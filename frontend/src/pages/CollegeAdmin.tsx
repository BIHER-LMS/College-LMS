import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { 
  LayoutDashboard, Building2, Users, GraduationCap, 
  Calendar, FileEdit, ClipboardCheck, TrendingUp, 
  Megaphone, Bell, Shield, Download, FileText, 
  LifeBuoy, Settings, UserCircle, ChevronDown, 
  ChevronRight, LogOut, Menu, X
} from 'lucide-react';
import { CollegeDepartments, CollegePrograms, CollegeBatches, CollegeClasses, CollegeSubjects, ManageHods, ManageFaculty, ManageStudents, CollegeProfile } from '../components/CollegeAdmin';
import { TimetableModule, AttendanceModule, PerformanceModule, ExaminationsModule } from '../components/CollegeAdmin/Modules';
import { fetchCollegeStats, fetchColleges } from '../services/collegeService';
import type { CollegeRecord } from '../services/collegeService';

const MENU_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
  { 
    name: 'College', icon: Building2, id: 'college', 
    subItems: [
      { name: 'College Profile', id: 'college-profile' },
      { name: 'Departments', id: 'college-departments' },
      { name: 'Academic Structure', id: 'college-academic-structure' }
    ]
  },
  { 
    name: 'Users', icon: Users, id: 'users',
    subItems: [
      { name: 'HODs', id: 'users-hods' },
      { name: 'Faculty', id: 'users-faculty' },
      { name: 'Students', id: 'users-students' }
    ]
  },
  {
    name: 'Academics', icon: GraduationCap, id: 'academics',
    subItems: [
      { name: 'Programs', id: 'acad-programs' },
      { name: 'Subjects', id: 'acad-subjects' },
      { name: 'Batches', id: 'acad-batches' },
      { name: 'Classes', id: 'acad-classes' },
      { name: 'Academic Year', id: 'acad-year' }
    ]
  },
  { name: 'Timetable', icon: Calendar, id: 'timetable' },
  { name: 'Examinations', icon: FileEdit, id: 'examinations' },
  {
    name: 'Attendance', icon: ClipboardCheck, id: 'attendance',
    subItems: [
      { name: 'College Overview', id: 'att-overview' },
      { name: 'Department', id: 'att-department' },
      { name: 'Classes', id: 'att-classes' }
    ]
  },
  {
    name: 'Performance', icon: TrendingUp, id: 'performance',
    subItems: [
      { name: 'Students', id: 'perf-students' },
      { name: 'Departments', id: 'perf-departments' },
      { name: 'Reports', id: 'perf-reports' }
    ]
  },
  { name: 'Announcements', icon: Megaphone, id: 'announcements' },
  { name: 'Notifications', icon: Bell, id: 'notifications' },
  { name: 'Roles & Permissions', icon: Shield, id: 'roles' },
  { name: 'Import / Export', icon: Download, id: 'import-export' },
  { name: 'Audit Logs', icon: FileText, id: 'audit-logs' },
  { name: 'Support', icon: LifeBuoy, id: 'support' },
  { name: 'Settings', icon: Settings, id: 'settings' },
  { name: 'Profile', icon: UserCircle, id: 'profile' }
];

export default function CollegeAdmin() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    college: true,
    users: true,
    academics: true
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const rawUser = localStorage.getItem('lms_user');
    if (!rawUser) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(rawUser);
    if (user.role !== 'COLLEGE_ADMIN') {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (e) {
      console.error('Logout error', e);
    }
    localStorage.removeItem('lms_user');
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview collegeId={currentUser.college_id} />;
      case 'college-profile':
        return <CollegeProfile />;
      case 'college-departments':
        return <CollegeDepartments collegeId={currentUser.college_id} />;
      case 'acad-programs':
        return <CollegePrograms collegeId={currentUser.college_id} />;
      case 'acad-batches':
        return <CollegeBatches collegeId={currentUser.college_id} />;
      case 'acad-classes':
        return <CollegeClasses collegeId={currentUser.college_id} />;
      case 'acad-subjects':
        return <CollegeSubjects collegeId={currentUser.college_id} />;
      case 'users-hods':
        return <ManageHods collegeId={currentUser.college_id} />;
      case 'users-faculty':
        return <ManageFaculty collegeId={currentUser.college_id} />;
      case 'users-students':
        return <ManageStudents collegeId={currentUser.college_id} />;
      case 'timetable':
        return <TimetableModule />;
      case 'examinations':
        return <ExaminationsModule />;
      case 'attendance':
      case 'att-overview':
      case 'att-department':
      case 'att-classes':
        return <AttendanceModule />;
      case 'performance':
      case 'perf-students':
      case 'perf-departments':
      case 'perf-reports':
        return <PerformanceModule />;
      default:
        return (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-700 mb-2 capitalize">
                {activeTab.replace(/-/g, ' ')}
              </h2>
              <p className="text-slate-500">This module is under construction.</p>
            </div>
          </div>
        );
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar logic is same as before, I'll copy the existing one */}
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-72 
        bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">College LMS</h1>
              <p className="text-xs text-brand-300">Admin Portal</p>
            </div>
          </div>
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {MENU_ITEMS.map((item) => (
            <div key={item.id}>
              {item.subItems ? (
                <div>
                  <button
                    onClick={() => toggleSection(item.id)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${expandedSections[item.id] ? 'text-white' : 'hover:bg-slate-800 hover:text-white'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 opacity-70" />
                      {item.name}
                    </div>
                    {expandedSections[item.id] ? (
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    ) : (
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    )}
                  </button>
                  
                  {expandedSections[item.id] && (
                    <div className="mt-1 ml-4 pl-4 border-l border-slate-800 space-y-1">
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => {
                            setActiveTab(subItem.id);
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`
                            w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
                            ${activeTab === subItem.id 
                              ? 'bg-brand-500/10 text-brand-400 font-medium' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }
                          `}
                        >
                          {subItem.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${activeTab === item.id 
                      ? 'bg-brand-500 text-white' 
                      : 'hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 opacity-70" />
                  {item.name}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-slate-800/50 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5 opacity-70" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-8 justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-800 capitalize hidden sm:block">
              {activeTab.replace(/-/g, ' ')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardOverview({ collegeId }: { collegeId: string }) {
  const [stats, setStats] = useState({
    students: 0,
    faculty: 0,
    hods: 0,
    departments: 0,
    programs: 0,
    subjects: 0
  });
  const [collegeInfo, setCollegeInfo] = useState<CollegeRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [fetchedStats, fetchedColleges] = await Promise.all([
          fetchCollegeStats(collegeId),
          fetchColleges()
        ]);
        
        setStats(fetchedStats);
        
        const college = fetchedColleges.find(c => c.id === collegeId);
        if (college) {
          setCollegeInfo(college);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [collegeId]);

  const displayStats = [
    { label: 'Total Students', value: stats.students, color: 'brand' },
    { label: 'Faculty Members', value: stats.faculty, color: 'emerald' },
    { label: 'Departments', value: stats.departments, color: 'indigo' },
    { label: 'Academic Programs', value: stats.programs, color: 'amber' }
  ];

  if (loading) {
    return <div className="flex items-center justify-center p-12 text-slate-500">Loading Dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {collegeInfo && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start sm:items-center gap-6">
          {collegeInfo.logoUrl ? (
            <img src={collegeInfo.logoUrl} alt={collegeInfo.name} className="w-20 h-20 rounded-lg object-contain bg-slate-50 border border-slate-100 p-2" />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-400">{collegeInfo.name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{collegeInfo.name}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              {collegeInfo.code && <span className="font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded uppercase">{collegeInfo.code}</span>}
              {collegeInfo.domain && <span>{collegeInfo.domain}</span>}
              {collegeInfo.city && <span>{collegeInfo.city}, {collegeInfo.state}</span>}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500 mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex items-center justify-center">
          <p className="text-slate-400">Attendance Chart Placeholder</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex items-center justify-center">
          <p className="text-slate-400">Recent Activity Placeholder</p>
        </div>
      </div>
    </div>
  );
}
