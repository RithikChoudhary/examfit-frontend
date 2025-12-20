import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Upload, HelpCircle, ChevronDown, Filter } from 'lucide-react';
import axios from 'axios';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

// Use shared API URL utility
import { getApiBaseUrl } from '../../../utils/apiConfig';
const API_URL = getApiBaseUrl();

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [boards, setBoards] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questionPapers, setQuestionPapers] = useState([]);
  
  // Filter states
  const [filterBoard, setFilterBoard] = useState('');
  const [filterExam, setFilterExam] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterQuestionPaper, setFilterQuestionPaper] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  const [formData, setFormData] = useState({
    text: '',
    options: [{ text: '', media: '' }, { text: '', media: '' }, { text: '', media: '' }, { text: '', media: '' }],
    correctIndex: 0,
    explanation: '',
    board: '',
    exam: '',
    subject: '',
    questionPaper: '',
    difficulty: 'medium',
    status: 'published',
    media: [], // Array of base64 image strings for question images
  });

  // Bulk upload state
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkData, setBulkData] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedQuestionPaper, setSelectedQuestionPaper] = useState('');

  // Stats
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch questions when filter changes
  useEffect(() => {
    if (filterQuestionPaper) {
      fetchQuestions();
    } else {
      setQuestions([]);
    }
  }, [filterQuestionPaper]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const [boardsRes, examsRes, subjectsRes, papersRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/boards`, { headers }),
        axios.get(`${API_URL}/exams`, { headers }),
        axios.get(`${API_URL}/subject`, { headers }),
        axios.get(`${API_URL}/question-papers`, { headers }),
        axios.get(`${API_URL}/questions?limit=1`, { headers }), // Just to get total count
      ]);

      const boardsData = Array.isArray(boardsRes.data) ? boardsRes.data : boardsRes.data.boards || [];
      setBoards(boardsData);
      
      const examsData = Array.isArray(examsRes.data) ? examsRes.data : examsRes.data.exams || [];
      examsData.forEach(e => { e.name = e.name || e.title; });
      setExams(examsData);
      
      setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : subjectsRes.data.subjects || []);
      setQuestionPapers(Array.isArray(papersRes.data) ? papersRes.data : papersRes.data.questionPapers || []);
      setTotalQuestions(statsRes.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    if (!filterQuestionPaper) return;
    
    try {
      setQuestionsLoading(true);
      const headers = getAuthHeaders();
      const response = await axios.get(
        `${API_URL}/questions?questionPaper=${filterQuestionPaper}&all=true`,
        { headers }
      );
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to fetch questions');
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleOpenModal = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      
      // Debug: Log the raw question object first
      console.log('[handleOpenModal] Raw question object:', {
        _id: question._id,
        hasCorrectIndex: 'correctIndex' in question,
        correctIndex: question.correctIndex,
        correctIndexType: typeof question.correctIndex,
        options: question.options,
        optionsLength: question.options?.length,
      });
      
      // Ensure correctIndex is a number (could be string from DB or undefined)
      // Use strict check - only default to 0 if it's actually undefined/null
      let correctIdx = 0;
      if (question.correctIndex !== undefined && question.correctIndex !== null) {
        correctIdx = parseInt(question.correctIndex, 10);
        // Ensure it's a valid number and within range
        if (isNaN(correctIdx) || correctIdx < 0) {
          console.warn('[handleOpenModal] Invalid correctIndex, defaulting to 0:', question.correctIndex);
          correctIdx = 0;
        }
      } else {
        console.warn('[handleOpenModal] correctIndex is undefined/null, defaulting to 0');
      }
      
      // Ensure options have media field
      const optionsWithMedia = (question.options || []).map(opt => ({
        text: opt.text || '',
        media: opt.media || '',
      }));
      
      // Pad to 4 options if needed (padding at the end, so correctIndex remains valid)
      while (optionsWithMedia.length < 4) {
        optionsWithMedia.push({ text: '', media: '' });
      }
      
      // Ensure correctIndex is within bounds of the actual options (before padding)
      const originalOptionsCount = question.options?.length || 0;
      if (correctIdx >= originalOptionsCount && originalOptionsCount > 0) {
        console.warn(`[handleOpenModal] correctIndex ${correctIdx} is out of bounds (options count: ${originalOptionsCount}), clamping to ${originalOptionsCount - 1}`);
        correctIdx = Math.min(correctIdx, originalOptionsCount - 1);
      }
      
      // Debug logging
      console.log('[handleOpenModal] Processed data:', {
        questionId: question._id,
        correctIndexFromDB: question.correctIndex,
        correctIndexProcessed: correctIdx,
        originalOptionsCount: originalOptionsCount,
        optionsAfterPadding: optionsWithMedia.length,
        options: optionsWithMedia.map((opt, idx) => `${idx}: "${opt.text?.substring(0, 30)}"`),
        correctOptionText: optionsWithMedia[correctIdx]?.text?.substring(0, 50),
      });
      
      setFormData({
        text: question.text,
        options: optionsWithMedia,
        correctIndex: correctIdx,
        explanation: question.explanation || '',
        board: filterBoard || '',
        exam: filterExam || '',
        subject: filterSubject || '',
        questionPaper: filterQuestionPaper || '',
        difficulty: question.difficulty || 'medium',
        status: question.status || 'published',
        media: question.media || [],
      });
      
      console.log('[handleOpenModal] FormData set with correctIndex:', correctIdx);
    } else {
      setEditingQuestion(null);
      setFormData({
        text: '',
        options: [{ text: '', media: '' }, { text: '', media: '' }, { text: '', media: '' }, { text: '', media: '' }],
        correctIndex: 0,
        explanation: '',
        board: filterBoard || '',
        exam: filterExam || '',
        subject: filterSubject || '',
        questionPaper: filterQuestionPaper || '',
        difficulty: 'medium',
        status: 'published',
        media: [],
      });
    }
    setIsModalOpen(true);
  };

  // Debug: Log formData changes, especially correctIndex
  useEffect(() => {
    if (isModalOpen && editingQuestion) {
      console.log('[useEffect] FormData correctIndex:', formData.correctIndex, 'Type:', typeof formData.correctIndex);
    }
  }, [formData.correctIndex, isModalOpen, editingQuestion]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const headers = getAuthHeaders();
      
      // Clean up options - remove empty media strings
      const cleanedOptions = formData.options.map(opt => ({
        text: opt.text,
        media: (opt.media && opt.media.trim() !== '') ? opt.media : null,
      }));
      
      // Clean up media array - remove empty strings and null values
      const cleanedMedia = formData.media
        .filter(img => img && img.trim() !== '')
        .map(img => img.trim());
      
      const payload = {
        text: formData.text,
        options: cleanedOptions,
        correctIndex: formData.correctIndex,
        explanation: formData.explanation || '',
        questionPaper: formData.questionPaper,
        subject: formData.subject,
        exam: formData.exam,
        difficulty: formData.difficulty,
        status: formData.status,
        media: cleanedMedia.length > 0 ? cleanedMedia : [], // Ensure it's an array
      };

      console.log('Submitting question payload:', {
        ...payload,
        options: payload.options.map(opt => ({ text: opt.text, hasMedia: !!opt.media })),
        mediaCount: payload.media.length,
      });

      if (editingQuestion) {
        await axios.patch(`${API_URL}/questions/${editingQuestion._id}`, payload, { headers });
        toast.success('Question updated successfully');
      } else {
        await axios.post(`${API_URL}/questions`, payload, { headers });
        toast.success('Question created successfully');
      }
      
      handleCloseModal();
      fetchQuestions();
      fetchInitialData(); // Refresh stats
    } catch (error) {
      console.error('Error saving question:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to save question';
      toast.error(errorMessage);
      
      // Log full error details for debugging
      if (error.response?.data) {
        console.error('Backend error details:', error.response.data);
    }
    }
  };

  // Convert image file to base64
  const handleImageUpload = (file, type, index = null) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('Please select an image file'));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('Image size must be less than 5MB'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        resolve(base64String);
      };
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(file);
    });
  };

  // Handle question image upload
  const handleQuestionImageUpload = async (e, index = null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await handleImageUpload(file);
      
      if (index !== null) {
        // Update existing image at index
        const newMedia = [...formData.media];
        newMedia[index] = base64;
        setFormData({ ...formData, media: newMedia });
      } else {
        // Add new image
        setFormData({ ...formData, media: [...formData.media, base64] });
      }
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
    }
    // Reset input
    e.target.value = '';
  };

  // Handle option image upload
  const handleOptionImageUpload = async (e, optionIndex) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await handleImageUpload(file);
      const newOptions = [...formData.options];
      newOptions[optionIndex] = { ...newOptions[optionIndex], media: base64 };
      setFormData({ ...formData, options: newOptions });
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
    }
    // Reset input
    e.target.value = '';
  };

  // Remove question image
  const handleRemoveQuestionImage = (index) => {
    const newMedia = formData.media.filter((_, i) => i !== index);
    setFormData({ ...formData, media: newMedia });
  };

  // Remove option image
  const handleRemoveOptionImage = (optionIndex) => {
    const newOptions = [...formData.options];
    newOptions[optionIndex] = { ...newOptions[optionIndex], media: '' };
    setFormData({ ...formData, options: newOptions });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      const headers = getAuthHeaders();
      await axios.delete(`${API_URL}/questions/${id}`, { headers });
      toast.success('Question deleted successfully');
      fetchQuestions();
      fetchInitialData();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('Failed to delete question');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkFile(file);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        let parsedData = [];

        if (file.name.endsWith('.csv')) {
          Papa.parse(data, {
            header: true,
            complete: (results) => {
              parsedData = results.data.filter(row => row.Question || row.question || row.text);
              setBulkData(parsedData);
            },
          });
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet).filter(row => row.Question || row.question || row.text);
          
          // Debug: Log first row to see actual column names
          if (parsedData.length > 0) {
            console.log('Excel file parsed. First row keys:', Object.keys(parsedData[0]));
            console.log('First row data:', parsedData[0]);
            console.log('Sample correct answer value:', parsedData[0]['Correct Answer'], 'Type:', typeof parsedData[0]['Correct Answer']);
          }
          
          setBulkData(parsedData);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error('Failed to parse file');
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedBoard || !selectedExam || !selectedSubject || !selectedQuestionPaper) {
      toast.error('Please select Board, Exam, Subject, and Question Paper');
      return;
    }

    if (!bulkData || bulkData.length === 0) {
      toast.error('No data to upload');
      return;
    }

    try {
      const headers = getAuthHeaders();
      const questionsToUpload = bulkData
        .map((row, index) => {
          const questionText = String(row.Question || row.question || row.text || '').trim();
          
          // Get all 4 options as strings
          const option1Text = String(row['Option 1'] || row.option1 || row['Option1'] || '').trim();
          const option2Text = String(row['Option 2'] || row.option2 || row['Option2'] || '').trim();
          const option3Text = String(row['Option 3'] || row.option3 || row['Option3'] || '').trim();
          const option4Text = String(row['Option 4'] || row.option4 || row['Option4'] || '').trim();
          
          // Store all options with their original positions (0-3)
          const allOptionsWithIndex = [
            { text: option1Text, originalPos: 1 },
            { text: option2Text, originalPos: 2 },
            { text: option3Text, originalPos: 3 },
            { text: option4Text, originalPos: 4 },
          ];
          
          // Parse correct answer from Excel (typically 1-4, meaning Option 1-4)
          // Try all possible column name variations
          const correctAnswerValue = 
            row['Correct Answer'] !== undefined ? row['Correct Answer'] :
            row['CorrectAnswer'] !== undefined ? row['CorrectAnswer'] :
            row.correctAnswer !== undefined ? row.correctAnswer :
            row['Correct'] !== undefined ? row['Correct'] :
            row.correct !== undefined ? row.correct :
            row.correctIndex !== undefined ? row.correctIndex :
            row['Correct Index'] !== undefined ? row['Correct Index'] :
            row['Answer'] !== undefined ? row['Answer'] :
            row.answer !== undefined ? row.answer :
            null;
          
          // Convert to string and parse - handle both string and number from Excel
          let correctAnswerNum;
          let correctAnswerStr = ''; // For debug logging
          
          if (correctAnswerValue === null || correctAnswerValue === undefined) {
            console.warn(`Question ${index + 1}: No correct answer found, defaulting to 1`);
            correctAnswerNum = 1;
            correctAnswerStr = '1 (default)';
          } else if (typeof correctAnswerValue === 'number') {
            // Excel might return it as a number directly
            correctAnswerNum = correctAnswerValue;
            correctAnswerStr = String(correctAnswerValue);
          } else {
            // It's a string, parse it
            correctAnswerStr = String(correctAnswerValue).trim();
            correctAnswerNum = parseInt(correctAnswerStr);
            
            // If not a valid number 1-4, try parsing as letter (A-D)
            if (isNaN(correctAnswerNum) || correctAnswerNum < 1 || correctAnswerNum > 4) {
              const upper = correctAnswerStr.toUpperCase();
              if (upper === 'A') correctAnswerNum = 1;
              else if (upper === 'B') correctAnswerNum = 2;
              else if (upper === 'C') correctAnswerNum = 3;
              else if (upper === 'D') correctAnswerNum = 4;
              else {
                console.warn(`Question ${index + 1}: Invalid correct answer "${correctAnswerStr}", defaulting to 1`);
                correctAnswerNum = 1;
              }
            }
          }
          
          // Ensure it's 1-4
          if (correctAnswerNum < 1 || correctAnswerNum > 4) {
            console.warn(`Question ${index + 1}: Correct answer out of range: ${correctAnswerNum}, defaulting to 1`);
            correctAnswerNum = 1;
          }
          
          // Debug first 3 rows
          if (index < 3) {
            console.log(`\n=== Row ${index + 1} Debug ===`);
            console.log('Correct Answer column value:', correctAnswerValue, 'Type:', typeof correctAnswerValue);
            console.log('Parsed correct answer number:', correctAnswerNum, '(from "' + correctAnswerStr + '")');
            console.log('Option texts:', {
              opt1: option1Text.substring(0, 20),
              opt2: option2Text.substring(0, 20),
              opt3: option3Text.substring(0, 20),
              opt4: option4Text.substring(0, 20),
            });
          }
          
          // Get the text of the correct option (1-4, convert to 0-3 for array index)
          const correctOptionIndex = correctAnswerNum - 1; // Convert 1-4 to 0-3
          const correctOptionText = allOptionsWithIndex[correctOptionIndex]?.text || '';
          
          // Debug first 3 rows
          if (index < 3) {
            console.log(`Correct option index: ${correctOptionIndex}, text: "${correctOptionText}"`);
          }
          
          // Filter out empty options and build final options array
          const validOptions = allOptionsWithIndex.filter(opt => opt.text && opt.text !== '');
          
          // Find the index of the correct option in the filtered array
          // First try to match by originalPos (most reliable)
          let correctIndex = validOptions.findIndex(opt => opt.originalPos === correctAnswerNum);
          
          // If not found by originalPos, try matching by text (trimmed for safety)
          if (correctIndex < 0 && correctOptionText) {
            correctIndex = validOptions.findIndex(opt => opt.text.trim() === correctOptionText.trim());
          }
          
          // Debug first 3 rows
          if (index < 3) {
            console.log(`Valid options count: ${validOptions.length}`);
            console.log(`Looking for correct answer: ${correctAnswerNum} (originalPos)`);
            console.log(`Correct option text: "${correctOptionText}"`);
            console.log(`Found correct index in filtered array: ${correctIndex}`);
            if (correctIndex >= 0) {
              console.log(`✓ Matched! Final correctIndex: ${correctIndex}, option text: "${validOptions[correctIndex].text}"`);
            } else {
              console.log(`✗ NOT FOUND - will default to 0`);
            }
          }
          
          // If correct option text was empty or not found, default to first option
          if (correctIndex < 0 || !correctOptionText) {
            console.warn(`Question ${index + 1}: Correct answer "${correctAnswerNum}" (Option ${correctAnswerNum}) not found in filtered options. Text was: "${correctOptionText}". Defaulting to first option.`);
            correctIndex = 0;
          }
          
          // Final options array (just text, no metadata)
          const options = validOptions.map(opt => ({ text: opt.text }));
          
          // Ensure correctIndex is a number (not string)
          const finalCorrectIndex = Number(correctIndex);
          
          return {
            text: questionText,
            options: options,
            correctIndex: finalCorrectIndex, // Ensure it's a number
            explanation: String(row.Explanation || row.explanation || '').trim(),
            questionPaper: selectedQuestionPaper,
            subject: selectedSubject,
            exam: selectedExam,
            difficulty: String(row.Difficulty || row.difficulty || 'medium').toLowerCase(),
            status: 'published',
          };
        })
        .filter(q => q.text && q.text !== '' && q.options.length >= 2); // Only keep valid questions
      
      if (questionsToUpload.length === 0) {
        toast.error('No valid questions found in file. Please check the file format.');
        return;
      }
      
      // Debug log for first few questions - show what we're actually sending
      console.log('\n=== READY TO UPLOAD ===');
      console.log(`Total questions: ${questionsToUpload.length}`);
      questionsToUpload.slice(0, 5).forEach((q, idx) => {
        console.log(`\nQuestion ${idx + 1}:`, {
          text: q.text?.substring(0, 60),
          optionsCount: q.options?.length,
          correctIndex: q.correctIndex,
          options: q.options?.map((opt, i) => `${i}: "${opt.text?.substring(0, 25)}"`),
          correctOption: `Option ${q.correctIndex}: "${q.options[q.correctIndex]?.text?.substring(0, 40)}"`,
        });
      });

      const response = await axios.post(`${API_URL}/questions/bulk`, { 
        questions: questionsToUpload,
        exam: selectedExam,
        subject: selectedSubject,
        questionPaper: selectedQuestionPaper
      }, { headers });
      
      // Check if there were any errors in the response
      if (response.data.errors && response.data.errors.length > 0) {
        console.warn('Some questions had errors:', response.data.errors);
        toast.error(`Uploaded ${response.data.saved} questions, but ${response.data.errors.length} had errors. Check console for details.`);
      } else {
        toast.success(response.data.message || `${response.data.saved} questions uploaded successfully`);
      }
      setIsBulkModalOpen(false);
      setBulkFile(null);
      setBulkData([]);
      fetchInitialData();
      if (filterQuestionPaper === selectedQuestionPaper) {
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error uploading questions:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to upload questions';
      toast.error(errorMessage);
      
      // Log full error details for debugging
      if (error.response?.data) {
        console.error('Backend error details:', error.response.data);
      }
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

  const getFilteredQuestionPapers = (subjectId) => {
    if (!subjectId) return [];
    return questionPapers.filter(qp => String(qp.subject?._id || qp.subject) === subjectId);
  };

  // Get question paper details
  const selectedPaper = questionPapers.find(p => p._id === filterQuestionPaper);
  const selectedSubjectObj = subjects.find(s => s._id === filterSubject);
  const selectedExamObj = exams.find(e => e._id === filterExam);

  const filteredQuestions = questions.filter(q =>
    q.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                Manage Questions
              </h1>
              <p className="text-gray-600">Select a question paper to view and manage questions</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <Upload size={20} />
                Bulk Upload
              </button>
              <button
                onClick={() => handleOpenModal()}
                disabled={!filterQuestionPaper}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={20} />
                Add Question
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <p className="text-sm text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <p className="text-sm text-gray-600">Question Papers</p>
              <p className="text-2xl font-bold text-gray-900">{questionPapers.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <p className="text-sm text-gray-600">Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <p className="text-sm text-gray-600">Exams</p>
              <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
            </div>
          </div>

          {/* Hierarchy Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className="text-indigo-600" />
              <h3 className="font-semibold text-gray-900">Select Question Paper</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Board</label>
                <select
                  value={filterBoard}
                  onChange={(e) => {
                    setFilterBoard(e.target.value);
                    setFilterExam('');
                    setFilterSubject('');
                    setFilterQuestionPaper('');
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
                    setFilterQuestionPaper('');
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
                  onChange={(e) => {
                    setFilterSubject(e.target.value);
                    setFilterQuestionPaper('');
                  }}
                  disabled={!filterExam}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                >
                  <option value="">Select Subject</option>
                  {getFilteredSubjects(filterExam).map((subject) => (
                    <option key={subject._id} value={subject._id}>{subject.icon} {subject.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Paper</label>
                <select
                  value={filterQuestionPaper}
                  onChange={(e) => setFilterQuestionPaper(e.target.value)}
                  disabled={!filterSubject}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                >
                  <option value="">Select Question Paper</option>
                  {getFilteredQuestionPapers(filterSubject).map((paper) => (
                    <option key={paper._id} value={paper._id}>{paper.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Search Bar - Only show when paper is selected */}
          {filterQuestionPaper && (
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Questions List */}
        {!filterQuestionPaper ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter size={32} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Question Paper</h3>
            <p className="text-gray-600">Use the filters above to select Board → Exam → Subject → Question Paper</p>
          </div>
        ) : questionsLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading questions...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Paper Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedPaper?.name}</h3>
                  <p className="text-white/70 text-sm mt-1">
                    {selectedSubjectObj?.icon} {selectedSubjectObj?.name} • {selectedExamObj?.title || selectedExamObj?.name}
                  </p>
                </div>
                <span className="px-4 py-2 bg-white/20 rounded-lg text-white font-medium">
                  {filteredQuestions.length} Questions
                </span>
              </div>
            </div>

            {/* Questions */}
            <div className="p-6">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <HelpCircle size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No questions found in this paper</p>
                  <button
                    onClick={() => handleOpenModal()}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add First Question
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQuestions.map((question, index) => (
                    <div
                      key={question._id}
                      className="group bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Q{index + 1}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              question.status === 'published' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {question.status}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              question.difficulty === 'easy' 
                                ? 'bg-blue-100 text-blue-700' 
                                : question.difficulty === 'medium'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {question.difficulty}
                            </span>
                          </div>
                          <p className="text-gray-900 font-medium mb-3 whitespace-pre-line">{question.text}</p>
                          
                          {/* Question Images */}
                          {question.media && question.media.length > 0 && (
                            <div className="mb-3 space-y-2">
                              {question.media.map((image, imgIdx) => (
                                <img
                                  key={imgIdx}
                                  src={image}
                                  alt={`Question image ${imgIdx + 1}`}
                                  className="max-w-full h-auto max-h-48 rounded-lg border border-gray-200"
                                />
                              ))}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {question.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className={`text-sm p-2 rounded ${
                                  optIndex === question.correctIndex
                                    ? 'bg-green-50 text-green-700 font-medium border border-green-200'
                                    : 'bg-gray-50 text-gray-600'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <span>{String.fromCharCode(65 + optIndex)}.</span>
                                  <div className="flex-1">
                                    <span>{option.text}</span>
                                    {option.media && (
                                      <img
                                        src={option.media}
                                        alt={`Option ${String.fromCharCode(65 + optIndex)} image`}
                                        className="mt-2 max-w-full h-auto max-h-32 rounded border border-gray-200"
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                              <p className="text-sm text-blue-900 whitespace-pre-line">
                                <strong>Explanation:</strong> {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleOpenModal(question)}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(question._id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingQuestion ? 'Edit Question' : 'Create New Question'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Hierarchy Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Board *</label>
                  <select
                    value={formData.board}
                    onChange={(e) => setFormData({ ...formData, board: e.target.value, exam: '', subject: '', questionPaper: '' })}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Board</option>
                    {boards.map((board) => (
                      <option key={board._id} value={board._id}>{board.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam *</label>
                  <select
                    value={formData.exam}
                    onChange={(e) => setFormData({ ...formData, exam: e.target.value, subject: '', questionPaper: '' })}
                    required
                    disabled={!formData.board}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Exam</option>
                    {getFilteredExams(formData.board).map((exam) => (
                      <option key={exam._id} value={exam._id}>{exam.title || exam.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value, questionPaper: '' })}
                    required
                    disabled={!formData.exam}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Subject</option>
                    {getFilteredSubjects(formData.exam).map((subject) => (
                      <option key={subject._id} value={subject._id}>{subject.icon} {subject.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Paper *</label>
                  <select
                    value={formData.questionPaper}
                    onChange={(e) => setFormData({ ...formData, questionPaper: e.target.value })}
                    required
                    disabled={!formData.subject}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Question Paper</option>
                    {getFilteredQuestionPapers(formData.subject).map((paper) => (
                      <option key={paper._id} value={paper._id}>{paper.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question Text *</label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter the question text..."
                />
              </div>

              {/* Question Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Images
                  <span className="text-xs text-gray-500 ml-2">(Optional - Max 5MB per image)</span>
                </label>
                <div className="space-y-3">
                  {/* Existing Images */}
                  {formData.media.map((image, index) => (
                    <div key={index} className="relative border border-gray-200 rounded-xl p-3 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <img 
                          src={image} 
                          alt={`Question image ${index + 1}`}
                          className="w-24 h-24 object-contain rounded-lg border border-gray-200"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Image {index + 1}</p>
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestionImage(index)}
                            className="mt-2 text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                        <label className="cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                          Replace
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleQuestionImageUpload(e, index)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add New Image Button */}
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-sm text-gray-600">
                    <Upload size={18} />
                    Add Question Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQuestionImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Options *</label>
                <div className="space-y-4">
                  {formData.options.map((option, index) => {
                    // Ensure both values are numbers for comparison
                    const isChecked = Number(formData.correctIndex) === Number(index);
                    return (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-center gap-3 mb-3">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={isChecked}
                        onChange={() => {
                          console.log(`[Radio] Changing correctIndex from ${formData.correctIndex} to ${index}`);
                          setFormData({ ...formData, correctIndex: Number(index) });
                        }}
                        className="w-5 h-5 text-indigo-600"
                      />
                      <span className="text-sm font-medium text-gray-600 w-8">{String.fromCharCode(65 + index)}.</span>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                            newOptions[index] = { ...newOptions[index], text: e.target.value };
                          setFormData({ ...formData, options: newOptions });
                        }}
                        required
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          placeholder={`Option ${index + 1} text`}
                      />
                      </div>
                      
                      {/* Option Image */}
                      <div className="ml-8">
                        {option.media ? (
                          <div className="flex items-center gap-3">
                            <img 
                              src={option.media} 
                              alt={`Option ${String.fromCharCode(65 + index)} image`}
                              className="w-24 h-24 object-contain rounded-lg border border-gray-200 bg-white"
                            />
                            <div className="flex-1">
                              <p className="text-sm text-gray-600">Option {String.fromCharCode(65 + index)} Image</p>
                              <div className="flex gap-2 mt-2">
                                <label className="cursor-pointer px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs">
                                  Replace
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleOptionImageUpload(e, index)}
                                    className="hidden"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOptionImage(index)}
                                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-xs text-gray-600">
                            <Upload size={14} />
                            Add Image to Option {String.fromCharCode(65 + index)}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleOptionImageUpload(e, index)}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Explanation</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Provide an explanation for the correct answer..."
                />
              </div>

              {/* Difficulty and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
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
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4">
              <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Questions</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Hierarchy Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Board *</label>
                  <select
                    value={selectedBoard}
                    onChange={(e) => {
                      setSelectedBoard(e.target.value);
                      setSelectedExam('');
                      setSelectedSubject('');
                      setSelectedQuestionPaper('');
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam *</label>
                  <select
                    value={selectedExam}
                    onChange={(e) => {
                      setSelectedExam(e.target.value);
                      setSelectedSubject('');
                      setSelectedQuestionPaper('');
                    }}
                    disabled={!selectedBoard}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Exam</option>
                    {getFilteredExams(selectedBoard).map((exam) => (
                      <option key={exam._id} value={exam._id}>{exam.title || exam.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => {
                      setSelectedSubject(e.target.value);
                      setSelectedQuestionPaper('');
                    }}
                    disabled={!selectedExam}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Subject</option>
                    {getFilteredSubjects(selectedExam).map((subject) => (
                      <option key={subject._id} value={subject._id}>{subject.icon} {subject.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Paper *</label>
                  <select
                    value={selectedQuestionPaper}
                    onChange={(e) => setSelectedQuestionPaper(e.target.value)}
                    disabled={!selectedSubject}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  >
                    <option value="">Select Question Paper</option>
                    {getFilteredQuestionPapers(selectedSubject).map((paper) => (
                      <option key={paper._id} value={paper._id}>{paper.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload File (CSV or Excel) *</label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {bulkData.length > 0 && (
                  <p className="mt-2 text-sm text-green-600">✓ {bulkData.length} questions loaded from file</p>
                )}
              </div>

              {/* Format Info */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-2">File Format</h3>
                <p className="text-sm text-blue-700">
                  Columns: Question, Option 1, Option 2, Option 3, Option 4, Correct Answer (1-4), Explanation, Difficulty
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsBulkModalOpen(false);
                    setBulkFile(null);
                    setBulkData([]);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkUpload}
                  disabled={!selectedBoard || !selectedExam || !selectedSubject || !selectedQuestionPaper || bulkData.length === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload {bulkData.length} Questions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestions;
