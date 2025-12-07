import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Calendar } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Exams.css'; // Use same styles as Exams page

// Use environment-aware API URL
const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://backend.examfit.in/api';
  }
  return import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
};
const API_URL = getApiBaseUrl();

const paperIcons = ['📝', '📋', '📄', '📑', '📃', '🗒️', '📜', '✍️', '📊', '📈'];

const QuestionPapers = () => {
  const [subject, setSubject] = useState(null);
  const [exam, setExam] = useState(null);
  const [board, setBoard] = useState(null);
  const [questionPapers, setQuestionPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const subjectId = searchParams.get('subject');
  const examId = searchParams.get('exam');
  const boardId = searchParams.get('board');

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (!subjectId || !examId || !boardId) {
      navigate('/');
      return;
    }

    fetchData();
  }, [subjectId, examId, boardId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [subjectRes, examRes, boardRes, papersRes] = await Promise.all([
        axios.get(`${API_URL}/subject/${subjectId}`, { headers }),
        axios.get(`${API_URL}/exams/${examId}`, { headers }),
        axios.get(`${API_URL}/boards/${boardId}`, { headers }),
        axios.get(`${API_URL}/question-papers?subjectId=${subjectId}`, { headers }),
      ]);

      const subjectData = subjectRes.data;
      setSubject(subjectData);
      
      // Debug: Log subject data to verify sectionPriorities are loaded
      console.log('📋 Subject loaded:', subjectData?.name);
      console.log('📋 Section Priorities:', subjectData?.sectionPriorities);
      console.log('📋 Section Priorities type:', typeof subjectData?.sectionPriorities);
      console.log('📋 Section Priorities keys:', subjectData?.sectionPriorities ? Object.keys(subjectData.sectionPriorities) : 'none');
      
      setExam(examRes.data.exam || examRes.data);
      setBoard(boardRes.data.board || boardRes.data);
      setQuestionPapers(Array.isArray(papersRes.data) ? papersRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (questionPaperId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const response = await axios.post(
        `${API_URL}/student/tests`,
        { questionPaperId, examId },
        { headers }
      );

      // API returns testId directly, not test._id
      navigate(`/test/${response.data.testId}`);
    } catch (error) {
      console.error('Error creating test:', error);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to start test');
    }
  };

  // Get section priority from subject's sectionPriorities
  const getSectionPriority = (sectionName) => {
    if (!subject?.sectionPriorities) {
      return 999; // Default to last
    }
    
    const priorities = subject.sectionPriorities;
    const normalizedSection = sectionName.trim();
    
    // Handle Map type
    if (priorities instanceof Map) {
      // Try exact match
      if (priorities.has(normalizedSection)) {
        return Number(priorities.get(normalizedSection)) || 999;
      }
      // Try case-insensitive match
      for (const [key, value] of priorities.entries()) {
        if (key.trim().toLowerCase() === normalizedSection.toLowerCase()) {
          return Number(value) || 999;
        }
      }
      return 999;
    }
    
    // Handle object type (most common after JSON serialization)
    if (typeof priorities === 'object' && priorities !== null) {
      // Try exact match first
      if (priorities[normalizedSection] !== undefined && priorities[normalizedSection] !== null) {
        return Number(priorities[normalizedSection]) || 999;
      }
      // Try case-insensitive match
      const lowerSection = normalizedSection.toLowerCase();
      for (const [key, value] of Object.entries(priorities)) {
        if (key.trim().toLowerCase() === lowerSection) {
          return Number(value) || 999;
        }
      }
    }
    
    return 999; // Default to last
  };

  // Group papers by section
  const getPapersBySection = () => {
    const grouped = {};
    questionPapers.forEach(paper => {
      const section = paper.section || 'General';
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(paper);
    });
    
    // Sort papers within sections
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

  const sectionedPapers = getPapersBySection();
  
  // Debug: Log all sections and their priorities
  const allSections = Object.keys(sectionedPapers);
  console.log('🔍 All sections found:', allSections);
  allSections.forEach(section => {
    const priority = getSectionPriority(section);
    console.log(`  - "${section}": priority = ${priority}`);
  });
  console.log('🔍 Subject sectionPriorities:', subject?.sectionPriorities);
  
  // Sort sections by priority (lower number = first)
  const sectionNames = Object.keys(sectionedPapers).sort((a, b) => {
    const priorityA = getSectionPriority(a);
    const priorityB = getSectionPriority(b);
    console.log(`🔀 Sorting: "${a}" (${priorityA}) vs "${b}" (${priorityB})`);
    // If priorities are equal, maintain alphabetical order
    if (priorityA === priorityB) {
      return a.localeCompare(b);
    }
    return priorityA - priorityB;
  });
  
  console.log('✅ Final section order:', sectionNames);
  const totalPapers = questionPapers.length;

  const getPaperIcon = (index) => paperIcons[index % paperIcons.length];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="loading-spinner mb-4"></div>
        <p className="text-gray-600 font-medium text-lg">Loading question papers...</p>
      </div>
    );
  }

  const subjectName = subject?.name || 'Subject';
  const subjectIcon = subject?.icon || '📚';
  const examName = exam?.title || exam?.name || 'Exam';
  const boardName = board?.name || 'Board';

  return (
    <div className="exams-page">
      {/* Hero Section - Same as Exams page */}
      <div className="exams-hero text-white py-12 px-4">
        <div className="container mx-auto relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/70 text-sm mb-6 flex-wrap">
            <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <ChevronRight size={16} />
            <Link to={`/exams?board=${boardId}`} className="hover:text-white transition-colors">
              {boardName}
            </Link>
            <ChevronRight size={16} />
            <span className="text-white font-medium">{subjectName}</span>
          </nav>

          {/* Title Section */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-4xl">{subjectIcon}</span>
                </div>
                <div>
                  <p className="text-white/70 text-sm font-medium uppercase tracking-wider">{examName}</p>
                  <h1 className="text-3xl md:text-4xl font-bold">{subjectName}</h1>
                </div>
              </div>
              <p className="text-white/80 text-lg max-w-xl">
                Select a question paper to start your practice test
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-6 py-4 text-center min-w-[100px]">
                <p className="text-4xl font-bold">{sectionNames.length}</p>
                <p className="text-white/70 text-sm mt-1">Sections</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-6 py-4 text-center min-w-[100px]">
                <p className="text-4xl font-bold">{totalPapers}</p>
                <p className="text-white/70 text-sm mt-1">Papers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">
        {sectionNames.length > 0 ? (
          <>
            {/* Section Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">📝</span>
                  </div>
                  Select Question Paper
                </h2>
                <p className="text-gray-500 mt-1">Click on any paper to start your test</p>
              </div>
            </div>

            {/* VERTICAL LAYOUT: Sections as columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sectionNames.map((section, sectionIndex) => {
                const papers = sectionedPapers[section];
                
                return (
                  <div 
                    key={section} 
                    className="exam-card bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100"
                    style={{ animationDelay: `${sectionIndex * 0.1}s` }}
                  >
                    {/* Section Header */}
                    <div className="exam-card-header bg-gradient-to-r from-blue-600 to-blue-700 p-4">
                      <h3 className="text-lg font-bold text-white truncate">{section}</h3>
                      <p className="text-white/70 text-sm mt-1">
                        {papers.length} {papers.length === 1 ? 'Paper' : 'Papers'}
                      </p>
                    </div>

                    {/* Papers List - Vertical */}
                    <div className="p-4">
                      {papers.length > 0 ? (
                        <div className="space-y-2">
                          {papers.map((paper, paperIndex) => (
                            <button
                              key={paper._id}
                              onClick={() => handleStartTest(paper._id)}
                              className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 text-left group"
                            >
                              <span className="text-2xl group-hover:scale-110 transition-transform">
                                {getPaperIcon(paperIndex)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 block truncate">
                                  {paper.name}
                                </span>
                                {paper.year && (
                                  <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    <Calendar size={12} />
                                    {paper.year}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors whitespace-nowrap">
                                Start
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-400">
                          <p className="text-sm">No papers available</p>
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
              <div className="text-7xl mb-6">📝</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Question Papers</h3>
              <p className="text-gray-500 text-lg mb-8">
                There are no question papers available for this subject yet.
              </p>
              <Link
                to={`/exams?board=${boardId}`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
              >
                <ArrowLeft size={20} />
                Back to Exams
              </Link>
            </div>
          </div>
        )}

        {/* Back Button */}
        {sectionNames.length > 0 && (
          <div className="mt-10">
            <Link
              to={`/exams?board=${boardId}`}
              className="back-btn"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Exams
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPapers;
