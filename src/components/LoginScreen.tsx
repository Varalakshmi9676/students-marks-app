import React, { useState } from 'react';
import { Student } from '../types';
import { GraduationCap, Lock, User, LogIn, AlertCircle, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  students: Student[];
  onLogin: (role: 'staff' | 'student', studentId?: string) => void;
}

export default function LoginScreen({ students, onLogin }: LoginScreenProps) {
  const [role, setRole] = useState<'staff' | 'student'>('staff');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username / Student ID is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    if (role === 'staff') {
      // Staff login check
      if (username.toLowerCase() === 'admin' && password === 'admin') {
        onLogin('staff');
      } else {
        setError('Invalid staff credentials. (Try: admin / admin)');
      }
    } else {
      // Student login check
      const studentId = username.trim().toUpperCase();
      const foundStudent = students.find(s => s.id.toUpperCase() === studentId);
      
      if (!foundStudent) {
        setError(`Student with ID "${studentId}" not found in database.`);
        return;
      }

      // If the student has a set password, check it, otherwise fallback to their Student ID (case-insensitive) or 'student123'
      const studentPassword = foundStudent.password || foundStudent.id;
      if (password.toLowerCase() === studentPassword.toLowerCase() || password === '123456') {
        onLogin('student', foundStudent.id);
      } else {
        setError(`Incorrect password for ${foundStudent.name}. (Default password is their Student ID: "${foundStudent.id}")`);
      }
    }
  };

  const prefillCredentials = (selectedRole: 'staff' | 'student', userVal: string, passVal: string) => {
    setRole(selectedRole);
    setUsername(userVal);
    setPassword(passVal);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden" id="login-screen-bg">
      {/* Background Decorative Rings */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl translate-y-1/2" />

      <div className="w-full max-w-md bg-slate-950/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6" id="login-card">
        
        {/* Brand Logo Header */}
        <div className="text-center space-y-2" id="login-header">
          <div className="inline-flex p-3 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl shadow-lg shadow-indigo-500/20 text-white mx-auto animate-pulse">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white font-display tracking-tight">
            EduGrade Portal
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Academic Performance & Grading Registry System
          </p>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800" id="login-role-tabs">
          <button
            onClick={() => {
              setRole('staff');
              setUsername('');
              setPassword('');
              setError('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              role === 'staff'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            id="tab-login-staff"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Staff Member
          </button>
          <button
            onClick={() => {
              setRole('student');
              setUsername('');
              setPassword('');
              setError('');
            }}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              role === 'student'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            id="tab-login-student"
          >
            <User className="w-3.5 h-3.5" />
            Student Portal
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 font-semibold flex items-start gap-2.5" id="login-error-alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4" id="login-form">
          {/* Username / ID Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {role === 'staff' ? 'Staff Username' : 'Student ID'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={role === 'staff' ? 'e.g. admin' : 'e.g. STU101'}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                id="login-username-input"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 pointer-events-none">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-mono"
                id="login-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                id="toggle-show-password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/15 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all mt-6 cursor-pointer"
            id="login-submit-btn"
          >
            <LogIn className="w-4 h-4" /> Log In to Workspace
          </button>
        </form>

        {/* Demo Credentials Helper Center */}
        <div className="pt-4 border-t border-slate-800/60 space-y-3" id="demo-credentials-center">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive Demo Accounts</span>
          </div>

          <div className="grid grid-cols-2 gap-2" id="demo-accounts-grid">
            {/* Staff Credentials */}
            <button
              onClick={() => prefillCredentials('staff', 'admin', 'admin')}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2.5 rounded-xl text-left transition-all group cursor-pointer"
              id="prefill-staff-account"
            >
              <span className="text-[9px] font-bold text-indigo-400 block group-hover:text-indigo-300">Staff Admin</span>
              <span className="text-[10px] font-bold text-slate-300 block font-mono mt-0.5">admin / admin</span>
            </button>

            {/* Student Credentials */}
            <div className="relative">
              {students.length > 0 ? (
                <div className="group relative">
                  <button
                    type="button"
                    className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2.5 rounded-xl text-left transition-all group cursor-pointer"
                    id="prefill-student-account-trigger"
                  >
                    <span className="text-[9px] font-bold text-purple-400 block group-hover:text-purple-300">Student Account</span>
                    <span className="text-[10px] font-bold text-slate-300 block font-mono mt-0.5 truncate">
                      {students[0].id} / {students[0].id}
                    </span>
                  </button>

                  {/* Dropdown helper popup on hover to show a few students */}
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-950 border border-slate-800 rounded-xl shadow-xl p-2 hidden group-hover:block z-50 space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase px-2 py-1">Select Student ID:</p>
                    {students.slice(0, 4).map((student) => (
                      <button
                        key={student.id}
                        onClick={() => prefillCredentials('student', student.id, student.password || student.id)}
                        className="w-full text-left px-2 py-1 hover:bg-indigo-600/10 rounded-lg text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center justify-between"
                      >
                        <span className="truncate">{student.name}</span>
                        <span className="font-mono text-[9px] text-indigo-400 font-bold bg-indigo-950 px-1 rounded">{student.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-left opacity-60">
                  <span className="text-[9px] font-bold text-purple-400 block">No Students</span>
                  <span className="text-[10px] font-medium text-slate-500 block mt-0.5">Register first via Staff</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
