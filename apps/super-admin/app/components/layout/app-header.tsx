import { SidebarTrigger } from '@front/cn/components/sidebar';
import { Separator } from '@front/cn/components/separator';

interface AppHeaderProps {
  title: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 !h-4" />
      <h1 className="text-sm font-semibold">{title}</h1>
    </header>
  );
}
