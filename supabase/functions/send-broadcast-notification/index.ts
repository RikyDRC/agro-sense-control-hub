
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { broadcastId, title, message, type, targetAudience } = await req.json()

    console.log('Broadcasting notification:', { broadcastId, title, type, targetAudience })

    // Get target users based on audience
    let targetUsers = []
    if (targetAudience === 'all') {
      const { data: users, error } = await supabaseClient
        .from('user_profiles')
        .select('id')
      
      if (error) throw error
      targetUsers = users || []
    } else if (targetAudience === 'farmers') {
      const { data: users, error } = await supabaseClient
        .from('user_profiles')
        .select('id')
        .eq('role', 'farmer')
      
      if (error) throw error
      targetUsers = users || []
    } else if (targetAudience === 'admins') {
      const { data: users, error } = await supabaseClient
        .from('user_profiles')
        .select('id')
        .in('role', ['admin', 'super_admin'])
      
      if (error) throw error
      targetUsers = users || []
    }

    console.log(`Found ${targetUsers.length} target users`)

    // Create notifications for each target user
    const notifications = targetUsers.map(user => ({
      user_id: user.id,
      title,
      message,
      type,
      category: 'broadcast',
      data: { broadcast_id: broadcastId }
    }))

    if (notifications.length > 0) {
      const { error: notificationError } = await supabaseClient
        .from('notifications')
        .insert(notifications)

      if (notificationError) {
        console.error('Error creating notifications:', notificationError)
        throw notificationError
      }

      // Update broadcast message with recipient count
      const { error: updateError } = await supabaseClient
        .from('broadcast_messages')
        .update({ 
          recipients_count: notifications.length,
          delivered_count: notifications.length
        })
        .eq('id', broadcastId)

      if (updateError) {
        console.error('Error updating broadcast message:', updateError)
        throw updateError
      }

      console.log(`Successfully sent ${notifications.length} notifications`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        recipientCount: notifications.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in send-broadcast-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
