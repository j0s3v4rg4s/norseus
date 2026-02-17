import type { LucideIcon } from 'lucide-react';
import { ChevronDown, Home, Users, Lock, Dumbbell, CreditCard, LogOut } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@front/cn/components/collapsible';
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@front/cn/components/sidebar';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

interface MenuSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
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

  function hasActiveSubItem(subItems: MenuSubItem[]) {
    return subItems.some((sub) => isItemActive(sub.url));
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) =>
                item.subItems && item.subItems.length > 0 ? (
                  <Collapsible
                    key={item.title}
                    defaultOpen={hasActiveSubItem(item.subItems)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.title}>
                          <item.icon />
                          <span>{item.title}</span>
                          <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={isItemActive(subItem.url)}>
                                <NavLink to={subItem.url} end={subItem.url === '/home'}>
                                  {subItem.title}
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isItemActive(item.url ?? '')}
                      tooltip={item.title}
                    >
                      <NavLink to={item.url ?? '#'} end={item.url === '/home'}>
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Log out">
              <LogOut />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
