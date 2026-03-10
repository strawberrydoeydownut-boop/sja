
export enum UserRole {
  Patient = 'patient',
  Admin = 'admin',
}

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  role: UserRole;
}

export interface VirtualEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ClinicWorkingHours {
  dayOfWeek: number; // 0 (Sun) to 6 (Sat)
  isOpen: boolean;
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

export interface Dentist {
  id: string;
  name: string;
  specialty: string;
  color: string;
  serviceIds?: string[]; // Services this specific dentist provides
  workingHours?: ClinicWorkingHours[]; // Individual schedule
}

export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
}

export enum AppointmentStatus {
  Pending = 'pending', // Waiting for dentist approval
  Scheduled = 'scheduled', // Approved
  Completed = 'completed',
  Cancelled = 'cancelled',
  NoShow = 'no-show',
}

export interface Appointment {
  id: string;
  patientId: string;
  dentistId: string;
  serviceId: string;
  start: Date;
  end: Date;
  status: AppointmentStatus;
  createdAt: Date;
}

export interface ClinicSettings {
  clinicName: string;
  onlineBookingEnabled: boolean;
  workingHours: ClinicWorkingHours[];
  slotDurationMinutes: number;
  holidays: string[];
}

export interface TimeSlot {
  time: Date;
  isAvailable: boolean;
}

export interface ReportData {
  totalAppointments: number;
  noShowRate: number;
  attendanceRate: number;
  appointmentsByService: { [serviceName: string]: number };
  busiestDays: { [day: string]: number };
}
