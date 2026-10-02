export type RoleType = 'hod' | 'faculty' | 'student';

export type ActiveView = 'landing' | 'workspace';

export interface EcosystemNodeInfo {
  id: string;
  name: string;
  role: string;
  badge: string;
  description: string;
  latency: string;
  throughput: string;
  activeProcesses: string[];
}

export interface CapabilityItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'governance' | 'instruction' | 'security' | 'ai' | 'infrastructure';
  specs: {
    protocol: string;
    sla: string;
    features: string[];
  };
}

export interface FacultyMember {
  id: string;
  name: string;
  title: string;
  department: string;
  workload: number; // percentage
  courses: string[];
  status: 'optimal' | 'high' | 'available';
  avatar: string;
}

export interface CurriculumProposal {
  id: string;
  courseCode: string;
  courseName: string;
  submittedBy: string;
  date: string;
  status: 'Approved' | 'Under Review' | 'Revision Requested';
  changes: string;
  auditHash: string;
}

export interface AssignmentItem {
  id: string;
  courseCode: string;
  title: string;
  dueDate: string;
  submittedCount: number;
  totalStudents: number;
  rubric: { criterion: string; weight: number }[];
  status: 'Active' | 'Graded' | 'Closed';
}

export interface StudentCourse {
  id: string;
  code: string;
  name: string;
  instructor: string;
  credits: number;
  schedule: string;
  room: string;
  progress: number;
  grade: string;
  nextDeadline: string;
}
