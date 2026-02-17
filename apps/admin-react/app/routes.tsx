import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('./app.tsx'),
  route('login', './routes/login/login.tsx'),
  route('home', './routes/home/layout.tsx', [
    route('users', './routes/home/users.tsx'),
    route('permissions', './routes/home/permissions/index.tsx'),
  ])
] satisfies RouteConfig;
