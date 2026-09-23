import React from 'react'
import { DashboardShell } from '@/components/layout/DashboardShell'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell role="admin">{children}</DashboardShell>
}
