import React from 'react';
import { User, Mail, Phone, Calendar, Building2, GraduationCap, MapPin } from 'lucide-react';
import type { StudentDetails as StudentDetailsType } from '../types/faculty.types';

interface StudentDetailsProps {
  student: StudentDetailsType;
}

export const StudentDetails: React.FC<StudentDetailsProps> = ({ student }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-8 relative overflow-hidden shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-slate-200">
        {student.profilePhoto ? (
          <img
            src={student.profilePhoto}
            alt={student.displayName || 'Student'}
            className="w-20 h-20 rounded-xl object-cover ring-2 ring-blue-100 shadow-sm"
          />
        ) : (
          <div className="w-20 h-20 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-2xl border border-slate-200 shadow-sm">
            <User className="w-9 h-9 text-slate-400" />
          </div>
        )}

        <div className="space-y-1 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">
              {student.displayName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email}
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {student.accountStatus}
            </span>
          </div>

          <p className="text-xs font-mono text-blue-600 font-semibold">
            {student.registerNumber ? `Reg: ${student.registerNumber}` : 'Register number not assigned'}
          </p>

          <p className="text-xs text-slate-500 flex items-center gap-2 pt-0.5">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            Class: <span className="text-slate-800 font-semibold">{student.className}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Email Address
          </span>
          <p className="text-sm font-medium text-slate-800 mt-1 flex items-center gap-2 truncate">
            <Mail className="w-4 h-4 text-blue-600 shrink-0" />
            {student.email}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Phone Number
          </span>
          <p className="text-sm font-medium text-slate-800 mt-1 flex items-center gap-2">
            <Phone className="w-4 h-4 text-blue-600" />
            {student.phone || <span className="text-slate-400 italic">Not available</span>}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Department
          </span>
          <p className="text-sm font-medium text-slate-800 mt-1 flex items-center gap-2 truncate">
            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
            {student.departmentName || '—'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Enrollment Year
          </span>
          <p className="text-sm font-medium text-slate-800 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            {student.enrollmentYear || '—'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Location
          </span>
          <p className="text-sm font-medium text-slate-800 mt-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            {[student.city, student.state].filter(Boolean).join(', ') || <span className="text-slate-400 italic">Not specified</span>}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Access Scope
          </span>
          <p className="text-sm font-medium text-emerald-700 mt-1 font-semibold">
            Assigned Class Student (Verified)
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
