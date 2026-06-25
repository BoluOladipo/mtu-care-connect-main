
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'nurse', 'pharmacist', 'lab_technician', 'receptionist');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    department TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patients table
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    email TEXT,
    phone TEXT,
    blood_type TEXT,
    allergies TEXT[],
    faculty TEXT NOT NULL,
    level TEXT NOT NULL,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relationship TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drugs/inventory table
CREATE TABLE public.drugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    generic_name TEXT,
    category TEXT NOT NULL,
    unit_of_measure TEXT NOT NULL,
    current_stock INTEGER NOT NULL DEFAULT 0,
    minimum_stock INTEGER NOT NULL DEFAULT 10,
    expiry_date DATE,
    batch_number TEXT,
    supplier TEXT,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create queue_entries table
CREATE TABLE public.queue_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_consultation', 'in_lab', 'in_pharmacy', 'completed')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent', 'emergency')),
    assigned_doctor_id UUID REFERENCES auth.users(id),
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    estimated_wait_time INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES auth.users(id) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('general', 'follow_up', 'specialist', 'immunization', 'fitness_exam')),
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vitals table
CREATE TABLE public.vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    recorded_by UUID REFERENCES auth.users(id) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    temperature DECIMAL(4,1),
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    oxygen_saturation INTEGER,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    notes TEXT
);

-- Create consultations table
CREATE TABLE public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES auth.users(id) NOT NULL,
    consultation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    chief_complaint TEXT NOT NULL,
    present_illness TEXT,
    diagnosis TEXT[],
    notes TEXT,
    follow_up_date DATE,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'pending_lab', 'pending_pharmacy')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prescriptions table
CREATE TABLE public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
    drug_id UUID REFERENCES public.drugs(id) NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    instructions TEXT,
    dispensed BOOLEAN NOT NULL DEFAULT false,
    dispensed_at TIMESTAMP WITH TIME ZONE,
    dispensed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_requests table
CREATE TABLE public.lab_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    test_type TEXT NOT NULL,
    requested_by UUID REFERENCES auth.users(id) NOT NULL,
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
    results TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES auth.users(id)
);

-- Create immunizations table
CREATE TABLE public.immunizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    vaccine_name TEXT NOT NULL,
    date_administered TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    administered_by UUID REFERENCES auth.users(id) NOT NULL,
    batch_number TEXT,
    next_dose_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medical_fitness table
CREATE TABLE public.medical_fitness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    exam_date DATE NOT NULL,
    examined_by UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('fit', 'unfit', 'conditional')),
    conditions TEXT[],
    valid_until DATE NOT NULL,
    certificate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immunizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_fitness ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user has any clinical role
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all profiles" ON public.profiles
FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for patients (all staff can access)
CREATE POLICY "Staff can view all patients" ON public.patients
FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert patients" ON public.patients
FOR INSERT WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update patients" ON public.patients
FOR UPDATE USING (public.is_staff(auth.uid()));

-- RLS Policies for drugs
CREATE POLICY "Staff can view drugs" ON public.drugs
FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Pharmacists and admins can manage drugs" ON public.drugs
FOR ALL USING (public.has_role(auth.uid(), 'pharmacist') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for queue_entries
CREATE POLICY "Staff can view queue" ON public.queue_entries
FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage queue" ON public.queue_entries
FOR ALL USING (public.is_staff(auth.uid()));

-- RLS Policies for appointments
CREATE POLICY "Staff can view appointments" ON public.appointments
FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage appointments" ON public.appointments
FOR ALL USING (public.is_staff(auth.uid()));

-- RLS Policies for vitals
CREATE POLICY "Staff can view vitals" ON public.vitals
FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Nurses and doctors can manage vitals" ON public.vitals
FOR ALL USING (public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for consultations
CREATE POLICY "Staff can view consultations" ON public.consultations
FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Doctors can manage consultations" ON public.consultations
FOR ALL USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for prescriptions
CREATE POLICY "Staff can view prescriptions" ON public.prescriptions
FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Doctors can create prescriptions" ON public.prescriptions
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Pharmacists can update prescriptions" ON public.prescriptions
FOR UPDATE USING (public.has_role(auth.uid(), 'pharmacist') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for lab_requests
CREATE POLICY "Staff can view lab requests" ON public.lab_requests
FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Doctors can create lab requests" ON public.lab_requests
FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Lab techs can update lab requests" ON public.lab_requests
FOR UPDATE USING (public.has_role(auth.uid(), 'lab_technician') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for immunizations
CREATE POLICY "Staff can view immunizations" ON public.immunizations
FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Nurses can manage immunizations" ON public.immunizations
FOR ALL USING (public.has_role(auth.uid(), 'nurse') OR public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for medical_fitness
CREATE POLICY "Staff can view medical fitness" ON public.medical_fitness
FOR SELECT USING (public.is_staff(auth.uid()));

CREATE POLICY "Doctors can manage medical fitness" ON public.medical_fitness
FOR ALL USING (public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'));

-- Create trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON public.drugs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON public.consultations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
