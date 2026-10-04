import { Student } from '../types';
import { computeStudentsWithRanks } from './studentUtils';

export const INITIAL_STUDENTS_RAW = [
  {
    id: "STU001",
    name: "Aarav Sharma",
    class: "10",
    section: "A",
    rollNumber: "1",
    marks: { maths: 95, science: 88, english: 92, social: 85, computer: 98 }
  },
  {
    id: "STU002",
    name: "Diya Patel",
    class: "10",
    section: "A",
    rollNumber: "2",
    marks: { maths: 78, science: 85, english: 80, social: 75, computer: 88 }
  },
  {
    id: "STU003",
    name: "Kabir Singh",
    class: "10",
    section: "B",
    rollNumber: "15",
    marks: { maths: 42, science: 38, english: 55, social: 45, computer: 50 }
  },
  {
    id: "STU004",
    name: "Ananya Iyer",
    class: "10",
    section: "A",
    rollNumber: "3",
    marks: { maths: 98, science: 96, english: 94, social: 90, computer: 99 }
  },
  {
    id: "STU005",
    name: "Rohan Verma",
    class: "10",
    section: "B",
    rollNumber: "22",
    marks: { maths: 32, science: 45, english: 50, social: 40, computer: 48 } // Fails maths -> fail status
  },
  {
    id: "STU006",
    name: "Meera Nair",
    class: "10",
    section: "B",
    rollNumber: "10",
    marks: { maths: 88, science: 82, english: 85, social: 87, computer: 91 }
  },
  {
    id: "STU007",
    name: "Aditya Rao",
    class: "10",
    section: "A",
    rollNumber: "4",
    marks: { maths: 62, science: 58, english: 65, social: 60, computer: 70 }
  }
];

export const getInitialStudents = (): Student[] => {
  return computeStudentsWithRanks(INITIAL_STUDENTS_RAW);
};
