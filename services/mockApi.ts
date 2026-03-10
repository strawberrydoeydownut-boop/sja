
import { User, Appointment, Dentist, Service, ClinicSettings, TimeSlot, ReportData, AppointmentStatus, UserRole, VirtualEmail } from '../types';
import { MOCK_USERS, MOCK_APPOINTMENTS, MOCK_DENTISTS, MOCK_SERVICES, MOCK_CLINIC_SETTINGS } from '../constants';
import { getDay, format, addMinutes, isSameDay } from 'date-fns';

const STORAGE_KEYS = {
  USERS: 'nexsched_v19_users',
  APPOINTMENTS: 'nexsched_v19_appointments',
  SETTINGS: 'nexsched_v19_settings',
  DENTISTS: 'nexsched_v19_dentists',
  EMAILS: 'nexsched_v19_emails',
  SESSION: 'nexsched_v19_session'
};

// Anthropic window.storage helper
const storage = (window as any).storage || {
    get: async (key: string) => JSON.parse(localStorage.getItem(key) || 'null'),
    set: async (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val))
};

const loadData = async <T,>(key: string, fallback: T, shared: boolean = true): Promise<T> => {
  try {
    const item = await storage.get(key, shared);
    if (item) {
      // Deep clone and parse dates if needed
      const data = JSON.parse(JSON.stringify(item), (k, v) => {
        if (['start', 'end', 'createdAt', 'time', 'timestamp'].includes(k)) return new Date(v);
        return v;
      });
      return data;
    }
  } catch (e) {
    console.warn(`Failed to load ${key} from storage`, e);
  }
  return fallback;
};

const saveData = async (key: string, data: any, shared: boolean = true) => {
  try {
    await storage.set(key, data, shared);
  } catch (e) {
    console.error(`Failed to save ${key} to storage`, e);
  }
};

const simulateDelay = <T,>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), 300));
};

export const sendVirtualEmail = async (to: string, subject: string, body: string) => {
    const emails = await loadData<VirtualEmail[]>(STORAGE_KEYS.EMAILS, []);
    const newEmail: VirtualEmail = {
        id: `email-${Date.now()}`,
        to,
        subject,
        body,
        timestamp: new Date(),
        isRead: false
    };
    emails.push(newEmail);
    await saveData(STORAGE_KEYS.EMAILS, emails);
};

export const getEmailsForAddress = async (emailAddress: string): Promise<VirtualEmail[]> => {
    const emails = await loadData<VirtualEmail[]>(STORAGE_KEYS.EMAILS, []);
    return simulateDelay(emails.filter(e => e.to.toLowerCase() === emailAddress.toLowerCase()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
};

export const login = async (email: string, password: string): Promise<User | null> => {
  const users = await loadData<User[]>(STORAGE_KEYS.USERS, [...MOCK_USERS]);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (user) {
    await saveData(STORAGE_KEYS.SESSION, user.id, false);
    return simulateDelay(user);
  }
  return simulateDelay(null);
};

export const register = async (details: Omit<User, 'id' | 'role' | 'password'> & { password_reg: string }): Promise<{ user: User | null; error?: string }> => {
  const users = await loadData<User[]>(STORAGE_KEYS.USERS, [...MOCK_USERS]);
  if (users.find(u => u.email.toLowerCase() === details.email.toLowerCase())) {
    return simulateDelay({ user: null, error: "An account with this email already exists." });
  }
  const newUser: User = {
    id: `user-${Date.now()}`,
    email: details.email,
    password: details.password_reg,
    name: details.name,
    phone: details.phone,
    age: details.age,
    gender: details.gender,
    role: UserRole.Patient,
  };
  users.push(newUser);
  await saveData(STORAGE_KEYS.USERS, users);
  await saveData(STORAGE_KEYS.SESSION, newUser.id, false);
  return simulateDelay({ user: newUser });
};

export const getCurrentUser = (): User | null => {
  // This needs to be sync for App.tsx initial state, but we can't await here.
  // However, the prompt says "read it back on module load".
  // Let's use a sync fallback for the very first render if possible, or update App.tsx.
  const id = localStorage.getItem(STORAGE_KEYS.SESSION); // Fallback for sync
  if (!id) return null;
  // This is tricky because loadData is async. 
  // I'll update App.tsx to handle async user loading.
  return null; 
};

export const getCurrentUserAsync = async (): Promise<User | null> => {
  const id = await storage.get(STORAGE_KEYS.SESSION, false);
  if (!id) return null;
  const users = await loadData<User[]>(STORAGE_KEYS.USERS, [...MOCK_USERS]);
  return users.find(u => u.id === id) || null;
};

export const logout = async (): Promise<void> => {
  await storage.set(STORAGE_KEYS.SESSION, null, false);
};

export const getAppointmentsForEmail = async (emailAddress: string): Promise<Appointment[]> => {
    const appointments = await loadData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, [...MOCK_APPOINTMENTS]);
    const users = await loadData<User[]>(STORAGE_KEYS.USERS, [...MOCK_USERS]);
    const user = users.find(u => u.email.toLowerCase() === emailAddress.toLowerCase());
    if (!user) return simulateDelay([]);
    return simulateDelay(appointments.filter(a => a.patientId === user.id));
};

export const getAppointmentsForUser = async (userId: string): Promise<Appointment[]> => {
  const appointments = await loadData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, [...MOCK_APPOINTMENTS]);
  return simulateDelay(appointments.filter(a => a.patientId === userId));
};

export const getAllAppointments = async (): Promise<Appointment[]> => {
  const appointments = await loadData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, [...MOCK_APPOINTMENTS]);
  return simulateDelay(appointments);
};

export const getAllPatients = async (): Promise<User[]> => {
  const users = await loadData<User[]>(STORAGE_KEYS.USERS, [...MOCK_USERS]);
  return simulateDelay(users.filter(u => u.role === UserRole.Patient));
};

export const getDentists = async (): Promise<Dentist[]> => {
  const dentists = await loadData<Dentist[]>(STORAGE_KEYS.DENTISTS, [...MOCK_DENTISTS]);
  return simulateDelay(dentists);
};

export const getServices = async (): Promise<Service[]> => simulateDelay([...MOCK_SERVICES]);

export const getClinicSettings = async (): Promise<ClinicSettings> => {
  const settings = await loadData<ClinicSettings>(STORAGE_KEYS.SETTINGS, { ...MOCK_CLINIC_SETTINGS });
  return simulateDelay(settings);
};

export const updateClinicSettings = async (settings: ClinicSettings): Promise<ClinicSettings> => {
    await saveData(STORAGE_KEYS.SETTINGS, settings);
    return simulateDelay(settings);
};

export const addDentist = async (details: Omit<Dentist, 'id'>): Promise<Dentist> => {
    const dentists = await loadData<Dentist[]>(STORAGE_KEYS.DENTISTS, [...MOCK_DENTISTS]);
    const users = await loadData<User[]>(STORAGE_KEYS.USERS, [...MOCK_USERS]);
    
    const newId = `dentist-${Date.now()}`;
    const newDentist: Dentist = {
        id: newId,
        ...details
    };
    dentists.push(newDentist);
    await saveData(STORAGE_KEYS.DENTISTS, dentists);

    // Create matching User entry
    const nameParts = details.name.replace('Dr. ', '').split(' ');
    const firstName = nameParts[0].toLowerCase();
    const lastName = (nameParts[1] || 'dentist').toLowerCase();
    const email = `${firstName}.${lastName}@nexsched.com`;
    
    const newUser: User = {
        id: newId,
        email,
        password: 'Dentist123!',
        name: details.name,
        phone: '555-0000',
        age: 35,
        gender: 'Other',
        role: UserRole.Admin
    };
    users.push(newUser);
    await saveData(STORAGE_KEYS.USERS, users);

    return simulateDelay(newDentist);
};

export const deleteDentist = async (id: string): Promise<void> => {
    const dentists = await loadData<Dentist[]>(STORAGE_KEYS.DENTISTS, [...MOCK_DENTISTS]);
    const filtered = dentists.filter(d => d.id !== id);
    await saveData(STORAGE_KEYS.DENTISTS, filtered);
    return simulateDelay(undefined);
};

const parseTime = (timeStr: string, baseDate: Date): Date => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(baseDate);
  d.setHours(hours, minutes, 0, 0);
  return d;
};

export const getAvailableTimeSlots = async (date: Date, dentistId: string, serviceId: string): Promise<TimeSlot[]> => {
  const clinicSettings = await loadData<ClinicSettings>(STORAGE_KEYS.SETTINGS, { ...MOCK_CLINIC_SETTINGS });
  const dentists = await loadData<Dentist[]>(STORAGE_KEYS.DENTISTS, [...MOCK_DENTISTS]);
  const appointments = await loadData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, [...MOCK_APPOINTMENTS]);
  
  if (!clinicSettings.onlineBookingEnabled) return simulateDelay([]);
  
  const dentist = dentists.find(d => d.id === dentistId);
  const dayOfWeek = getDay(date);
  
  const hoursSource = (dentist?.workingHours && dentist.workingHours.length > 0) 
    ? dentist.workingHours 
    : clinicSettings.workingHours;
    
  const dayShifts = hoursSource.filter(wh => wh.dayOfWeek === dayOfWeek && wh.isOpen);
  const services = [...MOCK_SERVICES];
  const service = services.find(s => s.id === serviceId);
  
  if (dayShifts.length === 0 || !service) return simulateDelay([]);
  
  const dayString = format(date, 'yyyy-MM-dd');
  if(clinicSettings.holidays.includes(dayString)) return simulateDelay([]);
  
  const dentistAppointments = appointments.filter(a => 
    a.dentistId === dentistId && 
    isSameDay(a.start, date) && 
    (a.status === AppointmentStatus.Scheduled || a.status === AppointmentStatus.Pending)
  );
  
  const allSlots: TimeSlot[] = [];

  dayShifts.forEach(shift => {
    const startTime = parseTime(shift.start, date);
    const endTime = parseTime(shift.end, date);
    let currentTime = startTime;

    while(currentTime < endTime) {
        const slotEnd = addMinutes(currentTime, service.durationMinutes);
        if (slotEnd > endTime) break;
        
        const isBooked = dentistAppointments.some(appt => 
          (currentTime >= appt.start && currentTime < appt.end) ||
          (slotEnd > appt.start && slotEnd <= appt.end) ||
          (appt.start >= currentTime && appt.start < slotEnd)
        );

        allSlots.push({ time: new Date(currentTime.getTime()), isAvailable: !isBooked });
        currentTime = addMinutes(currentTime, clinicSettings.slotDurationMinutes);
    }
  });

  allSlots.sort((a, b) => a.time.getTime() - b.time.getTime());
  return simulateDelay(allSlots);
};

export const bookAppointment = async (details: { patientId: string, dentistId: string, serviceId: string, start: Date }): Promise<Appointment> => {
  const appointments = await loadData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, [...MOCK_APPOINTMENTS]);
  const services = [...MOCK_SERVICES];
  const service = services.find(s => s.id === details.serviceId);
  if (!service) throw new Error("Service not found");
  const newAppointment: Appointment = {
    id: `apt-${Date.now()}`,
    ...details,
    end: addMinutes(details.start, service.durationMinutes),
    status: AppointmentStatus.Pending,
    createdAt: new Date()
  };
  appointments.push(newAppointment);
  await saveData(STORAGE_KEYS.APPOINTMENTS, appointments);

  const users = await loadData<User[]>(STORAGE_KEYS.USERS, [...MOCK_USERS]);
  const patient = users.find(u => u.id === details.patientId);
  if (patient) {
      await sendVirtualEmail(
          patient.email, 
          "Action Required: Booking Received", 
          `Hi ${patient.name.split(' ')[0]}, your request for ${service.name} has been received. Please wait for the dentist to approve your time slot.`
      );
  }

  return simulateDelay(newAppointment);
};

export const approveAppointment = async (appointmentId: string): Promise<Appointment> => {
  const appointments = await loadData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, [...MOCK_APPOINTMENTS]);
  const index = appointments.findIndex(a => a.id === appointmentId);
  if (index === -1) throw new Error("Appointment not found");
  
  appointments[index].status = AppointmentStatus.Scheduled;
  await saveData(STORAGE_KEYS.APPOINTMENTS, appointments);
  
  const users = await loadData<User[]>(STORAGE_KEYS.USERS, [...MOCK_USERS]);
  const dentists = await loadData<Dentist[]>(STORAGE_KEYS.DENTISTS, [...MOCK_DENTISTS]);
  const services = [...MOCK_SERVICES];
  
  const patient = users.find(u => u.id === appointments[index].patientId);
  const dentist = dentists.find(d => d.id === appointments[index].dentistId);
  const service = services.find(s => s.id === appointments[index].serviceId);
  
  if (patient && dentist && service) {
    const timeStr = format(new Date(appointments[index].start), 'eeee, MMM d @ h:mm a');
    const emailBody = `Hi ${patient.name}, Dr. ${dentist.name.split(' ').pop()} has reviewed and approved your booking for ${service.name} on ${timeStr}. Please arrive 10 minutes early. We look forward to seeing you!`;
    await sendVirtualEmail(patient.email, "CONFIRMED: Your Appointment at NexSched", emailBody);
  }
  
  return simulateDelay(appointments[index]);
};

export const cancelAppointment = async (appointmentId: string): Promise<Appointment> => {
  const appointments = await loadData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, [...MOCK_APPOINTMENTS]);
  const index = appointments.findIndex(a => a.id === appointmentId);
  if (index === -1) throw new Error("Appointment not found");
  
  appointments[index].status = AppointmentStatus.Cancelled;
  await saveData(STORAGE_KEYS.APPOINTMENTS, appointments);

  const users = await loadData<User[]>(STORAGE_KEYS.USERS, [...MOCK_USERS]);
  const patient = users.find(u => u.id === appointments[index].patientId);
  if (patient) {
      await sendVirtualEmail(
          patient.email,
          "Appointment Cancelled",
          `Hi ${patient.name}, your appointment has been successfully cancelled as requested.`
      );
  }

  return simulateDelay(appointments[index]);
};

export const updateAppointmentStatus = async (appointmentId: string, status: AppointmentStatus): Promise<Appointment> => {
  const appointments = await loadData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, [...MOCK_APPOINTMENTS]);
  const index = appointments.findIndex(a => a.id === appointmentId);
  if (index === -1) throw new Error("Appointment not found");
  appointments[index].status = status;
  await saveData(STORAGE_KEYS.APPOINTMENTS, appointments);
  return simulateDelay(appointments[index]);
};

export const getReportData = async (): Promise<ReportData> => {
    const appointments = await loadData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, [...MOCK_APPOINTMENTS]);
    const services = [...MOCK_SERVICES];
    const total = appointments.length;
    const noShows = appointments.filter(a => a.status === AppointmentStatus.NoShow).length;
    const completed = appointments.filter(a => a.status === AppointmentStatus.Completed).length;
    const appointmentsByService = services.reduce((acc, service) => {
        acc[service.name] = appointments.filter(a => a.serviceId === service.id).length;
        return acc;
    }, {} as { [serviceName: string]: number });
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const busiestDays = appointments.reduce((acc, appt) => {
        const day = dayNames[getDay(appt.start)];
        acc[day] = (acc[day] || 0) + 1;
        return acc;
    }, {} as { [day: string]: number });
    return simulateDelay({
        totalAppointments: total,
        noShowRate: total > 0 ? (noShows / total) * 100 : 0,
        attendanceRate: total > 0 ? (completed / total) * 100 : 0,
        appointmentsByService,
        busiestDays
    });
};
