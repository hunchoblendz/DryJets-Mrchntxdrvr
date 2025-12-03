'use client';

/**
 * Dashboard Layout - Precision OS v2.0
 * Enterprise control center with persistent sidebar + header
 */

import { useState } from 'react';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Header } from '@/components/navigation/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen flex bg-white dark:bg-[#0F1419] overflow-hidden">
      {/* Persistent Sidebar - Precision OS */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header - Precision OS */}
        <Header
          onCommandBarOpen={() => {
            // TODO: Implement command bar when @radix-ui/react-dialog is installed
            console.log('Command bar triggered');
          }}
          onQuickActionsOpen={() => {
            // TODO: Implement quick actions panel
            console.log('Quick actions triggered');
          }}
        />

        {/* Page Content Workspace */}
        <main className="flex-1 overflow-auto bg-white dark:bg-[#0F1419]">
          {children}
        </main>
      </div>
    </div>
  );
}
