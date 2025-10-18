'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { EquipmentIcon } from './EquipmentIcon';
import { HealthRing } from './HealthRing';
import {
  Activity,
  AlertTriangle,
  Calendar,
  Wifi,
  WifiOff,
  Wrench,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  const isMaintenanceDue = equipment.status === 'MAINTENANCE_REQUIRED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          'cursor-pointer transition-all duration-fast shadow-sm hover:shadow-lift border-2',
          equipment.isRunning && equipment.isIotEnabled && 'border-primary-200 dark:border-primary-800'
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <EquipmentIcon type={equipment.type} size="md" />
              <div>
                <h3 className="font-heading font-semibold text-lg">{equipment.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {equipment.type.replace(/_/g, ' ')}
                </p>
              </div>
            </div>

            {/* IoT Badge */}
            {equipment.isIotEnabled ? (
              <div className="relative">
                <Badge className="bg-brand-gradient text-white border-0">
                  <Wifi className="h-3 w-3 mr-1" />
                  IoT
                </Badge>
                {equipment.isRunning && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-eco-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-eco-500"></span>
                  </span>
                )}
              </div>
            ) : (
              <Badge variant="secondary">
                <WifiOff className="h-3 w-3 mr-1" />
                No IoT
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Health Ring - Center Feature */}
          {equipment.isIotEnabled && equipment.healthScore !== undefined && (
            <div className="flex justify-center py-2">
              <HealthRing
                score={equipment.healthScore}
                status={equipment.healthStatus}
                size={110}
              />
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Efficiency */}
            {equipment.isIotEnabled && equipment.efficiencyScore !== undefined && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Efficiency</span>
                  <span className="text-sm font-semibold">{equipment.efficiencyScore}%</span>
                </div>
                <Progress value={equipment.efficiencyScore} className="h-2" />
              </div>
            )}

            {/* Alerts */}
            {equipment.isIotEnabled && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Alerts</span>
                  {equipment.openAlerts > 0 ? (
                    <motion.div
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.3, repeat: equipment.openAlerts > 3 ? Infinity : 0, repeatDelay: 2 }}
                    >
                      <Badge variant="destructive" className="h-5 px-2">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {equipment.openAlerts}
                      </Badge>
                    </motion.div>
                  ) : (
                    <span className="text-sm font-medium text-eco-600">None</span>
                  )}
                </div>
              </div>
            )}

            {/* Last Service */}
            {equipment.lastMaintenanceDate && (
              <div className="space-y-1 col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Last Service
                  </span>
                  <span className="text-xs font-medium">
                    {formatDistanceToNow(new Date(equipment.lastMaintenanceDate), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            )}

            {/* Running Status */}
            {equipment.isIotEnabled && (
              <div className="col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <div className="flex items-center gap-2">
                    {equipment.isRunning ? (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-eco-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-eco-500"></span>
                        </span>
                        <span className="text-sm font-medium text-eco-600">Running</span>
                      </>
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">Idle</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Last Telemetry Update */}
          {equipment.isIotEnabled && equipment.lastTelemetryAt && (
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Last Update</span>
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-eco-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(equipment.lastTelemetryAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              View Details
            </Button>
            {isMaintenanceDue && (
              <Button
                size="sm"
                className="flex-1 bg-warning-gradient hover:opacity-90"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Schedule service
                }}
              >
                <Wrench className="h-3 w-3 mr-1" />
                Schedule Service
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
