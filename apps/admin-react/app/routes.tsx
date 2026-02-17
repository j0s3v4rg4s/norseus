import { type RouteConfig, index, route, layout } from '@react-router/dev/routes';

export default [
  index('./routes/redirect-home.tsx'),
  layout('./routes/public-layout.tsx', [
    route('login', './routes/login/login.tsx'),
  ]),
  layout('./routes/protected-layout.tsx', [
    route('home', './routes/home/layout.tsx', [
      route('users', './routes/home/users.tsx'),
      route('permissions', './routes/home/permissions/index.tsx'),
      route('permissions/create', './routes/home/permissions/create.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
