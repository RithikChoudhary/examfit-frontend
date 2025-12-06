import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { examsAPI, boardsAPI } from '../../services/api';
import { subjectsAPI } from '../../api/subjects';
import './Exams.css';

const subjectIcons = ['📚', '📖', '📝', '📋', '📑', '🎯', '💡', '🔬', '🧪', '📐', '🌍', '⚡', '🔢', '📊'];

const StudentExams = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const boardId = searchParams.get('board');

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (!boardId) {
      navigate('/');
      return;
    }

    fetchData(boardId);
  }, [boardId]);

  const fetchData = async (boardId) => {
    try {
      setLoading(true);
      const [boardRes, examsRes, subjectsRes] = await Promise.all([
        boardsAPI.getById(boardId),
        examsAPI.getAll({ board: boardId }),
        subjectsAPI.getAll({ boardId }),
      ]);
      
      setBoard(boardRes.data.board || boardRes.data);
      setExams(examsRes.data.exams || examsRes.data || []);
      setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : subjectsRes.data.subjects || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = (subjectId, examId) => {
    navigate(`/question-papers?subject=${subjectId}&exam=${examId}&board=${boardId}`);
  };

  const getSubjectIcon = (index) => subjectIcons[index % subjectIcons.length];

  // Get subjects for a specific exam - convert to string for proper comparison
  const getSubjectsForExam = (examId) => {
    const examIdStr = String(examId);
    return subjects.filter(subject => {
      const subjectExamId = String(subject.exam?._id || subject.exam);
      return subjectExamId === examIdStr;
    });
  };

  // Only show root exams (no sub-exams)
  const rootExams = exams.filter(e => !e.parentExam);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="loading-spinner mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">Loading exams...</p>
        <p className="text-gray-400 text-sm mt-1">Please wait</p>
      </div>
    );
  }

  const boardName = board?.name || 'Board';
  const boardDescription = board?.description || '';

  return (
    <div className="exams-page">
      {/* Hero Section */}
      <div className="exams-hero text-white py-12 px-4">
        <div className="container mx-auto relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/70 text-sm mb-6">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white font-medium">{boardName}</span>
          </nav>

          {/* Title Section */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-4xl">🎓</span>
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Exam Board</p>
                  <h1 className="text-3xl md:text-4xl font-bold">{boardName}</h1>
                </div>
              </div>
              {boardDescription && (
                <p className="text-white/80 text-lg max-w-xl">{boardDescription}</p>
              )}
              {!boardDescription && (
                <p className="text-white/80 text-lg max-w-xl">
                  Select a subject to view question papers and start practicing
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-6 py-4 text-center min-w-[100px]">
                <p className="text-4xl font-bold">{rootExams.length}</p>
                <p className="text-white/70 text-sm mt-1">Exams</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-6 py-4 text-center min-w-[100px]">
                <p className="text-4xl font-bold">{subjects.length}</p>
                <p className="text-white/70 text-sm mt-1">Subjects</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - SIDE BY SIDE VERTICAL COLUMNS */}
      <div className="container mx-auto px-4 py-10">
        {rootExams.length > 0 ? (
          <>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">📚</span>
                  </div>
                  Select Subject to Practice
                </h2>
                <p className="text-gray-500 mt-1">Click on any subject to view question papers</p>
              </div>
            </div>

            {/* EXAMS SIDE BY SIDE AS COLUMNS - 3 per row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rootExams.map((exam, examIndex) => {
                const examSubjects = getSubjectsForExam(exam._id);
                
                return (
                  <div 
                    key={exam._id} 
                    className="exam-column bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
                  >
                    {/* Exam Header */}
                    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <span className="text-2xl">📋</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white">{exam.title}</h3>
                          <p className="text-white/70 text-sm">
                            {examSubjects.length} Subjects
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Subjects List - VERTICAL */}
                    <div className="p-5">
                      {examSubjects.length > 0 ? (
                        <div className="space-y-3">
                          {examSubjects.map((subject, subIndex) => (
                            <button
                              key={subject._id}
                              onClick={() => handleSubjectClick(subject._id, exam._id)}
                              className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-indigo-50 rounded-xl border-2 border-gray-100 hover:border-blue-300 transition-all duration-200 text-left group"
                            >
                              <div className="w-11 h-11 bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200 rounded-xl flex items-center justify-center transition-all flex-shrink-0">
                                <span className="text-xl group-hover:scale-110 transition-transform">
                                  {subject.icon || getSubjectIcon(subIndex)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 block truncate">
                                  {subject.name}
                                </span>
                              </div>
                              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <span className="text-4xl block mb-3">📭</span>
                          <p>No subjects available</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="empty-state text-center py-16 px-4">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <div className="empty-state-icon text-7xl mb-6">📚</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Exams Available</h3>
              <p className="text-gray-500 text-lg mb-8">
                This board doesn't have any exams configured yet. Check back later!
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* Back Button */}
        {rootExams.length > 0 && (
          <div className="mt-10">
            <Link
              to="/"
              className="back-btn"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExams;
