import React, { useState } from 'react';
import { Student, SubjectMarks } from '../types';
import StudentTimetable from './StudentTimetable';
import { 
  GraduationCap, 
  LogOut, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  KeyRound, 
  Printer, 
  ShieldCheck, 
  Sparkles, 
  User, 
  BookOpenCheck,
  TrendingUp,
  Flame,
  FileCheck2,
  Lock,
  Eye,
  EyeOff,
  Calendar
} from 'lucide-react';

interface StudentDashboardProps {
  student: Student;
  allStudents: Student[];
  onLogout: () => void;
  onUpdatePassword: (studentId: string, newPass: string) => void;
}

export default function StudentDashboard({ 
  student, 
  allStudents, 
  onLogout, 
  onUpdatePassword 
}: StudentDashboardProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPassRaw, setShowPassRaw] = useState(false);
  const [activeTab, setActiveTab] = useState<'report' | 'timetable'>('report');


  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 4) {
      setPasswordError('Password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    onUpdatePassword(student.id, newPassword);
    setPasswordSuccess('Your password has been updated successfully!');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setShowPasswordFields(false);
      setPasswordSuccess('');
    }, 3000);
  };

  // Find overall class rank based on recalculating from allStudents
  const totalStudentsInClass = allStudents.filter(s => s.class === student.class).length;
  const sectionStudents = allStudents.filter(s => s.class === student.class && s.section === student.section);
  
  // Compute section-wise rank
  const sectionRank = sectionStudents
    .sort((a, b) => b.calculations.total - a.calculations.total)
    .findIndex(s => s.id === student.id) + 1;

  const subjectList: { key: keyof SubjectMarks; name: string; color: string; bg: string }[] = [
    { key: 'maths', name: 'Mathematics', color: 'text-indigo-600 border-indigo-100 bg-indigo-50/20', bg: 'bg-indigo-500' },
    { key: 'science', name: 'Science', color: 'text-emerald-600 border-emerald-100 bg-emerald-50/20', bg: 'bg-emerald-500' },
    { key: 'english', name: 'English', color: 'text-sky-600 border-sky-100 bg-sky-50/20', bg: 'bg-sky-500' },
    { key: 'social', name: 'Social Studies', color: 'text-amber-600 border-amber-100 bg-amber-50/20', bg: 'bg-amber-500' },
    { key: 'computer', name: 'Computer Science', color: 'text-purple-600 border-purple-100 bg-purple-50/20', bg: 'bg-purple-500' },
  ];

  // Automated Feedback Insights
  const getSubjectInsight = () => {
    const scores = Object.entries(student.marks).map(([key, val]) => ({ key, val }));
    const maxSubject = scores.reduce((prev, current) => (prev.val > current.val) ? prev : current);
    const minSubject = scores.reduce((prev, current) => (prev.val < current.val) ? prev : current);

    const subNameMap: Record<string, string> = {
      maths: 'Mathematics',
      science: 'Science',
      english: 'English',
      social: 'Social Studies',
      computer: 'Computer Science'
    };

    if (student.calculations.result === 'Fail') {
      const failedList = scores.filter(s => s.val < 35).map(s => subNameMap[s.key]);
      return {
        title: 'Remedial Action Recommended',
        message: `Focus on remedial preparation. Extra attention is required for: ${failedList.join(', ')} (scored below 35%).`,
        type: 'fail'
      };
    }

    if (student.calculations.percentage >= 85) {
      return {
        title: 'Exemplary Performance!',
        message: `Outstanding performance across all domains. You did exceptionally well in ${subNameMap[maxSubject.key]} with a score of ${maxSubject.val}! Keep up the outstanding momentum.`,
        type: 'excellent'
      };
    }

    return {
      title: 'Satisfactory Development',
      message: `Stable progress verified. Your maximum achievement was in ${subNameMap[maxSubject.key]} (${maxSubject.val}). Consider allocating extra prep cycles for ${subNameMap[minSubject.key]} (${minSubject.val}) to further boost your grade point average.`,
      type: 'good'
    };
  };

  const insight = getSubjectInsight();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800" id="student-dashboard-root">
      
      {/* Student Nav Bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30" id="student-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 font-display text-sm tracking-tight">EduGrade Student Hub</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Academic Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Show Password Toggle Option */}
            <button
              onClick={() => setShowPasswordFields(!showPasswordFields)}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Secure Account Password"
              id="student-pwd-toggle-btn"
            >
              <KeyRound className="w-4 h-4" />
              <span className="hidden sm:inline">Credentials</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-transparent hover:border-rose-100"
              id="student-logout-btn"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" id="student-dashboard-body">
        
        {/* Account Password Change Panel */}
        {showPasswordFields && (
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm max-w-md mx-auto animate-scale-up" id="pwd-change-panel">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-500" /> Secure Password Management
              </h3>
              <button onClick={() => setShowPasswordFields(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer">Close</button>
            </div>

            {passwordError && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg font-medium">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-3 p-2.5 bg-green-50 border border-green-100 text-green-700 text-xs rounded-lg font-medium">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <input
                    type={showPassRaw ? 'text' : 'password'}
                    required
                    placeholder="Enter at least 4 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/60 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-400 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassRaw(!showPassRaw)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassRaw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <input
                  type={showPassRaw ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-400 transition-all font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Update Password
              </button>
            </form>
          </div>
        )}

        {/* Top Student Overview Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm relative overflow-hidden" id="student-hero">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/40 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-xl font-black font-display shadow-sm">
              {student.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-800 font-display">{student.name}</h1>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full font-mono">
                  {student.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Class {student.class}-{student.section} • Roll Number: {student.rollNumber}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:border-l border-slate-100 md:pl-6" id="student-meta-mini-grid">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Class Rank</span>
              <span className="text-base font-black text-slate-800 font-mono">#{student.calculations.rank} <span className="text-[10px] text-slate-400 font-normal">of {totalStudentsInClass}</span></span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Section Rank</span>
              <span className="text-base font-black text-slate-800 font-mono">#{sectionRank} <span className="text-[10px] text-slate-400 font-normal">of {sectionStudents.length}</span></span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Cumulative Grade</span>
              <span className="text-base font-black text-indigo-600 font-mono">{student.calculations.grade}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Final Result</span>
              <span className={`text-base font-black font-display inline-flex items-center gap-1 ${student.calculations.result === 'Pass' ? 'text-green-600' : 'text-rose-600'}`}>
                {student.calculations.result === 'Pass' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {student.calculations.result}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white rounded-xl border border-slate-100 p-1.5 shadow-sm flex gap-1 max-w-sm" id="student-tab-switcher">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'report'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
            id="btn-tab-report"
          >
            <Award className="w-4 h-4" />
            Report Card
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'timetable'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
            id="btn-tab-timetable"
          >
            <Calendar className="w-4 h-4" />
            Class Timetable
          </button>
        </div>

        {activeTab === 'timetable' ? (
          <StudentTimetable student={student} />
        ) : (
          <>
            {/* Attendance Warnings and Messages */}
            {(student.attendedClasses === false || student.attendedExams === false) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="student-attendance-alerts">
                {student.attendedClasses === false && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3.5 text-amber-800" id="low-class-attendance-banner">
                    <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700 flex-shrink-0">
                      <XCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="text-xs">
                      <h4 className="font-bold text-amber-900">Class Attendance Alert</h4>
                      <p className="mt-0.5 leading-relaxed text-amber-700">You are currently flagged for low class attendance. Regular class attendance is critical for maintaining performance guidelines.</p>
                    </div>
                  </div>
                )}

                {student.attendedExams === false && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3.5 text-rose-800" id="absent-exams-banner">
                    <div className="p-1.5 bg-rose-100 rounded-lg text-rose-700 flex-shrink-0">
                      <XCircle className="w-5 h-5 text-rose-600" />
                    </div>
                    <div className="text-xs">
                      <h4 className="font-bold text-rose-900">Absent from Final Exams</h4>
                      <p className="mt-0.5 leading-relaxed text-rose-700">You were marked as absent from examinations. As a result, your terminal scores are evaluated as zero with an automatic Fail decision.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subject wise Score Panel & Remedial Guidance side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="student-view-split">
              
              {/* Subject Grades Progress Bar Box */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm lg:col-span-2 space-y-5" id="student-progress-box">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                  <BookOpenCheck className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Subject-wise Academic Performance</h3>
                </div>

                <div className="space-y-4" id="student-subjects-list">
                  {subjectList.map((sub) => {
                    const isSubjectAbsent = student.attendedExams === false || student.absentSubjects?.includes(sub.key);
                    const mark = isSubjectAbsent ? 0 : student.marks[sub.key];
                    const isFail = mark < 35 || isSubjectAbsent;
                    const statusColor = isSubjectAbsent 
                      ? 'text-rose-600 bg-rose-50 border-rose-150 font-extrabold'
                      : isFail 
                        ? 'text-rose-600 bg-rose-50 border-rose-100' 
                        : mark >= 75 
                          ? 'text-green-600 bg-green-50 border-green-100' 
                          : 'text-slate-500 bg-slate-50 border-slate-100';
                    return (
                      <div key={sub.key} className="space-y-1.5" id={`student-score-row-${sub.key}`}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">{sub.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColor}`}>
                              {isSubjectAbsent ? 'Absent' : isFail ? 'Needs Attention' : mark >= 75 ? 'Distinction' : 'Stable'}
                            </span>
                            <span className="font-black text-slate-800 font-mono">
                              {isSubjectAbsent ? <span className="text-rose-600 uppercase font-black">Absent</span> : `${mark} / 100`}
                            </span>
                          </div>
                        </div>
                        
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${sub.bg} transition-all duration-500`}
                            style={{ width: `${isSubjectAbsent ? 0 : mark}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Automated Remedial Guidance & Insights Panel */}
              <div className="flex flex-col gap-4" id="student-insights-and-support">
                
                {/* Automatic Insight Callout */}
                <div className={`rounded-2xl border p-5 flex-grow flex flex-col justify-between shadow-sm ${
                  insight.type === 'fail' 
                    ? 'bg-rose-50 border-rose-100 text-rose-800' 
                    : insight.type === 'excellent' 
                      ? 'bg-amber-50 border-amber-100 text-amber-900' 
                      : 'bg-indigo-50/50 border-indigo-100 text-indigo-900'
                }`} id="personal-insight-box">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {insight.type === 'fail' ? (
                        <XCircle className="w-5 h-5 text-rose-500 animate-bounce" />
                      ) : insight.type === 'excellent' ? (
                        <Flame className="w-5 h-5 text-amber-500 animate-bounce" />
                      ) : (
                        <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                      )}
                      <h4 className="font-black text-sm uppercase tracking-wide font-display">{insight.title}</h4>
                    </div>
                    <p className="text-xs leading-relaxed font-medium opacity-90">{insight.message}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-current/10 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between opacity-80">
                    <span>Evaluated: Today</span>
                    <span>Portal Autograde Verified</span>
                  </div>
                </div>

                {/* Print action box */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center space-y-3" id="print-action-box">
                  <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto" />
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">Official Record</h4>
                    <p className="text-[11px] text-slate-400 leading-normal mt-0.5">Need a paper copy of your report card? Use the certified print layout generator.</p>
                  </div>
                  <button
                    onClick={handlePrint}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
                    id="btn-print-card"
                  >
                    <Printer className="w-4 h-4" /> Print Verified Report Card
                  </button>
                </div>

              </div>

            </div>

            {/* Printable/Elegant Formal Report Card view built right in */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-md relative max-w-3xl mx-auto space-y-6 overflow-hidden" id="report-card-print-area">
              {/* Top Stamp decoration */}
              <div className="absolute top-0 right-0 w-28 h-28 bg-slate-50 rounded-bl-full border-l border-b border-slate-100 flex items-start justify-end p-4 text-slate-300 font-mono text-[9px] uppercase tracking-widest font-black">
                EduGrade
              </div>

              {/* School Header */}
              <div className="text-center space-y-1 pb-6 border-b border-slate-150">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-wide font-display">EDUGRADE ACADEMIC HIGH SCHOOL</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Office of Registry • Official Student Report Card</p>
              </div>

              {/* Profile metadata info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs py-2">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Student Name</span>
                  <span className="font-bold text-slate-800">{student.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Student ID</span>
                  <span className="font-mono font-bold text-indigo-600">{student.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Class & Section</span>
                  <span className="font-bold text-slate-800">Class {student.class}-{student.section}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wider">Roll Number</span>
                  <span className="font-mono font-bold text-slate-800">Roll No. {student.rollNumber}</span>
                </div>
              </div>

              {/* Attendance Warnings and Messages */}
              {(student.attendedClasses === false || student.attendedExams === false) && (
                <div className="space-y-2 border-l-2 border-slate-300 pl-3.5 my-3 text-left" id="print-attendance-notices">
                  {student.attendedClasses === false && (
                    <p className="text-[11px] text-slate-500 font-medium">
                      • <strong className="font-bold">Class Attendance Warning</strong>: Flagged for irregular class attendance.
                    </p>
                  )}
                  {student.attendedExams === false && (
                    <p className="text-[11px] text-rose-600 font-bold">
                      • <strong className="font-bold">Absent from Exams</strong>: Did not appear for final examinations. All grades evaluated as 0 (Fail).
                    </p>
                  )}
                </div>
              )}

              {/* Detailed Grades Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Subject Course</th>
                      <th className="py-3 px-4 text-center">Max Marks</th>
                      <th className="py-3 px-4 text-center">Min Passing</th>
                      <th className="py-3 px-4 text-center">Marks Obtained</th>
                      <th className="py-3 px-4 text-right">Subject Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {subjectList.map((sub) => {
                      const isSubjectAbsent = student.attendedExams === false || student.absentSubjects?.includes(sub.key);
                      const mark = isSubjectAbsent ? 0 : student.marks[sub.key];
                      const isFail = mark < 35 || isSubjectAbsent;
                      return (
                        <tr key={sub.key} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-4 font-bold text-slate-700">{sub.name}</td>
                          <td className="py-3.5 px-4 text-center text-slate-500 font-mono">100</td>
                          <td className="py-3.5 px-4 text-center text-slate-500 font-mono">35</td>
                          <td className="py-3.5 px-4 text-center font-bold font-mono">
                            {isSubjectAbsent ? (
                              <span className="text-rose-600 uppercase font-extrabold text-[10px] bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">Absent</span>
                            ) : (
                              <span className={isFail ? 'text-rose-600' : 'text-slate-800'}>{mark}</span>
                            )}
                          </td>
                          <td className={`py-3.5 px-4 text-right font-bold ${isFail ? 'text-rose-600' : 'text-indigo-600'}`}>
                            {isSubjectAbsent ? 'Ab' : isFail ? 'F' : mark >= 90 ? 'A+' : mark >= 80 ? 'A' : mark >= 70 ? 'B' : mark >= 50 ? 'C' : 'D'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Consolidated Calculations Footer Row */}
              <div className="bg-slate-50 rounded-xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border border-slate-100" id="report-card-cons-footer">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Score</span>
                  <span className="text-lg font-black text-slate-800 font-mono">{student.calculations.total} <span className="text-xs text-slate-400 font-normal">/ 500</span></span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Percentage</span>
                  <span className="text-lg font-black text-slate-800 font-mono">{student.calculations.percentage}%</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Final Evaluation</span>
                  <span className={`text-lg font-black ${student.calculations.result === 'Pass' ? 'text-green-600' : 'text-rose-600'}`}>{student.calculations.result}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Grade Assigned</span>
                  <span className="text-lg font-black text-indigo-600">{student.calculations.grade}</span>
                </div>
              </div>

              {/* Official Signatures Row */}
              <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs text-slate-400 font-medium" id="card-signatures-row">
                <div className="space-y-1">
                  <div className="border-b border-slate-200 mx-auto w-36 h-8 flex items-end justify-center font-mono text-[9px] text-slate-300">ADMINISTRATOR</div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authorized Registrar</p>
                </div>
                <div className="space-y-1">
                  <div className="border-b border-slate-200 mx-auto w-36 h-8 flex items-end justify-center font-mono text-[9px] text-slate-300">EDUGRADE HIGH</div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Principal / Board Dean</p>
                </div>
              </div>

            </div>
          </>
        )}

      </main>

    </div>
  );
}
