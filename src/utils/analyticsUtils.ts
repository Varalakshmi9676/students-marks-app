import { Student, SubjectMarks } from '../types';
import { calculateStudentFields, computeStudentsWithRanks } from './studentUtils';

export interface SectionAnalysis {
  section: string;
  count: number;
  averageTotal: number;
  averagePercentage: number;
  passCount: number;
  failCount: number;
  passRate: number;
  topperName: string;
  topperScore: number;
}

export interface AtRiskStudent {
  student: Student;
  failedSubjects: string[];
  borderlineSubjects: string[]; // subjects scored 35-45
}

// Generate random Indian/International names for student generation
const FIRST_NAMES = [
  'Arjun', 'Vihaan', 'Reyansh', 'Aarav', 'Pranav', 'Aditya', 'Sai', 'Krishna', 'Ishaan', 'Shaurya',
  'Diya', 'Aanya', 'Saanvi', 'Ananya', 'Kiara', 'Myra', 'Zara', 'Meera', 'Riya', 'Ira',
  'Liam', 'Noah', 'Oliver', 'Emma', 'Ava', 'Sophia', 'Isabella', 'Lucas', 'Mia', 'Benjamin'
];

const LAST_NAMES = [
  'Sharma', 'Patel', 'Verma', 'Nair', 'Iyer', 'Rao', 'Singh', 'Gupta', 'Reddy', 'Choudhury',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'
];

const CLASSES = ['10', '11', '12'];
const SECTIONS = ['A', 'B', 'C'];

export function generateRandomStudent(index: number, existingIds: string[]): {
  id: string;
  name: string;
  class: string;
  section: string;
  rollNumber: string;
  marks: SubjectMarks;
} {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const name = `${firstName} ${lastName}`;
  
  let id = `STU${100 + index}`;
  let attempts = 0;
  while (existingIds.includes(id) && attempts < 100) {
    id = `STU${100 + index + attempts}`;
    attempts++;
  }

  const className = CLASSES[Math.floor(Math.random() * CLASSES.length)];
  const section = SECTIONS[Math.floor(Math.random() * SECTIONS.length)];
  const rollNumber = String(Math.floor(Math.random() * 45) + 1);

  // Generate weighted random marks to make the distribution realistic (average around 65-80)
  const getRandomMark = () => {
    const rand = Math.random();
    if (rand < 0.08) return Math.floor(Math.random() * 30) + 10; // Fails occasionally (10-34)
    if (rand < 0.2) return Math.floor(Math.random() * 20) + 35;  // Borderline (35-55)
    if (rand < 0.6) return Math.floor(Math.random() * 25) + 55;  // Average (55-80)
    return Math.floor(Math.random() * 20) + 80;                 // Outstanding (80-100)
  };

  const marks: SubjectMarks = {
    maths: getRandomMark(),
    science: getRandomMark(),
    english: getRandomMark(),
    social: getRandomMark(),
    computer: getRandomMark(),
  };

  return { id, name, class: className, section, rollNumber, marks };
}

export function getSectionAnalysis(students: Student[]): SectionAnalysis[] {
  if (students.length === 0) return [];

  // Group by class-section
  const groups: Record<string, Student[]> = {};
  students.forEach((student) => {
    const key = `${student.class}-${student.section}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(student);
  });

  return Object.entries(groups).map(([sectionKey, list]) => {
    const count = list.length;
    const totals = list.map((s) => s.calculations.total);
    const percentages = list.map((s) => s.calculations.percentage);
    
    const averageTotal = Number((totals.reduce((a, b) => a + b, 0) / count).toFixed(1));
    const averagePercentage = Number((percentages.reduce((a, b) => a + b, 0) / count).toFixed(1));
    
    const passCount = list.filter((s) => s.calculations.result === 'Pass').length;
    const failCount = count - passCount;
    const passRate = Number(((passCount / count) * 100).toFixed(1));

    // Find topper of this specific section
    let topperName = 'N/A';
    let topperScore = 0;
    list.forEach((student) => {
      if (student.calculations.total > topperScore) {
        topperScore = student.calculations.total;
        topperName = student.name;
      }
    });

    return {
      section: sectionKey,
      count,
      averageTotal,
      averagePercentage,
      passCount,
      failCount,
      passRate,
      topperName,
      topperScore,
    };
  }).sort((a, b) => b.averagePercentage - a.averagePercentage);
}

export function getAtRiskStudents(students: Student[], passThreshold: number = 35): AtRiskStudent[] {
  return students.map((student) => {
    const failedSubjects: string[] = [];
    const borderlineSubjects: string[] = [];

    const subjectsList: { key: keyof SubjectMarks; name: string }[] = [
      { key: 'maths', name: 'Mathematics' },
      { key: 'science', name: 'Science' },
      { key: 'english', name: 'English' },
      { key: 'social', name: 'Social' },
      { key: 'computer', name: 'Computer' },
    ];

    subjectsList.forEach((sub) => {
      const score = student.marks[sub.key];
      if (score < passThreshold) {
        failedSubjects.push(sub.name);
      } else if (score >= passThreshold && score < passThreshold + 10) {
        borderlineSubjects.push(sub.name);
      }
    });

    return {
      student,
      failedSubjects,
      borderlineSubjects,
    };
  }).filter((risk) => risk.failedSubjects.length > 0 || risk.borderlineSubjects.length > 0);
}
