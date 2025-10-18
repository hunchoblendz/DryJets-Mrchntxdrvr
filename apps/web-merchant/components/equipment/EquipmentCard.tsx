'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HealthScoreBadge } from './HealthScoreBadge';
import {
  Activity,
  AlertTriangle,
  Calendar,
  Circle,
  Power,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: string;
  isIotEnabled: boolean;
  lastTelemetryAt?: string;
  healthScore?: number;
  healthStatus?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  efficiencyScore?: number;
  isRunning: boolean;
  openAlerts: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
}

interface EquipmentCardProps {
  equipment: Equipment;
  onClick?: () => void;
}

export function EquipmentCard({ equipment, onClick }: EquipmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return 'bg-green-500';
      case 'MAINTENANCE_REQUIRED':
        return 'bg-orange-500';
      case 'OUT_OF_SERVICE':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEquipmentIcon = (type: string) => {
    // You can replace these with actual equipment icons
    return '🔧';
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{getEquipmentIcon(equipment.type)}</div>
            <div>
              <CardTitle className="text-lg">{equipment.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{equipment.type}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {equipment.isIotEnabled ? (
              <Badge variant="default" className="bg-blue-600">
                <Wifi className="h-3 w-3 mr-1" />
                IoT
              </Badge>
            ) : (
              <Badge variant="secondary">
                <WifiOff className="h-3 w-3 mr-1" />
                No IoT
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <div className="flex items-center space-x-2">
              <Circle
                className={`h-2 w-2 ${getStatusColor(equipment.status)} rounded-full`}
                fill="currentColor"
              />
              <span className="text-sm font-medium">
                {equipment.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Running Status */}
          {equipment.isIotEnabled && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current State</span>
              <div className="flex items-center space-x-2">
                <Power
                  className={`h-4 w-4 ${equipment.isRunning ? 'text-green-600' : 'text-gray-400'}`}
                />
                <span className="text-sm font-medium">
                  {equipment.isRunning ? 'Running' : 'Idle'}
                </span>
              </div>
            </div>
          )}

          {/* Health Score */}
          {equipment.isIotEnabled && equipment.healthScore !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Health</span>
              <HealthScoreBadge
                score={equipment.healthScore}
                status={equipment.healthStatus}
              />
            </div>
          )}

          {/* Efficiency Score */}
          {equipment.isIotEnabled && equipment.efficiencyScore !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Efficiency</span>
              <span className="text-sm font-medium">{equipment.efficiencyScore}%</span>
            </div>
          )}

          {/* Open Alerts */}
          {equipment.isIotEnabled && equipment.openAlerts > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Alerts</span>
              <Badge variant="destructive" className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>{equipment.openAlerts}</span>
              </Badge>
            </div>
          )}

          {/* Last Maintenance */}
          {equipment.lastMaintenanceDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Service</span>
              <div className="flex items-center space-x-1 text-sm">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span>
                  {formatDistanceToNow(new Date(equipment.lastMaintenanceDate), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Last Telemetry */}
          {equipment.isIotEnabled && equipment.lastTelemetryAt && (
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Last Update</span>
                <div className="flex items-center space-x-1">
                  <Activity className="h-3 w-3 text-green-600 animate-pulse" />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(equipment.lastTelemetryAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
