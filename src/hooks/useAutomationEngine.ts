
import { useEffect, useCallback } from 'react';
import { useAutomationRules } from './useAutomationRules';
import { useAutomationHistory } from './useAutomationHistory';
import { useSensorReadings } from './useSensorReadings';
import { useDevices } from './useDevices';
import { ConditionType, ComparisonOperator, ActionType, DeviceStatus } from '@/types';
import { toast } from '@/components/ui/sonner';

export const useAutomationEngine = () => {
  const { rules } = useAutomationRules();
  const { addHistoryEntry } = useAutomationHistory();
  const { getLatestReadingForDevice } = useSensorReadings();
  const { updateDeviceStatus } = useDevices();

  const executeDeviceAction = async (deviceId: string, action: any, duration?: number) => {
    try {
      console.log(`Executing action on device ${deviceId}:`, action);
      
      // Update device status to simulate irrigation activation
      await updateDeviceStatus(deviceId, DeviceStatus.ONLINE);
      
      // If duration is specified, set a timeout to turn off the device
      if (duration && duration > 0) {
        setTimeout(async () => {
          try {
            await updateDeviceStatus(deviceId, DeviceStatus.OFFLINE);
            console.log(`Device ${deviceId} turned off after ${duration} minutes`);
          } catch (error) {
            console.error('Error turning off device:', error);
          }
        }, duration * 60 * 1000); // Convert minutes to milliseconds
      }

      return true;
    } catch (error) {
      console.error('Error executing device action:', error);
      throw error;
    }
  };

  const evaluateRule = useCallback(async (rule: any) => {
    try {
      console.log('Evaluating rule:', rule.name);

      // Check if rule is active
      if (!rule.isActive) {
        return false;
      }

      // Evaluate condition based on type
      if (rule.condition.type === ConditionType.SENSOR_READING) {
        const reading = await getLatestReadingForDevice(rule.condition.sensorId);
        
        if (!reading) {
          console.log('No sensor reading available for rule:', rule.name);
          return false;
        }

        const { threshold, operator } = rule.condition;
        const sensorValue = reading.value;

        let conditionMet = false;

        switch (operator) {
          case ComparisonOperator.LESS_THAN:
            conditionMet = sensorValue < threshold;
            break;
          case ComparisonOperator.GREATER_THAN:
            conditionMet = sensorValue > threshold;
            break;
          case ComparisonOperator.EQUAL_TO:
            conditionMet = sensorValue === threshold;
            break;
          default:
            return false;
        }

        console.log(`Sensor reading: ${sensorValue}, Threshold: ${threshold}, Operator: ${operator}, Met: ${conditionMet}`);

        if (conditionMet && rule.action.type === ActionType.TOGGLE_DEVICE) {
          try {
            await executeDeviceAction(rule.action.deviceId, rule.action, rule.action.duration);
            
            await addHistoryEntry({
              type: 'RULE_TRIGGER',
              name: 'Rule Triggered',
              description: `Rule "${rule.name}" triggered automatically - sensor reading ${sensorValue} ${operator} ${threshold}`,
              status: 'SUCCESS',
              zoneId: rule.zoneId,
              deviceId: rule.action.deviceId,
              details: `Sensor: ${sensorValue}${reading.unit}, Threshold: ${threshold}${reading.unit}`
            });

            toast.success(`Automation rule "${rule.name}" executed successfully`);
            return true;
          } catch (error) {
            await addHistoryEntry({
              type: 'RULE_TRIGGER',
              name: 'Rule Failed',
              description: `Rule "${rule.name}" failed to execute`,
              status: 'FAILURE',
              zoneId: rule.zoneId,
              deviceId: rule.action.deviceId,
              details: error instanceof Error ? error.message : 'Unknown error'
            });

            toast.error(`Automation rule "${rule.name}" failed to execute`);
            throw error;
          }
        }
      } else if (rule.condition.type === ConditionType.TIME_BASED) {
        const now = new Date();
        const currentTime = now.toTimeString().substring(0, 5); // HH:MM format
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Convert to our day format (1 = Monday, 7 = Sunday)
        const dayOfWeek = currentDay === 0 ? 7 : currentDay;

        if (rule.condition.timeOfDay === currentTime && 
            rule.condition.daysOfWeek?.includes(dayOfWeek)) {
          
          if (rule.action.type === ActionType.TOGGLE_DEVICE) {
            try {
              await executeDeviceAction(rule.action.deviceId, rule.action, rule.action.duration);
              
              await addHistoryEntry({
                type: 'RULE_TRIGGER',
                name: 'Scheduled Rule Triggered',
                description: `Time-based rule "${rule.name}" triggered at ${currentTime}`,
                status: 'SUCCESS',
                zoneId: rule.zoneId,
                deviceId: rule.action.deviceId
              });

              toast.success(`Scheduled rule "${rule.name}" executed`);
              return true;
            } catch (error) {
              await addHistoryEntry({
                type: 'RULE_TRIGGER',
                name: 'Scheduled Rule Failed',
                description: `Time-based rule "${rule.name}" failed to execute`,
                status: 'FAILURE',
                zoneId: rule.zoneId,
                deviceId: rule.action.deviceId
              });

              toast.error(`Scheduled rule "${rule.name}" failed`);
              throw error;
            }
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Error evaluating rule:', error);
      return false;
    }
  }, [getLatestReadingForDevice, updateDeviceStatus, addHistoryEntry]);

  const runAutomationEngine = useCallback(async () => {
    console.log('Running automation engine...');
    
    for (const rule of rules) {
      try {
        await evaluateRule(rule);
      } catch (error) {
        console.error(`Error processing rule ${rule.name}:`, error);
      }
    }
  }, [rules, evaluateRule]);

  // Run automation engine every 30 seconds
  useEffect(() => {
    if (rules.length === 0) return;

    const interval = setInterval(runAutomationEngine, 30000); // 30 seconds

    // Also run once immediately
    runAutomationEngine();

    return () => clearInterval(interval);
  }, [runAutomationEngine, rules.length]);

  return {
    runAutomationEngine,
    evaluateRule
  };
};
