import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, BookOpen, ArrowLeft } from 'lucide-react';
import axios from 'axios';

// Use environment-aware API URL
const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://backend.examfit.in/api';
  }
  return import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
};
const API_URL = getApiBaseUrl();

const subjectIcons = ['📚', '📖', '📝', '📋', '📑', '🎯', '💡', '🔬', '🧪', '📐', '🌍', '⚡', '🔢', '📊'];
const subjectColors = [
  'from-blue-500 to-blue-600',
  'from-orange-500 to-orange-600',
  'from-green-500 to-green-600',
  'from-purple-500 to-purple-600',
  'from-pink-500 to-pink-600',
  'from-teal-500 to-teal-600',
  'from-indigo-500 to-indigo-600',
  'from-amber-500 to-amber-600',
];

const StudentSubjects = () => {
  const [exam, setExam] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const examId = searchParams.get('exam');
  const boardId = searchParams.get('board');

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (!examId) {
      navigate('/');
      return;
    }

    fetchData();
  }, [examId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [examRes, subjectsRes] = await Promise.all([
        axios.get(`${API_URL}/exams/${examId}`, { headers }),
        axios.get(`${API_URL}/subject?examId=${examId}`, { headers }),
      ]);

      setExam(examRes.data);
      setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = (subjectId) => {
    navigate(`/question-papers?subject=${subjectId}&exam=${examId}&board=${boardId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          to={`/exams?board=${boardId}`}
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Exams
        </Link>

        {/* Hero Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg mb-4">
                  <span className="text-sm font-semibold">Select Subject</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{exam?.name || 'Loading...'}</h1>
                <p className="text-lg text-indigo-100 max-w-2xl">
                  Choose a subject to view available question papers and start practicing
                </p>
              </div>
              <div className="hidden md:block w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <BookOpen size={48} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8 flex-wrap">
          <Link to={`/exams?board=${boardId}`} className="hover:text-indigo-600 transition-colors">
            Exams
          </Link>
          <ChevronRight size={16} />
          <span className="text-gray-900 font-medium">{exam?.name}</span>
          <ChevronRight size={16} />
          <span className="text-gray-500">Subjects</span>
        </div>

        {/* Subjects Grid */}
        {subjects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No subjects available</h3>
            <p className="text-gray-600 mb-6">There are no subjects available for this exam yet</p>
            <Link
              to={`/exams?board=${boardId}`}
              className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
            >
              Go Back
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subjects.map((subject, index) => {
              const colorIndex = index % subjectColors.length;
              const iconIndex = index % subjectIcons.length;
              
              return (
                <button
                  key={subject._id}
                  onClick={() => handleSubjectClick(subject._id)}
                  className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-transparent transition-all duration-300 overflow-hidden text-left"
                >
                  <div className={`h-2 bg-gradient-to-r ${subjectColors[colorIndex]}`}></div>
                  <div className="p-6">
                    <div className={`w-14 h-14 bg-gradient-to-br ${subjectColors[colorIndex]} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <span className="text-3xl">{subject.icon || subjectIcons[iconIndex]}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {subject.name}
                    </h3>
                    {subject.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {subject.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500">View question papers</span>
                      <ChevronRight className="text-indigo-600 group-hover:translate-x-1 transition-transform" size={20} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSubjects;
