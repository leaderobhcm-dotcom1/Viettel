export enum PlanType {
  MOBILE = 'MOBILE',
  INTERNET = 'INTERNET',
  COMBO = 'COMBO'
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  data?: string;
  speed?: string;
  calls?: string;
  features: string[];
  type: PlanType;
  hot?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface ContactFormState {
  name: string;
  phone: string;
  service: string;
}

// New Types for Admin/Auth
export type Role = 'ADMIN' | 'CTV';

export interface User {
  username: string;
  role: Role;
  name: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  service: string;
  timestamp: number;
  status: 'new' | 'contacted' | 'done';
}

export interface ContactConfig {
  hotline: string;
  website: string;
  address: string;
}
