import React, { useState, useEffect, useRef } from 'react';
import { Student, SubjectMarks } from './types';
import { computeStudentsWithRanks, exportToCSV, parseCSV } from './utils/studentUtils';
import { getInitialStudents } from './utils/initialData';
import { generateRandomStudent } from './utils/analyticsUtils';
import DashboardStats from './components/DashboardStats';
import StudentForm from './components/StudentForm';
import StudentTable from './components/StudentTable';
import ReportCardModal from './components/ReportCardModal';
import ConfirmModal from './components/ConfirmModal';
import SectionComparison from './components/SectionComparison';
import RiskAlertCenter from './components/RiskAlertCenter';
import SubjectFocusAnalytics from './components/SubjectFocusAnalytics';
import LoginScreen from './components/LoginScreen';
import StudentDashboard from './components/StudentDashboard';
import StaffTimetable from './components/StaffTimetable';
import {
  GraduationCap,
  Upload,
  Download,
  Database,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  FileJson,
  Check,
  X,
  Plus,
  LayoutDashboard,
  Users,
  BookOpen,
  Columns,
  ShieldAlert,
  Wand2,
  Sparkles,
  LogOut,
  Calendar
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'student_marks_app_records';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedReportCardStudent, setSelectedReportCardStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'subjects' | 'sections' | 'alerts' | 'timetable'>('overview');
  
  const [auth, setAuth] = useState<{ role: 'staff' | 'student'; studentId?: string } | null>(() => {
    const savedAuth = localStorage.getItem('student_marks_app_auth');
    if (savedAuth) {
      try {
        return JSON.parse(savedAuth);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const handleLogin = (role: 'staff' | 'student', studentId?: string) => {
    const session = { role, studentId };
    localStorage.setItem('student_marks_app_auth', JSON.stringify(session));
    setAuth(session);
    showNotification(`Logged in successfully as ${role === 'staff' ? 'Staff Administrator' : 'Student'}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('student_marks_app_auth');
    setAuth(null);
    setEditingStudent(null);
    showNotification('Signed out from portal successfully.', 'info');
  };

  const handleUpdateStudentPassword = (studentId: string, newPass: string) => {
    const rawList = students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          password: newPass
        };
      }
      return s;
    });
    const recomputed = computeStudentsWithRanks(rawList);
    saveStudents(recomputed);
    showNotification('Your password has been updated securely.', 'success');
  };
  
  // Custom notifications
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
    confirmText?: string;
  } | null>(null);
  
  // Hidden inputs for file uploads
  const csvInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  // Load students from LocalStorage or default to initial data
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure calculations and ranks are perfectly computed
        const recomputed = computeStudentsWithRanks(parsed);
        setStudents(recomputed);
      } catch (e) {
        showNotification('Failed to read database. Restoring defaults.', 'error');
        setStudents(getInitialStudents());
      }
    } else {
      setStudents(getInitialStudents());
    }
  }, []);

  // Save to LocalStorage whenever student list changes
  const saveStudents = (updatedStudents: Student[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedStudents));
    setStudents(updatedStudents);
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
  };

  // Auto-clear notifications after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Core functions
  const handleAddStudent = (studentData: {
    id: string;
    name: string;
    class: string;
    section: string;
    rollNumber: string;
    marks: SubjectMarks;
    password?: string;
    attendedClasses?: boolean;
    attendedExams?: boolean;
    absentSubjects?: string[];
  }): boolean => {
    // Double check unique ID
    if (students.some(s => s.id.toLowerCase() === studentData.id.toLowerCase())) {
      showNotification(`Student ID "${studentData.id}" already exists.`, 'error');
      return false;
    }

    // Combine and compute ranking
    const rawList = students.map(s => ({
      id: s.id,
      name: s.name,
      class: s.class,
      section: s.section,
      rollNumber: s.rollNumber,
      marks: s.marks,
      password: s.password,
      attendedClasses: s.attendedClasses,
      attendedExams: s.attendedExams,
      absentSubjects: s.absentSubjects || []
    }));

    rawList.push({
      id: studentData.id,
      name: studentData.name,
      class: studentData.class,
      section: studentData.section,
      rollNumber: studentData.rollNumber,
      marks: studentData.marks,
      password: studentData.password || undefined,
      attendedClasses: studentData.attendedClasses,
      attendedExams: studentData.attendedExams,
      absentSubjects: studentData.absentSubjects || []
    });
    
    const recomputed = computeStudentsWithRanks(rawList);
    saveStudents(recomputed);
    showNotification(`Student "${studentData.name}" registered successfully!`);
    return true;
  };

  const handleUpdateStudent = (id: string, updatedData: {
    name: string;
    class: string;
    section: string;
    rollNumber: string;
    marks: SubjectMarks;
    password?: string;
    attendedClasses?: boolean;
    attendedExams?: boolean;
    absentSubjects?: string[];
  }) => {
    const rawList = students.map(s => {
      if (s.id === id) {
        return {
          id: s.id,
          name: updatedData.name,
          class: updatedData.class,
          section: updatedData.section,
          rollNumber: updatedData.rollNumber,
          marks: updatedData.marks,
          password: updatedData.password || s.password,
          attendedClasses: updatedData.attendedClasses,
          attendedExams: updatedData.attendedExams,
          absentSubjects: updatedData.absentSubjects || []
        };
      }
      return {
        id: s.id,
        name: s.name,
        class: s.class,
        section: s.section,
        rollNumber: s.rollNumber,
        marks: s.marks,
        password: s.password,
        attendedClasses: s.attendedClasses,
        attendedExams: s.attendedExams,
        absentSubjects: s.absentSubjects || []
      };
    });

    const recomputed = computeStudentsWithRanks(rawList);
    saveStudents(recomputed);
    showNotification(`Student details for "${updatedData.name}" updated successfully.`);
  };

  const handleDeleteStudent = (id: string) => {
    const targetStudent = students.find(s => s.id === id);
    const rawList = students
      .filter(s => s.id !== id)
      .map(s => ({
        id: s.id,
        name: s.name,
        class: s.class,
        section: s.section,
        rollNumber: s.rollNumber,
        marks: s.marks,
        password: s.password,
        attendedClasses: s.attendedClasses,
        attendedExams: s.attendedExams,
        absentSubjects: s.absentSubjects || []
      }));

    const recomputed = computeStudentsWithRanks(rawList);
    saveStudents(recomputed);
    showNotification(`Removed student record "${targetStudent?.name || id}" successfully.`);
    
    // Clear editing if deleted student was active in edit form
    if (editingStudent && editingStudent.id === id) {
      setEditingStudent(null);
    }
  };

  // Reset/Clear Helpers
  const handleResetDefault = () => {
    setConfirmState({
      isOpen: true,
      title: 'Reset Database',
      message: 'Are you sure you want to reset the database to preloaded sample student records? This will override your current data.',
      type: 'info',
      confirmText: 'Reset Database',
      onConfirm: () => {
        const initial = getInitialStudents();
        saveStudents(initial);
        showNotification('Database reset to sample student logs.', 'info');
        setEditingStudent(null);
        setConfirmState(null);
      }
    });
  };

  const handleClearAll = () => {
    setConfirmState({
      isOpen: true,
      title: 'Clear Database',
      message: 'Are you absolutely sure you want to delete ALL student records? This action is permanent and cannot be undone.',
      type: 'danger',
      confirmText: 'Delete All',
      onConfirm: () => {
        saveStudents([]);
        showNotification('All student records deleted successfully.', 'info');
        setEditingStudent(null);
        setConfirmState(null);
      }
    });
  };

  // Generate Random Mock Students
  const handleGenerateMockData = (count: number) => {
    const existingIds = students.map((s) => s.id);
    const newStudentsRaw: any[] = [];
    for (let i = 0; i < count; i++) {
      const randomStu = generateRandomStudent(students.length + i, [...existingIds, ...newStudentsRaw.map(s => s.id)]);
      newStudentsRaw.push(randomStu);
    }
    
    const combinedRaw = [
      ...students.map(s => ({
        id: s.id,
        name: s.name,
        class: s.class,
        section: s.section,
        rollNumber: s.rollNumber,
        marks: s.marks
      })),
      ...newStudentsRaw
    ];

    const recomputed = computeStudentsWithRanks(combinedRaw);
    saveStudents(recomputed);
    showNotification(`Generated ${count} randomized mock student records successfully.`, 'success');
  };

  // Export functions
  const handleExportJSON = () => {
    if (students.length === 0) {
      showNotification('Database is empty. Nothing to export.', 'error');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "students.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification('Exported students database as students.json');
  };

  const handleExportCSV = () => {
    if (students.length === 0) {
      showNotification('Database is empty. Nothing to export.', 'error');
      return;
    }
    const csvContent = exportToCSV(students);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "students_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Exported report spreadsheet as students_report.csv');
  };

  // Import handlers
  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const rawImported = parseCSV(text);
        if (rawImported.length === 0) {
          showNotification('No valid student entries found in the CSV.', 'error');
          return;
        }

        // Filter duplicates, keeping incoming or original based on user decision, 
        // by default let's merge them elegantly (incoming overrides existing IDs)
        const combinedRaw = [...students.map(s => ({
          id: s.id,
          name: s.name,
          class: s.class,
          section: s.section,
          rollNumber: s.rollNumber,
          marks: s.marks
        }))];

        let addedCount = 0;
        let updatedCount = 0;

        rawImported.forEach(imported => {
          const idx = combinedRaw.findIndex(s => s.id.toLowerCase() === imported.id.toLowerCase());
          if (idx > -1) {
            combinedRaw[idx] = imported; // overwrite duplicate ID
            updatedCount++;
          } else {
            combinedRaw.push(imported);
            addedCount++;
          }
        });

        const recomputed = computeStudentsWithRanks(combinedRaw);
        saveStudents(recomputed);
        showNotification(`Successfully imported CSV! Registered: ${addedCount}, Overwritten: ${updatedCount}`);
      } catch (err) {
        showNotification('Invalid CSV format. Check file structure.', 'error');
      }
    };
    reader.readAsText(file);
    if (csvInputRef.current) csvInputRef.current.value = ''; // Reset input
  };

  const handleJSONImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Handle both simple arrays or standard full student objects
        const rawImported = (Array.isArray(parsed) ? parsed : []).map((item: any) => {
          return {
            id: String(item.id || ''),
            name: String(item.name || ''),
            class: String(item.class || ''),
            section: String(item.section || ''),
            rollNumber: String(item.rollNumber || ''),
            marks: {
              maths: Math.max(0, Math.min(100, parseInt(item.marks?.maths ?? item.maths) || 0)),
              science: Math.max(0, Math.min(100, parseInt(item.marks?.science ?? item.science) || 0)),
              english: Math.max(0, Math.min(100, parseInt(item.marks?.english ?? item.english) || 0)),
              social: Math.max(0, Math.min(100, parseInt(item.marks?.social ?? item.social) || 0)),
              computer: Math.max(0, Math.min(100, parseInt(item.marks?.computer ?? item.computer) || 0)),
            }
          };
        }).filter(item => item.id && item.name);

        if (rawImported.length === 0) {
          showNotification('No valid student entries found in the JSON.', 'error');
          return;
        }

        const combinedRaw = [...students.map(s => ({
          id: s.id,
          name: s.name,
          class: s.class,
          section: s.section,
          rollNumber: s.rollNumber,
          marks: s.marks
        }))];

        let addedCount = 0;
        let updatedCount = 0;

        rawImported.forEach(imported => {
          const idx = combinedRaw.findIndex(s => s.id.toLowerCase() === imported.id.toLowerCase());
          if (idx > -1) {
            combinedRaw[idx] = imported;
            updatedCount++;
          } else {
            combinedRaw.push(imported);
            addedCount++;
          }
        });

        const recomputed = computeStudentsWithRanks(combinedRaw);
        saveStudents(recomputed);
        showNotification(`Successfully imported JSON! Registered: ${addedCount}, Overwritten: ${updatedCount}`);
      } catch (err) {
        showNotification('Invalid JSON file format.', 'error');
      }
    };
    reader.readAsText(file);
    if (jsonInputRef.current) jsonInputRef.current.value = ''; // Reset input
  };

  if (!auth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-between">
        <LoginScreen students={students} onLogin={handleLogin} />
        {/* Floating Alerts Container */}
        {notification && (
          <div
            id="toast-notification"
            className={`fixed top-4 right-4 z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-xl animate-slide-in font-medium text-sm transition-all max-w-sm ${
              notification.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-100'
                : notification.type === 'info'
                ? 'bg-blue-50 text-blue-800 border-blue-100'
                : 'bg-green-50 text-green-800 border-green-100'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition-colors"
              id="close-toast-btn"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  if (auth.role === 'student') {
    const activeStudent = students.find(s => s.id === auth.studentId);
    if (!activeStudent) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
          <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 max-w-sm text-center space-y-4">
            <h2 className="text-xl font-bold text-white">Record Not Found</h2>
            <p className="text-xs text-slate-400">Your student record is not available. Please contact administrator.</p>
            <button onClick={handleLogout} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all">Go Back</button>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentDashboard 
          student={activeStudent} 
          allStudents={students}
          onLogout={handleLogout}
          onUpdatePassword={handleUpdateStudentPassword}
        />
        {/* Floating Alerts Container */}
        {notification && (
          <div
            id="toast-notification"
            className={`fixed top-4 right-4 z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-xl animate-slide-in font-medium text-sm transition-all max-w-sm ${
              notification.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-100'
                : notification.type === 'info'
                ? 'bg-blue-50 text-blue-800 border-blue-100'
                : 'bg-green-50 text-green-800 border-green-100'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition-colors"
              id="close-toast-btn"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans antialiased text-slate-800" id="main-layout">
      
      {/* Upper Top Navbar / Hero Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40" id="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Logo & Info */}
          <div className="flex items-center gap-3" id="brand-identity">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-slate-800 flex items-center gap-2">
                Excel Academics Hub
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Student Marks Registry & Analytics Engine
              </p>
            </div>
          </div>

          {/* Header Actions Menu */}
          <div className="flex flex-wrap items-center gap-2.5" id="header-action-menu">
            
            {/* Hidden Input Upload Ref Triggers */}
            <input
              type="file"
              ref={csvInputRef}
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
              id="upload-csv-hidden"
            />
            <input
              type="file"
              ref={jsonInputRef}
              accept=".json"
              onChange={handleJSONImport}
              className="hidden"
              id="upload-json-hidden"
            />

            {/* Import Button Dropdown/Buttons */}
            <div className="flex items-center bg-slate-50 border border-slate-200/50 rounded-xl p-1 gap-1" id="import-btn-group">
              <button
                onClick={() => csvInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-white text-slate-600 hover:text-slate-800 transition-all"
                title="Import student registry from CSV file"
                id="btn-import-csv"
              >
                <Upload className="w-3.5 h-3.5" /> Import CSV
              </button>
              <button
                onClick={() => jsonInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-white text-slate-600 hover:text-slate-800 transition-all"
                title="Import student records from JSON file"
                id="btn-import-json"
              >
                <FileJson className="w-3.5 h-3.5" /> JSON
              </button>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center bg-slate-50 border border-slate-200/50 rounded-xl p-1 gap-1" id="export-btn-group">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-white text-slate-600 hover:text-slate-800 transition-all"
                title="Export report to CSV file"
                id="btn-export-csv"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-white text-slate-600 hover:text-slate-800 transition-all"
                title="Save database as students.json file"
                id="btn-export-json"
              >
                <Download className="w-3.5 h-3.5" /> Save JSON
              </button>
            </div>

            {/* Reset Defaults / Clear Database */}
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2.5 ml-1" id="db-maintenance-group">
              <button
                onClick={handleResetDefault}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors animate-none"
                title="Reset Database to Sample Students"
                id="btn-reset-db"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearAll}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Clear Database"
                id="btn-clear-db"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Staff Logout Action Block */}
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2.5 ml-1" id="staff-auth-actions">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-rose-150/20"
                title="Log out from Staff Workspace"
                id="btn-staff-logout"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Floating Alerts Container */}
      {notification && (
        <div
          id="toast-notification"
          className={`fixed top-20 right-4 z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-xl animate-slide-in font-medium text-sm transition-all max-w-sm ${
            notification.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-100'
              : notification.type === 'info'
              ? 'bg-blue-50 text-blue-800 border-blue-100'
              : 'bg-green-50 text-green-800 border-green-100'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <Check className="w-4 h-4 text-green-600 flex-shrink-0" />}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition-colors"
            id="close-toast-btn"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Body Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in" id="dashboard-content">
        
        {/* Modern Tab Bar Switcher */}
        <div className="bg-white rounded-xl border border-slate-100 p-2 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4" id="main-tab-switcher">
          <nav className="flex flex-wrap gap-1" aria-label="Main Workspace Sections">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
              id="tab-btn-overview"
            >
              <LayoutDashboard className="w-4 h-4" />
              General Dashboard
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
              id="tab-btn-students"
            >
              <Users className="w-4 h-4" />
              Student Directory
              {students.length > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${activeTab === 'students' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {students.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'subjects'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
              id="tab-btn-subjects"
            >
              <BookOpen className="w-4 h-4" />
              Subject Breakdown
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'sections'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
              id="tab-btn-sections"
            >
              <Columns className="w-4 h-4" />
              Section Metrics
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
              id="tab-btn-alerts"
            >
              <ShieldAlert className="w-4 h-4" />
              At-Risk Alerts
              {students.length > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${activeTab === 'alerts' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-600'}`}>
                  {students.filter(s => s.calculations.result === 'Fail').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('timetable')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'timetable'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
              id="tab-btn-timetable"
            >
              <Calendar className="w-4 h-4" />
              Staff Timetable
            </button>
          </nav>

          {/* Quick Mock Generator integrated in switcher bar */}
          <div className="flex items-center gap-1.5" id="quick-gen-tools">
            <span className="text-[10px] font-bold text-slate-400 font-mono hidden sm:inline uppercase">Populate Simulator:</span>
            <button
              onClick={() => handleGenerateMockData(10)}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg text-[11px] font-semibold border border-slate-200/50 flex items-center gap-1 transition-all cursor-pointer"
              title="Add 10 randomized student logs"
              id="btn-gen-10"
            >
              <Wand2 className="w-3 h-3 text-indigo-500 animate-pulse" /> +10 Students
            </button>
            <button
              onClick={() => handleGenerateMockData(25)}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg text-[11px] font-semibold border border-slate-200/50 flex items-center gap-1 transition-all cursor-pointer"
              title="Add 25 randomized student logs"
              id="btn-gen-25"
            >
              <Sparkles className="w-3 h-3 text-amber-500" /> +25 Students
            </button>
          </div>
        </div>

        {/* Tab Workspace Panels */}
        <div className="transition-all duration-300" id="tab-panels-workspace">
          
          {activeTab === 'overview' && (
            <div className="space-y-6" id="panel-overview">
              <DashboardStats students={students} />
              
              {/* Quick instructions and callouts if no data */}
              {students.length === 0 && (
                <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-6 text-center max-w-xl mx-auto space-y-3" id="no-students-getting-started">
                  <Sparkles className="w-8 h-8 text-indigo-500 mx-auto animate-pulse" />
                  <h3 className="text-lg font-bold text-slate-800 font-display">Database Currently Empty</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    To start testing the advanced grading dashboard, section comparisons, and subject distributions, click <strong>+10 Students</strong> above to instantly populate the database with realistic sample student details!
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'students' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="panel-students-split">
              {/* Form Column */}
              <section className="lg:col-span-1" aria-label="Student Registration Form" id="registration-section">
                <StudentForm
                  onAddStudent={handleAddStudent}
                  onUpdateStudent={handleUpdateStudent}
                  editingStudent={editingStudent}
                  clearEditing={() => setEditingStudent(null)}
                  existingIds={students.map(s => s.id)}
                />
              </section>

              {/* Table Column */}
              <section className="lg:col-span-2" aria-label="Student Registry Directory" id="database-section">
                <StudentTable
                  students={students}
                  onEditStudent={(student) => {
                    setEditingStudent(student);
                    // Scroll smoothly to form
                    document.getElementById('student-form-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  onDeleteStudent={handleDeleteStudent}
                  onViewReportCard={(student) => setSelectedReportCardStudent(student)}
                />
              </section>
            </div>
          )}

          {activeTab === 'subjects' && (
            <section id="panel-subjects" aria-label="Subject Performance Analytics" className="animate-fade-in">
              <SubjectFocusAnalytics students={students} />
            </section>
          )}

          {activeTab === 'sections' && (
            <section id="panel-sections" aria-label="Class Section Comparisons" className="animate-fade-in">
              <SectionComparison students={students} />
            </section>
          )}

          {activeTab === 'alerts' && (
            <section id="panel-alerts" aria-label="Struggling and Borderline Watchlist" className="animate-fade-in">
              <RiskAlertCenter 
                students={students} 
                onViewReportCard={(student) => setSelectedReportCardStudent(student)}
              />
            </section>
          )}

          {activeTab === 'timetable' && (
            <section id="panel-timetable" aria-label="Workload Conflict and Class Timetable Planner" className="animate-fade-in">
              <StaffTimetable students={students} />
            </section>
          )}

        </div>

      </main>

      {/* Footer Branding Info */}
      <footer className="border-t border-slate-100 bg-white py-6 text-center text-xs text-slate-400 font-medium" id="footer">
        <p>© 2026 Excel Academics Hub. All data stored securely in browser local space.</p>
      </footer>

      {/* Report Card Overlay Modal */}
      <ReportCardModal
        student={selectedReportCardStudent}
        onClose={() => setSelectedReportCardStudent(null)}
      />

      {/* Database Maintenance Confirmation Modal */}
      {confirmState && (
        <ConfirmModal
          isOpen={confirmState.isOpen}
          title={confirmState.title}
          message={confirmState.message}
          confirmText={confirmState.confirmText}
          cancelText="Cancel"
          type={confirmState.type}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}

    </div>
  );
}
