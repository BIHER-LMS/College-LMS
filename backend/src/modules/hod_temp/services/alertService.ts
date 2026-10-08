// The Prisma schema does not have a StudentAcademicAlert model.
// This service provides in-memory stub data until the model is added.

interface AcademicAlert {
  id: string;
  studentId: string;
  studentName: string;
  registerNumber: string;
  className: string;
  programName: string;
  attendancePercentage: number;
  gpa: number;
  alertType: string;
  notes: string | null;
  status: string;
  createdAt: string;
}

const stubAlerts: AcademicAlert[] = [];

export class AlertService {
  async getAlerts(status = 'ACTIVE') {
    if (status) {
      return stubAlerts.filter((a) => a.status === status);
    }
    return stubAlerts;
  }

  async createAlert(data: {
    studentId: string;
    attendancePercentage: number;
    gpa: number;
    alertType: string;
    notes?: string;
  }) {
    const alert: AcademicAlert = {
      id: `alert-${Date.now()}`,
      studentId: data.studentId,
      studentName: 'Student',
      registerNumber: '',
      className: '',
      programName: '',
      attendancePercentage: data.attendancePercentage,
      gpa: data.gpa,
      alertType: data.alertType,
      notes: data.notes || null,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    stubAlerts.unshift(alert);
    return alert;
  }

  async updateAlert(id: string, data: Partial<{ notes: string; status: string }>) {
    const alert = stubAlerts.find((a) => a.id === id);
    if (!alert) return null;
    if (data.notes !== undefined) alert.notes = data.notes;
    if (data.status !== undefined) alert.status = data.status;
    return alert;
  }
}

export const alertService = new AlertService();
