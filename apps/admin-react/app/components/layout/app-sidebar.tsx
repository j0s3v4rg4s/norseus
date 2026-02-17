import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Users,
  Lock,
  Dumbbell,
  CreditCard,
} from 'lucide-react';

import {
  Sidebar,
} from '@front/cn/components/sidebar';

interface MenuSubItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface MenuItem {
  title: string;
  icon: LucideIcon;
  url?: string;
  subItems?: MenuSubItem[];
}

const menuItems: MenuItem[] = [
  { title: 'Home', icon: Home, url: '/home' },
  { title: 'Empleados', icon: Users, url: '/home/users' },
  { title: 'Permisos', icon: Lock, url: '/home/permissions' },
  { title: 'Servicios', icon: Dumbbell, url: '/home/services' },
  { title: 'Planes', icon: CreditCard, url: '/home/plans' },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <h1>App Sidebar</h1>
  );
}
