# Product Requirements Document (PRD)
## Norseus - Enterprise Facility Management Platform

**Version:** 1.0  
**Date:** January 2025  
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
5. **Maintainability**: Modular architecture with 80%+ code coverage

---

## 3. Product Scope

### 3.1 In Scope (Current Features)

#### 3.1.1 Authentication & Authorization
- Firebase Authentication integration
- Multi-factor authentication support
- Session management
- Role-based access control (RBAC)
- Permission-based feature access
- Facility-level isolation

#### 3.1.2 User Management
- User profiles with basic information
- Employee management per facility
- Client/member management per facility
- User creation, update, and deletion
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
- Granular permission system
- Permission sections: roles, employees, services
- Permission actions: create, read, update, delete
- Role assignment to employees
- Facility admin override capabilities

#### 3.1.5 Service Management
- Service creation and management
- Service activation/deactivation
- Service descriptions
- Service categorization (future)

#### 3.1.6 Schedule Management
- Weekly schedule creation for services
- Day-of-week scheduling (Monday-Sunday)
- Time-based scheduling (HH:mm format)
- Duration configuration
- Capacity management per schedule
- Minimum reservation time requirements
- Minimum cancellation time requirements
- Schedule activation/deactivation
- Batch schedule creation
- Employee assignment to schedules

#### 3.1.7 Class Management
- Automatic class generation from schedules
- Class instance management
- Class capacity tracking
- Instructor assignment
- Class program/content management (rich text)
- Booking management (user bookings array)

#### 3.1.8 Plan Management
- Membership plan creation
- Plan-service associations
- Plan pricing and configuration
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

## 4. User Stories and Use Cases

### 4.1 Super Administrator

**US-001: Create Facility**
- **As a** super administrator
- **I want to** create new facilities in the system
- **So that** new organizations can use the platform

**US-002: Manage All Facilities**
- **As a** super administrator
- **I want to** view and manage all facilities
- **So that** I can oversee platform operations

### 4.2 Facility Administrator

**US-003: Manage Employees**
- **As a** facility administrator
- **I want to** create, edit, and remove employees
- **So that** I can manage my facility's staff

**US-004: Create Custom Roles**
- **As a** facility administrator
- **I want to** create custom roles with specific permissions
- **So that** I can control what each employee can do

**US-005: Assign Roles to Employees**
- **As a** facility administrator
- **I want to** assign roles to employees
- **So that** they have appropriate access levels

**US-006: Manage Services**
- **As a** facility administrator
- **I want to** create and manage services offered by my facility
- **So that** clients can book them

**US-007: Create Service Schedules**
- **As a** facility administrator
- **I want to** create weekly schedules for services
- **So that** classes are available at consistent times

**US-008: Manage Plans**
- **As a** facility administrator
- **I want to** create membership plans
- **So that** clients can subscribe to services

### 4.3 Facility Employee

**US-009: View Assigned Schedules**
- **As a** facility employee
- **I want to** view my assigned service schedules
- **So that** I know when I'm scheduled to work

**US-010: Manage Class Programs**
- **As a** facility employee with programming permission
- **I want to** create and edit class programs
- **So that** I can prepare class content

**US-011: View Facility Data**
- **As a** facility employee
- **I want to** view facility services, schedules, and classes
- **So that** I can assist clients

### 4.4 Facility Client

**US-012: View Available Services** (Future)
- **As a** facility client
- **I want to** view available services and schedules
- **So that** I can plan my bookings

**US-013: Book Classes** (Future)
- **As a** facility client
- **I want to** book available classes
- **So that** I can attend scheduled sessions

---

## 5. Functional Requirements

### 5.1 Authentication & Session Management

**FR-001: User Authentication**
- System MUST support Firebase Authentication
- System MUST support email/password authentication
- System MUST maintain user sessions securely
- System MUST support session timeout after inactivity

**FR-002: Multi-Facility Access**
- Users MUST be able to belong to multiple facilities
- Users MUST be able to switch between facilities
- System MUST maintain facility context per session

### 5.2 User Management

**FR-003: Profile Management**
- Users MUST have a profile with: name, email, profile image
- Users MUST be able to update their own profile
- System MUST store profile creation timestamp

**FR-004: Employee Management**
- System MUST allow creation of employees per facility
- Employees MUST be linked to a user account
- Employees MUST have a role assigned
- Employees MUST have an admin flag
- System MUST store employee join date
- System MUST project profile data in employee documents

**FR-005: Client Management**
- System MUST allow creation of clients per facility
- Clients MUST be linked to a user account
- Clients MUST have membership status
- System MUST store client join date
- System MUST project profile data in client documents

### 5.3 Facility Management

**FR-006: Facility Operations**
- System MUST support multiple facilities
- Facilities MUST have: name, logo, creation date
- Facilities MUST be isolated (data separation)
- System MUST allow facility switching for authorized users

### 5.4 Role & Permission System

**FR-007: Role Management**
- System MUST support custom roles per facility
- Roles MUST have: name, description, permissions object
- Permissions MUST be organized by sections (roles, employees, services)
- Permissions MUST support actions: create, read, update, delete
- System MUST allow role creation, update, and deletion
- Facility admins MUST have full access regardless of role

**FR-008: Permission Enforcement**
- System MUST enforce permissions at Firestore security rules level
- System MUST enforce permissions at application UI level
- System MUST check permissions before allowing operations
- System MUST provide permission checking helper functions

### 5.5 Service Management

**FR-009: Service Operations**
- Services MUST belong to a facility
- Services MUST have: name, description, active status
- System MUST track service creation and update timestamps
- System MUST allow service activation/deactivation
- Inactive services MUST hide their schedules from active use

**FR-010: Service Validation**
- Service name MUST be required
- Service name MUST have maximum length validation
- Service description MUST be optional

### 5.6 Schedule Management

**FR-011: Schedule Operations**
- Schedules MUST belong to a service
- Schedules MUST have: day of week, start time, duration, capacity
- Schedules MUST have: minimum reserve minutes, minimum cancel minutes
- Schedules MUST have an assigned employee
- Schedules MUST have active status
- System MUST prevent duplicate schedules (same service, day, time)
- System MUST validate: duration > 0, capacity > 0, times >= 0

**FR-012: Schedule Validation**
- Day of week MUST be: mon, tue, wed, thu, fri, sat, sun
- Start time MUST be in HH:mm format (24-hour)
- Duration MUST be positive integer (minutes)
- Capacity MUST be positive integer
- Employee ID MUST reference valid facility employee
- System MUST track schedule creation and update timestamps

### 5.7 Class Management

**FR-013: Class Operations**
- Classes MUST be generated from service schedules
- Classes MUST have: service reference, facility reference, date/time
- Classes MUST have: capacity, start time, duration
- Classes MUST support instructor assignment
- Classes MUST track user bookings (array of user IDs)
- Classes MUST support program content (rich text)
- System MUST track class creation and update timestamps

**FR-014: Class Generation**
- System MUST generate classes from active schedules
- System MUST respect schedule capacity and timing rules
- System MUST allow manual class creation/editing
- System MUST validate class dates are in the future (for bookings)

### 5.8 Plan Management

**FR-015: Plan Operations**
- Plans MUST belong to a facility
- Plans MUST have: name, description, active status
- Plans MUST support service associations
- System MUST track plan creation and update timestamps
- System MUST allow plan activation/deactivation

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

**NFR-001: Response Time**
- Page load time MUST be < 2 seconds
- API response time MUST be < 500ms (p95)
- Database query time MUST be < 200ms (p95)

**NFR-002: Throughput**
- System MUST support 1,000 concurrent users per facility
- System MUST handle 10,000 requests per minute

### 6.2 Scalability Requirements

**NFR-003: Horizontal Scaling**
- System MUST scale horizontally
- System MUST support 100+ facilities
- System MUST support 100,000+ users

**NFR-004: Data Growth**
- System MUST handle 1M+ documents per facility
- System MUST maintain performance with data growth

### 6.3 Security Requirements

**NFR-005: Authentication Security**
- System MUST use secure authentication (Firebase Auth)
- System MUST enforce password complexity (if applicable)
- System MUST support session management

**NFR-006: Authorization Security**
- System MUST enforce RBAC at database level (Firestore Rules)
- System MUST enforce RBAC at application level
- System MUST prevent unauthorized data access
- System MUST maintain facility data isolation

**NFR-007: Data Security**
- System MUST encrypt data in transit (HTTPS)
- System MUST encrypt sensitive data at rest
- System MUST comply with data protection regulations
- System MUST implement audit logging

### 6.4 Reliability Requirements

**NFR-008: Availability**
- System MUST maintain 99.9% uptime
- System MUST have automated failover
- System MUST have backup and recovery procedures

**NFR-009: Error Handling**
- System MUST handle errors gracefully
- System MUST provide meaningful error messages
- System MUST log all errors for debugging

### 6.5 Usability Requirements

**NFR-010: User Interface**
- System MUST be responsive (mobile, tablet, desktop)
- System MUST follow accessibility standards (WCAG 2.1 AA)
- System MUST provide intuitive navigation
- System MUST support keyboard navigation

**NFR-011: Internationalization**
- System MUST use English as primary language
- System MUST support future i18n (structure ready)

### 6.6 Maintainability Requirements

**NFR-012: Code Quality**
- Code MUST follow Angular 20.1.3 best practices
- Code MUST have TypeScript strict mode enabled
- Code MUST follow project coding standards
- Code MUST be documented (JSDoc for public APIs)

**NFR-013: Testing**
- Critical paths MUST have unit tests
- Components MUST have component tests
- Services MUST have service tests
- Target: 80%+ code coverage

---

## 7. Technical Architecture

### 7.1 Technology Stack

**Frontend:**
- Angular 20.1.3 (standalone components, signals)
- Nx 21.3.9 (monorepo management)
- Tailwind CSS v4 (styling)
- @p1kka/ui (UI component library)
- Angular Signals with @ngrx/signals (state management)

**Backend:**
- Firebase Authentication (user authentication)
- Firebase Firestore (NoSQL database)
- Firebase Cloud Functions (serverless functions)
- Firebase Storage (file storage)

**Development Tools:**
- TypeScript 5.8.3
- pnpm (package manager)
- ESLint (linting)
- Prettier (code formatting)

### 7.2 System Architecture

**Monorepo Structure:**
```
norseus/
├── apps/
│   ├── admin/          # Main Angular application
│   └── functions/      # Firebase Cloud Functions
├── libs/
│   ├── front/
│   │   ├── core/       # Business logic (employee, facility, profile, roles, services)
│   │   ├── state/      # State management (session)
│   │   ├── ui/         # UI component library
│   │   └── utils/      # Utilities (logger)
│   └── models/         # Shared data models
```

**Database Architecture:**
- Firestore with hierarchical subcollections
- Denormalized data for performance (profile projections)
- Facility-based data isolation
- Collection groups for cross-facility queries

### 7.3 Security Architecture

**Authentication:**
- Firebase Authentication for user management
- JWT-based session tokens
- Secure session management

**Authorization:**
- Firestore Security Rules for database-level enforcement
- Application-level permission checks
- Role-based access control (RBAC)
- Facility-level data isolation

### 7.4 Data Model

**Core Collections:**
- `profiles/{uid}` - User profiles
- `facilities/{facilityId}` - Facilities
- `facilities/{facilityId}/employees/{uid}` - Facility employees
- `facilities/{facilityId}/clients/{uid}` - Facility clients
- `facilities/{facilityId}/roles/{roleId}` - Facility roles
- `facilities/{facilityId}/services/{serviceId}` - Facility services
- `facilities/{facilityId}/services/{serviceId}/schedules/{scheduleId}` - Service schedules
- `facilities/{facilityId}/classes/{classId}` - Bookable classes
- `facilities/{facilityId}/plans/{planId}` - Membership plans

---

## 8. User Interface Requirements

### 8.1 Design Principles

1. **Consistency**: Use consistent UI components and patterns
2. **Accessibility**: Follow WCAG 2.1 AA standards
3. **Responsiveness**: Support mobile, tablet, and desktop
4. **Performance**: Optimize for fast load times
5. **Usability**: Intuitive navigation and clear actions

### 8.2 Key Pages/Features

**Authentication:**
- Login page
- Session management

**Dashboard:**
- Facility overview
- Quick actions
- Recent activity

**User Management:**
- Users list
- User creation
- User editing
- User deletion

**Role Management:**
- Roles list
- Role creation
- Role editing
- Permission configuration

**Service Management:**
- Services list
- Service creation
- Service editing
- Service schedules view
- Schedule creation/editing

**Class Management:**
- Classes calendar view
- Class detail view
- Class program editing
- Booking management (future)

**Plan Management:**
- Plans list
- Plan creation
- Plan editing
- Plan-service associations

### 8.3 UI Component Library

**Available Components:**
- Input fields (text, email, etc.)
- Buttons (primary, secondary, destructive, outline, ghost, link, icon)
- Select dropdowns
- Modals and dialogs
- Tables (CDK Table)
- Forms (reactive forms)
- Layout components

---

## 9. Integration Requirements

### 9.1 Current Integrations

**Firebase Services:**
- Firebase Authentication
- Firebase Firestore
- Firebase Cloud Functions
- Firebase Storage

### 9.2 Future Integration Considerations

- Payment gateways (Stripe, PayPal)
- Email service providers (SendGrid, Mailgun)
- SMS providers (Twilio)
- Calendar systems (Google Calendar, Outlook)
- Analytics platforms (Google Analytics, Mixpanel)

---

## 10. Data Requirements

### 10.1 Data Storage

**Database:**
- Firebase Firestore (NoSQL document database)
- Hierarchical collection structure
- Denormalized data for performance

**File Storage:**
- Firebase Storage for images and files
- Profile images
- Facility logos
- Class program attachments (future)

### 10.2 Data Retention

- User data: Retained while account is active
- Deleted users: Soft delete with 30-day retention
- Audit logs: 90-day retention
- Backup: Daily automated backups

### 10.3 Data Privacy

- GDPR compliance considerations
- User data export capability (future)
- User data deletion capability
- Privacy policy compliance

---

## 11. Success Metrics

### 11.1 User Adoption Metrics

- Monthly Active Users (MAU)
- Daily Active Users (DAU)
- User retention rate (30-day, 90-day)
- Feature adoption rate

### 11.2 Performance Metrics

- Average page load time
- API response time (p50, p95, p99)
- Error rate
- Uptime percentage

### 11.3 Business Metrics

- Number of facilities onboarded
- Number of services created
- Number of classes scheduled
- Booking conversion rate (future)

### 11.4 Technical Metrics

- Code coverage percentage
- Build time
- Deployment frequency
- Mean time to recovery (MTTR)

---

## 12. Risks and Mitigation

### 12.1 Technical Risks

**Risk 1: Firebase Service Limits**
- **Impact**: High
- **Probability**: Medium
- **Mitigation**: Monitor usage, implement caching, plan for scaling

**Risk 2: Data Consistency**
- **Impact**: High
- **Probability**: Low
- **Mitigation**: Use Cloud Functions for critical operations, implement validation

**Risk 3: Security Vulnerabilities**
- **Impact**: Critical
- **Probability**: Low
- **Mitigation**: Regular security audits, automated security scanning, security rules testing

### 12.2 Business Risks

**Risk 4: User Adoption**
- **Impact**: High
- **Probability**: Medium
- **Mitigation**: User testing, feedback collection, iterative improvements

**Risk 5: Scalability Challenges**
- **Impact**: Medium
- **Probability**: Medium
- **Mitigation**: Load testing, performance monitoring, architectural reviews

---

## 13. Dependencies

### 13.1 External Dependencies

- Firebase services (Auth, Firestore, Functions, Storage)
- Angular framework and ecosystem
- Nx monorepo tools
- Third-party UI libraries (@p1kka/ui)

### 13.2 Internal Dependencies

- Shared models library
- Core business logic libraries
- UI component library
- State management libraries

---

## 14. Timeline and Milestones

### 14.1 Current Status

**Phase 1: Foundation (Completed)**
- ✅ Authentication system
- ✅ User management
- ✅ Facility management
- ✅ RBAC system
- ✅ Service management
- ✅ Schedule management
- ✅ Class management
- ✅ Plan management

### 14.2 Future Milestones

**Phase 2: Enhancement (Planned)**
- Booking system
- Payment integration
- Email notifications
- Mobile optimization

**Phase 3: Advanced Features (Future)**
- Analytics dashboard
- Reporting system
- Third-party integrations
- Mobile applications

---

## 15. Appendices

### 15.1 Glossary

- **RBAC**: Role-Based Access Control
- **Facility**: A business location or establishment
- **Employee**: A staff member of a facility
- **Client**: A customer or member of a facility
- **Service**: An offering provided by a facility (e.g., yoga class)
- **Schedule**: A recurring weekly time slot for a service
- **Class**: A specific instance of a service at a date/time
- **Plan**: A membership plan that includes services
- **Profile**: User account information

### 15.2 References

- [AGENTS.md](../AGENTS.md) - Development guidelines
- [project-overview.md](./project-overview.md) - Project overview
- [rbac-design.md](./rbac-design.md) - RBAC system design
- [services.md](./services.md) - Services feature specification
- [employees-technical-plan.md](./employees-technical-plan.md) - Employee management plan
- [FIRESTORE_DATABASE_STRUCTURE.md](../FIRESTORE_DATABASE_STRUCTURE.md) - Database structure

### 15.3 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2025 | AI Assistant | Initial PRD creation |

---

**Document Status:** Active  
**Last Updated:** January 2025  
**Next Review:** Quarterly

