
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DialogFooter } from '@/components/ui/dialog';
import { Loader2, Save } from 'lucide-react';

interface PlanFormProps {
  planFormData: {
    id?: string;
    name: string;
    description: string;
    price: string;
    billing_interval: string;
    features: Record<string, any>;
  };
  isEditing: boolean;
  savingPlan: boolean;
  onCancel: () => void;
  onSave: (e: React.FormEvent) => void;
  onFormDataChange: (field: string, value: any) => void;
  onFeatureChange: (key: string, value: any) => void;
}

const PlanForm: React.FC<PlanFormProps> = ({
  planFormData,
  isEditing,
  savingPlan,
  onCancel,
  onSave,
  onFormDataChange,
  onFeatureChange,
}) => {
  return (
    <form onSubmit={onSave} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Plan Name</Label>
        <Input 
          id="name" 
          value={planFormData.name} 
          onChange={(e) => onFormDataChange('name', e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          value={planFormData.description} 
          onChange={(e) => onFormDataChange('description', e.target.value)}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input 
            id="price" 
            type="number" 
            min="0" 
            step="0.01" 
            value={planFormData.price} 
            onChange={(e) => onFormDataChange('price', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="billing_interval">Billing Interval</Label>
          <Select 
            value={planFormData.billing_interval} 
            onValueChange={(value) => onFormDataChange('billing_interval', value)}
          >
            <SelectTrigger id="billing_interval">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Monthly</SelectItem>
              <SelectItem value="year">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Features</Label>
        
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-sm font-normal">Toggle Features</Label>
            <div className="grid grid-cols-1 gap-2">
              {['basic_analytics', 'advanced_analytics', 'irrigation_control', 'weather_data', 'soil_analysis', 'crop_recommendations', 'priority_support'].map((feature) => (
                <div key={feature} className="flex items-center justify-between">
                  <Label htmlFor={feature} className="cursor-pointer">
                    {feature.split('_').join(' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                  <input
                    id={feature}
                    type="checkbox"
                    checked={!!planFormData.features[feature]}
                    onChange={(e) => onFeatureChange(feature, e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-normal">Numeric Limits</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sensor_limit">Sensor Limit</Label>
                <Input
                  id="sensor_limit"
                  type="number"
                  min="0"
                  value={planFormData.features.sensor_limit || 0}
                  onChange={(e) => onFeatureChange('sensor_limit', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="zone_limit">Zone Limit</Label>
                <Input
                  id="zone_limit"
                  type="number"
                  min="0"
                  value={planFormData.features.zone_limit || 0}
                  onChange={(e) => onFeatureChange('zone_limit', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={savingPlan}>
          {savingPlan ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Update Plan' : 'Create Plan'}
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default PlanForm;
