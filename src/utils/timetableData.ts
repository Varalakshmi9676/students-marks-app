import { ClassTimetable, DaySchedule, TimetableSlot } from '../types';

export const TIMETABLE_PERIODS = [
  { id: 1, name: 'Period 1', time: '09:00 AM - 10:00 AM' },
  { id: 2, name: 'Period 2', time: '10:00 AM - 11:00 AM' },
  { id: 3, name: 'Period 3', time: '11:15 AM - 12:15 PM' },
  { id: 4, name: 'Period 4', time: '12:15 PM - 01:15 PM' },
  { id: 5, name: 'Period 5', time: '02:00 PM - 03:00 PM' },
  { id: 6, name: 'Period 6', time: '03:00 PM - 04:00 PM' },
];

export const TIMETABLE_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const SUBJECT_OPTIONS = [
  { value: 'Mathematics', label: 'Mathematics (Maths)' },
  { value: 'Science', label: 'Science' },
  { value: 'English', label: 'English' },
  { value: 'Social Studies', label: 'Social Studies' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Library', label: 'Library' },
  { value: 'Sports', label: 'Sports & Games' },
  { value: 'Free Period', label: 'Free Period' },
];

export const TEACHER_OPTIONS = [
  { value: 'Mrs. Watson', label: 'Mrs. Watson (Maths)' },
  { value: 'Mr. Roy', label: 'Mr. Roy (Maths)' },
  { value: 'Dr. Smith', label: 'Dr. Smith (Science)' },
  { value: 'Mrs. Davis', label: 'Mrs. Davis (Science)' },
  { value: 'Miss Green', label: 'Miss Green (English)' },
  { value: 'Mr. Alan', label: 'Mr. Alan (English)' },
  { value: 'Mr. Brooks', label: 'Mr. Brooks (Social)' },
  { value: 'Miss Clara', label: 'Miss Clara (Social)' },
  { value: 'Prof. Charles', label: 'Prof. Charles (Computer)' },
  { value: 'Miss Lovelace', label: 'Miss Lovelace (Computer)' },
  { value: 'Coach Johnson', label: 'Coach Johnson (Sports)' },
  { value: 'Self-Study', label: 'Self-Study' },
];

const DEFAULT_SLOT: TimetableSlot = {
  subject: 'Free Period',
  teacher: 'Self-Study',
  room: 'Room 101',
};

// Generates an empty timetable skeleton for any class/section
export const generateEmptyTimetable = (className: string, section: string): ClassTimetable => {
  return {
    class: className,
    section: section,
    weekSchedule: TIMETABLE_DAYS.map(day => ({
      day,
      slots: Array(6).fill(null).map((_, idx) => ({
        subject: idx % 2 === 0 ? 'Mathematics' : 'Science',
        teacher: idx % 2 === 0 ? 'Mrs. Watson' : 'Dr. Smith',
        room: `Room ${className}${section}-${101 + idx}`,
      })),
    })),
  };
};

// Beautiful default timetable for Class 10 Section A
const DEFAULT_10A_TIMETABLE: ClassTimetable = {
  class: '10',
  section: 'A',
  weekSchedule: [
    {
      day: 'Monday',
      slots: [
        { subject: 'Mathematics', teacher: 'Mrs. Watson', room: 'Room 101' },
        { subject: 'Science', teacher: 'Dr. Smith', room: 'Lab B' },
        { subject: 'English', teacher: 'Miss Green', room: 'Room 101' },
        { subject: 'Social Studies', teacher: 'Mr. Brooks', room: 'Room 101' },
        { subject: 'Computer Science', teacher: 'Prof. Charles', room: 'Lab A' },
        { subject: 'Library', teacher: 'Mrs. Watson', room: 'Library Hall' },
      ]
    },
    {
      day: 'Tuesday',
      slots: [
        { subject: 'Science', teacher: 'Dr. Smith', room: 'Lab B' },
        { subject: 'Mathematics', teacher: 'Mrs. Watson', room: 'Room 101' },
        { subject: 'English', teacher: 'Miss Green', room: 'Room 101' },
        { subject: 'Computer Science', teacher: 'Prof. Charles', room: 'Lab A' },
        { subject: 'Sports', teacher: 'Coach Johnson', room: 'Playground' },
        { subject: 'Social Studies', teacher: 'Mr. Brooks', room: 'Room 101' },
      ]
    },
    {
      day: 'Wednesday',
      slots: [
        { subject: 'English', teacher: 'Miss Green', room: 'Room 101' },
        { subject: 'Social Studies', teacher: 'Mr. Brooks', room: 'Room 101' },
        { subject: 'Mathematics', teacher: 'Mrs. Watson', room: 'Room 101' },
        { subject: 'Science', teacher: 'Dr. Smith', room: 'Lab B' },
        { subject: 'Library', teacher: 'Mrs. Watson', room: 'Library Hall' },
        { subject: 'Computer Science', teacher: 'Prof. Charles', room: 'Lab A' },
      ]
    },
    {
      day: 'Thursday',
      slots: [
        { subject: 'Computer Science', teacher: 'Prof. Charles', room: 'Lab A' },
        { subject: 'Science', teacher: 'Dr. Smith', room: 'Lab B' },
        { subject: 'Social Studies', teacher: 'Mr. Brooks', room: 'Room 101' },
        { subject: 'Mathematics', teacher: 'Mrs. Watson', room: 'Room 101' },
        { subject: 'English', teacher: 'Miss Green', room: 'Room 101' },
        { subject: 'Sports', teacher: 'Coach Johnson', room: 'Playground' },
      ]
    },
    {
      day: 'Friday',
      slots: [
        { subject: 'Mathematics', teacher: 'Mrs. Watson', room: 'Room 101' },
        { subject: 'Science', teacher: 'Dr. Smith', room: 'Lab B' },
        { subject: 'English', teacher: 'Miss Green', room: 'Room 101' },
        { subject: 'Social Studies', teacher: 'Mr. Brooks', room: 'Room 101' },
        { subject: 'Free Period', teacher: 'Self-Study', room: 'Room 101' },
        { subject: 'Computer Science', teacher: 'Prof. Charles', room: 'Lab A' },
      ]
    }
  ]
};

// Beautiful default timetable for Class 10 Section B
const DEFAULT_10B_TIMETABLE: ClassTimetable = {
  class: '10',
  section: 'B',
  weekSchedule: [
    {
      day: 'Monday',
      slots: [
        { subject: 'Science', teacher: 'Mrs. Davis', room: 'Lab B' },
        { subject: 'Mathematics', teacher: 'Mr. Roy', room: 'Room 102' },
        { subject: 'Social Studies', teacher: 'Miss Clara', room: 'Room 102' },
        { subject: 'English', teacher: 'Mr. Alan', room: 'Room 102' },
        { subject: 'Library', teacher: 'Mr. Alan', room: 'Library Hall' },
        { subject: 'Computer Science', teacher: 'Miss Lovelace', room: 'Lab A' },
      ]
    },
    {
      day: 'Tuesday',
      slots: [
        { subject: 'Mathematics', teacher: 'Mr. Roy', room: 'Room 102' },
        { subject: 'Science', teacher: 'Mrs. Davis', room: 'Lab B' },
        { subject: 'English', teacher: 'Mr. Alan', room: 'Room 102' },
        { subject: 'Sports', teacher: 'Coach Johnson', room: 'Playground' },
        { subject: 'Computer Science', teacher: 'Miss Lovelace', room: 'Lab A' },
        { subject: 'Social Studies', teacher: 'Miss Clara', room: 'Room 102' },
      ]
    },
    {
      day: 'Wednesday',
      slots: [
        { subject: 'Social Studies', teacher: 'Miss Clara', room: 'Room 102' },
        { subject: 'English', teacher: 'Mr. Alan', room: 'Room 102' },
        { subject: 'Science', teacher: 'Mrs. Davis', room: 'Lab B' },
        { subject: 'Mathematics', teacher: 'Mr. Roy', room: 'Room 102' },
        { subject: 'Computer Science', teacher: 'Miss Lovelace', room: 'Lab A' },
        { subject: 'Library', teacher: 'Mr. Alan', room: 'Library Hall' },
      ]
    },
    {
      day: 'Thursday',
      slots: [
        { subject: 'Science', teacher: 'Mrs. Davis', room: 'Lab B' },
        { subject: 'Mathematics', teacher: 'Mr. Roy', room: 'Room 102' },
        { subject: 'English', teacher: 'Mr. Alan', room: 'Room 102' },
        { subject: 'Social Studies', teacher: 'Miss Clara', room: 'Room 102' },
        { subject: 'Sports', teacher: 'Coach Johnson', room: 'Playground' },
        { subject: 'Free Period', teacher: 'Self-Study', room: 'Room 102' },
      ]
    },
    {
      day: 'Friday',
      slots: [
        { subject: 'Computer Science', teacher: 'Miss Lovelace', room: 'Lab A' },
        { subject: 'Mathematics', teacher: 'Mr. Roy', room: 'Room 102' },
        { subject: 'Science', teacher: 'Mrs. Davis', room: 'Lab B' },
        { subject: 'Social Studies', teacher: 'Miss Clara', room: 'Room 102' },
        { subject: 'English', teacher: 'Mr. Alan', room: 'Room 102' },
        { subject: 'Free Period', teacher: 'Self-Study', room: 'Room 102' },
      ]
    }
  ]
};

const TIMETABLES_STORAGE_KEY = 'student_marks_app_timetables';

export const loadTimetables = (): ClassTimetable[] => {
  const saved = localStorage.getItem(TIMETABLES_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load timetables from localStorage, falling back to defaults', e);
    }
  }
  
  // Set defaults and save
  const defaultList = [DEFAULT_10A_TIMETABLE, DEFAULT_10B_TIMETABLE];
  localStorage.setItem(TIMETABLES_STORAGE_KEY, JSON.stringify(defaultList));
  return defaultList;
};

export const saveTimetable = (timetable: ClassTimetable): ClassTimetable[] => {
  const currentList = loadTimetables();
  const idx = currentList.findIndex(t => t.class === timetable.class && t.section === timetable.section);
  
  if (idx > -1) {
    currentList[idx] = timetable;
  } else {
    currentList.push(timetable);
  }
  
  localStorage.setItem(TIMETABLES_STORAGE_KEY, JSON.stringify(currentList));
  return currentList;
};

export const findOrCreateTimetable = (className: string, section: string): ClassTimetable => {
  const currentList = loadTimetables();
  const found = currentList.find(t => t.class === className && t.section === section);
  if (found) return found;
  
  // Create dynamic and save
  const newTimetable = generateEmptyTimetable(className, section);
  saveTimetable(newTimetable);
  return newTimetable;
};
