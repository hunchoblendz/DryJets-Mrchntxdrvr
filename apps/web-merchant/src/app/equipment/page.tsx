'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Activity, AlertTriangle, CheckCircle, TrendingUp, Zap } from 'lucide-react';

// Mock data - will be replaced with API calls
const mockEquipment = [
  {
    id: 'cmgw4mp2q0015142amt15srrh',
    name: 'Industrial Washer #1',
    type: 'WASHER',
    isIotEnabled: true,
    healthScore: 92,
    status: 'OPERATIONAL',
    alertCount: 1,
    currentPower: 2150,
    temperature: 62,
    lastTelemetry: new Date().toISOString(),
  },
  {
    id: 'cmgw4mp2u0017142akhd61abw',
    name: 'Commercial Dryer #1',
    type: 'DRYER',
    isIotEnabled: true,
    healthScore: 78,
    status: 'WARNING',
    alertCount: 3,
    currentPower: 3200,
    temperature: 85,
    lastTelemetry: new Date().toISOString(),
  },
  {
    id: 'cmgw4mp2v0019142a8rxkhplr',
    name: 'Pressing Machine #1',
    type: 'PRESSER',
    isIotEnabled: true,
    healthScore: 95,
    status: 'OPERATIONAL',
    alertCount: 0,
    currentPower: 1650,
    temperature: 155,
    lastTelemetry: new Date().toISOString(),
  },
  {
    id: 'cmgw4mp2w001b142a4txvqe9s',
    name: 'Industrial Washer #2',
    type: 'WASHER',
    isIotEnabled: false,
    healthScore: null,
    status: 'OFFLINE',
    alertCount: 0,
  },
];

function getHealthScoreColor(score: number | null) {
  if (score === null) return 'gray';
  if (score >= 90) return 'green';
  if (score >= 75) return 'yellow';
  if (score >= 60) return 'orange';
  return 'red';
}

function getHealthScoreLabel(score: number | null) {
  if (score === null) return 'N/A';
  if (score >= 90) return 'EXCELLENT';
  if (score >= 75) return 'GOOD';
  if (score >= 60) return 'FAIR';
  if (score >= 40) return 'POOR';
  return 'CRITICAL';
}

function getStatusColor(status: string) {
  switch (status) {
    case 'OPERATIONAL':
      return 'bg-green-100 text-green-800';
    case 'WARNING':
      return 'bg-yellow-100 text-yellow-800';
    case 'ERROR':
      return 'bg-red-100 text-red-800';
    case 'OFFLINE':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function HealthScoreBadge({ score }: { score: number | null }) {
  const color = getHealthScoreColor(score);
  const label = getHealthScoreLabel(score);

  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorClasses[color]}`}>
        {label}
      </div>
      {score !== null && (
        <span className="text-2xl font-bold text-gray-700">{score}</span>
      )}
    </div>
  );
}

function EquipmentCard({ equipment }: { equipment: typeof mockEquipment[0] }) {
  return (
    <Link href={`/equipment/${equipment.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{equipment.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{equipment.type}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(equipment.status)}`}>
            {equipment.status}
          </div>
        </div>

      <div className="space-y-4">
        {/* Health Score */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Health Score</p>
          <HealthScoreBadge score={equipment.healthScore} />
        </div>

        {equipment.isIotEnabled && equipment.healthScore !== null && (
          <>
            {/* Current Metrics */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <p className="text-xs text-gray-500">Power</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">{equipment.currentPower}W</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-orange-500" />
                  <p className="text-xs text-gray-500">Temperature</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">{equipment.temperature}°C</p>
              </div>
            </div>

            {/* Alerts */}
            {equipment.alertCount > 0 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  {equipment.alertCount} Active Alert{equipment.alertCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Last Update */}
            <div className="text-xs text-gray-400 pt-2 border-t border-gray-100">
              Last updated: {new Date(equipment.lastTelemetry).toLocaleTimeString()}
            </div>
          </>
        )}

        {!equipment.isIotEnabled && (
          <div className="pt-4 border-t border-gray-100">
            <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Enable IoT Monitoring
            </button>
          </div>
        )}
      </div>
      </div>
    </Link>
  );
}

export default function EquipmentPage() {
  const [filter, setFilter] = useState<'all' | 'iot-enabled' | 'offline'>('all');

  const filteredEquipment = mockEquipment.filter((eq) => {
    if (filter === 'iot-enabled') return eq.isIotEnabled;
    if (filter === 'offline') return !eq.isIotEnabled || eq.status === 'OFFLINE';
    return true;
  });

  const stats = {
    total: mockEquipment.length,
    iotEnabled: mockEquipment.filter((e) => e.isIotEnabled).length,
    activeAlerts: mockEquipment.reduce((sum, e) => sum + (e.alertCount || 0), 0),
    avgHealthScore: Math.round(
      mockEquipment
        .filter((e) => e.healthScore !== null)
        .reduce((sum, e) => sum + (e.healthScore || 0), 0) /
        mockEquipment.filter((e) => e.healthScore !== null).length
    ),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Equipment</h1>
              <p className="text-gray-500 mt-1">Monitor and manage your equipment</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              Add Equipment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Equipment</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">IoT Enabled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.iotEnabled}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeAlerts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Health Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgHealthScore}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Equipment ({mockEquipment.length})
          </button>
          <button
            onClick={() => setFilter('iot-enabled')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'iot-enabled'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            IoT Enabled ({mockEquipment.filter((e) => e.isIotEnabled).length})
          </button>
          <button
            onClick={() => setFilter('offline')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'offline'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Offline ({mockEquipment.filter((e) => !e.isIotEnabled || e.status === 'OFFLINE').length})
          </button>
        </div>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((equipment) => (
            <EquipmentCard key={equipment.id} equipment={equipment} />
          ))}
        </div>

        {filteredEquipment.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No equipment found with the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}