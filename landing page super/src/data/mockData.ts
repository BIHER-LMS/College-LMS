import { CapabilityItem, EcosystemNodeInfo, FacultyMember, CurriculumProposal, AssignmentItem, StudentCourse } from '../types';

export const ECOSYSTEM_NODES: Record<string, EcosystemNodeInfo> = {
  hod: {
    id: 'node-01',
    name: 'HOD Module',
    role: 'Executive Governance Root',
    badge: 'Node 01',
    description: 'Central administrative gateway executing policy propagation, department budgeting, and institutional accreditation compliance.',
    latency: '1.2 ms',
    throughput: '4,800 req/sec',
    activeProcesses: [
      'Department Council Oversight v2.4',
      'Accreditation Hash Audit Verification',
      'Syllabus Amendment Routing Daemon',
      'Faculty Workload Balancing Queue'
    ]
  },
  faculty: {
    id: 'node-02',
    name: 'Faculty Module',
    role: 'Instructional Core Engine',
    badge: 'Node 02',
    description: 'Pedagogy coordination node managing course syllabus delivery, automated rubric grading, and synchronous office hour scheduling.',
    latency: '0.8 ms',
    throughput: '12,400 req/sec',
    activeProcesses: [
      'Course Distribution Pipeline (REST/gRPC)',
      'Deterministic Evaluation Engine',
      'Asynchronous Question Forum Sync',
      'Attendance & Participation Stream'
    ]
  },
  student: {
    id: 'node-03',
    name: 'Student Module',
    role: 'Active Terminal Hub',
    badge: 'Node 03',
    description: 'Unified learning terminal aggregating personalized daily timetables, assignment gateways, lecture repositories, and academic advisement.',
    latency: '0.5 ms',
    throughput: '28,900 req/sec',
    activeProcesses: [
      'Chronological Timeline Ingestion',
      'Encrypted Submission Storage Gate',
      'Real-time Department Broadcast Stream',
      'Institutional Credential Vault'
    ]
  }
};

export const CAPABILITIES: CapabilityItem[] = [
  {
    id: 'hod-mgmt',
    title: 'HOD Management',
    description: 'Institutional governance and departmental coordination with granular delegation matrices.',
    icon: 'corporate_fare',
    category: 'governance',
    specs: {
      protocol: 'RBAC Policy Matrix / SAML 2.0',
      sla: '99.99% Uptime Guarantee',
      features: ['Department directory sync', 'Faculty load quota enforcement', 'Annual governance audit logs']
    }
  },
  {
    id: 'fac-mgmt',
    title: 'Faculty Management',
    description: 'Workflows supporting teaching schedules, curricula, and interaction without administrative friction.',
    icon: 'school',
    category: 'instruction',
    specs: {
      protocol: 'LTI 1.3 Certified Core',
      sla: 'Sub-second State Propagation',
      features: ['Syllabus module editor', 'Dynamic office hour slots', 'Cross-department co-teaching support']
    }
  },
  {
    id: 'stu-mgmt',
    title: 'Student Management',
    description: 'Streamlined student academic journeys, unified transcripts, and frictionless progress tracking.',
    icon: 'local_library',
    category: 'instruction',
    specs: {
      protocol: 'FERPA & GDPR Compliant',
      sla: 'Instantaneous Sync',
      features: ['Course roadmap visualization', 'Grade trajectory metrics', 'Advisement request gateway']
    }
  },
  {
    id: 'acad-workflows',
    title: 'Academic Workflows',
    description: 'Structured pipelines for submissions, approvals, and curriculum routing across administrative layers.',
    icon: 'schema',
    category: 'governance',
    specs: {
      protocol: 'Deterministic State Machine',
      sla: 'Zero-loss Event Bus',
      features: ['Three-tier curriculum approval', 'Grade change appeal pipeline', 'Late submission waiver routing']
    }
  },
  {
    id: 'central-info',
    title: 'Centralized Information',
    description: 'Single source of truth eliminating fragmented campus tools, duplicate silos, and stale records.',
    icon: 'dataset',
    category: 'infrastructure',
    specs: {
      protocol: 'Distributed PostgreSQL + Read Replicas',
      sla: 'Strict ACID Compliance',
      features: ['Unified course catalog', 'Universal student identifier index', 'Cross-system data federator']
    }
  },
  {
    id: 'role-exp',
    title: 'Role-Based Experiences',
    description: 'Tailored interfaces for administrators, instructors, and learners with dedicated ergonomic surfaces.',
    icon: 'badge',
    category: 'governance',
    specs: {
      protocol: 'Context-Aware Microfrontends',
      sla: '< 100ms Component Hydration',
      features: ['Custom navigational trees per role', 'Zero UI clutter from irrelevant tools', 'Instant role simulation preview']
    }
  },
  {
    id: 'secure-auth',
    title: 'Secure Authentication',
    description: 'Institutional access control, encrypted identity management, and continuous session auditing.',
    icon: 'lock',
    category: 'security',
    specs: {
      protocol: 'OAuth2 / OIDC / MFA Enforced',
      sla: 'FIPS 140-2 Level 3 Validated',
      features: ['Single Sign-On (Google / Azure AD)', 'Zero-trust device posture validation', 'Automated token revocation']
    }
  },
  {
    id: 'ai-caps',
    title: 'AI-Assisted Capabilities',
    description: 'Contextual academic intelligence integrated into daily workflows with deterministic governance.',
    icon: 'psychology',
    category: 'ai',
    specs: {
      protocol: 'Deterministic Orchestrator v4',
      sla: 'Strict Schema Output Guarantee',
      features: ['Automated syllabus consistency check', 'Assignment rubric alignment assistant', 'Student advising schedule matcher']
    }
  },
  {
    id: 'rag-know',
    title: 'RAG-Based Knowledge Access',
    description: 'Grounded knowledge retrieval over verified institutional documentation with immutable citations.',
    icon: 'menu_book',
    category: 'ai',
    specs: {
      protocol: 'Vector Embeddings + Metadata Filtering',
      sla: '100% Zero-Hallucination Guardrails',
      features: ['University handbook search', 'Departmental regulatory lookup', 'Academic calendar query engine']
    }
  },
  {
    id: 'tool-call',
    title: 'Tool Calling',
    description: 'Automated execution of internal LMS routines through structured, auditable APIs and typed parameters.',
    icon: 'integration_instructions',
    category: 'infrastructure',
    specs: {
      protocol: 'JSON-RPC & OpenAPI Specification',
      sla: 'Immutable Execution Ledger',
      features: ['Timetable conflict resolution tool', 'Transcript generation invocation', 'Course registration seat reserve']
    }
  },
  {
    id: 'backend-serv',
    title: 'Connected Backend Services',
    description: 'High-throughput microservice architecture built for scale, fault tolerance, and institutional resiliency.',
    icon: 'dns',
    category: 'infrastructure',
    specs: {
      protocol: 'gRPC / HTTP/2 Event Streaming',
      sla: 'Horizontal Auto-Scale < 3s',
      features: ['Edge-cached static assets', 'PostgreSQL cluster with failover', 'Async worker queues for bulk exports']
    }
  }
];

export const MOCK_FACULTY: FacultyMember[] = [
  {
    id: 'fac-1',
    name: 'Dr. Elena Rostova',
    title: 'Professor of Distributed Systems',
    department: 'Computer Science',
    workload: 85,
    courses: ['CS-301 Distributed Systems', 'CS-504 Cloud Architectures'],
    status: 'optimal',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-2',
    name: 'Dr. Marcus Vance',
    title: 'Associate Professor',
    department: 'Computer Science',
    workload: 92,
    courses: ['CS-204 Data Structures & Alg', 'CS-410 Cryptography'],
    status: 'high',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-3',
    name: 'Prof. Sarah Chen',
    title: 'Assistant Professor',
    department: 'Artificial Intelligence',
    workload: 65,
    courses: ['AI-101 Introduction to ML', 'AI-320 Deep Architectures'],
    status: 'available',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'fac-4',
    name: 'Dr. Arthur Pendelton',
    title: 'Chair Professor of Systems',
    department: 'Computer Science',
    workload: 78,
    courses: ['CS-499 Senior Capstone', 'CS-601 Advanced Concurrency'],
    status: 'optimal',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

export const MOCK_PROPOSALS: CurriculumProposal[] = [
  {
    id: 'prop-101',
    courseCode: 'CS-482',
    courseName: 'Autonomous Systems & Deterministic AI',
    submittedBy: 'Prof. Sarah Chen',
    date: 'Oct 01, 2026',
    status: 'Approved',
    changes: 'Updated prerequisite chain to include Linear Algebra II and added 4-credit lab hours for physical robotics testing.',
    auditHash: '0x8f3c...b29a'
  },
  {
    id: 'prop-102',
    courseCode: 'CS-301',
    courseName: 'Distributed Systems & Microservices',
    submittedBy: 'Dr. Elena Rostova',
    date: 'Sep 28, 2026',
    status: 'Under Review',
    changes: 'Integrated Raft consensus module and replaced legacy RPC labs with modern gRPC benchmarks.',
    auditHash: '0x4d11...71ce'
  },
  {
    id: 'prop-103',
    courseCode: 'SEC-210',
    courseName: 'Applied Cryptographic Protocols',
    submittedBy: 'Dr. Marcus Vance',
    date: 'Sep 24, 2026',
    status: 'Under Review',
    changes: 'Addition of Post-Quantum Cryptography primer into Module 4 syllabus overview.',
    auditHash: '0x99a2...3f00'
  }
];

export const MOCK_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 'asg-1',
    courseCode: 'CS-301',
    title: 'Lab 03: Fault-Tolerant Distributed Key-Value Store',
    dueDate: 'Tomorrow, 11:59 PM',
    submittedCount: 42,
    totalStudents: 48,
    status: 'Active',
    rubric: [
      { criterion: 'Leader Election Correctness', weight: 40 },
      { criterion: 'Partition Recovery Performance', weight: 30 },
      { criterion: 'Unit Test Coverage (>90%)', weight: 30 }
    ]
  },
  {
    id: 'asg-2',
    courseCode: 'CS-301',
    title: 'Midterm Architectural Essay: Consensus Trade-offs',
    dueDate: 'Oct 10, 2026',
    submittedCount: 14,
    totalStudents: 48,
    status: 'Active',
    rubric: [
      { criterion: 'Analytical Rigor', weight: 50 },
      { criterion: 'Empirical Benchmarking Data', weight: 30 },
      { criterion: 'Citation Integrity', weight: 20 }
    ]
  },
  {
    id: 'asg-3',
    courseCode: 'CS-204',
    title: 'Problem Set 04: Red-Black Trees & B-Trees',
    dueDate: 'Sep 25, 2026',
    submittedCount: 88,
    totalStudents: 88,
    status: 'Graded',
    rubric: [
      { criterion: 'Algorithmic Complexity (O(log n))', weight: 60 },
      { criterion: 'Edge Case Testing (Duplicate Keys)', weight: 40 }
    ]
  }
];

export const MOCK_STUDENT_COURSES: StudentCourse[] = [
  {
    id: 'sc-1',
    code: 'CS-301',
    name: 'Distributed Systems & Cloud Architecture',
    instructor: 'Dr. Elena Rostova',
    credits: 4,
    schedule: 'Mon / Wed 10:00 - 11:30 AM',
    room: 'Hall Turing 201',
    progress: 68,
    grade: 'A (94.2%)',
    nextDeadline: 'Lab 03 due tomorrow'
  },
  {
    id: 'sc-2',
    code: 'CS-204',
    name: 'Data Structures & Algorithms II',
    instructor: 'Dr. Marcus Vance',
    credits: 4,
    schedule: 'Tue / Thu 01:00 - 02:30 PM',
    room: 'Hall Lovelace 104',
    progress: 82,
    grade: 'A- (91.0%)',
    nextDeadline: 'Problem Set 05 in 4 days'
  },
  {
    id: 'sc-3',
    code: 'AI-101',
    name: 'Introduction to Machine Intelligence',
    instructor: 'Prof. Sarah Chen',
    credits: 3,
    schedule: 'Fri 09:00 AM - 12:00 PM',
    room: 'Computing Lab 3',
    progress: 54,
    grade: 'A (95.5%)',
    nextDeadline: 'Project Proposal in 8 days'
  }
];
