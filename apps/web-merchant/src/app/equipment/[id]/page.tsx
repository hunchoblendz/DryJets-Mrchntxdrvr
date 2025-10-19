'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Activity, Zap, Droplets, Wind, TrendingUp, AlertTriangle, Calendar, Settings } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock telemetry data - will be replaced with API calls
const mockTelemetryHistory = Array.from({ length: 24 }, (_, i) => ({
  time: `${23 - i}h ago`,
  timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
  powerWatts: 1800 + Math.random() * 400 + (i % 3 === 0 ? 300 : 0),
  temperature: 58 + Math.random() * 12,
  vibration: 1.5 + Math.random() * 1.5 + (i % 5 === 0 ? 2 : 0),
  waterLiters: i % 2 === 0 ? 45 + Math.random() * 10 : null,
})).reverse();

const mockEquipment = {
  id: 'cmgw4mp2q0015142amt15srrh',
  name: 'Industrial Washer #1',
  type: 'WASHER',
  manufacturer: 'Maytag',
  model: 'MAH8700A',
  serialNumber: 'WM-2023-001',
  installDate: '2023-01-15',
  lastMaintenance: '2024-09-15',
  nextMaintenance: '2024-12-15',
  isIotEnabled: true,
  healthScore: 92,
  efficiencyScore: 88,
  status: 'OPERATIONAL',
  currentMetrics: {
    powerWatts: 2150,
    temperature: 62,
    vibration: 2.1,
    waterLiters: 48,
    cycleCount: 1247,
    isRunning: true,
  },
  alerts: [
    {
      id: '1',
      type: 'PREVENTIVE_MAINTENANCE',
      severity: 'LOW',
      title: 'Scheduled Maintenance Due',
      message: 'Preventive maintenance scheduled in 30 days',
      createdAt: new Date().toISOString(),
    },
  ],
};

function MetricCard({ icon: Icon, label, value, unit, trend, color = 'blue' }: any) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
    cyan: 'bg-cyan-100 text-cyan-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900">
          {value}
          <span className="text-lg text-gray-500 ml-1">{unit}</span>
        </p>
      </div>
    </div>
  );
}

function HealthScoreGauge({ score, label }: { score: number; label: string }) {
  const getColor = (s: number) => {
    if (s >= 90) return '#10b981';
    if (s >= 75) return '#f59e0b';
    if (s >= 60) return '#f97316';
    return '#ef4444';
  };

  const percentage = score;
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="transform -rotate-90 w-48 h-48">
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke={getColor(score)}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900">{score}</span>
          <span className="text-sm text-gray-500 mt-1">{label}</span>
        </div>
      </div>
    </div>
  );
}

export default function EquipmentDetailPage({ params }: { params: { id: string } }) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/equipment"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{mockEquipment.name}</h1>
              <p className="text-gray-500 mt-1">{mockEquipment.type} • {mockEquipment.manufacturer} {mockEquipment.model}</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule Maintenance
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {mockEquipment.status}
            </span>
            {mockEquipment.currentMetrics.isRunning && (
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                Currently Running
              </span>
            )}
            <span className="text-sm text-gray-400">
              Serial: {mockEquipment.serialNumber}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {mockEquipment.alerts.length > 0 && (
          <div className="mb-8">
            {mockEquipment.alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900">{alert.title}</h4>
                  <p className="text-sm text-yellow-800 mt-1">{alert.message}</p>
                </div>
                <button className="text-sm text-yellow-700 font-medium hover:text-yellow-900">
                  Acknowledge
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Health Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-8 flex justify-center">
            <HealthScoreGauge score={mockEquipment.healthScore} label="Health Score" />
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-8 flex justify-center">
            <HealthScoreGauge score={mockEquipment.efficiencyScore} label="Efficiency Score" />
          </div>
        </div>

        {/* Current Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={Zap}
            label="Power Consumption"
            value={mockEquipment.currentMetrics.powerWatts}
            unit="W"
            trend={-3}
            color="blue"
          />
          <MetricCard
            icon={Activity}
            label="Temperature"
            value={mockEquipment.currentMetrics.temperature}
            unit="°C"
            trend={2}
            color="orange"
          />
          <MetricCard
            icon={Wind}
            label="Vibration Level"
            value={mockEquipment.currentMetrics.vibration.toFixed(1)}
            unit="mm/s"
            trend={-5}
            color="purple"
          />
          <MetricCard
            icon={Droplets}
            label="Water Usage"
            value={mockEquipment.currentMetrics.waterLiters}
            unit="L"
            color="cyan"
          />
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Telemetry History</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === '24h'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              24 Hours
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === '7d'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === '30d'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Power Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Power Consumption</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockTelemetryHistory}>
                <defs>
                  <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="time"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `${value}W`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => [`${value.toFixed(0)}W`, 'Power']}
                />
                <Area
                  type="monotone"
                  dataKey="powerWatts"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorPower)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Temperature Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Temperature</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockTelemetryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="time"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `${value}°C`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => [`${value.toFixed(1)}°C`, 'Temperature']}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Vibration Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vibration Level</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockTelemetryHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="time"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `${value} mm/s`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => [`${value.toFixed(2)} mm/s`, 'Vibration']}
                />
                <Line
                  type="monotone"
                  dataKey="vibration"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Water Usage Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Water Usage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockTelemetryHistory.filter((d) => d.waterLiters !== null)}>
                <defs>
                  <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="time"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `${value}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => [`${value.toFixed(1)}L`, 'Water']}
                />
                <Area
                  type="monotone"
                  dataKey="waterLiters"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#colorWater)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Equipment Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Installation Date</p>
              <p className="font-medium text-gray-900">{new Date(mockEquipment.installDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Last Maintenance</p>
              <p className="font-medium text-gray-900">{new Date(mockEquipment.lastMaintenance).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Next Maintenance</p>
              <p className="font-medium text-yellow-600">{new Date(mockEquipment.nextMaintenance).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Cycles</p>
              <p className="font-medium text-gray-900">{mockEquipment.currentMetrics.cycleCount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Manufacturer</p>
              <p className="font-medium text-gray-900">{mockEquipment.manufacturer}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Model</p>
              <p className="font-medium text-gray-900">{mockEquipment.model}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}