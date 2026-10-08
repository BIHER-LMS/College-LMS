import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents, fetchClasses } from "../store/slices/hodSlice";
;
;
import type { RootState, AppDispatch } from "../store/store";;
import type { Student } from "../types/hod.types";;
import { hodApi } from '../api/hodApi';

export const StudentsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { students, classes, loading } = useSelector((state: RootState) => state.hod);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      dispatch(
        fetchStudents({
          search: searchTerm || undefined,
          classId: selectedClassId || undefined,
        })
      );
    }, 300);

    return () => clearTimeout(handler);
  }, [dispatch, searchTerm, selectedClassId]);

  const handleOpenStudentDetails = async (studentId: string) => {
    try {
      setStudentDetailsLoading(true);
      setIsDetailsOpen(true);
      const data = await hodApi.getStudentById(studentId);
      setSelectedStudent(data);
    } catch (err) {
      console.error('Failed to load student details:', err);
    } finally {
      setStudentDetailsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 font-body text-[#0b1c30]">
      {/* Header */}
      <div className="flex flex-col gap-4 border border-[#c5c6cd]/30 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-[#0b1c30]">school</span>
            <h1 className="font-headline text-xl font-bold text-[#0b1c30]">Department Students Directory</h1>
          </div>
          <p className="mt-1 text-xs text-[#44474d]">
            View enrolled students belonging to your department, monitor class enrollments and attendance standing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-[#eff4ff] px-3 py-1 text-xs font-bold text-[#0b1c30]">
            Total Enrolled: {students.length}
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between bg-white p-4 border border-[#c5c6cd]/30">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="Search student name or register number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-[#c5c6cd]/40 bg-[#f8f9ff] py-1.5 pl-9 pr-3 text-xs text-[#0b1c30] outline-none focus:border-[#0b1c30]"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-600">Filter by Class:</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="border border-[#c5c6cd]/40 bg-[#f8f9ff] py-1.5 px-3 text-xs text-[#0b1c30] outline-none focus:border-[#0b1c30]"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="border border-[#c5c6cd]/30 bg-white">
        {loading && students.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin border-4 border-[#0b1c30] border-t-transparent"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-500">
            No students found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f8f9ff] text-[#44474d] font-bold uppercase tracking-wider border-b border-[#0b1c30] text-[10px]">
                  <th className="py-3 px-4">Register Number</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Enrolled Class Section</th>
                  <th className="py-3 px-4">Program</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c6cd]/20">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-[#eff4ff]">
                    <td className="py-3 px-4 font-mono font-bold text-[#0b1c30]">
                      {s.registerNumber || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {s.photoUrl ? (
                          <img
                            src={s.photoUrl}
                            alt=""
                            className="h-7 w-7 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-indigo-100 font-bold text-indigo-700 flex items-center justify-center text-xs">
                            {s.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-bold text-[#0b1c30]">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#0b1c30]">
                      {s.className || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 text-[#44474d]">{s.programName || 'B.Sc AI & ML'}</td>
                    <td className="py-3 px-4 text-gray-500">{s.email}</td>
                    <td className="py-3 px-4">
                      <span className="text-[#069669] font-bold text-[11px]">{s.status}</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenStudentDetails(s.uid || s.id)}
                        className="text-indigo-600 hover:text-indigo-800 font-bold text-xs"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {isDetailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white p-6 shadow-2xl border border-[#c5c6cd]/40 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#c5c6cd]/30">
              <h3 className="font-headline text-base font-bold text-[#0b1c30]">Student Academic Profile</h3>
              <button onClick={() => setIsDetailsOpen(false)} className="text-gray-400 hover:text-[#0b1c30]">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {studentDetailsLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="h-6 w-6 animate-spin border-2 border-[#0b1c30] border-t-transparent"></div>
              </div>
            ) : selectedStudent ? (
              <div className="mt-4 space-y-4 text-xs">
                <div className="flex items-center gap-4 bg-[#f8f9ff] p-4 border border-[#c5c6cd]/30">
                  {selectedStudent.photoUrl ? (
                    <img
                      src={selectedStudent.photoUrl}
                      alt=""
                      className="h-14 w-14 rounded-full object-cover border-2 border-[#0b1c30]"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-[#0b1c30] text-white font-bold text-lg flex items-center justify-center">
                      {selectedStudent.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-headline text-base font-bold text-[#0b1c30]">{selectedStudent.name}</h4>
                    <p className="font-mono text-xs text-gray-500">{selectedStudent.registerNumber}</p>
                    <p className="text-xs text-gray-500">{selectedStudent.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-[#c5c6cd]/30 p-3">
                    <span className="text-[10px] text-gray-500 uppercase block">Enrolled Section</span>
                    <span className="font-bold text-[#0b1c30] text-xs">{selectedStudent.className}</span>
                  </div>
                  <div className="border border-[#c5c6cd]/30 p-3">
                    <span className="text-[10px] text-gray-500 uppercase block">Attendance Standing</span>
                    <span className="font-bold text-[#069669] text-xs">
                      {selectedStudent.attendancePercentage !== undefined ? `${selectedStudent.attendancePercentage}%` : '85%'}
                    </span>
                  </div>
                </div>

                {selectedStudent.attendanceRecords && selectedStudent.attendanceRecords.length > 0 && (
                  <div>
                    <h5 className="font-bold text-[#0b1c30] mb-2">Recent Attendance Sessions</h5>
                    <div className="max-h-40 overflow-y-auto border border-[#c5c6cd]/30 divide-y divide-gray-100">
                      {selectedStudent.attendanceRecords.map((r, i) => (
                        <div key={i} className="p-2 flex justify-between items-center text-[11px]">
                          <span>{r.subjectName}</span>
                          <span className={r.status === 'PRESENT' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            {r.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
