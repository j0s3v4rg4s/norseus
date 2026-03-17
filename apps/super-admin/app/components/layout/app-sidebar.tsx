import type { LucideIcon } from 'lucide-react';
import { Building2, ShieldCheck, LogOut } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@front/cn/components/sidebar';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

interface MenuItem {
  title: string;
  icon: LucideIcon;
  url: string;
}

const menuItems: MenuItem[] = [
  { title: 'Instalaciones', icon: Building2, url: '/home/facilities' },
  { title: 'Super Admins', icon: ShieldCheck, url: '/home/super-admins' },
];

function SidebarLogo() {
  const { state, isMobile } = useSidebar();
  const showLogo = isMobile || state === 'expanded';
  const showIcon = !isMobile && state === 'collapsed';

  return (
    <div className="relative h-8 w-full overflow-hidden">
      <Link
        to="/home"
        className={`absolute inset-0 flex items-center justify-center transition-[transform,opacity] duration-300 ease-out ${
          showLogo
            ? 'translate-x-0 opacity-100'
            : '-translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <img
          src="/logos/logo_name.svg"
          alt="Norseus"
          className="h-8 w-auto object-contain"
        />
      </Link>
      <Link
        to="/home"
        className={`absolute inset-0 flex items-center justify-center transition-[transform,opacity] duration-500 ease-out ${
          showIcon
            ? 'translate-x-0 opacity-100'
            : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <img
          src="/logos/icon.svg"
          alt="Norseus"
          className="h-8 w-8 object-contain"
        />
      </Link>
    </div>
  );
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    await signOut(auth);
    navigate('/login');
  }

  function isItemActive(url: string) {
    if (url === '/home') {
      return location.pathname === '/home';
    }
    return location.pathname === url || location.pathname.startsWith(`${url}/`);
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isItemActive(item.url)}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Cerrar sesion">
              <LogOut />
              <span>Cerrar sesion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
