import React, { useState } from 'react';
import { Student, SubjectMarks } from '../types';
import { BookOpen, Award, AlertCircle, HelpCircle, GraduationCap, Flame, ThumbsUp, Medal } from 'lucide-react';

interface SubjectFocusAnalyticsProps {
  students: Student[];
}

interface SubjectConfig {
  key: keyof SubjectMarks;
  name: string;
  iconBg: string;
  iconText: string;
  themeColor: string;
}

const SUBJECT_CONFIGS: SubjectConfig[] = [
  { key: 'maths', name: 'Mathematics', iconBg: 'bg-indigo-50', iconText: 'text-indigo-600', themeColor: 'indigo' },
  { key: 'science', name: 'Science', iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', themeColor: 'emerald' },
  { key: 'english', name: 'English', iconBg: 'bg-sky-50', iconText: 'text-sky-600', themeColor: 'sky' },
  { key: 'social', name: 'Social Studies', iconBg: 'bg-amber-50', iconText: 'text-amber-600', themeColor: 'amber' },
  { key: 'computer', name: 'Computer Science', iconBg: 'bg-purple-50', iconText: 'text-purple-600', themeColor: 'purple' },
];

export default function SubjectFocusAnalytics({ students }: SubjectFocusAnalyticsProps) {
  const [selectedSubjectKey, setSelectedSubjectKey] = useState<keyof SubjectMarks>('maths');

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-400" id="subject-focus-empty">
        <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
        <p className="text-sm font-medium">No student records available to focus subject-wise statistics.</p>
      </div>
    );
  }

  const currentSubject = SUBJECT_CONFIGS.find((sub) => sub.key === selectedSubjectKey) || SUBJECT_CONFIGS[0];

  // Extract marks for the selected subject
  const marksList = students.map((s) => s.marks[selectedSubjectKey]);
  const totalStudents = students.length;

  const averageMark = Number((marksList.reduce((a, b) => a + b, 0) / totalStudents).toFixed(1));
  const maxMark = Math.max(...marksList);
  const minMark = Math.min(...marksList);

  const passingStudents = students.filter((s) => s.marks[selectedSubjectKey] >= 35);
  const passCount = passingStudents.length;
  const failCount = totalStudents - passCount;
  const passPercent = Number(((passCount / totalStudents) * 100).toFixed(1));

  // Find topper(s) for the subject
  const toppers = students.filter((s) => s.marks[selectedSubjectKey] === maxMark);
  // Find struggling (failing) students for this subject
  const struggling = students.filter((s) => s.marks[selectedSubjectKey] < 35).sort((a, b) => a.marks[selectedSubjectKey] - b.marks[selectedSubjectKey]);

  // Grade Distribution Calculation
  // A+: 90-100, A: 80-89, B: 70-79, C: 50-69, D: 35-49, F: <35
  const gradeBuckets = {
    'A+ (90-100)': students.filter((s) => s.marks[selectedSubjectKey] >= 90).length,
    'A (80-89)': students.filter((s) => s.marks[selectedSubjectKey] >= 80 && s.marks[selectedSubjectKey] < 90).length,
    'B (70-79)': students.filter((s) => s.marks[selectedSubjectKey] >= 70 && s.marks[selectedSubjectKey] < 80).length,
    'C (50-69)': students.filter((s) => s.marks[selectedSubjectKey] >= 50 && s.marks[selectedSubjectKey] < 70).length,
    'D (35-49)': students.filter((s) => s.marks[selectedSubjectKey] >= 35 && s.marks[selectedSubjectKey] < 50).length,
    'F (<35)': students.filter((s) => s.marks[selectedSubjectKey] < 35).length,
  };

  const maxBucketCount = Math.max(...Object.values(gradeBuckets), 1);

  // Styling helper for the active subject
  const activeColorClasses: Record<string, { tab: string; border: string; bar: string; text: string }> = {
    indigo: {
      tab: 'bg-indigo-600 text-white shadow-indigo-100',
      border: 'border-indigo-100 bg-indigo-50/20',
      bar: 'bg-indigo-500',
      text: 'text-indigo-600',
    },
    emerald: {
      tab: 'bg-emerald-600 text-white shadow-emerald-100',
      border: 'border-emerald-100 bg-emerald-50/20',
      bar: 'bg-emerald-500',
      text: 'text-emerald-600',
    },
    sky: {
      tab: 'bg-sky-600 text-white shadow-sky-100',
      border: 'border-sky-100 bg-sky-50/20',
      bar: 'bg-sky-500',
      text: 'text-sky-600',
    },
    amber: {
      tab: 'bg-amber-600 text-white shadow-amber-100',
      border: 'border-amber-100 bg-amber-50/20',
      bar: 'bg-amber-500',
      text: 'text-amber-600',
    },
    purple: {
      tab: 'bg-purple-600 text-white shadow-purple-100',
      border: 'border-purple-100 bg-purple-50/20',
      bar: 'bg-purple-500',
      text: 'text-purple-600',
    },
  };

  const theme = activeColorClasses[currentSubject.themeColor] || activeColorClasses.indigo;

  return (
    <div className="space-y-6" id="subject-focus-analytics-panel">
      
      {/* Subject Tab Selector */}
      <div className="flex flex-wrap gap-2 pb-1 border-b border-slate-100" id="subject-tab-buttons-container">
        {SUBJECT_CONFIGS.map((sub) => {
          const isActive = selectedSubjectKey === sub.key;
          return (
            <button
              key={sub.key}
              onClick={() => setSelectedSubjectKey(sub.key)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? theme.tab
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200/60'
              }`}
              id={`subject-tab-btn-${sub.key}`}
            >
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : sub.iconText} bg-current`} />
              {sub.name}
            </button>
          );
        })}
      </div>

      {/* Main Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="subject-numbers-grid">
        {/* Pass rate percentage */}
        <div className={`rounded-xl border p-4 shadow-sm ${theme.border}`} id="sub-stat-pass-percent">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subject Pass Rate</span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl font-black text-slate-800 font-mono">{passPercent}%</span>
            <span className="text-xs text-slate-500 font-semibold">({passCount}/{totalStudents})</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
            <div className={`h-full rounded-full ${theme.bar}`} style={{ width: `${passPercent}%` }} />
          </div>
        </div>

        {/* Average Grade Score */}
        <div className={`rounded-xl border p-4 shadow-sm ${theme.border}`} id="sub-stat-avg">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subject Average</span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl font-black text-slate-800 font-mono">{averageMark}</span>
            <span className="text-xs text-slate-500 font-semibold">marks</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
            <div className={`h-full rounded-full ${theme.bar}`} style={{ width: `${averageMark}%` }} />
          </div>
        </div>

        {/* Highest Score */}
        <div className={`rounded-xl border p-4 shadow-sm ${theme.border}`} id="sub-stat-highest">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Highest Mark (Topper)</span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl font-black text-slate-800 font-mono">{maxMark}</span>
            <span className="text-xs text-slate-500 font-semibold">/100</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold truncate mt-2 uppercase tracking-wide flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500" /> Topper score registered
          </p>
        </div>

        {/* Lowest Score */}
        <div className={`rounded-xl border p-4 shadow-sm ${theme.border}`} id="sub-stat-lowest">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lowest Mark</span>
          <div className="flex items-baseline gap-1.5 mt-1.5">
            <span className="text-2xl font-black text-slate-800 font-mono">{minMark}</span>
            <span className="text-xs text-slate-500 font-semibold">/100</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wide flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-500" /> Minimum boundary reached
          </p>
        </div>
      </div>

      {/* Grade Distribution & Student Focus Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="subject-details-grid">
        
        {/* Dynamic Grade Distribution Histogram */}
        <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm lg:col-span-7" id="subject-histogram-panel">
          <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-5">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-slate-500" /> Grade Metrics Distribution
            </h3>
            <span className="text-[10px] font-semibold text-slate-400 font-mono">Based on {totalStudents} records</span>
          </div>

          {/* Histogram Bars */}
          <div className="space-y-4" id="subject-histogram-container">
            {Object.entries(gradeBuckets).map(([bucketLabel, count]) => {
              const percentage = Number(((count / maxBucketCount) * 100).toFixed(0));
              const displayPercentage = Number(((count / totalStudents) * 100).toFixed(0));
              return (
                <div key={bucketLabel} className="flex items-center gap-3" id={`histogram-row-${bucketLabel}`}>
                  <span className="w-24 text-xs font-semibold text-slate-500 font-mono flex-shrink-0 text-right">{bucketLabel}</span>
                  <div className="flex-grow bg-slate-50 h-6 rounded-lg overflow-hidden border border-slate-100/30 relative flex items-center">
                    <div
                      className={`h-full ${theme.bar} opacity-85 rounded-r transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                    <span className="absolute left-2.5 text-[10px] font-bold text-slate-700 font-mono">
                      {count} {count === 1 ? 'student' : 'students'}
                    </span>
                  </div>
                  <span className="w-10 text-xs font-semibold text-slate-400 font-mono text-left">
                    {displayPercentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Toppers and Strugglers Side-by-side lists */}
        <div className="lg:col-span-5 flex flex-col gap-6" id="subject-leaderboard-panel">
          {/* TOP PERFORMERS LIST */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex-grow">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3 mb-3">
              <Award className="w-4.5 h-4.5 text-amber-500" />
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Subject leaders ({maxMark} marks)</h3>
            </div>
            
            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {toppers.map((student) => (
                <div
                  key={student.id}
                  className="bg-amber-50/20 border border-amber-100/30 rounded-lg p-2.5 flex items-center justify-between"
                  id={`sub-topper-item-${student.id}`}
                >
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs font-display">{student.name}</h4>
                    <p className="text-[10px] text-slate-500 font-semibold">Class {student.class}-{student.section} • Roll #{student.rollNumber}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                    <Medal className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-bold text-amber-700 font-mono">{student.marks[selectedSubjectKey]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STRUGGLING STUDENTS LIST */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex-grow">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3 mb-3">
              <AlertCircle className="w-4.5 h-4.5 text-rose-500" />
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Failing / Remedial Watchlist</h3>
            </div>
            
            {struggling.length > 0 ? (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {struggling.map((student) => (
                  <div
                    key={student.id}
                    className="bg-rose-50/20 border border-rose-100/30 rounded-lg p-2.5 flex items-center justify-between"
                    id={`sub-struggle-item-${student.id}`}
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs font-display">{student.name}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold">Class {student.class}-{student.section} • Roll #{student.rollNumber}</p>
                    </div>
                    <span className="text-xs font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded border border-rose-100 font-mono">
                      {student.marks[selectedSubjectKey]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 flex flex-col items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-green-400 mb-1" />
                <p className="text-[10px] font-bold text-slate-500">100% PASS RATE IN THIS SUBJECT</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
