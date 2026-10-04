import { Student, SubjectMarks, StudentCalculations, SubjectStats, ClassAnalysis } from '../types';

export const SUBJECTS: { key: keyof SubjectMarks; label: string }[] = [
  { key: 'maths', label: 'Mathematics' },
  { key: 'science', label: 'Science' },
  { key: 'english', label: 'English' },
  { key: 'social', label: 'Social' },
  { key: 'computer', label: 'Computer' },
];

export function calculateStudentFields(marks: SubjectMarks, attendedExams = true, absentSubjects: string[] = []): Omit<StudentCalculations, 'rank'> {
  if (!attendedExams) {
    return {
      total: 0,
      percentage: 0,
      grade: 'F',
      result: 'Fail',
    };
  }

  // If a subject is marked as absent, its mark is 0 for calculations
  const getSubjectMark = (key: keyof SubjectMarks) => {
    if (absentSubjects.includes(key)) {
      return 0;
    }
    return marks[key];
  };

  const mathsMark = getSubjectMark('maths');
  const scienceMark = getSubjectMark('science');
  const englishMark = getSubjectMark('english');
  const socialMark = getSubjectMark('social');
  const computerMark = getSubjectMark('computer');

  const total = mathsMark + scienceMark + englishMark + socialMark + computerMark;
  const percentage = Number((total / 5).toFixed(2));

  let grade = 'F';
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B';
  else if (percentage >= 60) grade = 'C';
  else if (percentage >= 50) grade = 'D';
  else grade = 'F';

  const hasFailedSubject =
    mathsMark < 35 ||
    scienceMark < 35 ||
    englishMark < 35 ||
    socialMark < 35 ||
    computerMark < 35;

  const result: 'Pass' | 'Fail' = hasFailedSubject ? 'Fail' : 'Pass';

  return {
    total,
    percentage,
    grade,
    result,
  };
}

export function computeStudentsWithRanks(
  rawStudents: {
    id: string;
    name: string;
    class: string;
    section: string;
    rollNumber: string;
    marks: SubjectMarks;
    attendedClasses?: boolean;
    attendedExams?: boolean;
    absentSubjects?: string[];
    password?: string;
  }[]
): Student[] {
  if (rawStudents.length === 0) return [];

  // Calculate fields for each student
  const calculated = rawStudents.map((student) => {
    const fields = calculateStudentFields(
      student.marks,
      student.attendedExams !== false,
      student.absentSubjects || []
    );
    return {
      ...student,
      attendedClasses: student.attendedClasses !== false,
      attendedExams: student.attendedExams !== false,
      absentSubjects: student.absentSubjects || [],
      calculations: {
        ...fields,
        rank: 0, // placeholder
      },
    };
  });

  // Sort descending by total marks
  const sorted = [...calculated].sort((a, b) => b.calculations.total - a.calculations.total);

  // Assign ranks with ties handled
  let currentRank = 1;
  let prevTotal = -1;
  const ranked = sorted.map((student, index) => {
    if (index > 0 && student.calculations.total < prevTotal) {
      currentRank = index + 1;
    }
    prevTotal = student.calculations.total;
    return {
      ...student,
      calculations: {
        ...student.calculations,
        rank: currentRank,
      },
    };
  });

  return ranked;
}

export function getSubjectStats(students: Student[]): SubjectStats[] {
  if (students.length === 0) {
    return SUBJECTS.map((sub) => ({
      subject: sub.label,
      highest: 0,
      lowest: 0,
      average: 0,
    }));
  }

  return SUBJECTS.map((sub) => {
    const scores = students.map((s) => {
      const isAbsent = s.attendedExams === false || s.absentSubjects?.includes(sub.key);
      return isAbsent ? 0 : s.marks[sub.key];
    });
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const sum = scores.reduce((acc, curr) => acc + curr, 0);
    const average = Number((sum / students.length).toFixed(1));

    return {
      subject: sub.label,
      highest,
      lowest,
      average,
    };
  });
}

export function analyzeClass(students: Student[]): ClassAnalysis {
  const defaultAnalysis: ClassAnalysis = {
    classAverage: 0,
    averagePercentage: 0,
    highestScoringSubject: null,
    lowestScoringSubject: null,
    passPercentage: 0,
    totalStudents: 0,
    passedStudents: 0,
    failedStudents: 0,
    gradeDistribution: { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 },
  };

  if (students.length === 0) return defaultAnalysis;

  const totalStudents = students.length;
  const totals = students.map((s) => s.calculations.total);
  const percentages = students.map((s) => s.calculations.percentage);

  const classAverage = Number((totals.reduce((a, b) => a + b, 0) / totalStudents).toFixed(1));
  const averagePercentage = Number((percentages.reduce((a, b) => a + b, 0) / totalStudents).toFixed(1));

  const passedStudents = students.filter((s) => s.calculations.result === 'Pass').length;
  const failedStudents = totalStudents - passedStudents;
  const passPercentage = Number(((passedStudents / totalStudents) * 100).toFixed(1));

  const gradeDistribution = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
  students.forEach((s) => {
    const grade = s.calculations.grade as keyof typeof gradeDistribution;
    if (grade in gradeDistribution) {
      gradeDistribution[grade]++;
    }
  });

  // Calculate subject-wise averages to find highest/lowest scoring subjects
  const subjectAverages = SUBJECTS.map((sub) => {
    const sum = students.reduce((acc, s) => {
      const isAbsent = s.attendedExams === false || s.absentSubjects?.includes(sub.key);
      return acc + (isAbsent ? 0 : s.marks[sub.key]);
    }, 0);
    return {
      name: sub.label,
      average: Number((sum / totalStudents).toFixed(1)),
    };
  });

  const sortedSubjects = [...subjectAverages].sort((a, b) => b.average - a.average);
  const highestScoringSubject = sortedSubjects[0] || null;
  const lowestScoringSubject = sortedSubjects[sortedSubjects.length - 1] || null;

  return {
    classAverage,
    averagePercentage,
    highestScoringSubject,
    lowestScoringSubject,
    passPercentage,
    totalStudents,
    passedStudents,
    failedStudents,
    gradeDistribution,
  };
}

export function exportToCSV(students: Student[]): string {
  const headers = [
    'Student ID',
    'Student Name',
    'Class',
    'Section',
    'Roll Number',
    'Mathematics',
    'Science',
    'English',
    'Social',
    'Computer',
    'Total Marks',
    'Percentage',
    'Grade',
    'Result',
    'Rank',
    'Attended Classes',
    'Attended Exams',
  ];

  const rows = students.map((s) => [
    s.id,
    `"${s.name.replace(/"/g, '""')}"`,
    `"${s.class.replace(/"/g, '""')}"`,
    `"${s.section.replace(/"/g, '""')}"`,
    s.rollNumber,
    s.marks.maths,
    s.marks.science,
    s.marks.english,
    s.marks.social,
    s.marks.computer,
    s.calculations.total,
    s.calculations.percentage,
    s.calculations.grade,
    s.calculations.result,
    s.calculations.rank,
    s.attendedClasses !== false ? 'Yes' : 'No',
    s.attendedExams !== false ? 'Yes' : 'No',
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}

export function parseCSV(csvText: string): {
  id: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string;
  marks: SubjectMarks;
  attendedClasses?: boolean;
  attendedExams?: boolean;
}[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length <= 1) return [];

  const students: {
    id: string;
    name: string;
    class: string;
    section: string;
    rollNumber: string;
    marks: SubjectMarks;
    attendedClasses?: boolean;
    attendedExams?: boolean;
  }[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Basic CSV parser that handles double quotes
    const line = lines[i];
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
    if (matches.length < 10) continue;

    const clean = (val: string) => val?.trim().replace(/^"|"$/g, '').replace(/""/g, '"') || '';

    const id = clean(matches[0]);
    const name = clean(matches[1]);
    const className = clean(matches[2]);
    const section = clean(matches[3]);
    const rollNumber = clean(matches[4]);

    const maths = Math.max(0, Math.min(100, parseInt(clean(matches[5])) || 0));
    const science = Math.max(0, Math.min(100, parseInt(clean(matches[6])) || 0));
    const english = Math.max(0, Math.min(100, parseInt(clean(matches[7])) || 0));
    const social = Math.max(0, Math.min(100, parseInt(clean(matches[8])) || 0));
    const computer = Math.max(0, Math.min(100, parseInt(clean(matches[9])) || 0));

    const attClassesVal = matches[15] ? clean(matches[15]) : 'Yes';
    const attExamsVal = matches[16] ? clean(matches[16]) : 'Yes';

    const attendedClasses = attClassesVal.toLowerCase() !== 'no';
    const attendedExams = attExamsVal.toLowerCase() !== 'no';

    if (id && name) {
      students.push({
        id,
        name,
        class: className,
        section,
        rollNumber,
        marks: { maths, science, english, social, computer },
        attendedClasses,
        attendedExams,
      });
    }
  }

  return students;
}
