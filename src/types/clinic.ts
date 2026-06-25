// Core types for MTU Clinic Management System

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'pharmacist' | 'lab_technician' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  createdAt: Date;
}

export interface Patient {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  bloodType?: string;
  allergies?: string[];
  faculty: string;
  level: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type QueueStatus = 'waiting' | 'in_consultation' | 'in_lab' | 'in_pharmacy' | 'completed';

export interface QueueEntry {
  id: string;
  patientId: string;
  patient: Patient;
  status: QueueStatus;
  priority: 'normal' | 'urgent' | 'emergency';
  assignedDoctorId?: string;
  checkInTime: Date;
  estimatedWaitTime?: number; // in minutes
  notes?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patient: Patient;
  doctorId: string;
  doctorName: string;
  date: Date;
  time: string;
  type: 'general' | 'follow_up' | 'specialist' | 'immunization' | 'fitness_exam';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reason?: string;
  notes?: string;
}

export interface Vital {
  id: string;
  patientId: string;
  recordedBy: string;
  recordedAt: Date;
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  notes?: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: Date;
  chiefComplaint: string;
  presentIllness?: string;
  diagnosis: string[];
  notes?: string;
  prescriptions: Prescription[];
  labRequests: LabRequest[];
  followUpDate?: Date;
}

export interface Prescription {
  id: string;
  consultationId: string;
  drugId: string;
  drugName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions?: string;
  dispensed: boolean;
  dispensedAt?: Date;
  dispensedBy?: string;
}

export interface Drug {
  id: string;
  name: string;
  genericName?: string;
  category: string;
  unitOfMeasure: string;
  currentStock: number;
  minimumStock: number;
  expiryDate?: Date;
  batchNumber?: string;
  supplier?: string;
  unitPrice: number;
}

export interface LabRequest {
  id: string;
  consultationId: string;
  patientId: string;
  testType: string;
  requestedBy: string;
  requestedAt: Date;
  status: 'pending' | 'in_progress' | 'completed';
  results?: string;
  completedAt?: Date;
  completedBy?: string;
}

export interface Immunization {
  id: string;
  patientId: string;
  vaccineName: string;
  dateAdministered: Date;
  administeredBy: string;
  batchNumber?: string;
  nextDoseDate?: Date;
  notes?: string;
}

export interface MedicalFitness {
  id: string;
  patientId: string;
  examDate: Date;
  examinedBy: string;
  status: 'fit' | 'unfit' | 'conditional';
  conditions?: string[];
  validUntil: Date;
  certificateUrl?: string;
}

// Dashboard statistics
export interface DashboardStats {
  totalPatientsToday: number;
  currentQueueLength: number;
  averageWaitTime: number;
  appointmentsToday: number;
  lowStockAlerts: number;
  expiringDrugsCount: number;
}
