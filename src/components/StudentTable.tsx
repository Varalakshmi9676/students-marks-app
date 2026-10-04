import { useState } from 'react';
import { Student } from '../types';
import { 
  Search, 
  Edit2, 
  Trash2, 
  FileText, 
  Filter, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Sparkles
} from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface StudentTableProps {
  students: Student[];
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onViewReportCard: (student: Student) => void;
}

type SortField = 'id' | 'name' | 'rollNumber' | 'class' | 'total' | 'percentage' | 'grade' | 'result' | 'rank';

export default function StudentTable({
  students,
  onEditStudent,
  onDeleteStudent,
  onViewReportCard,
}: StudentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Extract unique classes and sections for dropdown filters
  const classes = ['All', ...Array.from(new Set(students.map(s => s.class)))].sort();
  const sections = ['All', ...Array.from(new Set(students.map(s => s.section)))].sort();

  // Filter students based on search and selected filters
  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !searchTerm ||
      student.name.toLowerCase().includes(searchLower) ||
      student.id.toLowerCase().includes(searchLower) ||
      student.calculations.grade.toLowerCase() === searchLower ||
      student.calculations.result.toLowerCase() === searchLower ||
      student.class.toLowerCase().includes(searchLower) ||
      `class ${student.class}`.toLowerCase().includes(searchLower) ||
      `class-${student.class}`.toLowerCase().includes(searchLower) ||
      student.rollNumber.includes(searchLower);

    const matchesClass = selectedClass === 'All' || student.class === selectedClass;
    const matchesSection = selectedSection === 'All' || student.section === selectedSection;
    const matchesStatus = selectedStatus === 'All' || student.calculations.result === selectedStatus;

    return matchesSearch && matchesClass && matchesSection && matchesStatus;
  });

  // Sort students based on sortField and sortDirection
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let valA: any;
    let valB: any;

    switch (sortField) {
      case 'id':
        valA = a.id;
        valB = b.id;
        break;
      case 'name':
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
        break;
      case 'rollNumber':
        const numA = parseInt(a.rollNumber, 10);
        const numB = parseInt(b.rollNumber, 10);
        if (!isNaN(numA) && !isNaN(numB)) {
          valA = numA;
          valB = numB;
        } else {
          valA = a.rollNumber.toLowerCase();
          valB = b.rollNumber.toLowerCase();
        }
        break;
      case 'class':
        const classNumA = parseInt(a.class, 10);
        const classNumB = parseInt(b.class, 10);
        if (!isNaN(classNumA) && !isNaN(classNumB)) {
          valA = classNumA;
          valB = classNumB;
        } else {
          valA = a.class.toLowerCase();
          valB = b.class.toLowerCase();
        }
        if (valA === valB) {
          return sortDirection === 'asc' 
            ? a.section.localeCompare(b.section) 
            : b.section.localeCompare(a.section);
        }
        break;
      case 'total':
        valA = a.calculations.total;
        valB = b.calculations.total;
        break;
      case 'percentage':
        valA = a.calculations.percentage;
        valB = b.calculations.percentage;
        break;
      case 'grade':
        valA = a.calculations.grade;
        valB = b.calculations.grade;
        break;
      case 'result':
        valA = a.calculations.result;
        valB = b.calculations.result;
        break;
      case 'rank':
        valA = a.calculations.rank;
        valB = b.calculations.rank;
        break;
      default:
        return 0;
    }

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginate sorted results
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage) || 1;
  const paginatedStudents = sortedStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1); // reset to page 1 on search
  };

  const handleClassChange = (val: string) => {
    setSelectedClass(val);
    setCurrentPage(1);
  };

  const handleSectionChange = (val: string) => {
    setSelectedSection(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      if (['total', 'percentage', 'grade', 'result'].includes(field)) {
        setSortDirection('desc');
      } else {
        setSortDirection('asc');
      }
    }
    setCurrentPage(1);
  };

  const renderSortHeader = (label: string, field: SortField, align: 'left' | 'center' | 'right' = 'left') => {
    const isSorted = sortField === field;
    return (
      <th
        onClick={() => handleSort(field)}
        className={`py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 cursor-pointer select-none hover:bg-slate-100 hover:text-slate-800 transition-all duration-200 group ${
          align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
        }`}
        id={`header-sort-${field}`}
      >
        <div className={`flex items-center gap-1.5 ${
          align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'
        }`}>
          <span>{label}</span>
          <span className="text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0">
            {isSorted ? (
              sortDirection === 'asc' ? (
                <ArrowUp className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
              )
            ) : (
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 stroke-[1.5]" />
            )}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col h-full" id="student-table-container">
      
      {/* Search & Filters Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5" id="table-controls">
        {/* Search Input */}
        <div className="relative flex-grow max-w-md" id="search-bar-wrapper">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name or ID..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50/50 transition-all placeholder-slate-400 text-slate-700"
            id="search-input"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5" id="filter-dropdowns">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" /> Filters
          </div>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => handleClassChange(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-lg py-1.5 px-3 text-xs font-medium text-slate-600 focus:outline-none focus:border-indigo-400 transition-all"
            id="filter-class"
          >
            <option value="All">All Classes</option>
            {classes.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>

          {/* Section Filter */}
          <select
            value={selectedSection}
            onChange={(e) => handleSectionChange(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-lg py-1.5 px-3 text-xs font-medium text-slate-600 focus:outline-none focus:border-indigo-400 transition-all"
            id="filter-section"
          >
            <option value="All">All Sections</option>
            {sections.filter(s => s !== 'All').map(s => (
              <option key={s} value={s}>Sec {s}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-lg py-1.5 px-3 text-xs font-medium text-slate-600 focus:outline-none focus:border-indigo-400 transition-all"
            id="filter-status"
          >
            <option value="All">All Statuses</option>
            <option value="Pass">Pass</option>
            <option value="Fail">Fail</option>
          </select>
        </div>
      </div>

      {/* Database Student List Table */}
      <div className="overflow-x-auto border border-slate-50 rounded-xl" id="database-table-wrapper">
        <table className="w-full text-left text-sm border-collapse" id="database-student-table">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-400 font-medium">
              {renderSortHeader('ID', 'id')}
              {renderSortHeader('Student Name', 'name')}
              {renderSortHeader('Roll', 'rollNumber', 'center')}
              {renderSortHeader('Class-Sec', 'class', 'center')}
              {renderSortHeader('Total', 'total', 'right')}
              {renderSortHeader('Percentage', 'percentage', 'right')}
              {renderSortHeader('Grade', 'grade', 'center')}
              {renderSortHeader('Status', 'result', 'center')}
              {renderSortHeader('Rank', 'rank', 'center')}
              <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-slate-500 text-center select-none">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-700">
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map((student) => {
                const isPass = student.calculations.result === 'Pass';
                const isTopRank = student.calculations.rank <= 3;
                
                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors" id={`student-row-${student.id}`}>
                    <td className="py-3.5 px-4 font-mono font-semibold text-xs text-slate-500">
                      {student.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 font-display">
                      <div className="flex flex-col">
                        <span>{student.name}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          {student.attendedClasses === false ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                              Absent Classes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold bg-emerald-50/50 text-emerald-700 border border-emerald-100/30 rounded-md">
                              Regular Class
                            </span>
                          )}

                          {student.attendedExams === false ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-md">
                              Absent Exams
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold bg-indigo-50/50 text-indigo-700 border border-indigo-100/30 rounded-md">
                              Attended Exams
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-600">
                      {student.rollNumber}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-slate-600">
                      {student.class} - {student.section}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                      {student.calculations.total}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                      {student.calculations.percentage}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-extrabold text-sm text-slate-800">
                        {student.calculations.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isPass
                            ? 'bg-green-50 text-green-700 border border-green-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}
                      >
                        {student.calculations.result}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center font-bold text-xs rounded-full px-2 py-0.5 ${
                          student.calculations.rank === 1
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : student.calculations.rank === 2
                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                            : student.calculations.rank === 3
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'text-slate-500'
                        }`}
                      >
                        {isTopRank ? `Rank ${student.calculations.rank}` : `#${student.calculations.rank}`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5" id={`actions-${student.id}`}>
                        <button
                          onClick={() => onViewReportCard(student)}
                          className="p-1.5 hover:bg-indigo-50 text-indigo-500 hover:text-indigo-700 rounded-lg transition-colors"
                          title="View Report Card"
                          id={`btn-report-${student.id}`}
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditStudent(student)}
                          className="p-1.5 hover:bg-sky-50 text-sky-500 hover:text-sky-700 rounded-lg transition-colors"
                          title="Edit Student Marks"
                          id={`btn-edit-${student.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg transition-colors"
                          title="Delete Record"
                          id={`btn-delete-${student.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="text-center py-10 text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertTriangle className="w-7 h-7 text-slate-300 stroke-[1.5]" />
                    <p className="text-sm">No student records found matching the query.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredStudents.length > itemsPerPage && (
        <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-4" id="table-pagination">
          <p className="text-xs text-slate-400 font-medium">
            Showing <span className="font-semibold text-slate-600">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-semibold text-slate-600">
              {Math.min(currentPage * itemsPerPage, filteredStudents.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-600">{filteredStudents.length}</span> students
          </p>
          <div className="flex items-center gap-1" id="pagination-buttons">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              id="prev-page-btn"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-600 px-3 py-1 bg-slate-50 rounded-lg">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              id="next-page-btn"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Record Confirmation Modal */}
      <ConfirmModal
        isOpen={!!studentToDelete}
        title="Delete Student Record"
        message={`Are you sure you want to delete the student record for "${studentToDelete?.name}" (${studentToDelete?.id})? This action is permanent and cannot be undone.`}
        confirmText="Delete Record"
        cancelText="Cancel"
        type="danger"
        onConfirm={() => {
          if (studentToDelete) {
            onDeleteStudent(studentToDelete.id);
            setStudentToDelete(null);
          }
        }}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
}
