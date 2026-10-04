import React, { useState, useEffect } from 'react';
import { Student, SubjectMarks } from '../types';
import { UserPlus, CheckCircle, RefreshCw, X, AlertCircle } from 'lucide-react';

interface StudentFormProps {
  onAddStudent: (studentData: {
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
  }) => boolean; // returns true if successful
  onUpdateStudent: (id: string, updatedData: {
    name: string;
    class: string;
    section: string;
    rollNumber: string;
    marks: SubjectMarks;
    password?: string;
    attendedClasses?: boolean;
    attendedExams?: boolean;
    absentSubjects?: string[];
  }) => void;
  editingStudent: Student | null;
  clearEditing: () => void;
  existingIds: string[];
}

export default function StudentForm({
  onAddStudent,
  onUpdateStudent,
  editingStudent,
  clearEditing,
  existingIds,
}: StudentFormProps) {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');
  const [attendedClasses, setAttendedClasses] = useState(true);
  const [attendedExams, setAttendedExams] = useState(true);
  const [absentSubjects, setAbsentSubjects] = useState<string[]>([]);

  // Marks state
  const [maths, setMaths] = useState<string>('');
  const [science, setScience] = useState<string>('');
  const [english, setEnglish] = useState<string>('');
  const [social, setSocial] = useState<string>('');
  const [computer, setComputer] = useState<string>('');

  // Validation & Error states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  // Sync editing student data
  useEffect(() => {
    if (editingStudent) {
      setId(editingStudent.id);
      setName(editingStudent.name);
      setClassName(editingStudent.class);
      setSection(editingStudent.section);
      setRollNumber(editingStudent.rollNumber);
      setMaths(editingStudent.marks.maths.toString());
      setScience(editingStudent.marks.science.toString());
      setEnglish(editingStudent.marks.english.toString());
      setSocial(editingStudent.marks.social.toString());
      setComputer(editingStudent.marks.computer.toString());
      setPassword(editingStudent.password || '');
      setAttendedClasses(editingStudent.attendedClasses !== false);
      setAttendedExams(editingStudent.attendedExams !== false);
      setAbsentSubjects(editingStudent.absentSubjects || []);
      setErrors({});
      setGeneralError('');
    } else {
      resetForm();
    }
  }, [editingStudent]);

  const resetForm = () => {
    setId('');
    setName('');
    setClassName('');
    setSection('');
    setRollNumber('');
    setPassword('');
    setAttendedClasses(true);
    setAttendedExams(true);
    setAbsentSubjects([]);
    setMaths('');
    setScience('');
    setEnglish('');
    setSocial('');
    setComputer('');
    setErrors({});
    setGeneralError('');
  };

  const handleMarkChange = (value: string, setter: (val: string) => void, field: string) => {
    // Only allow empty string or numbers
    if (value === '' || /^\d*$/.test(value)) {
      const num = parseInt(value, 10);
      if (value !== '' && (num < 0 || num > 100)) {
        setErrors(prev => ({ ...prev, [field]: 'Marks must be between 0 and 100' }));
      } else {
        setErrors(prev => {
          const copy = { ...prev };
          delete copy[field];
          return copy;
        });
      }
      setter(value);
    }
  };

  const validateForm = (): boolean => {
    const tempErrors: Record<string, string> = {};
    let isValid = true;

    if (!id.trim()) {
      tempErrors.id = 'Student ID is required';
      isValid = false;
    } else if (!editingStudent && existingIds.includes(id.trim())) {
      tempErrors.id = 'Student ID already exists';
      isValid = false;
    }

    if (!name.trim()) {
      tempErrors.name = 'Student Name is required';
      isValid = false;
    }

    if (!className.trim()) {
      tempErrors.className = 'Class is required';
      isValid = false;
    }

    if (!section.trim()) {
      tempErrors.section = 'Section is required';
      isValid = false;
    }

    if (!rollNumber.trim()) {
      tempErrors.rollNumber = 'Roll number is required';
      isValid = false;
    }

    // Validate marks are entered and valid
    if (attendedExams) {
      const subjectFields = [
        { name: 'maths', val: maths, label: 'Mathematics' },
        { name: 'science', val: science, label: 'Science' },
        { name: 'english', val: english, label: 'English' },
        { name: 'social', val: social, label: 'Social' },
        { name: 'computer', val: computer, label: 'Computer' },
      ];

      subjectFields.forEach(sub => {
        // Skip validation if marked as absent
        if (!absentSubjects.includes(sub.name)) {
          if (sub.val === '') {
            tempErrors[sub.name] = `${sub.label} marks are required`;
            isValid = false;
          } else {
            const num = parseInt(sub.val, 10);
            if (isNaN(num) || num < 0 || num > 100) {
              tempErrors[sub.name] = 'Must be between 0 and 100';
              isValid = false;
            }
          }
        }
      });
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      setGeneralError('Please fix the errors in the form.');
      return;
    }

    const marksData: SubjectMarks = {
      maths: (attendedExams && !absentSubjects.includes('maths')) ? (parseInt(maths, 10) || 0) : 0,
      science: (attendedExams && !absentSubjects.includes('science')) ? (parseInt(science, 10) || 0) : 0,
      english: (attendedExams && !absentSubjects.includes('english')) ? (parseInt(english, 10) || 0) : 0,
      social: (attendedExams && !absentSubjects.includes('social')) ? (parseInt(social, 10) || 0) : 0,
      computer: (attendedExams && !absentSubjects.includes('computer')) ? (parseInt(computer, 10) || 0) : 0,
    };

    if (editingStudent) {
      onUpdateStudent(editingStudent.id, {
        name: name.trim(),
        class: className.trim(),
        section: section.trim(),
        rollNumber: rollNumber.trim(),
        marks: marksData,
        password: password.trim() || undefined,
        attendedClasses,
        attendedExams,
        absentSubjects,
      });
      clearEditing();
      resetForm();
    } else {
      const success = onAddStudent({
        id: id.trim(),
        name: name.trim(),
        class: className.trim(),
        section: section.trim(),
        rollNumber: rollNumber.trim(),
        marks: marksData,
        password: password.trim() || undefined,
        attendedClasses,
        attendedExams,
        absentSubjects,
      });

      if (success) {
        resetForm();
      } else {
        setGeneralError('Failed to add student. ID may already be in use.');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm flex flex-col h-full" id="student-form-card">
      <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-4" id="form-header">
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800 text-lg font-display">
            {editingStudent ? 'Update Student Marks' : 'Student Registration'}
          </h3>
        </div>
        {editingStudent && (
          <button
            onClick={clearEditing}
            className="p-1 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
            title="Cancel Editing"
            id="cancel-edit-btn"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {generalError && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-xs flex items-center gap-2 font-medium" id="form-error-alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col justify-between" id="registration-form">
        <div className="space-y-4">
          
          {/* Primary Details Row */}
          <div className="grid grid-cols-2 gap-4" id="form-row-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Student ID</label>
              <input
                type="text"
                disabled={!!editingStudent}
                placeholder="e.g. STU101"
                value={id}
                onChange={(e) => setId(e.target.value.toUpperCase())}
                className={`w-full bg-slate-50/50 disabled:bg-slate-100/80 disabled:cursor-not-allowed border ${errors.id ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-100 focus:border-indigo-400 focus:ring-indigo-100'} rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-4 transition-all`}
                id="input-student-id"
              />
              {errors.id && <p className="text-[10px] font-semibold text-rose-500">{errors.id}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Student Name</label>
              <input
                type="text"
                placeholder="e.g. Liam Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full bg-slate-50/50 border ${errors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-100 focus:border-indigo-400 focus:ring-indigo-100'} rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-4 transition-all`}
                id="input-student-name"
              />
              {errors.name && <p className="text-[10px] font-semibold text-rose-500">{errors.name}</p>}
            </div>
          </div>

          {/* Login Password Input for Students */}
          <div className="space-y-1" id="form-row-password">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Custom Account Password</label>
            <input
              type="text"
              placeholder="Defaults to Student ID if left empty"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-100 focus:border-indigo-400 focus:ring-indigo-100 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-4 transition-all"
              id="input-student-password"
            />
            <p className="text-[10px] text-slate-400 font-semibold">Allows the student to log in securely to their personal marks dashboard.</p>
          </div>

          {/* Academic Class & Roll Info */}
          <div className="grid grid-cols-3 gap-3" id="form-row-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Class</label>
              <input
                type="text"
                placeholder="e.g. 10"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className={`w-full bg-slate-50/50 border ${errors.className ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-100 focus:border-indigo-400 focus:ring-indigo-100'} rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-4 transition-all`}
                id="input-student-class"
              />
              {errors.className && <p className="text-[10px] font-semibold text-rose-500">{errors.className}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Section</label>
              <input
                type="text"
                placeholder="e.g. A"
                value={section}
                onChange={(e) => setSection(e.target.value.toUpperCase())}
                className={`w-full bg-slate-50/50 border ${errors.section ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-100 focus:border-indigo-400 focus:ring-indigo-100'} rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-4 transition-all`}
                id="input-student-section"
              />
              {errors.section && <p className="text-[10px] font-semibold text-rose-500">{errors.section}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Roll No.</label>
              <input
                type="text"
                placeholder="e.g. 25"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className={`w-full bg-slate-50/50 border ${errors.rollNumber ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-100 focus:border-indigo-400 focus:ring-indigo-100'} rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-4 transition-all`}
                id="input-student-roll"
              />
              {errors.rollNumber && <p className="text-[10px] font-semibold text-rose-500">{errors.rollNumber}</p>}
            </div>
          </div>

          {/* Attendance Options Section */}
          <div className="pt-2 border-t border-slate-50 space-y-3" id="attendance-status-fields">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Attendance & Participation</h4>
            <div className="grid grid-cols-2 gap-4 bg-slate-50/60 p-3 rounded-xl border border-slate-100/50">
              {/* Class Attendance Toggle */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={attendedClasses}
                  onChange={(e) => setAttendedClasses(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                  id="checkbox-attend-class"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">Attends Classes</span>
                  <span className="text-[10px] text-slate-400">Regular attendance</span>
                </div>
              </label>

              {/* Exam Attendance Toggle */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={attendedExams}
                  onChange={(e) => setAttendedExams(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                  id="checkbox-attend-exams"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">Attended Exams</span>
                  <span className="text-[10px] text-slate-400">Appeared for final exam</span>
                </div>
              </label>
            </div>
          </div>

          {/* Marks Entry Section */}
          <div className="pt-2 border-t border-slate-50 space-y-3" id="marks-entry-fields">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Subject Marks (0-100)</h4>
              {!attendedExams && (
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 animate-pulse">
                  Absent from Exams
                </span>
              )}
            </div>
            
            {!attendedExams ? (
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 text-center text-slate-500 space-y-1" id="marks-absent-notice">
                <p className="text-xs font-bold text-slate-700">Exam Marks Locked</p>
                <p className="text-[10px]">Since student is marked as "Absent" from exams, their grades and total are evaluated as 0 ('F' grade).</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3" id="subject-marks-grid">
                
                {/* Maths */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-500">Maths</label>
                    <div className="flex items-center gap-1.5">
                      <label className="flex items-center gap-1 cursor-pointer text-[10px] text-slate-400 select-none">
                        <input
                          type="checkbox"
                          checked={absentSubjects.includes('maths')}
                          onChange={(e) => {
                            const isAb = e.target.checked;
                            if (isAb) {
                              setAbsentSubjects(prev => [...prev, 'maths']);
                              setMaths('');
                            } else {
                              setAbsentSubjects(prev => prev.filter(s => s !== 'maths'));
                            }
                          }}
                          className="w-3 h-3 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span>Absent</span>
                      </label>
                      {!absentSubjects.includes('maths') && maths !== '' && parseInt(maths) < 35 && (
                        <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1 py-0.2 rounded border border-rose-100">Fail threshold</span>
                      )}
                    </div>
                  </div>
                  {absentSubjects.includes('maths') ? (
                    <div className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg py-1.5 px-3 text-xs font-bold text-center font-mono h-[38px] flex items-center justify-center">
                      ABSENT
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="0 - 100"
                      value={maths}
                      onChange={(e) => handleMarkChange(e.target.value, setMaths, 'maths')}
                      className={`w-full bg-slate-50/50 border ${errors.maths ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-100 focus:border-indigo-400 focus:ring-indigo-100'} rounded-lg py-1.5 px-3 text-sm font-mono focus:outline-none focus:ring-4 transition-all`}
                      id="input-mark-maths"
                    />
                  )}
                  {errors.maths && <p className="text-[10px] font-semibold text-rose-500">{errors.maths}</p>}
                </div>

                {/* Science */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-500">Science</label>
                    <div className="flex items-center gap-1.5">
                      <label className="flex items-center gap-1 cursor-pointer text-[10px] text-slate-400 select-none">
                        <input
                          type="checkbox"
                          checked={absentSubjects.includes('science')}
                          onChange={(e) => {
                            const isAb = e.target.checked;
                            if (isAb) {
                              setAbsentSubjects(prev => [...prev, 'science']);
                              setScience('');
                            } else {
                              setAbsentSubjects(prev => prev.filter(s => s !== 'science'));
                            }
                          }}
                          className="w-3 h-3 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span>Absent</span>
                      </label>
                      {!absentSubjects.includes('science') && science !== '' && parseInt(science) < 35 && (
                        <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1 py-0.2 rounded border border-rose-100">Fail threshold</span>
                      )}
                    </div>
                  </div>
                  {absentSubjects.includes('science') ? (
                    <div className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg py-1.5 px-3 text-xs font-bold text-center font-mono h-[38px] flex items-center justify-center">
                      ABSENT
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="0 - 100"
                      value={science}
                      onChange={(e) => handleMarkChange(e.target.value, setScience, 'science')}
                      className={`w-full bg-slate-50/50 border ${errors.science ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-100 focus:border-indigo-400 focus:ring-indigo-100'} rounded-lg py-1.5 px-3 text-sm font-mono focus:outline-none focus:ring-4 transition-all`}
                      id="input-mark-science"
                    />
                  )}
                  {errors.science && <p className="text-[10px] font-semibold text-rose-500">{errors.science}</p>}
                </div>

                {/* English */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-500">English</label>
                    <div className="flex items-center gap-1.5">
                      <label className="flex items-center gap-1 cursor-pointer text-[10px] text-slate-400 select-none">
                        <input
                          type="checkbox"
                          checked={absentSubjects.includes('english')}
                          onChange={(e) => {
                            const isAb = e.target.checked;
                            if (isAb) {
                              setAbsentSubjects(prev => [...prev, 'english']);
                              setEnglish('');
                            } else {
                              setAbsentSubjects(prev => prev.filter(s => s !== 'english'));
                            }
                          }}
                          className="w-3 h-3 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span>Absent</span>
                      </label>
                      {!absentSubjects.includes('english') && english !== '' && parseInt(english) < 35 && (
                        <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1 py-0.2 rounded border border-rose-100">Fail threshold</span>
                      )}
                    </div>
                  </div>
                  {absentSubjects.includes('english') ? (
                    <div className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg py-1.5 px-3 text-xs font-bold text-center font-mono h-[38px] flex items-center justify-center">
                      ABSENT
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="0 - 100"
                      value={english}
                      onChange={(e) => handleMarkChange(e.target.value, setEnglish, 'english')}
                      className={`w-full bg-slate-50/50 border ${errors.english ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-100 focus:border-indigo-400 focus:ring-indigo-100'} rounded-lg py-1.5 px-3 text-sm font-mono focus:outline-none focus:ring-4 transition-all`}
                      id="input-mark-english"
                    />
                  )}
                  {errors.english && <p className="text-[10px] font-semibold text-rose-500">{errors.english}</p>}
                </div>

                {/* Social */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-500">Social</label>
                    <div className="flex items-center gap-1.5">
                      <label className="flex items-center gap-1 cursor-pointer text-[10px] text-slate-400 select-none">
                        <input
                          type="checkbox"
                          checked={absentSubjects.includes('social')}
                          onChange={(e) => {
                            const isAb = e.target.checked;
                            if (isAb) {
                              setAbsentSubjects(prev => [...prev, 'social']);
                              setSocial('');
                            } else {
                              setAbsentSubjects(prev => prev.filter(s => s !== 'social'));
                            }
                          }}
                          className="w-3 h-3 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span>Absent</span>
                      </label>
                      {!absentSubjects.includes('social') && social !== '' && parseInt(social) < 35 && (
                        <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1 py-0.2 rounded border border-rose-100">Fail threshold</span>
                      )}
                    </div>
                  </div>
                  {absentSubjects.includes('social') ? (
                    <div className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg py-1.5 px-3 text-xs font-bold text-center font-mono h-[38px] flex items-center justify-center">
                      ABSENT
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="0 - 100"
                      value={social}
                      onChange={(e) => handleMarkChange(e.target.value, setSocial, 'social')}
                      className={`w-full bg-slate-50/50 border ${errors.social ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-100 focus:border-indigo-400 focus:ring-indigo-100'} rounded-lg py-1.5 px-3 text-sm font-mono focus:outline-none focus:ring-4 transition-all`}
                      id="input-mark-social"
                    />
                  )}
                  {errors.social && <p className="text-[10px] font-semibold text-rose-500">{errors.social}</p>}
                </div>

                {/* Computer */}
                <div className="col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-500">Computer</label>
                    <div className="flex items-center gap-1.5">
                      <label className="flex items-center gap-1 cursor-pointer text-[10px] text-slate-400 select-none">
                        <input
                          type="checkbox"
                          checked={absentSubjects.includes('computer')}
                          onChange={(e) => {
                            const isAb = e.target.checked;
                            if (isAb) {
                              setAbsentSubjects(prev => [...prev, 'computer']);
                              setComputer('');
                            } else {
                              setAbsentSubjects(prev => prev.filter(s => s !== 'computer'));
                            }
                          }}
                          className="w-3 h-3 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span>Absent</span>
                      </label>
                      {!absentSubjects.includes('computer') && computer !== '' && parseInt(computer) < 35 && (
                        <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1 py-0.2 rounded border border-rose-100">Fail threshold</span>
                      )}
                    </div>
                  </div>
                  {absentSubjects.includes('computer') ? (
                    <div className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg py-1.5 px-3 text-xs font-bold text-center font-mono h-[38px] flex items-center justify-center">
                      ABSENT
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="0 - 100"
                      value={computer}
                      onChange={(e) => handleMarkChange(e.target.value, setComputer, 'computer')}
                      className={`w-full bg-slate-50/50 border ${errors.computer ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-100 focus:border-indigo-400 focus:ring-indigo-100'} rounded-lg py-1.5 px-3 text-sm font-mono focus:outline-none focus:ring-4 transition-all`}
                      id="input-mark-computer"
                    />
                  )}
                  {errors.computer && <p className="text-[10px] font-semibold text-rose-500">{errors.computer}</p>}
                </div>

              </div>
            )}
          </div>

        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-5 border-t border-slate-50 mt-5" id="form-buttons">
          <button
            type="button"
            onClick={resetForm}
            className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-lg text-sm py-2 px-4 transition-all"
            id="btn-reset"
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
          
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-sm py-2 px-4 shadow-sm hover:shadow transition-all"
            id="btn-submit"
          >
            <CheckCircle className="w-4 h-4" /> {editingStudent ? 'Update' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
}
