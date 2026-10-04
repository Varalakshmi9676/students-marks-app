import { Student } from '../types';
import { SUBJECTS } from '../utils/studentUtils';
import { X, Printer, Award, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface ReportCardModalProps {
  student: Student | null;
  onClose: () => void;
}

export default function ReportCardModal({ student, onClose }: ReportCardModalProps) {
  if (!student) return null;

  const isPass = student.calculations.result === 'Pass';

  const getSubjectStatus = (mark: number, isAbsent: boolean) => {
    if (isAbsent) return 'Absent';
    return mark >= 35 ? 'Pass' : 'Fail';
  };

  const getSubjectGrade = (mark: number, isAbsent: boolean) => {
    if (isAbsent) return 'Ab';
    if (mark >= 90) return 'A+';
    if (mark >= 80) return 'A';
    if (mark >= 70) return 'B';
    if (mark >= 60) return 'C';
    if (mark >= 50) return 'D';
    return 'F';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" id="report-card-modal">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col relative" id="modal-card">
        
        {/* Modal Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2 print:hidden z-10" id="modal-controls">
          <button
            onClick={handlePrint}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-xl border border-slate-200/50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Print Report Card"
            id="print-card-btn"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-xl border border-slate-200/50 transition-colors"
            title="Close"
            id="close-card-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report Card Body */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[85vh] print:p-0" id="report-card-print-area">
          
          {/* Institution Header */}
          <div className="text-center space-y-1.5 border-b-2 border-slate-800 pb-5" id="institution-header">
            <div className="flex items-center justify-center gap-2 text-indigo-700">
              <Award className="w-8 h-8" />
              <span className="text-xs font-bold uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                Academic Progress Certificate
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-800 font-display uppercase tracking-tight">
              Excel Academic Academy
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Annual Assessment Report Card • School Year 2026
            </p>
          </div>

          {/* Student Profile Block */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 p-4 bg-slate-50 rounded-xl border border-slate-100" id="student-profile-block">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student Name</span>
              <span className="text-sm font-extrabold text-slate-800 font-display">{student.name}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student ID</span>
              <span className="text-sm font-mono font-bold text-slate-600">{student.id}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Class & Section</span>
              <span className="text-sm font-semibold text-slate-700">{student.class} - {student.section}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Roll Number</span>
              <span className="text-sm font-semibold text-slate-700">#{student.rollNumber}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Class Rank</span>
              <span className="text-sm font-extrabold text-indigo-700">Rank {student.calculations.rank}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
              <span className={`inline-flex items-center gap-1 text-xs font-bold ${isPass ? 'text-green-600' : 'text-rose-600'}`}>
                {isPass ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {student.calculations.result.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Attendance Warnings and Messages */}
          {(student.attendedClasses === false || student.attendedExams === false) && (
            <div className="space-y-2.5" id="report-attendance-notices">
              {student.attendedClasses === false && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-3" id="warning-class-attendance">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-amber-900">Low Class Attendance</p>
                    <p className="mt-0.5 font-medium text-amber-700">This student did not attend classes regularly. Critical class attendance warnings are logged in the school database.</p>
                  </div>
                </div>
              )}

              {student.attendedExams === false && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-3" id="warning-exam-attendance">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-rose-900">Absent from Exams</p>
                    <p className="mt-0.5 font-medium text-rose-700">This student did not attend the final examinations. As a result, exam grades are evaluated as 0 (Fail).</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subject Grades Table */}
          <div className="space-y-3" id="subject-grades-section">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-slate-400" /> Subject-wise Performance
            </h3>
            
            <div className="overflow-x-auto border border-slate-100 rounded-lg" id="marks-table-wrapper">
              <table className="w-full text-left text-sm border-collapse" id="marks-table">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-medium border-b border-slate-100">
                    <th className="py-2.5 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Subject</th>
                    <th className="py-2.5 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 text-center">Max Marks</th>
                    <th className="py-2.5 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 text-center">Passing Marks</th>
                    <th className="py-2.5 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 text-right">Marks Obtained</th>
                    <th className="py-2.5 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 text-center">Grade</th>
                    <th className="py-2.5 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {SUBJECTS.map((sub) => {
                    const isAbsent = student.attendedExams === false || student.absentSubjects?.includes(sub.key);
                    const score = isAbsent ? 0 : student.marks[sub.key];
                    const passed = score >= 35 && !isAbsent;
                    return (
                      <tr key={sub.key} className="hover:bg-slate-50/20" id={`report-row-${sub.key}`}>
                        <td className="py-2.5 px-4 font-semibold text-slate-800 font-display">{sub.label}</td>
                        <td className="py-2.5 px-4 text-center font-mono font-medium text-slate-400">100</td>
                        <td className="py-2.5 px-4 text-center font-mono font-medium text-slate-400">35</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800 text-base">
                          {isAbsent ? <span className="text-rose-500 font-extrabold text-xs uppercase bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">Absent</span> : score}
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono font-extrabold text-slate-800">{getSubjectGrade(score, isAbsent)}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span className={`inline-flex px-1.5 py-0.2 rounded font-semibold text-xs ${passed ? 'text-green-600 bg-green-50/50' : 'text-rose-600 bg-rose-50/50'}`}>
                            {getSubjectStatus(score, isAbsent)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Aggregate Results Summary Card */}
          <div className="p-5 bg-indigo-600 text-white rounded-xl shadow-md grid grid-cols-2 md:grid-cols-4 gap-4" id="aggregate-summary-card">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">Total Obtained</span>
              <span className="text-xl font-black font-mono">{student.calculations.total} <span className="text-xs text-indigo-200">/ 500</span></span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">Percentage</span>
              <span className="text-xl font-black font-mono">{student.calculations.percentage}%</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">Overall Grade</span>
              <span className="text-xl font-black font-mono bg-white/20 px-2 py-0.5 rounded inline-block">{student.calculations.grade}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">Academic Decision</span>
              <span className={`text-sm font-extrabold px-2.5 py-0.5 rounded inline-block uppercase tracking-wider ${isPass ? 'bg-green-500 text-white' : 'bg-rose-500 text-white'}`}>
                {student.calculations.result}
              </span>
            </div>
          </div>

          {/* Certificate Footer Notes */}
          <div className="text-center pt-4 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 font-medium" id="report-card-footer">
            <span>Generated on {new Date().toLocaleDateString()}</span>
            <span className="hidden print:inline-block border-t border-dashed border-slate-300 w-36 pt-1 mt-4 md:mt-0 font-bold uppercase tracking-wider text-[10px] text-slate-500">
              Registrar Signature
            </span>
            <span>Excel Academic Manager</span>
          </div>

        </div>
      </div>
    </div>
  );
}
