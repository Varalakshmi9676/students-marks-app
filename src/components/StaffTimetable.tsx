import React, { useState, useEffect } from 'react';
import { Student, ClassTimetable, TimetableSlot } from '../types';
import { 
  loadTimetables, 
  saveTimetable, 
  findOrCreateTimetable, 
  TIMETABLE_PERIODS, 
  TIMETABLE_DAYS, 
  SUBJECT_OPTIONS, 
  TEACHER_OPTIONS 
} from '../utils/timetableData';
import { Calendar, Clock, User, MapPin, Edit, Check, X, ShieldAlert, Sparkles, LayoutGrid, AlertCircle } from 'lucide-react';

interface StaffTimetableProps {
  students: Student[];
}

export default function StaffTimetable({ students }: StaffTimetableProps) {
  // Extract all unique Class & Section pairings from students database to edit
  const getClassSectionsList = () => {
    const list: { class: string; section: string }[] = [];
    
    // Add default 10-A and 10-B even if no students are registered
    list.push({ class: '10', section: 'A' });
    list.push({ class: '10', section: 'B' });

    students.forEach(student => {
      const exists = list.some(item => item.class === student.class && item.section === student.section);
      if (!exists && student.class && student.section) {
        list.push({ class: student.class, section: student.section });
      }
    });

    return list.sort((a, b) => {
      if (a.class !== b.class) return a.class.localeCompare(b.class);
      return a.section.localeCompare(b.section);
    });
  };

  const classSections = getClassSectionsList();
  
  // Selected Class/Section state
  const [selectedClass, setSelectedClass] = useState<string>('10');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  
  // Sub-tabs: 'class' (Class timetable) vs 'workload' (Teacher workload)
  const [subTab, setSubTab] = useState<'class' | 'workload'>('class');

  const [timetables, setTimetables] = useState<ClassTimetable[]>([]);
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  
  // Edit form buffer
  const [editSubject, setEditSubject] = useState<string>('');
  const [editTeacher, setEditTeacher] = useState<string>('');
  const [editRoom, setEditRoom] = useState<string>('');

  // Notifications
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    // Initial load
    setTimetables(loadTimetables());
  }, []);

  // Sync state helper
  const handleReload = () => {
    setTimetables(loadTimetables());
  };

  // Get active editing class timetable
  const activeTimetable = findOrCreateTimetable(selectedClass, selectedSection);
  const activeDaySchedule = activeTimetable.weekSchedule.find(d => d.day === selectedDay);

  const startEditing = (idx: number, slot: TimetableSlot) => {
    setEditingSlotIndex(idx);
    setEditSubject(slot.subject);
    setEditTeacher(slot.teacher);
    setEditRoom(slot.room);
  };

  const cancelEditing = () => {
    setEditingSlotIndex(null);
  };

  const saveSlot = (indexToUpdate: number) => {
    if (!editSubject || !editTeacher) return;

    const updatedWeekSchedule = activeTimetable.weekSchedule.map(daySch => {
      if (daySch.day === selectedDay) {
        const updatedSlots = daySch.slots.map((slot, idx) => {
          if (idx === indexToUpdate) {
            return {
              subject: editSubject,
              teacher: editTeacher,
              room: editRoom.trim() || 'Room 101',
            };
          }
          return slot;
        });
        return { ...daySch, slots: updatedSlots };
      }
      return daySch;
    });

    const updatedTimetable: ClassTimetable = {
      ...activeTimetable,
      weekSchedule: updatedWeekSchedule,
    };

    const newList = saveTimetable(updatedTimetable);
    setTimetables(newList);
    setEditingSlotIndex(null);
    setSuccessMsg(`Period ${indexToUpdate + 1} updated successfully for Class ${selectedClass}-${selectedSection}!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Compile Teacher schedules to inspect conflicts (Double booking)
  // Teacher Conflict analysis across all active timetables
  interface ConflictInfo {
    teacher: string;
    day: string;
    periodId: number;
    classes: string[]; // Classes which are double booked
  }

  const findTeacherConflicts = (): ConflictInfo[] => {
    const conflicts: ConflictInfo[] = [];
    const allTimetables = loadTimetables();

    TIMETABLE_DAYS.forEach(day => {
      TIMETABLE_PERIODS.forEach(period => {
        // Map of: Teacher name -> Array of Class ID ('10-A', '10-B')
        const teacherMap: Record<string, string[]> = {};

        allTimetables.forEach(t => {
          const daySch = t.weekSchedule.find(d => d.day === day);
          if (daySch) {
            const slot = daySch.slots[period.id - 1];
            if (slot && slot.teacher && slot.teacher !== 'Self-Study') {
              if (!teacherMap[slot.teacher]) {
                teacherMap[slot.teacher] = [];
              }
              teacherMap[slot.teacher].push(`${t.class}-${t.section}`);
            }
          }
        });

        // Add conflicts if count > 1
        Object.entries(teacherMap).forEach(([teacher, assignedClasses]) => {
          if (assignedClasses.length > 1) {
            conflicts.push({
              teacher,
              day,
              periodId: period.id,
              classes: assignedClasses,
            });
          }
        });
      });
    });

    return conflicts;
  };

  const conflicts = findTeacherConflicts();

  // Helper to color codes
  const getSubjectColorClasses = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('math')) return 'bg-indigo-50 border-indigo-100 text-indigo-700';
    if (s.includes('science')) return 'bg-emerald-50 border-emerald-100 text-emerald-700';
    if (s.includes('english')) return 'bg-sky-50 border-sky-100 text-sky-700';
    if (s.includes('social')) return 'bg-amber-50 border-amber-100 text-amber-700';
    if (s.includes('computer')) return 'bg-purple-50 border-purple-100 text-purple-700';
    if (s.includes('sport') || s.includes('game')) return 'bg-rose-50 border-rose-100 text-rose-700';
    if (s.includes('library')) return 'bg-teal-50 border-teal-100 text-teal-700';
    return 'bg-slate-50 border-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6" id="staff-timetable-workspace">
      
      {/* Upper Navigation Tabs */}
      <div className="bg-white rounded-xl border border-slate-100 p-2 shadow-sm flex items-center justify-between gap-4" id="timetable-nav-bar">
        <div className="flex gap-1" id="subtabs-selectors">
          <button
            onClick={() => setSubTab('class')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              subTab === 'class'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
            id="subtab-class"
          >
            <Calendar className="w-4 h-4" />
            Class Schedules
          </button>
          <button
            onClick={() => setSubTab('workload')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              subTab === 'workload'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
            id="subtab-workload"
          >
            <LayoutGrid className="w-4 h-4" />
            Workload & Conflict Monitor
            {conflicts.length > 0 && (
              <span className="bg-rose-500 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-full animate-pulse">
                {conflicts.length} Alert
              </span>
            )}
          </button>
        </div>

        {/* Sync Indicator */}
        <div className="text-[10px] text-slate-400 font-bold font-mono tracking-wider flex items-center gap-1.5 pr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
          <span>REAL-TIME PORTAL STORAGE</span>
        </div>
      </div>

      {/* SUCCESS BANNER */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800 font-bold flex items-center gap-2 animate-scale-up" id="timetable-success">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {subTab === 'class' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" id="class-timetable-workspace-panel">
          
          {/* LEFT COLUMN: Controls / Selector */}
          <div className="lg:col-span-1 space-y-4" id="timetable-editor-controls">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">Class Select</h4>
              </div>

              {/* Class/Section Dropdowns */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classroom Target</label>
                  <select
                    value={`${selectedClass}-${selectedSection}`}
                    onChange={(e) => {
                      const [cls, sec] = e.target.value.split('-');
                      setSelectedClass(cls);
                      setSelectedSection(sec);
                      cancelEditing();
                    }}
                    className="w-full bg-slate-50/50 border border-slate-100 focus:border-indigo-400 rounded-lg p-2 text-xs font-bold focus:outline-none"
                    id="select-target-class"
                  >
                    {classSections.map((item) => (
                      <option key={`${item.class}-${item.section}`} value={`${item.class}-${item.section}`}>
                        Class {item.class} - Section {item.section}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Workday</label>
                  <div className="flex flex-col gap-1" id="days-radio-group">
                    {TIMETABLE_DAYS.map((day) => (
                      <button
                        key={day}
                        onClick={() => {
                          setSelectedDay(day);
                          cancelEditing();
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs font-bold transition-all ${
                          selectedDay === day
                            ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600 pl-3'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800 pl-2'
                        }`}
                        id={`btn-control-day-${day.toLowerCase()}`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ALERTS CORNER */}
            {conflicts.length > 0 && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 shadow-sm space-y-2.5" id="timetable-conflicts-notice">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-rose-500 animate-bounce" />
                  <span>Double Booking Alert!</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-normal font-medium">
                  We detected <strong>{conflicts.length} teacher schedule conflicts</strong> in the registry. Tap the workload tab to inspect and resolve overlaps.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Weekly Schedule list with editor fields */}
          <div className="lg:col-span-3 space-y-4" id="timetable-periods-grid">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-800 font-display text-sm">
                    Class {selectedClass}-{selectedSection} &bull; {selectedDay} Period List
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-bold font-mono">
                  6 Hours Total / Day
                </span>
              </div>

              {/* Weekly Schedule list */}
              <div className="space-y-3" id="editor-slots-list">
                {activeDaySchedule?.slots.map((slot, index) => {
                  const periodNum = index + 1;
                  const periodInfo = TIMETABLE_PERIODS.find(p => p.id === periodNum);
                  const isEditing = editingSlotIndex === index;

                  // Find if this current slot has a conflict
                  const isConflictSlot = conflicts.some(c => 
                    c.day === selectedDay && 
                    c.periodId === periodNum && 
                    c.teacher === slot.teacher
                  );

                  return (
                    <div
                      key={periodNum}
                      className={`p-4 rounded-xl border transition-all ${
                        isEditing
                          ? 'bg-slate-50 border-slate-300 ring-2 ring-indigo-100'
                          : isConflictSlot
                          ? 'bg-rose-50/30 border-rose-200'
                          : 'bg-white hover:bg-slate-50/20 border-slate-100'
                      }`}
                      id={`row-period-edit-${periodNum}`}
                    >
                      {isEditing ? (
                        /* EDITING VIEW MODE */
                        <div className="space-y-4" id="inline-slot-editor">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                            <span className="text-xs font-black text-indigo-600 font-mono">EDIT PERIOD {periodNum} ({periodInfo?.time})</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => saveSlot(index)}
                                className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                                id="btn-save-slot"
                              >
                                <Check className="w-3.5 h-3.5" /> Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                                id="btn-cancel-slot"
                              >
                                <X className="w-3.5 h-3.5" /> Cancel
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3" id="edit-fields-grid">
                            {/* Subject Select */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Subject</label>
                              <select
                                value={editSubject}
                                onChange={(e) => setEditSubject(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none"
                              >
                                {SUBJECT_OPTIONS.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </div>

                            {/* Teacher Select */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Teacher</label>
                              <select
                                value={editTeacher}
                                onChange={(e) => setEditTeacher(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none"
                              >
                                {TEACHER_OPTIONS.map(opt => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            </div>

                            {/* Room Text input */}
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Room Number</label>
                              <input
                                type="text"
                                placeholder="e.g. Room 101"
                                value={editRoom}
                                onChange={(e) => setEditRoom(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-none font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* STANDARD DISPLAY MODE */
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          
                          {/* Period Title / Timing */}
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-150 flex flex-col items-center justify-center font-mono font-black flex-shrink-0 text-slate-500">
                              <span className="text-[9px] leading-none text-slate-400 uppercase font-bold">P</span>
                              <span className="text-sm leading-none mt-0.5">{periodNum}</span>
                            </div>

                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-bold text-slate-800 text-sm">{slot.subject}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border font-mono ${getSubjectColorClasses(slot.subject)}`}>
                                  Classroom
                                </span>
                                {isConflictSlot && (
                                  <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[8px] font-bold uppercase px-1 rounded flex items-center gap-0.5">
                                    <AlertCircle className="w-2.5 h-2.5 text-rose-500" /> Conflict
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium font-mono">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{periodInfo?.time}</span>
                              </div>
                            </div>
                          </div>

                          {/* Instructor & Location & Edit Action */}
                          <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-50 pt-2 sm:pt-0">
                            <div className="grid grid-cols-2 sm:flex sm:flex-col items-start sm:items-end gap-1" id="slot-details">
                              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span>{slot.teacher}</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono font-bold">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>{slot.room}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => startEditing(index, slot)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit this schedule period details"
                              id={`btn-edit-period-${periodNum}`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* WORKLOAD & DOUBLE BOOKINGS SCANNER VIEW */
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6 animate-fade-in" id="workload-dashboard-panel">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-4">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
                Teacher Workload & Placement Analytics
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Comprehensive tracking of instructor schedules across classrooms to eliminate double bookings
              </p>
            </div>
          </div>

          {/* ACTIVE CONFLICT DETAILS LIST */}
          {conflicts.length > 0 ? (
            <div className="space-y-3" id="active-conflicts-list">
              <div className="flex items-center gap-1.5 text-xs font-black text-rose-500 uppercase tracking-wider pl-1">
                <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>ACTIVE SCHEDULING CONFLICTS ({conflicts.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="conflicts-notices-grid">
                {conflicts.map((conflict, idx) => (
                  <div key={idx} className="bg-rose-50/50 border border-rose-100 rounded-xl p-4 flex gap-3 text-xs" id={`conflict-card-${idx}`}>
                    <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-rose-900">
                        Instructor {conflict.teacher} Overlap
                      </p>
                      <p className="text-slate-600 leading-normal font-medium">
                        Scheduled to teach at <strong>{conflict.day} &bull; Period {conflict.periodId}</strong> in multiple classrooms concurrently:
                      </p>
                      <div className="flex gap-1.5 mt-2 flex-wrap" id="conflict-classes-badge-list">
                        {conflict.classes.map(cls => (
                          <span key={cls} className="bg-rose-500 text-white font-mono font-black text-[9px] uppercase px-1.5 py-0.5 rounded shadow-sm">
                            Class {cls}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex gap-3 text-xs text-green-800" id="no-conflicts-panel">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-green-900">All Schedules Perfect!</h4>
                <p className="mt-0.5 text-green-700 leading-relaxed font-medium">No double-bookings found. Every teacher is uniquely scheduled across all available hours on all days.</p>
              </div>
            </div>
          )}

          {/* MASTER TEACHERS WORKLOAD GRID */}
          <div className="space-y-3" id="master-teachers-grid-wrapper">
            <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider pl-1">Master Workload Schedule By Teacher</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      <th className="py-3 px-4">Instructor Name</th>
                      <th className="py-3 px-4 text-center">Mon</th>
                      <th className="py-3 px-4 text-center">Tue</th>
                      <th className="py-3 px-4 text-center">Wed</th>
                      <th className="py-3 px-4 text-center">Thu</th>
                      <th className="py-3 px-4 text-center">Fri</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {TEACHER_OPTIONS.filter(t => t.value !== 'Self-Study').map(teacherOpt => {
                      const teacherName = teacherOpt.value;

                      // Count periods assigned to this teacher across all class schedules
                      const totalAssignments = loadTimetables().reduce((sum, timetable) => {
                        return sum + timetable.weekSchedule.reduce((daySum, day) => {
                          return daySum + day.slots.filter(s => s.teacher === teacherName).length;
                        }, 0);
                      }, 0);

                      return (
                        <tr key={teacherName} className="hover:bg-slate-50/20">
                          <td className="py-3 px-4 font-bold text-slate-800 font-display">
                            <div>{teacherName}</div>
                            <span className="text-[9px] text-slate-400 font-normal font-mono block mt-0.5">
                              {totalAssignments} Total Slots Assigned / Week
                            </span>
                          </td>
                          {TIMETABLE_DAYS.map(day => {
                            // Find which periods this day the teacher has lessons
                            const assignmentsThisDay: { period: number; classStr: string }[] = [];
                            loadTimetables().forEach(t => {
                              const daySch = t.weekSchedule.find(d => d.day === day);
                              if (daySch) {
                                daySch.slots.forEach((s, idx) => {
                                  if (s.teacher === teacherName) {
                                    assignmentsThisDay.push({ period: idx + 1, classStr: `${t.class}-${t.section}` });
                                  }
                                });
                              }
                            });

                            const hasOverlap = assignmentsThisDay.length > 1;

                            return (
                              <td key={day} className="py-3 px-2 text-center">
                                {assignmentsThisDay.length === 0 ? (
                                  <span className="text-[9px] font-bold text-slate-300 uppercase font-mono">Free</span>
                                ) : (
                                  <div className="flex flex-col gap-1 items-center justify-center">
                                    {assignmentsThisDay.map((assign, aIdx) => (
                                      <span
                                        key={aIdx}
                                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase border ${
                                          hasOverlap
                                            ? 'bg-rose-50 text-rose-600 border-rose-200 font-extrabold animate-pulse'
                                            : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                        }`}
                                      >
                                        P{assign.period} &bull; {assign.classStr}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
