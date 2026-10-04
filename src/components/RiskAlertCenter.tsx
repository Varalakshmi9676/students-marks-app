import React from 'react';
import { Student } from '../types';
import { getAtRiskStudents, AtRiskStudent } from '../utils/analyticsUtils';
import { AlertTriangle, BookOpen, AlertCircle, Sparkles, UserCheck, ShieldAlert, GraduationCap } from 'lucide-react';

interface RiskAlertCenterProps {
  students: Student[];
  onViewReportCard: (student: Student) => void;
}

export default function RiskAlertCenter({ students, onViewReportCard }: RiskAlertCenterProps) {
  const atRiskList = getAtRiskStudents(students);

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-400" id="risk-alert-empty">
        <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
        <p className="text-sm font-medium">No registered student records available to evaluate at-risk alerts.</p>
      </div>
    );
  }

  // Filter into critical failure list (failed at least 1 subject) and warning list (borderline score 35-45)
  const criticalList = atRiskList.filter(risk => risk.failedSubjects.length > 0);
  const borderlineList = atRiskList.filter(risk => risk.failedSubjects.length === 0 && risk.borderlineSubjects.length > 0);

  // Filter into low attendance class and exam absence lists
  const lowAttendanceClasses = students.filter(s => s.attendedClasses === false);
  const absentExams = students.filter(s => s.attendedExams === false);

  return (
    <div className="space-y-6" id="risk-alert-dashboard">
      
      {/* Risk Alert Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5" id="risk-overview-grid">
        {/* Critical Alerts */}
        <div className="bg-rose-50 border border-rose-100/60 rounded-xl p-5 flex items-start gap-4 shadow-sm" id="risk-card-critical">
          <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 flex-shrink-0 animate-pulse">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Critical Alerts</span>
            <h4 className="text-xl font-bold text-slate-800 font-display mt-0.5">{criticalList.length} Students</h4>
            <p className="text-[11px] text-rose-700/80 font-medium leading-relaxed mt-1">
              Currently failing one or more subjects (marks less than 35%). Immediate intervention is highly recommended.
            </p>
          </div>
        </div>

        {/* Borderline Students */}
        <div className="bg-amber-50 border border-amber-100/60 rounded-xl p-5 flex items-start gap-4 shadow-sm" id="risk-card-warning">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Borderline Warning</span>
            <h4 className="text-xl font-bold text-slate-800 font-display mt-0.5">{borderlineList.length} Students</h4>
            <p className="text-[11px] text-amber-700/80 font-medium leading-relaxed mt-1">
              Passing but scoring 35-45% in one or more subjects. At risk of failing without extra counseling.
            </p>
          </div>
        </div>

        {/* Clear/Safe Students */}
        <div className="bg-green-50 border border-green-100/60 rounded-xl p-5 flex items-start gap-4 shadow-sm" id="risk-card-safe">
          <div className="p-2.5 rounded-xl bg-green-100 text-green-700 flex-shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Fully Secure Status</span>
            <h4 className="text-xl font-bold text-slate-800 font-display mt-0.5">
              {students.length - atRiskList.length} Students
            </h4>
            <p className="text-[11px] text-green-700/80 font-medium leading-relaxed mt-1">
              Scoring comfortably above failing thresholds in all subjects. Demonstrating stable academic milestones.
            </p>
          </div>
        </div>
      </div>

      {/* Main layout splitting Critical list and Warning list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="risk-main-split">
        
        {/* CRITICAL ATTENTION NEEDED */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm" id="critical-list-panel">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3 mb-4">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Critical Remedial Focus</h3>
          </div>

          {criticalList.length > 0 ? (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1" id="critical-alerts-list">
              {criticalList.map((risk) => (
                <div
                  key={risk.student.id}
                  className="bg-rose-50/20 border border-rose-100/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-rose-50/40"
                  id={`risk-item-critical-${risk.student.id}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 font-display text-sm">{risk.student.name}</h4>
                      <span className="text-[10px] font-semibold bg-rose-50 text-rose-600 px-2 py-0.2 rounded border border-rose-100 font-mono">
                        {risk.student.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Class {risk.student.class}-{risk.student.section} • Roll #{risk.student.rollNumber}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {risk.failedSubjects.map((sub) => (
                        <span key={sub} className="text-[9px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle className="w-2.5 h-2.5" /> {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => onViewReportCard(risk.student)}
                    className="self-start sm:self-center px-3 py-1.5 bg-rose-50 hover:bg-rose-100/80 text-rose-700 rounded-lg text-xs font-semibold border border-rose-100 transition-colors"
                    id={`btn-critical-report-${risk.student.id}`}
                  >
                    Action Plan
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center h-52">
              <Sparkles className="w-7 h-7 text-green-400 mb-2 stroke-[1.5]" />
              <p className="text-xs font-medium">No critical academic failures detected! Outstanding pass margins.</p>
            </div>
          )}
        </div>

        {/* BORDERLINE WATCHLIST */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm" id="borderline-watchlist-panel">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Borderline Watchlist</h3>
          </div>

          {borderlineList.length > 0 ? (
            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1" id="borderline-alerts-list">
              {borderlineList.map((risk) => (
                <div
                  key={risk.student.id}
                  className="bg-amber-50/20 border border-amber-100/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors hover:bg-amber-50/40"
                  id={`risk-item-borderline-${risk.student.id}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 font-display text-sm">{risk.student.name}</h4>
                      <span className="text-[10px] font-semibold bg-amber-50 text-amber-600 px-2 py-0.2 rounded border border-amber-100 font-mono">
                        {risk.student.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Class {risk.student.class}-{risk.student.section} • Roll #{risk.student.rollNumber}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {risk.borderlineSubjects.map((sub) => (
                        <span key={sub} className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <BookOpen className="w-2.5 h-2.5" /> {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => onViewReportCard(risk.student)}
                    className="self-start sm:self-center px-3 py-1.5 bg-amber-50 hover:bg-amber-100/80 text-amber-700 rounded-lg text-xs font-semibold border border-amber-100 transition-colors"
                    id={`btn-borderline-report-${risk.student.id}`}
                  >
                    View Grades
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center h-52">
              <GraduationCap className="w-7 h-7 text-indigo-400 mb-2 stroke-[1.5]" />
              <p className="text-xs font-medium">All passing students are scoring well above borderline levels.</p>
            </div>
          )}
        </div>

      </div>

      {/* Attendance & Engagement Panel */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm" id="attendance-tracking-panel">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-3 mb-4">
          <AlertCircle className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Attendance & Participation Flag Center</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="attendance-lists-grid">
          {/* Low Class Attendance */}
          <div className="space-y-3" id="low-attendance-subpanel">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              Class Attendance Warnings <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded text-[10px]">{lowAttendanceClasses.length}</span>
            </h4>
            {lowAttendanceClasses.length > 0 ? (
              <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1" id="low-class-list">
                {lowAttendanceClasses.map((student) => (
                  <div key={student.id} className="bg-amber-50/20 border border-amber-100/30 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{student.name} ({student.id})</p>
                      <p className="text-[10px] text-slate-500">Class {student.class}-{student.section} • Roll #{student.rollNumber}</p>
                    </div>
                    <button
                      onClick={() => onViewReportCard(student)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold border border-amber-100 transition-colors cursor-pointer"
                    >
                      Inspect Profile
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center font-medium">All students are attending classes regularly!</p>
            )}
          </div>

          {/* Exam Absentees */}
          <div className="space-y-3" id="absent-exams-subpanel">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              Exam Absentees <span className="bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded text-[10px]">{absentExams.length}</span>
            </h4>
            {absentExams.length > 0 ? (
              <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1" id="exam-absents-list">
                {absentExams.map((student) => (
                  <div key={student.id} className="bg-rose-50/20 border border-rose-100/30 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{student.name} ({student.id})</p>
                      <p className="text-[10px] text-slate-500">Class {student.class}-{student.section} • Roll #{student.rollNumber}</p>
                    </div>
                    <button
                      onClick={() => onViewReportCard(student)}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold border border-rose-100 transition-colors cursor-pointer"
                    >
                      Inspect Profile
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center font-medium">No exam absentees. 100% test engagement!</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
