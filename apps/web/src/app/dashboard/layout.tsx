import { ReactNode } from 'react';
import { DashboardLayoutClient } from '@/layouts';

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
