# Product Requirements Document (PRD)

## Norseus - Enterprise Facility Management Platform

**Version:** 2.0
**Date:** March 2026
**Status:** Active Development

---

## 1. Executive Summary

### 1.1 Product Overview

Norseus is a modern, enterprise-grade facility management platform designed to help businesses manage their facilities, employees, clients, services, and operations efficiently. The platform provides comprehensive tools for multi-facility organizations to handle user management, role-based access control, service scheduling, class management, and membership plans.

### 1.2 Product Vision

To become the leading facility management platform that empowers businesses to streamline their operations, enhance customer experience, and scale efficiently across multiple locations.

### 1.3 Target Audience

**Primary Users:**

- Facility administrators and managers
- Facility employees (instructors, coaches, receptionists)
- Facility clients/members
- Super administrators (platform administrators)

**Target Businesses:**

- Fitness centers and gyms
- Wellness centers
- Sports facilities
- Training centers
- Multi-location service businesses

### 1.4 Key Value Propositions

1. **Multi-Facility Management**: Seamlessly manage multiple facilities from a single platform
2. **Flexible RBAC**: Granular permission system that adapts to any organizational structure
3. **Service Scheduling**: Advanced scheduling system for classes, sessions, and services
4. **Scalable Architecture**: Built on modern, cloud-native technologies for reliability and scale
5. **User-Centric Design**: Intuitive interface built with modern UI/UX principles

---

## 2. Product Goals and Objectives

### 2.1 Business Goals

1. **Operational Efficiency**: Reduce administrative overhead by 40% through automation
2. **Scalability**: Support organizations with 1-100+ facilities
3. **User Adoption**: Achieve 90% user satisfaction score
4. **Data Security**: Maintain 99.9% uptime and zero data breaches
5. **Revenue Growth**: Enable facilities to increase bookings by 25% through better scheduling

### 2.2 Technical Goals

1. **Performance**: Sub-200ms page load times
2. **Reliability**: 99.9% uptime SLA
3. **Security**: SOC 2 compliance readiness
4. **Scalability**: Support 10,000+ concurrent users
5. **Maintainability**: Modular architecture with domain-driven library separation

---

## 3. Product Scope

### 3.1 In Scope (Current Features)

#### 3.1.1 Authentication & Authorization

- Firebase Authentication integration
- Multi-factor authentication support
- Session management via Zustand global store
- Role-based access control (RBAC)
- Permission-based feature access
- Facility-level isolation

#### 3.1.2 User Management

- User profiles with basic information
- Employee management per facility (create, update, delete via Cloud Functions)
- Client/member management per facility
- Profile image management
- Email-based user identification

#### 3.1.3 Facility Management

- Multi-facility support
- Facility creation and configuration
- Facility logo management
- Facility-level data isolation
- Facility switching for multi-facility users

#### 3.1.4 Role & Permission Management

- Custom role creation per facility
- Granular permission system organized by sections
- Permission sections: roles, employees, services, programming
- Permission actions: create, read, update, delete
- Role assignment to employees
- Facility admin override capabilities

#### 3.1.5 Service Management

- Service creation and management
- Service activation/deactivation
- Service descriptions
- Plan-service associations (bidirectional via `planIds`)

#### 3.1.6 Schedule Management

- Weekly schedule creation for services
- Day-of-week scheduling (Monday-Sunday)
- Time-based scheduling (HH:mm 24-hour format)
- Duration configuration (minutes)
- Capacity management per schedule
- Minimum reservation time requirements
- Minimum cancellation time requirements
- Schedule activation/deactivation

#### 3.1.7 Class Management

- Automatic class generation from schedules
- Class instance management
- Class capacity tracking
- Instructor assignment
- Class program/content management (rich text via Tiptap)
- Booking management (user bookings array)

#### 3.1.8 Plan Management

- Membership plan creation with cost and currency
- Plan duration types (monthly, bimonthly, quarterly, semiannually, annually, custom)
- Plan-service associations with class limits (fixed or unlimited)
- Plan activation/deactivation

### 3.2 Out of Scope (Future Considerations)

1. **Payment Processing**: Integration with payment gateways
2. **Booking System**: Client-facing booking interface
3. **Mobile Applications**: Native iOS/Android apps
4. **Analytics Dashboard**: Advanced reporting and analytics
5. **Email Notifications**: Automated email system
6. **SMS Notifications**: SMS-based alerts
7. **Inventory Management**: Equipment and inventory tracking
8. **Marketing Tools**: Campaign management and promotions
9. **Third-Party Integrations**: External system integrations
10. **Multi-language Support**: Internationalization (i18n)

---

## 4. Functional Requirements

### 4.1 Authentication & Session Management

**FR-001: User Authentication**

- System MUST support Firebase Authentication
- System MUST support email/password authentication
- System MUST maintain user sessions securely via Zustand store
- System MUST redirect unauthenticated users to the login page
- System MUST support Firebase emulators for local development

**FR-002: Multi-Facility Access**

- Users MUST be able to belong to multiple facilities
- Users MUST be able to switch between facilities
- System MUST maintain facility context in session store

### 4.2 User Management

**FR-003: Profile Management**

- Users MUST have a profile with: name, email, profile image
- Profiles are stored at `profiles/{uid}` with the Firebase Auth UID as document ID
- System MUST store profile creation timestamp

**FR-004: Employee Management**

- System MUST allow creation of employees per facility via Cloud Functions
- Employees MUST be linked to a user account
- Employees MUST have an optional role assigned (`roleId`)
- Employees MUST have an admin flag (`isAdmin`)
- Employees MUST have an active flag (`isActive`) synced with Firebase Auth `disabled` status
- System MUST project profile data in employee documents to avoid extra reads
- System MUST store employee join date

**FR-005: Client Management**

- System MUST allow creation of clients per facility
- Clients MUST be linked to a user account
- Clients MUST have an active status
- System MUST project profile data in client documents
- System MUST store client join date

### 4.3 Facility Management

**FR-006: Facility Operations**

- System MUST support multiple facilities
- Facilities MUST have: name, logo, creation date
- Facilities MUST be isolated (data separation via Firestore subcollections)
- System MUST allow facility switching for authorized users

### 4.4 Role & Permission System

**FR-007: Role Management**

- System MUST support custom roles per facility
- Roles MUST have: id, name, permissions object
- Permissions MUST be organized by sections: `roles`, `employees`, `services`, `programming`
- Permissions MUST support actions: `create`, `read`, `update`, `delete`
- Role names MUST be unique per facility (enforced via Cloud Functions)
- Facility admins MUST have full access regardless of role

**FR-008: Permission Enforcement**

- System MUST enforce permissions at Firestore security rules level
- System MUST enforce permissions at application UI level
- System MUST provide helper functions for permission checking in security rules

### 4.5 Service Management

**FR-009: Service Operations**

- Services MUST belong to a facility
- Services MUST have: id, name, description, active status, timestamps
- Services MAY have `planIds` array referencing associated plans
- System MUST allow service activation/deactivation

**FR-010: Service Validation**

- Service name MUST be required
- Service description MUST be optional

### 4.6 Schedule Management

**FR-011: Schedule Operations**

- Schedules MUST belong to a service (subcollection)
- Schedules MUST have: id, dayOfWeek, startTime, durationMinutes, capacity
- Schedules MUST have: minReserveMinutes, minCancelMinutes
- Schedules MUST have active status and timestamps
- System MUST prevent duplicate schedules (same service, day, time) via Cloud Functions

**FR-012: Schedule Validation**

- Day of week MUST be: `mon`, `tue`, `wed`, `thu`, `fri`, `sat`, `sun`
- Start time MUST be in `HH:mm` format (24-hour)
- Duration MUST be positive integer (minutes)
- Capacity MUST be positive integer
- `minReserveMinutes` and `minCancelMinutes` MUST be >= 0

### 4.7 Class Management

**FR-013: Class Operations**

- Classes MUST be generated from service schedules
- Classes MUST have: id, serviceId, facilityId, scheduleId, date, startAt, duration, capacity
- Classes MUST support instructor assignment (`instructorId`)
- Classes MUST track user bookings (`userBookings` array of UIDs)
- Classes MUST support program content (rich text via Tiptap editor)
- Classes MAY have a program title (`programTitle`)

**FR-014: Class Generation**

- System MUST generate classes from active schedules
- System MUST respect schedule capacity and timing rules

### 4.8 Plan Management

**FR-015: Plan Operations**

- Plans MUST belong to a facility
- Plans MUST have: id, name, description, cost, currency, duration, services, active status
- Plan duration MUST support types: `monthly`, `bimonthly`, `quarterly`, `semiannually`, `annually`, `custom`
- Custom duration MUST specify number of days
- Plan services MUST specify: serviceId, classLimitType (`fixed` or `unlimited`), classLimit
- System MUST allow plan activation/deactivation

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

**NFR-001: Response Time**

- Page load time MUST be < 2 seconds
- API response time MUST be < 500ms (p95)
- Database query time MUST be < 200ms (p95)

**NFR-002: Throughput**

- System MUST support 1,000 concurrent users per facility
- System MUST handle 10,000 requests per minute

### 5.2 Scalability Requirements

**NFR-003: Horizontal Scaling**

- System MUST scale horizontally via Firebase infrastructure
- System MUST support 100+ facilities
- System MUST support 100,000+ users

**NFR-004: Data Growth**

- System MUST handle 1M+ documents per facility
- System MUST maintain performance with data growth

### 5.3 Security Requirements

**NFR-005: Authentication Security**

- System MUST use secure authentication (Firebase Auth)
- System MUST support session management
- Super admin role MUST be determined by Firebase Auth custom claim (`role == 'super_admin'`)

**NFR-006: Authorization Security**

- System MUST enforce RBAC at database level (Firestore Security Rules)
- System MUST enforce RBAC at application level
- System MUST prevent unauthorized data access
- System MUST maintain facility data isolation via subcollection architecture
- Facility admins MUST have wildcard write access to all subcollections within their facility

**NFR-007: Data Security**

- System MUST encrypt data in transit (HTTPS)
- System MUST encrypt sensitive data at rest (Firebase managed)
- System MUST comply with data protection regulations

### 5.4 Reliability Requirements

**NFR-008: Availability**

- System MUST maintain 99.9% uptime (Firebase SLA)
- System MUST have automated failover (Firebase managed)
- System MUST have backup and recovery procedures

**NFR-009: Error Handling**

- System MUST handle errors gracefully with user-friendly toast notifications (Sileo)
- System MUST provide meaningful error messages
- System MUST log errors for debugging

### 5.5 Usability Requirements

**NFR-010: User Interface**

- System MUST be responsive (mobile, tablet, desktop)
- System MUST follow accessibility standards (WCAG 2.1 AA)
- System MUST provide intuitive navigation via sidebar layout
- System MUST support keyboard navigation

**NFR-011: Internationalization**

- System MUST use English as primary language
- System MUST support future i18n (structure ready)

### 5.6 Maintainability Requirements

**NFR-012: Code Quality**

- Code MUST follow React 19 best practices with functional components
- Code MUST use TypeScript strict mode
- Code MUST follow project coding standards defined in AGENTS.md
- Domain libraries MUST be pure functions (no React dependencies)

**NFR-013: Testing**

- Critical paths SHOULD have unit tests
- Components SHOULD have component tests
- Services SHOULD have service tests

---

## 6. Technical Architecture

### 6.1 Technology Stack

**Frontend:**

- React 19 (functional components, hooks)
- React Router v7 (SPA mode, file-based routing, no SSR)
- Zustand 5.x (global state management)
- React Hook Form 7.x + Zod 4.x (form handling and validation)
- Tailwind CSS v4 (styling)
- shadcn/ui via Radix UI primitives (UI component library)
- Lucide React (icons)
- Tiptap 3.x (rich text editor)
- Sileo (toast notifications)

**Backend:**

- Firebase Authentication (user authentication, custom claims)
- Firebase Firestore (NoSQL database)
- Firebase Cloud Functions (serverless functions via esbuild)
- Firebase Storage (file storage)

**Development Tools:**

- Nx 21.x (monorepo management)
- Vite 6.x (bundling and dev server)
- TypeScript 5.8.x
- pnpm (package manager)
- ESLint (linting)
- Prettier (code formatting)

### 6.2 Monorepo Structure

```
norseus/
├── apps/
│   ├── admin-react/       # React 19 admin application (SPA)
│   │   ├── app/
│   │   │   ├── routes/    # React Router v7 file-based routes
│   │   │   ├── firebase.ts
│   │   │   ├── root.tsx
│   │   │   └── routes.ts
│   │   ├── react-router.config.ts
│   │   └── vite.config.ts
│   └── functions/         # Firebase Cloud Functions
│       └── src/index.ts
├── libs/
│   ├── front/
│   │   ├── cn/            # shadcn/ui components (28 components), hooks, utils
│   │   ├── employees/     # Employee domain service (pure functions)
│   │   ├── facility/      # Facility domain service (pure functions)
│   │   ├── roles/         # Roles domain service (pure functions)
│   │   ├── services/      # Services, schedules, classes, plans services (pure functions)
│   │   └── ui-react/      # Shared React components (DaySelector, WeekCalendar, etc.)
│   ├── models/            # Shared TypeScript models (front + back)
│   └── assets/            # Global styles
├── docs/                  # Project documentation
├── nx.json
├── tsconfig.base.json
└── package.json
```

### 6.3 Path Aliases

```
@front/cn/components/*  -> libs/front/cn/components/*
@front/cn/hooks/*       -> libs/front/cn/hooks/*
@front/cn/utils         -> libs/front/cn/utils/index.ts
@front/employees        -> libs/front/employees/src/index.ts
@front/facility         -> libs/front/facility/src/index.ts
@front/roles            -> libs/front/roles/src/index.ts
@front/services         -> libs/front/services/src/index.ts
@front/ui-react         -> libs/front/ui-react/src/index.ts
@models/classes         -> libs/models/src/classes/index.ts
@models/common          -> libs/models/src/common/index.ts
@models/facility        -> libs/models/src/facility/index.ts
@models/permissions     -> libs/models/src/permissions/index.ts
@models/plans           -> libs/models/src/plans/index.ts
@models/services        -> libs/models/src/services/index.ts
@models/user            -> libs/models/src/user/index.ts
```

### 6.4 Application Routes

```
/                          -> Redirect to /home
/login                     -> Public login page
/home                      -> Protected layout (sidebar + header)
  /home/employees          -> Employees list
  /home/employees/create   -> Create employee
  /home/employees/:id/edit -> Edit employee
  /home/permissions        -> Roles/permissions list
  /home/permissions/create -> Create role
  /home/permissions/:id/edit -> Edit role
  /home/services           -> Services list
  /home/services/create    -> Create service
  /home/services/:id/edit  -> Edit service
  /home/services/:id       -> Service detail (schedules)
  /home/services/:id/schedules/create -> Create schedule
  /home/plans              -> Plans list
  /home/plans/create       -> Create plan
  /home/plans/:id/edit     -> Edit plan
  /home/plans/:id          -> Plan detail
```

### 6.5 Database Architecture

- Firestore with hierarchical subcollections
- Denormalized data for performance (profile projections in employee/client documents)
- Facility-based data isolation
- Collection groups for cross-facility queries

```
profiles/{uid}
facilities/{facilityId}/
├── employees/{uid}
├── clients/{uid}
├── roles/{roleId}
├── services/{serviceId}/
│   └── schedules/{scheduleId}
├── classes/{classId}
└── plans/{planId}
```

### 6.6 Security Architecture

**Authentication:**

- Firebase Authentication for user management
- JWT-based session tokens with custom claims
- `super_admin` role via custom claim

**Authorization:**

- Firestore Security Rules for database-level enforcement
- Application-level permission checks
- Role-based access control (RBAC) with per-section, per-action granularity
- Facility admin wildcard rule: full read/write on all subcollections
- Helper functions: `isSuperAdmin`, `isAuth`, `isFacilityAdmin`, `isFacilityEmployee`, `isFacilityClient`, `belongsToFacility`, `hasPermission`

### 6.7 Domain Library Architecture

All domain libraries (`@front/employees`, `@front/facility`, `@front/roles`, `@front/services`) follow a pure function pattern:

- No React dependencies (no hooks, no components)
- Receive Firebase instances (`db: Firestore`, `functions: Functions`) as parameters
- Return Promises with typed models from `@models/*`
- Can be consumed by any React component or store

---

## 7. User Interface Requirements

### 7.1 Design Principles

1. **Consistency**: Use shadcn/ui components with Radix UI primitives
2. **Accessibility**: Follow WCAG 2.1 AA standards via Radix built-in accessibility
3. **Responsiveness**: Support mobile, tablet, and desktop
4. **Performance**: Optimize for fast load times with Vite + code splitting
5. **Usability**: Sidebar-based navigation with intuitive layout

### 7.2 Key Pages/Features

**Authentication:**

- Login page with email/password

**Main Layout:**

- Sidebar navigation (collapsible, via shadcn Sidebar component)
- Header with facility selector and user menu

**Employee Management:**

- Employees list with table view
- Employee creation form
- Employee editing form

**Role Management:**

- Roles/permissions list
- Role creation with section-based permission checkboxes
- Role editing

**Service Management:**

- Services list
- Service creation form
- Service editing form
- Service detail page with schedules view
- Schedule creation form

**Class Management:**

- Week calendar view (via `@front/ui-react` WeekCalendar/DateWeekCalendar)
- Class detail view
- Class program editing with Tiptap rich text editor

**Plan Management:**

- Plans list
- Plan creation form with service associations and class limits
- Plan editing form
- Plan detail view

### 7.3 UI Component Library

28 shadcn/ui components available via `@front/cn/components/`:

AlertDialog, Alert, Avatar, Badge, Breadcrumb, Button, Card, Checkbox, Collapsible, DropdownMenu, Empty, Field, Input, Label, Select, Separator, Sheet, Sidebar, Skeleton, Switch, Table, Tabs, Textarea, ToggleGroup, Toggle, Tooltip

Custom hooks: `use-mobile`
Utilities: `cn()` (clsx + tailwind-merge)

---

## 8. Integration Requirements

### 8.1 Current Integrations

**Firebase Services:**

- Firebase Authentication (email/password, custom claims)
- Firebase Firestore (document database with security rules)
- Firebase Cloud Functions (employee CRUD, validation logic)
- Firebase Storage (images and files)
- Firebase Emulators (local development: auth:9099, firestore:8080, functions:5001)

### 8.2 Future Integration Considerations

- Payment gateways (Stripe, PayPal)
- Email service providers (SendGrid, Mailgun)
- SMS providers (Twilio)
- Calendar systems (Google Calendar, Outlook)
- Analytics platforms (Google Analytics, Mixpanel)

---

## 9. Data Requirements

### 9.1 Data Storage

**Database:**

- Firebase Firestore (NoSQL document database)
- Hierarchical subcollection structure under facilities
- Denormalized profile projections for read performance

**File Storage:**

- Firebase Storage for images and files
- Profile images
- Facility logos

### 9.2 Data Retention

- User data: Retained while account is active
- Deleted users: Soft delete with 30-day retention
- Audit logs: 90-day retention
- Backup: Daily automated backups (Firebase managed)

### 9.3 Data Privacy

- GDPR compliance considerations
- User data export capability (future)
- User data deletion capability
- Privacy policy compliance

---

## 10. Success Metrics

### 10.1 User Adoption Metrics

- Monthly Active Users (MAU)
- Daily Active Users (DAU)
- User retention rate (30-day, 90-day)
- Feature adoption rate

### 10.2 Performance Metrics

- Average page load time
- API response time (p50, p95, p99)
- Error rate
- Uptime percentage

### 10.3 Business Metrics

- Number of facilities onboarded
- Number of services created
- Number of classes scheduled
- Booking conversion rate (future)

### 10.4 Technical Metrics

- Build time
- Deployment frequency
- Mean time to recovery (MTTR)

---

## 11. Risks and Mitigation

### 11.1 Technical Risks

**Risk 1: Firebase Service Limits**

- **Impact**: High
- **Probability**: Medium
- **Mitigation**: Monitor usage, implement caching, plan for scaling

**Risk 2: Data Consistency**

- **Impact**: High
- **Probability**: Low
- **Mitigation**: Use Cloud Functions for critical operations (employee management, uniqueness validation), implement validation at both client and server

**Risk 3: Security Vulnerabilities**

- **Impact**: Critical
- **Probability**: Low
- **Mitigation**: Firestore Security Rules with comprehensive helper functions, regular security audits, permission enforcement at both database and application layers

### 11.2 Business Risks

**Risk 4: User Adoption**

- **Impact**: High
- **Probability**: Medium
- **Mitigation**: User testing, feedback collection, iterative improvements

**Risk 5: Scalability Challenges**

- **Impact**: Medium
- **Probability**: Medium
- **Mitigation**: Load testing, performance monitoring, Firestore indexing strategy

---

## 12. Dependencies

### 12.1 External Dependencies

- Firebase services (Auth, Firestore, Functions, Storage)
- React and React Router ecosystem
- Nx monorepo tools
- shadcn/ui + Radix UI component primitives
- Tailwind CSS v4

### 12.2 Internal Dependencies

- `@models/*` shared TypeScript models
- `@front/cn` UI component library
- `@front/*` domain service libraries
- `@front/ui-react` shared React components

---

## 13. Timeline and Milestones

### 13.1 Current Status

**Phase 1: Foundation (Completed)**

- Authentication system (Firebase Auth)
- User/employee management
- Facility management
- RBAC system (roles + permissions)
- Service management
- Schedule management
- Class management
- Plan management
- Migration from Angular to React 19

### 13.2 Future Milestones

**Phase 2: Enhancement (Planned)**

- Client-facing booking system
- Payment integration
- Email notifications
- Mobile optimization

**Phase 3: Advanced Features (Future)**

- Analytics dashboard
- Reporting system
- Third-party integrations
- Mobile applications

---

## 14. Appendices

### 14.1 Glossary

- **RBAC**: Role-Based Access Control
- **Facility**: A business location or establishment
- **Employee**: A staff member of a facility
- **Client**: A customer or member of a facility
- **Service**: An offering provided by a facility (e.g., yoga class)
- **Schedule**: A recurring weekly time slot for a service
- **Class**: A specific instance of a service at a date/time
- **Plan**: A membership plan that includes services with class limits
- **Profile**: User account information (Firebase Auth linked)

### 14.2 References

- [AGENTS.md](../AGENTS.md) - Development guidelines and coding standards
- [firestore-collections.md](./firestore-collections.md) - Firestore database structure

### 14.3 Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 2025 | Initial PRD creation (Angular stack) |
| 2.0 | March 2026 | Complete rewrite reflecting React 19 migration, updated tech stack, removed Angular references |

---

**Document Status:** Active
**Last Updated:** March 2026
**Next Review:** Quarterly
