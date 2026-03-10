
import { User, Dentist, Service, Appointment, ClinicSettings, UserRole, AppointmentStatus, ClinicWorkingHours } from './types';

// Dr. Velez Schedule: Mon-Sat, 8am-5pm
const VELEZ_SCHEDULE: ClinicWorkingHours[] = [
  { dayOfWeek: 1, isOpen: true, start: "08:00", end: "17:00" },
  { dayOfWeek: 2, isOpen: true, start: "08:00", end: "17:00" },
  { dayOfWeek: 3, isOpen: true, start: "08:00", end: "17:00" },
  { dayOfWeek: 4, isOpen: true, start: "08:00", end: "17:00" },
  { dayOfWeek: 5, isOpen: true, start: "08:00", end: "17:00" },
  { dayOfWeek: 6, isOpen: true, start: "08:00", end: "17:00" },
];

// Dr. Paule Schedule: Mon-Sun, 8am-12pm & 2pm-5pm
const PAULE_SCHEDULE: ClinicWorkingHours[] = [];
[1, 2, 3, 4, 5, 6, 0].forEach(day => {
  PAULE_SCHEDULE.push({ dayOfWeek: day, isOpen: true, start: "08:00", end: "12:00" });
  PAULE_SCHEDULE.push({ dayOfWeek: day, isOpen: true, start: "14:00", end: "17:00" });
});

export const MOCK_SERVICES: Service[] = [
  { id: 'v-checkup', name: 'Check up', durationMinutes: 30 },
  { id: 'v-cleaning', name: 'Cleaning / Scaling', durationMinutes: 45 },
  { id: 'v-filling', name: 'Fillings / Restorative Care', durationMinutes: 60 },
  { id: 'v-ortho', name: 'Orthodontics / Brace', durationMinutes: 60 },
  { id: 'v-surgery', name: 'Tooth extraction / surgery', durationMinutes: 90 },
  { id: 'p-restorative', name: 'Restorative filling', durationMinutes: 60 },
  { id: 'p-d-extraction', name: 'Dental extraction', durationMinutes: 45 },
  { id: 'p-cleaning', name: 'Cleaning', durationMinutes: 45 },
  { id: 'p-t-extraction', name: 'Tooth extraction', durationMinutes: 45 },
  { id: 'p-dentures', name: 'Dentures', durationMinutes: 90 },
  { id: 'p-ortho', name: 'Orthodontic treatment', durationMinutes: 60 },
];

export const MOCK_USERS: User[] = [
  { id: 'patient-1', email: 'patient@example.com', password: 'password123', name: 'Jane Doe', phone: '+63 917 123 4567', age: 28, gender: 'Female', role: UserRole.Patient },
  { id: 'admin-1', email: 'admin@nexsched.com', password: 'admin123', name: 'Clinic Admin', phone: '987-654-3210', age: 45, gender: 'Female', role: UserRole.Admin },
  { id: 'dentist-paule', email: 'jonathan@nexsched.com', password: 'Paule123', name: 'Dr. Jonathan L. Paule', phone: '+63 900 000 0000', age: 42, gender: 'Male', role: UserRole.Admin },
  { id: 'dentist-velez', email: 'matthew@nexsched.com', password: 'Velez123', name: 'Dr. Matthew T. Velez', phone: '+63 917 555 1234', age: 38, gender: 'Male', role: UserRole.Admin },
];

export const MOCK_DENTISTS: Dentist[] = [
  { 
    id: 'dentist-velez', 
    name: 'Dr. Matthew T. Velez', 
    specialty: 'General Dentistry & Orthodontics', 
    color: '#0284c7',
    serviceIds: ['v-checkup', 'v-cleaning', 'v-filling', 'v-ortho', 'v-surgery'],
    workingHours: VELEZ_SCHEDULE
  },
  { 
    id: 'dentist-paule', 
    name: 'Dr. Jonathan L. Paule', 
    specialty: 'Oral Surgery & Prosthodontics', 
    color: '#E53E3E',
    serviceIds: ['p-restorative', 'p-d-extraction', 'p-cleaning', 'p-t-extraction', 'p-dentures', 'p-ortho'],
    workingHours: PAULE_SCHEDULE
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [];

export const MOCK_CLINIC_SETTINGS: ClinicSettings = {
  clinicName: "NexSched Dental Clinic",
  onlineBookingEnabled: true,
  workingHours: VELEZ_SCHEDULE,
  slotDurationMinutes: 30,
  holidays: ["2024-12-25", "2025-01-01"],
};
