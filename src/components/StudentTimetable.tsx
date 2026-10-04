import React, { useState, useEffect } from 'react';
import { Student, ClassTimetable, TimetableSlot } from '../types';
import { findOrCreateTimetable, TIMETABLE_PERIODS, TIMETABLE_DAYS } from '../utils/timetableData';
import { Calendar, Clock, User, MapPin, Sparkles, BookOpen, GraduationCap, CheckCircle } from 'lucide-react';

interface StudentTimetableProps {
  student: Student;
}

export default function StudentTimetable({ student }: StudentTimetableProps) {
  const [timetable, setTimetable] = useState<ClassTimetable | null>(null);
  
  // Get current day (Monday to Friday) as initial state, defaulting to Monday if weekend
  const getTodayDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayNum = new Date().getDay();
    const dayName = days[todayNum];
    return TIMETABLE_DAYS.includes(dayName) ? dayName : 'Monday';
  };

  const [selectedDay, setSelectedDay] = useState<string>(getTodayDayName);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    // Load student's timetable based on their class and section
    const data = findOrCreateTimetable(student.class, student.section);
    setTimetable(data);

    // Keep current time updated for live period tracking
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [student.class, student.section]);

  // Check if a time period is currently active
  const isPeriodActive = (dayName: string, periodTimeRange: string): boolean => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = days[currentTime.getDay()];
    if (currentDayName !== dayName) return false;

    try {
      const [startStr, endStr] = periodTimeRange.split(' - ');
      
      const parseTime = (timeStr: string) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        const d = new Date(currentTime);
        d.setHours(hours, minutes, 0, 0);
        return d;
      };

      const start = parseTime(startStr);
      const end = parseTime(endStr);
      return currentTime >= start && currentTime <= end;
    } catch (e) {
      return false;
    }
  };

  if (!timetable) return null;

  const activeDaySchedule = timetable.weekSchedule.find(d => d.day === selectedDay);
  const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentTime.getDay()];

  // Helper to style different subjects
  const getSubjectBadgeStyles = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('math')) return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    if (s.includes('science')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (s.includes('english')) return 'bg-sky-50 text-sky-700 border-sky-100';
    if (s.includes('social')) return 'bg-amber-50 text-amber-700 border-amber-100';
    if (s.includes('computer')) return 'bg-purple-50 text-purple-700 border-purple-100';
    if (s.includes('sport') || s.includes('game')) return 'bg-rose-50 text-rose-700 border-rose-100';
    if (s.includes('library')) return 'bg-teal-50 text-teal-700 border-teal-100';
    return 'bg-slate-50 text-slate-700 border-slate-100';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6" id="student-timetable-card">
      
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4" id="timetable-header">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-100">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 font-display flex items-center gap-1.5">
              Class {student.class}-{student.section} Weekly Schedule
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 font-mono">
                Auto-Synced
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Daily time table as assigned by Academic Staff Coordinator
            </p>
          </div>
        </div>

        {/* Calendar Day Pill Selection */}
        <div className="flex items-center gap-1.5" id="timetable-day-selector">
          <span className="text-[10px] font-bold text-slate-400 font-mono hidden lg:inline uppercase">SELECT DAY:</span>
          <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100" id="timetable-day-pill-container">
            {TIMETABLE_DAYS.map((day) => {
              const isToday = todayDayName === day;
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                  }`}
                  id={`btn-day-${day.toLowerCase()}`}
                >
                  {day.slice(0, 3)}
                  {isToday && (
                    <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-600'} ring-1 ring-white animate-pulse`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Period Cards Timeline Container */}
      <div className="space-y-4" id="timetable-slots-wrapper">
        
        {/* Morning / Afternoon headers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* First Half - Morning Sessions */}
          <div className="space-y-3" id="morning-sessions-col">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Forenoon Sessions</span>
            </div>

            {activeDaySchedule?.slots.slice(0, 3).map((slot, index) => {
              const periodNum = index + 1;
              const periodInfo = TIMETABLE_PERIODS.find(p => p.id === periodNum);
              const isActive = periodInfo ? isPeriodActive(selectedDay, periodInfo.time) : false;

              return (
                <div
                  key={periodNum}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden ${
                    isActive
                      ? 'bg-indigo-50/40 border-indigo-200 shadow-md shadow-indigo-100/20 ring-1 ring-indigo-300/30'
                      : 'bg-white hover:bg-slate-50/30 border-slate-100'
                  }`}
                  id={`period-card-${periodNum}`}
                >
                  {/* Left Side: Period Number & Time Range */}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-mono font-black border flex-shrink-0 ${
                      isActive 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                        : 'bg-slate-50 text-slate-500 border-slate-150'
                    }`}>
                      <span className="text-[10px] leading-none uppercase text-current opacity-60">P</span>
                      <span className="text-sm leading-none mt-0.5">{periodNum}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black tracking-tight text-slate-800`}>
                          {slot.subject}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border font-mono ${getSubjectBadgeStyles(slot.subject)}`}>
                          Classroom Course
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{periodInfo?.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Instructor & Room Placement */}
                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-50 pt-2 sm:pt-0 gap-1" id="slot-instructor-placement">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{slot.teacher}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono font-bold">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{slot.room}</span>
                    </div>
                  </div>

                  {/* Live Glowing Badge */}
                  {isActive && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-indigo-600 text-white font-mono font-black text-[8px] uppercase rounded tracking-wider animate-pulse shadow">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                      <span>Live Now</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Recess Break Placement Callout */}
            <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 flex items-center justify-between text-xs text-slate-500 font-semibold" id="recess-break-box">
              <div className="flex items-center gap-2">
                <span className="inline-block px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9px] font-black uppercase">Recess</span>
                <span>Forenoon Short Break</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">11:00 AM - 11:15 AM (15m)</span>
            </div>
          </div>

          {/* Second Half - Afternoon Sessions */}
          <div className="space-y-3" id="afternoon-sessions-col">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
              <span>Afternoon Sessions</span>
            </div>

            {activeDaySchedule?.slots.slice(3, 6).map((slot, index) => {
              const periodNum = index + 4;
              const periodInfo = TIMETABLE_PERIODS.find(p => p.id === periodNum);
              const isActive = periodInfo ? isPeriodActive(selectedDay, periodInfo.time) : false;

              return (
                <div
                  key={periodNum}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden ${
                    isActive
                      ? 'bg-indigo-50/40 border-indigo-200 shadow-md shadow-indigo-100/20 ring-1 ring-indigo-300/30'
                      : 'bg-white hover:bg-slate-50/30 border-slate-100'
                  }`}
                  id={`period-card-${periodNum}`}
                >
                  {/* Left Side: Period Number & Time Range */}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-mono font-black border flex-shrink-0 ${
                      isActive 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                        : 'bg-slate-50 text-slate-500 border-slate-150'
                    }`}>
                      <span className="text-[10px] leading-none uppercase text-current opacity-60">P</span>
                      <span className="text-sm leading-none mt-0.5">{periodNum}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black tracking-tight text-slate-800`}>
                          {slot.subject}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border font-mono ${getSubjectBadgeStyles(slot.subject)}`}>
                          Classroom Course
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{periodInfo?.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Instructor & Room Placement */}
                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-50 pt-2 sm:pt-0 gap-1" id="slot-instructor-placement">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{slot.teacher}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono font-bold">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{slot.room}</span>
                    </div>
                  </div>

                  {/* Live Glowing Badge */}
                  {isActive && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-indigo-600 text-white font-mono font-black text-[8px] uppercase rounded tracking-wider animate-pulse shadow">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                      <span>Live Now</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Lunch Break Placement Callout */}
            <div className="bg-slate-50 border border-slate-200/50 rounded-xl p-3 flex items-center justify-between text-xs text-slate-500 font-semibold" id="lunch-break-box">
              <div className="flex items-center gap-2">
                <span className="inline-block px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[9px] font-black uppercase">Lunch</span>
                <span>Afternoon Meal Interval</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">01:15 PM - 02:00 PM (45m)</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
