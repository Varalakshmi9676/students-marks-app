import { Student, ClassAnalysis, SubjectStats } from '../types';
import { SUBJECTS, getSubjectStats, analyzeClass } from '../utils/studentUtils';
import { Award, Users, GraduationCap, Percent, TrendingUp, TrendingDown, BookOpen, BarChart3, Star } from 'lucide-react';

interface DashboardStatsProps {
  students: Student[];
}

export default function DashboardStats({ students }: DashboardStatsProps) {
  const analysis: ClassAnalysis = analyzeClass(students);
  const subjectStats: SubjectStats[] = getSubjectStats(students);

  // Find topper(s)
  const toppers = students.filter(s => s.calculations.rank === 1);
  const topper = toppers[0] || null;

  const statCards = [
    {
      id: 'total-students',
      label: 'Total Students',
      value: analysis.totalStudents,
      subtext: `${analysis.passedStudents} Passed • ${analysis.failedStudents} Failed`,
      icon: Users,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      id: 'class-average',
      label: 'Class Average',
      value: `${analysis.classAverage} / 500`,
      subtext: `Avg Percentage: ${analysis.averagePercentage}%`,
      icon: GraduationCap,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      id: 'pass-rate',
      label: 'Pass Percentage',
      value: `${analysis.passPercentage}%`,
      subtext: students.length > 0 ? `Passing threshold: 35% per subject` : 'No data available',
      icon: Percent,
      color: analysis.passPercentage >= 75 ? 'text-green-600 bg-green-50 border-green-100' : 'text-amber-600 bg-amber-50 border-amber-100',
    },
  ];

  const gradeColors: Record<string, string> = {
    'A+': 'bg-green-600',
    'A': 'bg-emerald-500',
    'B': 'bg-teal-500',
    'C': 'bg-sky-500',
    'D': 'bg-amber-500',
    'F': 'bg-rose-500',
  };

  return (
    <div className="space-y-6" id="dashboard-stats-container">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5" id="stats-overview-grid">
        {statCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              id={`stat-card-${card.id}`}
              className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex items-start justify-between transition-all duration-200 hover:shadow-md"
            >
              <div className="space-y-1">
                <span className="text-sm font-medium text-slate-500">{card.label}</span>
                <h3 className="text-2xl font-bold font-display text-slate-800">{card.value}</h3>
                <p className="text-xs text-slate-400 font-medium">{card.subtext}</p>
              </div>
              <div className={`p-3 rounded-xl border ${card.color}`}>
                <IconComponent className="w-5 h-5" />
              </div>
            </div>
          );
        })}

        {/* New Subject Averages Metric Card */}
        <div
          id="stat-card-subject-averages"
          className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-md"
        >
          <div className="space-y-2.5 w-full">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <span className="text-sm font-medium text-slate-500">Subject Averages</span>
                <h3 className="text-base font-bold text-slate-800 font-display">Class Performance</h3>
              </div>
              <div className="p-3 rounded-xl border text-indigo-600 bg-indigo-50 border-indigo-100 flex-shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            
            {students.length > 0 ? (
              <div className="space-y-1.5 pt-1" id="overview-subject-averages-list">
                {subjectStats.map((stat) => (
                  <div key={stat.subject} className="flex items-center justify-between text-[11px] font-semibold" id={`overview-avg-${stat.subject.toLowerCase()}`}>
                    <span className="text-slate-600 font-medium">{stat.subject}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-600 font-bold">{stat.average}%</span>
                      <div className="w-12 bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${stat.average}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium py-2">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="analysis-main-grid">
        
        {/* Class Topper Card */}
        <div id="class-topper-card" className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          {/* Subtle decorative background glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 bg-amber-100 rounded-full opacity-30 blur-xl group-hover:scale-110 transition-transform duration-500"></div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h4 className="font-semibold text-slate-800">Class Topper</h4>
              </div>
              {topper && (
                <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Rank #1
                </span>
              )}
            </div>

            {topper ? (
              <div className="space-y-3" id="topper-info-box">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 font-display">{topper.name}</h3>
                  <p className="text-xs text-slate-500">Student ID: <span className="font-mono font-semibold">{topper.id}</span></p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                  <div>
                    <span className="text-xs text-slate-400 block">Total Marks</span>
                    <span className="text-base font-bold font-mono text-slate-800">{topper.calculations.total} <span className="text-xs text-slate-400">/ 500</span></span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Percentage</span>
                    <span className="text-base font-bold font-mono text-slate-800">{topper.calculations.percentage}%</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Class & Sec</span>
                    <span className="text-sm font-semibold text-slate-700">{topper.class} - {topper.section}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Roll Number</span>
                    <span className="text-sm font-semibold text-slate-700">#{topper.rollNumber}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 flex flex-col items-center justify-center h-full">
                <Star className="w-8 h-8 text-slate-200 mb-2 stroke-[1.5]" />
                <p className="text-sm">No student records to compute topper.</p>
              </div>
            )}
          </div>

          {topper && (
            <div className="mt-4 pt-3 border-t border-slate-50 text-xs text-slate-400 flex justify-between" id="topper-footer">
              <span>Grade: <span className="font-bold text-emerald-600 font-mono">{topper.calculations.grade}</span></span>
              <span>Status: <span className="font-semibold text-emerald-600">{topper.calculations.result}</span></span>
            </div>
          )}
        </div>

        {/* Grade Distribution & Quick Analysis */}
        <div id="grade-distribution-card" className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              <h4 className="font-semibold text-slate-800">Grade Distribution</h4>
            </div>

            {students.length > 0 ? (
              <div className="space-y-3" id="grade-bars-list">
                {Object.entries(analysis.gradeDistribution).map(([grade, count]) => {
                  const percentage = analysis.totalStudents > 0 
                    ? (count / analysis.totalStudents) * 100 
                    : 0;
                  return (
                    <div key={grade} className="space-y-1" id={`grade-bar-${grade}`}>
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-600 font-mono font-bold w-6">{grade}</span>
                        <span className="text-slate-400">{count} {count === 1 ? 'student' : 'students'}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${gradeColors[grade] || 'bg-slate-400'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 flex flex-col items-center justify-center h-full">
                <BarChart3 className="w-8 h-8 text-slate-200 mb-2 stroke-[1.5]" />
                <p className="text-sm">No student records to display distribution.</p>
              </div>
            )}
          </div>
        </div>

        {/* Subject-wise Highlights */}
        <div id="subject-highlights-card" className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-sky-500" />
              <h4 className="font-semibold text-slate-800">Subject Performance</h4>
            </div>

            {students.length > 0 ? (
              <div className="space-y-4" id="subject-highlights-container">
                <div className="flex items-start gap-3 p-3 bg-green-50/60 rounded-xl border border-green-100/40">
                  <div className="p-2 rounded-lg bg-green-100 text-green-700">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Highest Scoring Subject</span>
                    <h5 className="font-bold text-slate-800 text-sm font-display">
                      {analysis.highestScoringSubject?.name}
                    </h5>
                    <p className="text-xs text-slate-500 font-mono">
                      Average: {analysis.highestScoringSubject?.average}%
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-rose-50/60 rounded-xl border border-rose-100/40">
                  <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium">Needs Improvement</span>
                    <h5 className="font-bold text-slate-800 text-sm font-display">
                      {analysis.lowestScoringSubject?.name}
                    </h5>
                    <p className="text-xs text-slate-500 font-mono">
                      Average: {analysis.lowestScoringSubject?.average}%
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 flex flex-col items-center justify-center h-full">
                <BookOpen className="w-8 h-8 text-slate-200 mb-2 stroke-[1.5]" />
                <p className="text-sm">Add students to view subject performance.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Subject-Wise Detailed Table */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow" id="subject-detailed-stats-section">
        <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-slate-500" /> Subject-wise Metrics
        </h4>
        <div className="overflow-x-auto" id="subject-stats-table-wrapper">
          <table className="w-full text-left text-sm border-collapse" id="subject-stats-table">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-medium">
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500">Subject</th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-green-600">Highest Marks</th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-rose-600">Lowest Marks</th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-700">Average Marks</th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-400 w-1/3">Visual Average</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700">
              {subjectStats.map((stat) => (
                <tr key={stat.subject} className="hover:bg-slate-50/50 transition-colors" id={`row-${stat.subject.toLowerCase()}`}>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 font-display">{stat.subject}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-green-600 text-sm">{students.length > 0 ? stat.highest : '-'}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-rose-500 text-sm">{students.length > 0 ? stat.lowest : '-'}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800 text-sm">{students.length > 0 ? stat.average : '-'}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${students.length > 0 ? stat.average : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-mono text-slate-400 w-8">{students.length > 0 ? `${stat.average}%` : '-'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
