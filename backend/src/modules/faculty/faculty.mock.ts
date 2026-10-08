export interface MockProfile {
  id: string;
  displayName: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  profilePhotoUrl: string | null;
  updatedAt: Date;
}

export interface MockUser {
  id: string;
  firebaseUid: string;
  email: string;
  phone: string | null;
  collegeId: string;
  status: string;
  profiles: MockProfile | null;
}

export const devMockUsers: Record<string, any> = {
  'D679ftp5r9QC8zzybJkGAokVZ2d2': {
    uid: 'D679ftp5r9QC8zzybJkGAokVZ2d2',
    email: 'dr.karthik.cse@college.edu',
    display_name: 'Dr. Karthik S',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    role: 'FACULTY',
    college_id: 'col-01',
    department_id: 'dept-cse-01',
    register_number: null,
    approval_status: 'APPROVED',
    department: {
      id: 'dept-cse-01',
      name: 'Department of Computer Science & Engineering',
      code: 'CSE',
    },
    assigned_classes: [
      {
        id: 'cls-cse-2022-a',
        name: 'B.E CSE - IV Year Sec A',
        current_semester: 7,
      },
    ],
  },
  'FACULTY_MEENAKSHI_02': {
    uid: 'FACULTY_MEENAKSHI_02',
    email: 'meenakshi.raman@college.edu',
    display_name: 'Prof. Meenakshi Raman',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    role: 'FACULTY',
    college_id: 'col-01',
    department_id: 'dept-cse-01',
    register_number: null,
    approval_status: 'APPROVED',
    department: {
      id: 'dept-cse-01',
      name: 'Department of Computer Science & Engineering',
      code: 'CSE',
    },
    assigned_classes: [],
  },
  'HOD_ANNAMALAI_01': {
    uid: 'HOD_ANNAMALAI_01',
    email: 'hod.cse@college.edu',
    display_name: 'Dr. S. Annamalai (HOD)',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    role: 'HOD',
    college_id: 'col-01',
    department_id: 'dept-cse-01',
    register_number: null,
    approval_status: 'APPROVED',
    department: {
      id: 'dept-cse-01',
      name: 'Department of Computer Science & Engineering',
      code: 'CSE',
    },
    assigned_classes: [],
  },
};

export const devMockProfiles: Record<string, MockUser> = {
  'D679ftp5r9QC8zzybJkGAokVZ2d2': {
    id: 'user-fac-01',
    firebaseUid: 'D679ftp5r9QC8zzybJkGAokVZ2d2',
    email: 'dr.karthik.cse@college.edu',
    phone: '+91 98452 10982',
    collegeId: 'col-01',
    status: 'ACTIVE',
    profiles: {
      id: 'prof-01',
      displayName: 'Dr. Karthik S',
      phone: '+91 98452 10982',
      address: '42, Academic Staff Quarters, College Campus',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      bio: 'Associate Professor & Class Incharge. Specializes in Cloud Computing, Distributed Systems, and Microservices Architecture.',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      updatedAt: new Date(),
    },
  },
  'FACULTY_MEENAKSHI_02': {
    id: 'user-fac-02',
    firebaseUid: 'FACULTY_MEENAKSHI_02',
    email: 'meenakshi.raman@college.edu',
    phone: '+91 98452 10983',
    collegeId: 'col-01',
    status: 'ACTIVE',
    profiles: {
      id: 'prof-02',
      displayName: 'Prof. Meenakshi Raman',
      phone: '+91 98452 10983',
      address: '15, Faculty Enclave',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      bio: 'Assistant Professor. Specializes in Algorithms, Data Structures, and Discrete Mathematics.',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      updatedAt: new Date(),
    },
  },
  'HOD_ANNAMALAI_01': {
    id: 'user-fac-03',
    firebaseUid: 'HOD_ANNAMALAI_01',
    email: 'hod.cse@college.edu',
    phone: '+91 98452 10984',
    collegeId: 'col-01',
    status: 'ACTIVE',
    profiles: {
      id: 'prof-03',
      displayName: 'Dr. S. Annamalai',
      phone: '+91 98452 10984',
      address: 'Dean Quarters, Main Block',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      bio: 'Professor & Head of Department. 22+ years of experience in computer architecture and academic leadership.',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
      updatedAt: new Date(),
    },
  },
};
