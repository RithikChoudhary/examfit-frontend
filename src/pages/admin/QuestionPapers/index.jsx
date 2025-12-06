import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, FileText, Filter } from 'lucide-react';
import { questionPapersAPI } from '../../../api/questionPapers';
import { subjectsAPI } from '../../../api/subjects';
import { examsAPI, boardsAPI } from '../../../services/api';
import toast from 'react-hot-toast';

// Predefined sections for organization
const PREDEFINED_SECTIONS = [
  'Previous Year Questions',
  'Practice Tests',
  'Mock Tests',
  'Section I',
  'Section II',
  'Section III',
  'Paper 1',
  'Paper 2',
  'General',
];

const AdminQuestionPapers = () => {
  const [questionPapers, setQuestionPapers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [papersLoading, setPapersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState(null);
  
  // Filter states
  const [filterBoard, setFilterBoard] = useState('');
  const [filterExam, setFilterExam] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    exam: '',
    board: '',
    section: 'General',
    year: '',
  });

  // Stats
  const [totalPapers, setTotalPapers] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch papers when subject filter changes
  useEffect(() => {
    if (filterSubject) {
      fetchPapers();
    } else {
      setQuestionPapers([]);
    }
  }, [filterSubject]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [subjectsRes, examsRes, boardsRes, papersCountRes] = await Promise.all([
        subjectsAPI.getAll(),
        examsAPI.getAll(),
        boardsAPI.getAll(),
        questionPapersAPI.getAll(),
      ]);
      
      setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : subjectsRes.data.subjects || []);
      
      const examsData = Array.isArray(examsRes.data) ? examsRes.data : examsRes.data.exams || [];
      examsData.forEach(e => { e.name = e.name || e.title; });
      setExams(examsData);
      
      setBoards(Array.isArray(boardsRes.data) ? boardsRes.data : boardsRes.data.boards || []);
      
      const allPapers = Array.isArray(papersCountRes.data) ? papersCountRes.data : papersCountRes.data.questionPapers || [];
      setTotalPapers(allPapers.length);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPapers = async () => {
    if (!filterSubject) return;
    
    try {
      setPapersLoading(true);
      const response = await questionPapersAPI.getAll({ subjectId: filterSubject });
      setQuestionPapers(Array.isArray(response.data) ? response.data : response.data.questionPapers || []);
    } catch (error) {
      console.error('Error fetching papers:', error);
      toast.error('Failed to fetch papers');
    } finally {
      setPapersLoading(false);
    }
  };

  // Filter helpers
  const getFilteredExams = (boardId) => {
    if (!boardId) return [];
    return exams.filter(e => String(e.board?._id || e.board) === boardId);
  };

  const getFilteredSubjects = (examId) => {
    if (!examId) return [];
    return subjects.filter(s => String(s.exam?._id || s.exam) === examId);
  };

  // Group papers by section
  const getGroupedPapers = () => {
    const filtered = questionPapers.filter(paper =>
      paper.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped = {};
    filtered.forEach(paper => {
      const section = paper.section || 'General';
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(paper);
    });

    // Sort papers within sections by year (desc) then name
    Object.keys(grouped).forEach(section => {
      grouped[section].sort((a, b) => {
        if (a.year && b.year) return b.year - a.year;
        if (a.year) return -1;
        if (b.year) return 1;
        return a.name.localeCompare(b.name);
      });
    });

    return grouped;
  };

  const handleOpenModal = (paper = null) => {
    if (paper) {
      setEditingPaper(paper);
      setFormData({
        name: paper.name,
        subject: paper.subject?._id || paper.subject || filterSubject || '',
        exam: paper.exam?._id || paper.exam || filterExam || '',
        board: paper.board?._id || paper.board || filterBoard || '',
        section: paper.section || 'General',
        year: paper.year || '',
      });
    } else {
      setEditingPaper(null);
      setFormData({
        name: '',
        subject: filterSubject || '',
        exam: filterExam || '',
        board: filterBoard || '',
        section: 'General',
        year: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPaper(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        name: formData.name,
        subject: formData.subject,
        exam: formData.exam,
        board: formData.board,
        section: formData.section || 'General',
        year: formData.year ? parseInt(formData.year) : null,
      };

      if (editingPaper) {
        await questionPapersAPI.update(editingPaper._id, payload);
        toast.success('Question paper updated successfully');
      } else {
        await questionPapersAPI.create(payload);
        toast.success('Question paper created successfully');
      }
      handleCloseModal();
      fetchPapers();
      fetchInitialData();
    } catch (error) {
      console.error('Error saving question paper:', error);
      toast.error(error.response?.data?.message || 'Failed to save question paper');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question paper?')) {
      return;
    }

    try {
      await questionPapersAPI.delete(id);
      toast.success('Question paper deleted successfully');
      fetchPapers();
      fetchInitialData();
    } catch (error) {
      console.error('Error deleting question paper:', error);
      toast.error('Failed to delete question paper');
    }
  };

  // For form dropdowns
  const getFormFilteredExams = () => {
    if (!formData.board) return [];
    return exams.filter(e => String(e.board?._id || e.board) === formData.board);
  };

  const getFormFilteredSubjects = () => {
    if (!formData.exam) return [];
    return subjects.filter(s => String(s.exam?._id || s.exam) === formData.exam);
  };

  const groupedPapers = getGroupedPapers();
  const selectedSubject = subjects.find(s => s._id === filterSubject);
  const selectedExam = exams.find(e => e._id === filterExam);
  const selectedBoard = boards.find(b => b._id === filterBoard);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Question Papers
              </h1>
              <p className="text-gray-600">Select a subject to view and manage its question papers</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              disabled={!filterSubject}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={20} />
              Add Question Paper
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-600">Total Papers</p>
              <p className="text-2xl font-bold text-indigo-600">{totalPapers}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-600">Subjects</p>
              <p className="text-2xl font-bold text-purple-600">{subjects.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-600">Exams</p>
              <p className="text-2xl font-bold text-pink-600">{exams.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-600">Boards</p>
              <p className="text-2xl font-bold text-orange-600">{boards.length}</p>
            </div>
          </div>

          {/* Hierarchy Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className="text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Select Subject to View Papers</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Board</label>
                <select
                  value={filterBoard}
                  onChange={(e) => {
                    setFilterBoard(e.target.value);
                    setFilterExam('');
                    setFilterSubject('');
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Board</option>
                  {boards.map((board) => (
                    <option key={board._id} value={board._id}>{board.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam</label>
                <select
                  value={filterExam}
                  onChange={(e) => {
                    setFilterExam(e.target.value);
                    setFilterSubject('');
                  }}
                  disabled={!filterBoard}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                >
                  <option value="">Select Exam</option>
                  {getFilteredExams(filterBoard).map((exam) => (
                    <option key={exam._id} value={exam._id}>{exam.title || exam.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  disabled={!filterExam}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                >
                  <option value="">Select Subject</option>
                  {getFilteredSubjects(filterExam).map((subject) => (
                    <option key={subject._id} value={subject._id}>{subject.icon} {subject.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Search Bar - Only show when subject is selected */}
          {filterSubject && (
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search question papers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Content */}
        {!filterSubject ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter size={32} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Subject</h3>
            <p className="text-gray-600">Use the filters above to select Board → Exam → Subject</p>
          </div>
        ) : papersLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading question papers...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Subject Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <span className="text-2xl">{selectedSubject?.icon || '📚'}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedSubject?.name}</h3>
                    <p className="text-white/70 text-sm">
                      {selectedExam?.title || selectedExam?.name} • {selectedBoard?.name}
                    </p>
                  </div>
                </div>
                <span className="px-4 py-2 bg-white/20 rounded-lg text-white font-medium">
                  {questionPapers.length} Papers
                </span>
              </div>
            </div>

            {/* Papers Content */}
            <div className="p-6">
              {Object.keys(groupedPapers).length === 0 ? (
                <div className="text-center py-8">
                  <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No question papers found for this subject</p>
                  <button
                    onClick={() => handleOpenModal()}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add First Paper
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedPapers).map(([section, papers]) => (
                    <div key={section}>
                      {/* Section Header */}
                      <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                        <h4 className="font-semibold text-gray-800">{section}</h4>
                        <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full">
                          {papers.length} papers
                        </span>
                      </div>
                      
                      {/* Papers Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {papers.map((paper) => (
                          <div
                            key={paper._id}
                            className="group relative bg-gradient-to-br from-gray-50 to-white hover:from-indigo-50 hover:to-purple-50 p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-300 transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-gray-900 mb-1 truncate">{paper.name}</h5>
                                {paper.year && (
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    📅 {paper.year}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1 ml-2">
                                <button
                                  onClick={() => handleOpenModal(paper)}
                                  className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(paper._id)}
                                  className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPaper ? 'Edit Question Paper' : 'Add Question Paper'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Board */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Board <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.board}
                  onChange={(e) => setFormData({ ...formData, board: e.target.value, exam: '', subject: '' })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Board</option>
                  {boards.map((board) => (
                    <option key={board._id} value={board._id}>{board.name}</option>
                  ))}
                </select>
              </div>

              {/* Exam */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.exam}
                  onChange={(e) => setFormData({ ...formData, exam: e.target.value, subject: '' })}
                  required
                  disabled={!formData.board}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                >
                  <option value="">Select Exam</option>
                  {getFormFilteredExams().map((exam) => (
                    <option key={exam._id} value={exam._id}>{exam.title || exam.name}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  disabled={!formData.exam}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                >
                  <option value="">Select Subject</option>
                  {getFormFilteredSubjects().map((subject) => (
                    <option key={subject._id} value={subject._id}>{subject.icon} {subject.name}</option>
                  ))}
                </select>
              </div>

              {/* Paper Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paper Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., PYQ 2024, Paper 1"
                />
              </div>

              {/* Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PREDEFINED_SECTIONS.map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year (optional)</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 2024"
                  min="2000"
                  max="2030"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                >
                  {editingPaper ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestionPapers;
