import { type RouteConfig, index, route, layout } from '@react-router/dev/routes';

export default [
  index('./routes/redirect-home.tsx'),
  layout('./routes/public-layout.tsx', [
    route('login', './routes/login/login.tsx'),
  ]),
  layout('./routes/protected-layout.tsx', [
    route('home', './routes/home/layout.tsx', [
      route('facilities', './routes/home/facilities/index.tsx'),
      route('facilities/create', './routes/home/facilities/facilities-create.tsx'),
      route('super-admins', './routes/home/super-admins/index.tsx'),
      route('super-admins/create', './routes/home/super-admins/super-admins-create.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
