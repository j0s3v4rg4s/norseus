import { Links, Meta, Outlet, Scripts, ScrollRestoration, type MetaFunction, type LinksFunction } from 'react-router';
import { Toaster } from 'sileo';
import { AuthProvider } from './context/auth-context';
import { TooltipProvider } from '@front/cn/components/tooltip';

export const meta: MetaFunction = () => [
  {
    title: 'Norseus Super Admin',
  },
];

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster options={{ fill: '#171717', styles: { description: 'text-zinc-400' } }} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
