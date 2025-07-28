import { Database, Constants } from './types';

export type Profile = Database['public']['Tables']['profile']['Row'];
export type Facility = Database['public']['Tables']['facility']['Row'];
export type FacilityUser = Database['public']['Tables']['facility_user']['Row'];
export type Role = Database['public']['Tables']['role']['Row'];
export type Permission = Database['public']['Tables']['permissions']['Row'];

export const PERMISSIONS_ACTIONS = Constants.public.Enums.permission_action;
export const PERMISSIONS_SECTIONS = Constants.public.Enums.sections;
export const USER_TYPES = Constants.public.Enums.user_type;

export type PermissionAction = Database['public']['Enums']['permission_action'];
export type Section = Database['public']['Enums']['sections'];
export type UserType = Database['public']['Enums']['user_type'];