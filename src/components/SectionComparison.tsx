import React from 'react';
import { Student } from '../types';
import { getSectionAnalysis, SectionAnalysis } from '../utils/analyticsUtils';
import { Columns, Award, CheckCircle2, TrendingUp, HelpCircle, Flame, Target } from 'lucide-react';

interface SectionComparisonProps {
  students: Student[];
}

export default function SectionComparison({ students }: SectionComparisonProps) {
  const sectionStats = getSectionAnalysis(students);

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-slate-400" id="section-compare-empty">
        <Columns className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
        <p className="text-sm font-medium">No registered student records available to analyze sections.</p>
      </div>
    );
  }

  // Find overall highest performing section
  const topSection = sectionStats[0] || null;

  return (
    <div className="space-y-6" id="section-comparison-panel">
      
      {/* Summary Cards */}
      {topSection && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="section-hero-grid">
          {/* Best Section Hero */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50/50 border border-indigo-100 rounded-xl p-5 flex items-start gap-4 shadow-sm" id="best-section-hero">
            <div className="p-3 rounded-xl bg-indigo-100 text-indigo-700 flex-shrink-0">
              <Award className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest bg-white px-2.5 py-0.5 rounded-full border border-indigo-100">Leader Section</span>
              <h4 className="text-lg font-black text-slate-800 font-display">Class {topSection.section}</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Highest academic performance registered. Average score is <span className="font-bold text-slate-700">{topSection.averageTotal}</span> with an outstanding <span className="font-bold text-indigo-700">{topSection.passRate}% pass rate</span>.
              </p>
            </div>
          </div>

          {/* Section comparison callout */}
          <div className="bg-white rounded-xl border border-slate-100 p-5 flex items-start gap-4 shadow-sm" id="section-analytics-info">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex-shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">Comparison Index</span>
              <h4 className="text-lg font-black text-slate-800 font-display">Section Performance Tracker</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Sections are evaluated dynamically based on individual subject calculations, enrollment, passing ratios, and maximum topper index bounds.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" id="sections-grid">
        {sectionStats.map((stat, idx) => {
          const passColor = stat.passRate >= 80 ? 'text-green-600' : stat.passRate >= 60 ? 'text-amber-600' : 'text-rose-600';
          return (
            <div
              key={stat.section}
              className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              id={`section-stat-card-${stat.section}`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-slate-50 pb-3 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 font-display">Class-Sec {stat.section}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">Enrolled: {stat.count} {stat.count === 1 ? 'Student' : 'Students'}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${idx === 0 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                    {idx === 0 ? '👑 Ranked #1' : `Ranked #${idx + 1}`}
                  </span>
                </div>

                {/* Performance stats bar */}
                <div className="space-y-4">
                  {/* Avg Percentage */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Average Score</span>
                      <span className="font-bold text-slate-800 font-mono">{stat.averagePercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${stat.averagePercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Pass Rate progress bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>Pass Ratio</span>
                      <span className={`font-bold font-mono ${passColor}`}>{stat.passRate}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${stat.passRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Detailed Numbers */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 bg-slate-50/60 rounded-xl border border-slate-100/30 text-center">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Passed</span>
                      <span className="text-sm font-bold font-mono text-green-600">{stat.passCount}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Failed</span>
                      <span className="text-sm font-bold font-mono text-rose-500">{stat.failCount}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Average Total</span>
                      <span className="text-sm font-bold font-mono text-slate-700">{Math.round(stat.averageTotal)}</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Section Topper Footer */}
              <div className="mt-5 pt-3 border-t border-slate-50 text-xs flex items-center justify-between" id={`section-topper-${stat.section}`}>
                <span className="text-slate-400 font-medium">Section Topper:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 font-display">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  {stat.topperName} <span className="font-mono text-[10px] text-slate-400 font-semibold">({stat.topperScore})</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
