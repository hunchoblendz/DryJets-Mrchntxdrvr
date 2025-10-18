'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HealthScoreBadge } from '@/components/equipment/HealthScoreBadge';
import { TelemetryChart } from '@/components/equipment/TelemetryChart';
import {
  ArrowLeft, Activity, Zap, Droplets, Thermometer,
  Wind, Clock, Calendar, Wrench, AlertTriangle
} from 'lucide-react';

interface EquipmentDetail {
  id: string;
  name: string;
  type: string;
  status: string;
  isIotEnabled: boolean;
  healthScore: number;
  healthStatus: string;
  efficiencyScore: number;
  lastTelemetryAt: string;
  telemetry: {
    powerWatts: number;
    waterLiters: number;
    temperature: number;
    vibration: number;
    isRunning: boolean;
    cycleType: string;
    cycleCount: number;
  };
  openAlerts: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
}

export default function EquipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [equipment, setEquipment] = useState<EquipmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquipmentDetails();
  }, [params.id]);

  const fetchEquipmentDetails = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/v1/iot/equipment/${params.id}/telemetry`);

      // Mock data
      setEquipment({
        id: params.id as string,
        name: 'Washer #1',
        type: 'WASHER',
        status: 'OPERATIONAL',
        isIotEnabled: true,
        healthScore: 87,
        healthStatus: 'GOOD',
        efficiencyScore: 92,
        lastTelemetryAt: new Date().toISOString(),
        telemetry: {
          powerWatts: 2100,
          waterLiters: 45.5,
          temperature: 55,
          vibration: 2.3,
          isRunning: true,
          cycleType: 'WASH',
          cycleCount: 1247,
        },
        openAlerts: 0,
        lastMaintenanceDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        nextMaintenanceDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Activity className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Equipment Not Found</h3>
            <Button onClick={() => router.push('/dashboard/equipment')}>
              Back to Equipment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push('/dashboard/equipment')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Equipment
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{equipment.name}</h1>
            <p className="text-muted-foreground mt-1">{equipment.type}</p>
          </div>
          <div className="flex gap-3">
            <HealthScoreBadge score={equipment.healthScore} status={equipment.healthStatus as 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL'} size="lg" />
            <Badge variant={equipment.telemetry.isRunning ? 'default' : 'secondary'}>
              {equipment.telemetry.isRunning ? 'Running' : 'Idle'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Power Usage
            </CardDescription>
            <CardTitle className="text-2xl">{equipment.telemetry.powerWatts}W</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              Water Usage
            </CardDescription>
            <CardTitle className="text-2xl">{equipment.telemetry.waterLiters}L</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Temperature
            </CardDescription>
            <CardTitle className="text-2xl">{equipment.telemetry.temperature}°C</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Wind className="h-4 w-4" />
              Vibration
            </CardDescription>
            <CardTitle className="text-2xl">{equipment.telemetry.vibration}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="telemetry" className="space-y-4">
        <TabsList>
          <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({equipment.openAlerts})</TabsTrigger>
        </TabsList>

        <TabsContent value="telemetry" className="space-y-4">
          <TelemetryChart equipmentId={equipment.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cycle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Cycle:</span>
                  <span className="font-medium">{equipment.telemetry.cycleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Cycles:</span>
                  <span className="font-medium">{equipment.telemetry.cycleCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Efficiency Score:</span>
                  <span className="font-medium">{equipment.efficiencyScore}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Vibration:</span>
                  <Badge variant={equipment.telemetry.vibration < 4 ? 'outline' : 'destructive'}>
                    {equipment.telemetry.vibration < 4 ? 'Normal' : 'High'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Temperature:</span>
                  <Badge variant={equipment.telemetry.temperature < 80 ? 'outline' : 'destructive'}>
                    {equipment.telemetry.temperature < 80 ? 'Normal' : 'High'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Power Draw:</span>
                  <Badge variant="outline">Normal</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Schedule</CardTitle>
              <CardDescription>Preventive maintenance tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Last Maintenance</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(equipment.lastMaintenanceDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">45 days ago</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Next Maintenance</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(equipment.nextMaintenanceDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge>In 45 days</Badge>
              </div>

              <Button className="w-full">
                <Wrench className="h-4 w-4 mr-2" />
                Schedule Maintenance
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Alerts</CardTitle>
              <CardDescription>Active alerts and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              {equipment.openAlerts === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto text-green-600 mb-4" />
                  <h3 className="font-semibold mb-2">All Clear!</h3>
                  <p className="text-muted-foreground">No active alerts for this equipment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Alerts will be populated from API */}
                  <p className="text-muted-foreground">Loading alerts...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}