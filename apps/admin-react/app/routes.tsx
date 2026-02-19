import { type RouteConfig, index, route, layout } from '@react-router/dev/routes';

export default [
  index('./routes/redirect-home.tsx'),
  layout('./routes/public-layout.tsx', [
    route('login', './routes/login/login.tsx'),
  ]),
  layout('./routes/protected-layout.tsx', [
    route('home', './routes/home/layout.tsx', [
      route('employees', './routes/home/employees/index.tsx'),
      route('employees/create', './routes/home/employees/employees-create.tsx'),
      route('employees/:employeeId/edit', './routes/home/employees/employees-edit.tsx'),
      route('permissions', './routes/home/permissions/index.tsx'),
      route('permissions/create', './routes/home/permissions/permissions-create.tsx'),
      route('permissions/:roleId/edit', './routes/home/permissions/permissions-edit.tsx'),
      route('services', './routes/home/services/index.tsx'),
      route('services/create', './routes/home/services/services-create.tsx'),
      route('services/:serviceId/edit', './routes/home/services/services-edit.tsx'),
      route('services/:serviceId', './routes/home/services/services-detail.tsx'),
      route('services/:serviceId/schedules/create', './routes/home/services/schedules/schedules-create.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
