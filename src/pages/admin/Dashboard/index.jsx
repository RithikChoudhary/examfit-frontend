import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  ClipboardList, 
  HelpCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import axios from 'axios';

// Use environment-aware API URL
const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://backend.examfit.in/api';
  }
  return import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
};
const API_URL = getApiBaseUrl();

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    boards: 0,
    exams: 0,
    subjects: 0,
    questionPapers: 0,
    questions: 0,
    pendingQuestions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        const [boardsRes, examsRes, subjectsRes, papersRes, questionsRes, pendingRes] = await Promise.all([
          axios.get(`${API_URL}/boards`, { headers }),
          axios.get(`${API_URL}/exams`, { headers }),
          axios.get(`${API_URL}/subject`, { headers }),
          axios.get(`${API_URL}/question-papers`, { headers }),
          axios.get(`${API_URL}/questions?status=published&limit=1`, { headers }), // Just get count from pagination
          axios.get(`${API_URL}/questions?status=draft&limit=1`, { headers }),
        ]);

        // Handle different API response formats
        const boardsData = Array.isArray(boardsRes.data) ? boardsRes.data : boardsRes.data.boards || [];
        const examsData = Array.isArray(examsRes.data) ? examsRes.data : examsRes.data.exams || [];
        const subjectsData = Array.isArray(subjectsRes.data) ? subjectsRes.data : subjectsRes.data.subjects || [];
        const papersData = Array.isArray(papersRes.data) ? papersRes.data : papersRes.data.questionPapers || [];
        
        // Get total counts from pagination response
        const questionsTotal = questionsRes.data?.pagination?.total || 
                              (Array.isArray(questionsRes.data) ? questionsRes.data.length : questionsRes.data.questions?.length || 0);
        const pendingTotal = pendingRes.data?.pagination?.total || 
                            (Array.isArray(pendingRes.data) ? pendingRes.data.length : pendingRes.data.questions?.length || 0);

        setStats({
          boards: boardsData.length,
          exams: examsData.length,
          subjects: subjectsData.length,
          questionPapers: papersData.length,
          questions: questionsTotal,
          pendingQuestions: pendingTotal,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const quickLinks = [
    {
      to: '/admin/boards',
      icon: GraduationCap,
      title: 'Boards',
      description: 'Manage exam boards (UPSC, SSC, etc.)',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      to: '/admin/exams',
      icon: BookOpen,
      title: 'Exams',
      description: 'Manage exams under boards (CSE, CMS, etc.)',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      to: '/admin/subjects',
      icon: ClipboardList,
      title: 'Subjects',
      description: 'Manage subjects (Geography, History, etc.)',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      to: '/admin/question-papers',
      icon: FileText,
      title: 'Question Papers',
      description: 'Manage question papers (PYQ 2024, Section I, etc.)',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
    {
      to: '/admin/questions',
      icon: HelpCircle,
      title: 'Questions',
      description: 'Create and manage individual questions',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage your entire question bank hierarchy</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <GraduationCap className="text-blue-600" size={20} />
              </div>
              <TrendingUp className="text-green-500" size={16} />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.boards}</p>
            <p className="text-sm text-gray-600">Boards</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <BookOpen className="text-purple-600" size={20} />
              </div>
              <TrendingUp className="text-green-500" size={16} />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.exams}</p>
            <p className="text-sm text-gray-600">Exams</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <ClipboardList className="text-green-600" size={20} />
              </div>
              <TrendingUp className="text-green-500" size={16} />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.subjects}</p>
            <p className="text-sm text-gray-600">Subjects</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <FileText className="text-orange-600" size={20} />
              </div>
              <TrendingUp className="text-green-500" size={16} />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.questionPapers}</p>
            <p className="text-sm text-gray-600">Papers</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center">
                <HelpCircle className="text-pink-600" size={20} />
              </div>
              <TrendingUp className="text-green-500" size={16} />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.questions}</p>
            <p className="text-sm text-gray-600">Questions</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                <FileText className="text-yellow-600" size={20} />
              </div>
              <span className="text-yellow-600 text-xs font-medium">DRAFT</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingQuestions}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>

        {/* Hierarchy Information */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 mb-12 border border-indigo-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Content Hierarchy</h2>
          <div className="flex items-center gap-3 text-lg font-medium text-gray-700">
            <span className="px-4 py-2 bg-white rounded-lg shadow-sm">Board</span>
            <span className="text-gray-400">→</span>
            <span className="px-4 py-2 bg-white rounded-lg shadow-sm">Exam</span>
            <span className="text-gray-400">→</span>
            <span className="px-4 py-2 bg-white rounded-lg shadow-sm">Subject</span>
            <span className="text-gray-400">→</span>
            <span className="px-4 py-2 bg-white rounded-lg shadow-sm">Question Paper</span>
            <span className="text-gray-400">→</span>
            <span className="px-4 py-2 bg-white rounded-lg shadow-sm">Questions</span>
          </div>
          <p className="text-gray-600 mt-4">
            Example: <span className="font-medium">UPSC → CSE → Geography → PYQ 2024 → Questions</span>
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-transparent transition-all duration-300 overflow-hidden"
                >
                  <div className={`h-2 bg-gradient-to-r ${link.color}`}></div>
                  <div className="p-6">
                    <div className={`w-14 h-14 ${link.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={link.textColor} size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {link.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
