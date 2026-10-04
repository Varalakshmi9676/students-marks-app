export interface SubjectMarks {
  maths: number;
  science: number;
  english: number;
  social: number;
  computer: number;
}

export interface StudentCalculations {
  total: number;
  percentage: number;
  grade: string;
  result: 'Pass' | 'Fail';
  rank: number;
}

export interface Student {
  id: string; // Student ID
  name: string;
  class: string;
  section: string;
  rollNumber: string;
  marks: SubjectMarks;
  calculations: StudentCalculations;
  password?: string; // Optional password for separate login
  attendedClasses?: boolean; // Defaults to true
  attendedExams?: boolean; // Defaults to true
  absentSubjects?: string[]; // Array of subject keys where student was absent
}

export interface SubjectStats {
  subject: string;
  highest: number;
  lowest: number;
  average: number;
}

export interface ClassAnalysis {
  classAverage: number;
  averagePercentage: number;
  highestScoringSubject: { name: string; average: number } | null;
  lowestScoringSubject: { name: string; average: number } | null;
  passPercentage: number;
  totalStudents: number;
  passedStudents: number;
  failedStudents: number;
  gradeDistribution: {
    'A+': number;
    'A': number;
    'B': number;
    'C': number;
    'D': number;
    'F': number;
  };
}

export interface TimetableSlot {
  subject: string;
  teacher: string;
  room: string;
}

export interface DaySchedule {
  day: string; // 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
  slots: TimetableSlot[]; // Usually 6 slots corresponding to the 6 periods
}

export interface ClassTimetable {
  class: string;
  section: string;
  weekSchedule: DaySchedule[];
}

