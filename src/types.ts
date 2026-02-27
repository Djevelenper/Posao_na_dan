export type UserRole = 'worker' | 'venue';
export type Industry = 'hospitality' | 'healthcare';
export type City = 'Beograd' | 'Novi Sad' | 'Kragujevac' | 'Niš' | 'Subotica' | 'Trebinje' | 'Banja Luka';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  industry: Industry;
  city: City;
  avatar?: string;
  rating: number;
  completedShifts: number;
}

export interface Shift {
  id: string;
  venueId: string;
  venueName: string;
  venueAvatar?: string;
  distance: string;
  date: string; // ISO string
  startTime: string;
  endTime: string;
  role: string;
  pay: number;
  status: 'open' | 'pending' | 'booked' | 'completed';
  workerId?: string;
  industry: Industry;
  city: City;
  department?: string;
}

export interface Booking {
  id: string;
  shiftId: string;
  workerId: string;
  status: 'pending' | 'confirmed' | 'rejected';
}
