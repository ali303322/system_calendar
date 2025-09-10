export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Event {
  end_datetime?: string;
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  start_datetime?: string;
  location?: string;
  color?: string;
  isAllDay?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string; // Rendre optionnel pour simplifier
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Calendar: undefined;
  EventForm: { event?: Event; mode: 'create' | 'edit' };
  EventDetails: { event: Event };
  Notifications: undefined;
}; 