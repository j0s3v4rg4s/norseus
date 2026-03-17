import { SidebarInset, SidebarProvider } from '@front/cn/components/sidebar';
import { AppHeader } from '../../components/layout/app-header';
import { AppSidebar } from '../../components/layout/app-sidebar';
import { Outlet } from 'react-router';

export default function HomeLayout() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '15rem',
          '--sidebar-width-mobile': '20rem',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" collapsible="icon" />
      <SidebarInset>
        <AppHeader title="Super Admin" />
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 @md/main:gap-6 @md/main:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
