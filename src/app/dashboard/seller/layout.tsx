import React from 'react'
import { DashboardShell } from '@/components/layout/DashboardShell'

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell role="seller">{children}</DashboardShell>
}
