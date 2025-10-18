'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EquipmentCard } from '@/components/equipment/EquipmentCard';
import { Plus, Activity, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

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

export default function EquipmentPage() {
  const router = useRouter();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'iot' | 'no-iot'>('all');

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/v1/iot/equipment', {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // const data = await response.json();
      // setEquipment(data);

      // Mock data for now
      setEquipment([
        {
          id: '1',
          name: 'Washer #1',
          type: 'WASHER',
          status: 'OPERATIONAL',
          isIotEnabled: true,
          lastTelemetryAt: new Date().toISOString(),
          healthScore: 87,
          healthStatus: 'GOOD',
          efficiencyScore: 92,
          isRunning: true,
          openAlerts: 0,
          lastMaintenanceDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          nextMaintenanceDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          name: 'Dryer #1',
          type: 'DRYER',
          status: 'OPERATIONAL',
          isIotEnabled: true,
          lastTelemetryAt: new Date().toISOString(),
          healthScore: 74,
          healthStatus: 'FAIR',
          efficiencyScore: 68,
          isRunning: false,
          openAlerts: 2,
          lastMaintenanceDate: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          name: 'Washer #2',
          type: 'WASHER',
          status: 'MAINTENANCE_REQUIRED',
          isIotEnabled: true,
          lastTelemetryAt: new Date().toISOString(),
          healthScore: 45,
          healthStatus: 'POOR',
          efficiencyScore: 52,
          isRunning: false,
          openAlerts: 3,
          lastMaintenanceDate: new Date(Date.now() - 130 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          name: 'Presser #1',
          type: 'PRESSER',
          status: 'OPERATIONAL',
          isIotEnabled: false,
          isRunning: false,
          openAlerts: 0,
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipment.filter((eq) => {
    if (filter === 'iot') return eq.isIotEnabled;
    if (filter === 'no-iot') return !eq.isIotEnabled;
    return true;
  });

  const stats = {
    total: equipment.length,
    iotEnabled: equipment.filter((eq) => eq.isIotEnabled).length,
    running: equipment.filter((eq) => eq.isRunning).length,
    alerts: equipment.reduce((sum, eq) => sum + eq.openAlerts, 0),
    avgHealth: Math.round(
      equipment
        .filter((eq) => eq.healthScore)
        .reduce((sum, eq) => sum + (eq.healthScore || 0), 0) /
        equipment.filter((eq) => eq.healthScore).length || 0
    ),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading equipment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Equipment Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage your equipment with IoT insights
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/equipment/add')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Equipment</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>IoT Enabled</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.iotEnabled}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Currently Running</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.running}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Open Alerts</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{stats.alerts}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Health Score</CardDescription>
            <CardTitle className="text-3xl">
              {stats.avgHealth > 0 ? `${stats.avgHealth}%` : 'N/A'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Equipment ({equipment.length})
        </Button>
        <Button
          variant={filter === 'iot' ? 'default' : 'outline'}
          onClick={() => setFilter('iot')}
        >
          <Activity className="h-4 w-4 mr-2" />
          IoT Enabled ({stats.iotEnabled})
        </Button>
        <Button
          variant={filter === 'no-iot' ? 'default' : 'outline'}
          onClick={() => setFilter('no-iot')}
        >
          No IoT ({equipment.length - stats.iotEnabled})
        </Button>
      </div>

      {/* Equipment Grid */}
      {filteredEquipment.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Equipment Found</h3>
            <p className="text-muted-foreground mb-4">
              {filter === 'iot'
                ? 'No IoT-enabled equipment. Enable IoT on your equipment to start monitoring.'
                : 'Add equipment to get started with monitoring and management.'}
            </p>
            <Button onClick={() => router.push('/dashboard/equipment/add')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((eq) => (
            <EquipmentCard
              key={eq.id}
              equipment={eq}
              onClick={() => router.push(`/dashboard/equipment/${eq.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
