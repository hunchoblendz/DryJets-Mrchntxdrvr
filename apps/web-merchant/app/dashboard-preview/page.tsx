'use client';

/**
 * Dashboard Preview Page
 * Phase 3: Enterprise Dashboard - Visual Showcase
 *
 * This page demonstrates all Phase 3 dashboard components
 * Visit: http://localhost:3000/dashboard-preview
 */

import * as React from 'react';
import { Package, DollarSign, TrendingUp, Truck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { KPICard, KPIGrid, ComparisonKPICard } from '@/components/dashboard/KPICard';
import { DataTable, Column } from '@/components/dashboard/DataTable';
import { LocationSelector, useLocationSelection } from '@/components/dashboard/LocationSelector';
import { WorkflowStepper } from '@/components/workflow/WorkflowStepper';
import { Badge } from '@/components/ui/badge-v2';
import { Button } from '@/components/ui/button-v2';

// Type cast helper for Lucide icons to fix React 18 type mismatch
const asIcon = (Icon: LucideIcon) => Icon as React.ComponentType<{ className?: string }>;

// Mock data
const mockLocations = [
  { id: 'loc-1', name: 'Downtown Store', city: 'San Francisco', state: 'CA', isMain: true },
  { id: 'loc-2', name: 'Marina District', city: 'San Francisco', state: 'CA' },
  { id: 'loc-3', name: 'Mission Store', city: 'San Francisco', state: 'CA' },
  { id: 'loc-4', name: 'Sunset Store', city: 'San Francisco', state: 'CA' },
];

const mockOrders = [
  {
    id: 'ORD-1234',
    customer: 'John Doe',
    status: 'IN_PROCESS',
    items: 8,
    total: 45.0,
    date: '2025-10-19',
  },
  {
    id: 'ORD-1235',
    customer: 'Jane Smith',
    status: 'READY_FOR_DELIVERY',
    items: 12,
    total: 68.5,
    date: '2025-10-19',
  },
  {
    id: 'ORD-1236',
    customer: 'Mike Johnson',
    status: 'PICKED_UP',
    items: 5,
    total: 28.0,
    date: '2025-10-19',
  },
  {
    id: 'ORD-1237',
    customer: 'Sarah Davis',
    status: 'DELIVERED',
    items: 6,
    total: 35.5,
    date: '2025-10-18',
  },
];

const workflowSteps = [
  { id: 'customer', label: 'Select Customer', description: 'Search and select customer' },
  { id: 'service', label: 'Choose Service', description: 'Select cleaning service type' },
  { id: 'items', label: 'Add Items', description: 'List items to be cleaned' },
  { id: 'schedule', label: 'Schedule', description: 'Choose date and time' },
  { id: 'review', label: 'Review', description: 'Confirm and submit' },
];

export default function DashboardPreviewPage() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const { selectedLocationId, setSelectedLocationId } = useLocationSelection(mockLocations);

  const orderColumns: Column<typeof mockOrders[0]>[] = [
    {
      id: 'id',
      header: 'Order ID',
      accessorKey: 'id',
      cell: (value) => <span className="font-mono text-sm font-medium text-[#0066FF]">{value}</span>,
    },
    {
      id: 'customer',
      header: 'Customer',
      accessorKey: 'customer',
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: (value) => {
        const statusConfig: Record<string, { label: string; variant: any }> = {
          IN_PROCESS: { label: 'In Process', variant: 'warning' },
          READY_FOR_DELIVERY: { label: 'Ready', variant: 'success' },
          PICKED_UP: { label: 'Picked Up', variant: 'default' },
          DELIVERED: { label: 'Delivered', variant: 'success' },
        };
        const config = statusConfig[value as string] || { label: value, variant: 'default' };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      id: 'items',
      header: 'Items',
      accessorKey: 'items',
      align: 'center',
    },
    {
      id: 'total',
      header: 'Total',
      accessorKey: 'total',
      cell: (value) => `$${value.toFixed(2)}`,
      align: 'right',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0A0A0B]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-[#0A0A0B] border-b border-[#E5E7EB] dark:border-[#2A2A2D]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#111827] dark:text-[#FAFAFA]">
                Phase 3 Dashboard Preview
              </h1>
              <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6] mt-1">
                Interactive showcase of all new components
              </p>
            </div>
            {mockLocations.length > 1 && (
              <LocationSelector
                locations={mockLocations}
                selectedLocationId={selectedLocationId}
                onLocationChange={setSelectedLocationId}
              />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Section 1: KPI Cards */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[#111827] dark:text-[#FAFAFA] mb-4">
            1. KPI Cards with Trends & Sparklines
          </h2>
          <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6] mb-6">
            Enterprise-style metric cards with trend indicators and sparkline charts. Auto-formats large numbers (1.2M, 1.2K).
          </p>

          <KPIGrid columns={4}>
            <KPICard
              title="Today's Orders"
              value={24}
              trend={{ value: 12.5, direction: 'up', period: 'day' }}
              icon={asIcon(Package)}
              sparklineData={[18, 22, 19, 24, 21, 24]}
            />

            <KPICard
              title="Revenue"
              value="$1,245"
              trend={{ value: 8.3, direction: 'up', period: 'day' }}
              icon={asIcon(DollarSign)}
              variant="success"
              sparklineData={[950, 1100, 980, 1200, 1150, 1245]}
            />

            <KPICard
              title="Avg Order"
              value="$52"
              trend={{ value: 3.2, direction: 'up' }}
              icon={asIcon(TrendingUp)}
            />

            <KPICard
              title="Pending"
              value={5}
              subtitle="Awaiting pickup"
              icon={asIcon(Truck)}
              variant="warning"
            />
          </KPIGrid>
        </section>

        {/* Section 2: Comparison KPI */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[#111827] dark:text-[#FAFAFA] mb-4">
            2. Comparison Metrics
          </h2>
          <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6] mb-6">
            Side-by-side comparison of metrics across time periods.
          </p>

          <div className="max-w-lg">
            <ComparisonKPICard
              title="Monthly Revenue"
              current={{ label: 'This Month', value: '$45,230' }}
              previous={{ label: 'Last Month', value: '$38,940' }}
              trend={{ value: 16.2, direction: 'up' }}
              icon={asIcon(DollarSign)}
            />
          </div>
        </section>

        {/* Section 3: Data Table */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[#111827] dark:text-[#FAFAFA] mb-4">
            3. High-Performance Data Table
          </h2>
          <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6] mb-6">
            Sortable, searchable, paginated table with selection, bulk actions, and CSV export.
          </p>

          <div className="rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2D] bg-white dark:bg-[#0A0A0B] overflow-hidden">
            <DataTable
              data={mockOrders}
              columns={orderColumns}
              searchable={true}
              searchPlaceholder="Search orders..."
              sortable={true}
              selectable={true}
              pagination={true}
              pageSize={10}
              exportable={true}
              exportFilename="orders.csv"
              onRowClick={(row) => console.log('View order:', row.id)}
              bulkActions={[
                {
                  label: 'Cancel Selected',
                  onClick: (rows) => alert(`Cancel ${rows.length} orders`),
                },
              ]}
            />
          </div>
        </section>

        {/* Section 4: Workflow Stepper */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[#111827] dark:text-[#FAFAFA] mb-4">
            4. Workflow Stepper
          </h2>
          <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6] mb-6">
            Visual progress indicator for multi-step workflows with current step highlighting and progress bar.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Full Variant */}
            <div className="rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2D] bg-white dark:bg-[#0A0A0B] p-6">
              <p className="text-xs font-semibold text-[#6B7280] dark:text-[#A1A1A6] uppercase mb-4">
                Full Variant
              </p>
              <WorkflowStepper
                steps={workflowSteps}
                currentStep={currentStep}
                onStepClick={(index) => {
                  if (index <= currentStep) setCurrentStep(index);
                }}
              />
              <div className="flex gap-2 mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
                  disabled={currentStep === 0}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentStep((p) => Math.min(workflowSteps.length - 1, p + 1))}
                  disabled={currentStep === workflowSteps.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Compact Variant */}
            <div className="rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2D] bg-white dark:bg-[#0A0A0B] p-6">
              <p className="text-xs font-semibold text-[#6B7280] dark:text-[#A1A1A6] uppercase mb-4">
                Compact Variant
              </p>
              <WorkflowStepper
                steps={workflowSteps}
                currentStep={currentStep}
                variant="compact"
              />
            </div>

            {/* Status Info */}
            <div className="rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2D] bg-white dark:bg-[#0A0A0B] p-6">
              <p className="text-xs font-semibold text-[#6B7280] dark:text-[#A1A1A6] uppercase mb-4">
                Current Step
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-[#111827] dark:text-[#FAFAFA]">
                    {workflowSteps[currentStep].label}
                  </p>
                  <p className="text-xs text-[#6B7280] dark:text-[#A1A1A6] mt-1">
                    {workflowSteps[currentStep].description}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#F3F4F6] dark:border-[#1A1A1D]">
                  <p className="text-xs text-[#6B7280] dark:text-[#A1A1A6]">
                    Progress: {currentStep + 1} of {workflowSteps.length}
                  </p>
                  <div className="h-2 bg-[#F3F4F6] dark:bg-[#1A1A1D] rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-[#0066FF] transition-all"
                      style={{ width: `${((currentStep + 1) / workflowSteps.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Location Features */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[#111827] dark:text-[#FAFAFA] mb-4">
            5. Location Selector Features
          </h2>
          <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6] mb-6">
            Multi-location dropdown with search, persistence, and recent locations. Click the selector in the header to see the full experience.
          </p>

          <div className="rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2D] bg-white dark:bg-[#0A0A0B] p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-[#111827] dark:text-[#FAFAFA] mb-2">
                  Currently Selected:
                </p>
                <div className="p-3 rounded-lg bg-[#F9FAFB] dark:bg-[#161618] border border-[#E5E7EB] dark:border-[#2A2A2D]">
                  {selectedLocationId ? (
                    <p className="text-sm text-[#111827] dark:text-[#FAFAFA]">
                      {mockLocations.find((l) => l.id === selectedLocationId)?.name}
                    </p>
                  ) : (
                    <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6]">All Locations</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#6B7280] dark:text-[#A1A1A6] uppercase mb-2">
                  Features:
                </p>
                <ul className="space-y-2 text-sm text-[#6B7280] dark:text-[#A1A1A6]">
                  <li>✓ Dropdown with search/filter</li>
                  <li>✓ "All Locations" aggregated view</li>
                  <li>✓ Recent locations history (max 3)</li>
                  <li>✓ localStorage persistence</li>
                  <li>✓ Keyboard navigation</li>
                  <li>✓ Badge showing current selection</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Component Features */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[#111827] dark:text-[#FAFAFA] mb-4">
            6. Component Features Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* KPI Card Features */}
            <div className="rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2D] bg-white dark:bg-[#0A0A0B] p-6">
              <h3 className="font-semibold text-[#111827] dark:text-[#FAFAFA] mb-3">KPI Card</h3>
              <ul className="space-y-2 text-sm text-[#6B7280] dark:text-[#A1A1A6]">
                <li>✓ Auto-format large numbers (1.23M, 1.2K)</li>
                <li>✓ Trend indicators with color coding</li>
                <li>✓ SVG sparkline charts</li>
                <li>✓ 3 size variants (sm, md, lg)</li>
                <li>✓ 4 color variants (default, success, warning, danger)</li>
                <li>✓ Click-through support</li>
                <li>✓ Loading & error states</li>
              </ul>
            </div>

            {/* DataTable Features */}
            <div className="rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2D] bg-white dark:bg-[#0A0A0B] p-6">
              <h3 className="font-semibold text-[#111827] dark:text-[#FAFAFA] mb-3">Data Table</h3>
              <ul className="space-y-2 text-sm text-[#6B7280] dark:text-[#A1A1A6]">
                <li>✓ Column sorting & multi-column sort</li>
                <li>✓ Full-text search across all columns</li>
                <li>✓ Pagination with customizable page size</li>
                <li>✓ Row selection (single & multi-select)</li>
                <li>✓ Bulk actions with custom handlers</li>
                <li>✓ Export to CSV</li>
                <li>✓ Custom cell renderers</li>
              </ul>
            </div>

            {/* Workflow Stepper Features */}
            <div className="rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2D] bg-white dark:bg-[#0A0A0B] p-6">
              <h3 className="font-semibold text-[#111827] dark:text-[#FAFAFA] mb-3">Workflow Stepper</h3>
              <ul className="space-y-2 text-sm text-[#6B7280] dark:text-[#A1A1A6]">
                <li>✓ Visual step indicators</li>
                <li>✓ Progress bar with percentage</li>
                <li>✓ 3 variants (full, compact, horizontal)</li>
                <li>✓ Optional steps marker</li>
                <li>✓ Clickable step navigation</li>
                <li>✓ Current/completed/upcoming states</li>
                <li>✓ Smooth animations (200ms)</li>
              </ul>
            </div>

            {/* Location Selector Features */}
            <div className="rounded-lg border border-[#E5E7EB] dark:border-[#2A2A2D] bg-white dark:bg-[#0A0A0B] p-6">
              <h3 className="font-semibold text-[#111827] dark:text-[#FAFAFA] mb-3">Location Selector</h3>
              <ul className="space-y-2 text-sm text-[#6B7280] dark:text-[#A1A1A6]">
                <li>✓ "All Locations" option</li>
                <li>✓ Search by name/city/address</li>
                <li>✓ Recent locations history</li>
                <li>✓ localStorage persistence</li>
                <li>✓ Mobile-responsive</li>
                <li>✓ Keyboard navigation</li>
                <li>✓ Active location badge</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="py-12 border-t border-[#E5E7EB] dark:border-[#2A2A2D]">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#111827] dark:text-[#FAFAFA]">
              Phase 3 Status: COMPLETE ✅
            </h2>
            <p className="text-sm text-[#6B7280] dark:text-[#A1A1A6] max-w-2xl">
              All Phase 3 components have been implemented and are production-ready. This preview showcases the key features
              of the enterprise dashboard system including KPI cards, data tables, workflow steppers, location selectors,
              and adaptive dashboard routing.
            </p>

            <div className="pt-4 flex gap-3">
              <Button variant="primary">
                View Documentation →
              </Button>
              <Button variant="ghost">
                GitHub Repository
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
