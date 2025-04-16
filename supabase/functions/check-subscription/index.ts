
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes (upsert) in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      // No Stripe customer found, ensure user has no active subscription
      await supabaseClient.from("user_subscriptions").upsert({
        user_id: user.id,
        plan_id: null,
        status: "inactive",
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
      
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    
    // Get active subscription for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    
    const hasActiveSub = subscriptions.data.length > 0;
    
    if (!hasActiveSub) {
      // Update database to reflect no active subscription
      await supabaseClient.from("user_subscriptions")
        .update({ 
          status: "inactive",
          end_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user.id)
        .eq("status", "active");
      
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    // Found active subscription
    const subscription = subscriptions.data[0];
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    
    // Get the price ID from the subscription
    const priceId = subscription.items.data[0].price.id;
    
    // Get plan details from Supabase
    const { data: plans } = await supabaseClient
      .from("subscription_plans")
      .select("*");
      
    // We need to update the subscription in our database
    // First, check if we have this subscription recorded
    const { data: existingSubscription } = await supabaseClient
      .from("user_subscriptions")
      .select("*")
      .eq("stripe_subscription_id", subscription.id)
      .maybeSingle();
      
    if (existingSubscription) {
      // Update existing subscription
      await supabaseClient.from("user_subscriptions").update({
        status: "active",
        end_date: subscriptionEnd,
        updated_at: new Date().toISOString()
      }).eq("id", existingSubscription.id);
    } else {
      // Need to create a new subscription record
      // Find plan that matches this price - in a real app you'd have a more robust way to match Stripe prices to plans
      const plan = plans?.find(p => p.price * 100 === subscription.items.data[0].price.unit_amount);
      
      if (!plan) {
        throw new Error("Could not match Stripe price to a plan");
      }
      
      // Deactivate any existing active subscriptions for this user
      await supabaseClient.from("user_subscriptions")
        .update({ status: "inactive" })
        .eq("user_id", user.id)
        .eq("status", "active");
        
      // Create new subscription record
      await supabaseClient.from("user_subscriptions").insert({
        user_id: user.id,
        plan_id: plan.id,
        status: "active",
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        start_date: new Date(subscription.current_period_start * 1000).toISOString(),
        end_date: subscriptionEnd
      });
    }
    
    // Get updated subscription data to return
    const { data: updatedSubscription } = await supabaseClient
      .from("user_subscriptions")
      .select(`
        *,
        plan:plan_id(*)
      `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    return new Response(JSON.stringify({
      subscribed: true,
      subscription: updatedSubscription
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
