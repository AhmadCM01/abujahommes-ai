import React from 'react'
import { DashboardShell } from '@/components/layout/DashboardShell'

export default function BuyerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell role="buyer">{children}</DashboardShell>
}
