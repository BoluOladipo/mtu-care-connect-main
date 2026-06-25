import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MedicalRecord {
  id: string;
  patientName: string;
  studentId: string;
  recordType: "Consultation" | "Lab Result" | "Immunization" | "Prescription";
  date: string;
  provider: string;
  summary: string;
}

export interface FitnessCertificate {
  id: string;
  studentName: string;
  studentId: string;
  patientId: string;
  issueDate: string;
  expiryDate: string;
  status: "valid" | "expired";
  examiner: string;
  conditions: string[] | null;
}

export interface RecordStats {
  totalRecords: number;
  activePatients: number;
  validFitnessCerts: number;
  expiringSoon: number;
}

export const useRecordStats = () => {
  return useQuery({
    queryKey: ["record-stats"],
    queryFn: async (): Promise<RecordStats> => {
      const today = new Date().toISOString().split("T")[0];
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const [
        consultationsRes,
        labRes,
        immunizationsRes,
        prescriptionsRes,
        patientsRes,
        validCertsRes,
        expiringRes,
      ] = await Promise.all([
        supabase.from("consultations").select("id", { count: "exact", head: true }),
        supabase.from("lab_requests").select("id", { count: "exact", head: true }),
        supabase.from("immunizations").select("id", { count: "exact", head: true }),
        supabase.from("prescriptions").select("id", { count: "exact", head: true }),
        supabase
          .from("patients")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("medical_fitness")
          .select("id", { count: "exact", head: true })
          .gte("valid_until", today),
        supabase
          .from("medical_fitness")
          .select("id", { count: "exact", head: true })
          .gte("valid_until", today)
          .lte("valid_until", thirtyDaysFromNow),
      ]);

      const totalRecords =
        (consultationsRes.count || 0) +
        (labRes.count || 0) +
        (immunizationsRes.count || 0) +
        (prescriptionsRes.count || 0);

      return {
        totalRecords,
        activePatients: patientsRes.count || 0,
        validFitnessCerts: validCertsRes.count || 0,
        expiringSoon: expiringRes.count || 0,
      };
    },
  });
};

export const useMedicalRecords = (searchTerm: string, recordType: string) => {
  return useQuery({
    queryKey: ["medical-records", searchTerm, recordType],
    queryFn: async (): Promise<MedicalRecord[]> => {
      const records: MedicalRecord[] = [];

      // Fetch consultations
      if (recordType === "all" || recordType === "consultation") {
        const { data: consultations } = await supabase
          .from("consultations")
          .select(`
            id,
            consultation_date,
            chief_complaint,
            diagnosis,
            doctor_id,
            patients!inner(first_name, last_name, student_id)
          `)
          .order("consultation_date", { ascending: false })
          .limit(50);

        if (consultations) {
          for (const c of consultations) {
            const patient = c.patients as unknown as { first_name: string; last_name: string; student_id: string };
            const fullName = `${patient.first_name} ${patient.last_name}`;
            if (
              searchTerm &&
              !fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
              !patient.student_id.toLowerCase().includes(searchTerm.toLowerCase())
            ) {
              continue;
            }
            records.push({
              id: c.id,
              patientName: fullName,
              studentId: patient.student_id,
              recordType: "Consultation",
              date: new Date(c.consultation_date).toLocaleDateString(),
              provider: "Doctor",
              summary: c.chief_complaint + (c.diagnosis?.length ? ` - ${c.diagnosis.join(", ")}` : ""),
            });
          }
        }
      }

      // Fetch lab results
      if (recordType === "all" || recordType === "lab") {
        const { data: labResults } = await supabase
          .from("lab_requests")
          .select(`
            id,
            test_type,
            requested_at,
            status,
            results,
            patients!inner(first_name, last_name, student_id)
          `)
          .order("requested_at", { ascending: false })
          .limit(50);

        if (labResults) {
          for (const l of labResults) {
            const patient = l.patients as unknown as { first_name: string; last_name: string; student_id: string };
            const fullName = `${patient.first_name} ${patient.last_name}`;
            if (
              searchTerm &&
              !fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
              !patient.student_id.toLowerCase().includes(searchTerm.toLowerCase())
            ) {
              continue;
            }
            records.push({
              id: l.id,
              patientName: fullName,
              studentId: patient.student_id,
              recordType: "Lab Result",
              date: new Date(l.requested_at).toLocaleDateString(),
              provider: "Lab Tech",
              summary: `${l.test_type} - ${l.status}${l.results ? `: ${l.results}` : ""}`,
            });
          }
        }
      }

      // Fetch immunizations
      if (recordType === "all" || recordType === "immunization") {
        const { data: immunizations } = await supabase
          .from("immunizations")
          .select(`
            id,
            vaccine_name,
            date_administered,
            patients!inner(first_name, last_name, student_id)
          `)
          .order("date_administered", { ascending: false })
          .limit(50);

        if (immunizations) {
          for (const i of immunizations) {
            const patient = i.patients as unknown as { first_name: string; last_name: string; student_id: string };
            const fullName = `${patient.first_name} ${patient.last_name}`;
            if (
              searchTerm &&
              !fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
              !patient.student_id.toLowerCase().includes(searchTerm.toLowerCase())
            ) {
              continue;
            }
            records.push({
              id: i.id,
              patientName: fullName,
              studentId: patient.student_id,
              recordType: "Immunization",
              date: new Date(i.date_administered).toLocaleDateString(),
              provider: "Nurse",
              summary: `${i.vaccine_name} vaccination`,
            });
          }
        }
      }

      // Sort all records by date descending
      return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
  });
};

export const useFitnessCertificates = () => {
  return useQuery({
    queryKey: ["fitness-certificates"],
    queryFn: async (): Promise<FitnessCertificate[]> => {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("medical_fitness")
        .select(`
          id,
          exam_date,
          valid_until,
          status,
          conditions,
          examined_by,
          patient_id,
          patients!inner(first_name, last_name, student_id)
        `)
        .order("exam_date", { ascending: false });

      if (error) throw error;

      return (data || []).map((cert) => {
        const patient = cert.patients as unknown as { first_name: string; last_name: string; student_id: string };
        const isExpired = cert.valid_until < today;
        return {
          id: cert.id,
          studentName: `${patient.first_name} ${patient.last_name}`,
          studentId: patient.student_id,
          patientId: cert.patient_id,
          issueDate: cert.exam_date,
          expiryDate: cert.valid_until,
          status: isExpired ? "expired" : "valid",
          examiner: "Doctor",
          conditions: cert.conditions,
        };
      });
    },
  });
};
