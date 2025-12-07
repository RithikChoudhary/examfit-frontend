import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../../services/api';
import './TakeTest.css';

const TakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const autosaveIntervalRef = useRef(null);
  
  const QUESTIONS_PER_PAGE = 30;

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTest();
    setCurrentPage(1); // Reset to first page when test changes
    return () => {
      if (autosaveIntervalRef.current) {
        clearInterval(autosaveIntervalRef.current);
      }
    };
  }, [testId]);
  
  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    if (test && Object.keys(answers).length > 0) {
      autosaveIntervalRef.current = setInterval(() => {
        autosaveAnswers();
      }, 10000);
      return () => {
        if (autosaveIntervalRef.current) {
          clearInterval(autosaveIntervalRef.current);
        }
      };
    }
  }, [answers, test]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      const resultResponse = await studentAPI.getTestResult(testId);
      
      if (resultResponse.data.submitted) {
        navigate(`/results/${testId}`);
        return;
      }
      
      // Load in-progress test
      if (resultResponse.data.questions) {
        console.log('Test data received:', resultResponse.data);
        console.log('First question correctIndex:', resultResponse.data.questions[0]?.correctIndex);
        
        let displayTitle = 'Practice Test';
        if (resultResponse.data.subject && resultResponse.data.subject.name) {
          displayTitle = resultResponse.data.subject.name;
        } else if (resultResponse.data.exam) {
          displayTitle = resultResponse.data.exam.title || 'Exam';
        }
        
        setTest({
          exam: resultResponse.data.exam || { title: 'Exam' },
          subject: resultResponse.data.subject,
          questionPaperId: resultResponse.data.questionPaperId,
          displayTitle: displayTitle,
          questions: resultResponse.data.questions,
        });
        
        const initialAnswers = {};
        resultResponse.data.questions.forEach((q) => {
          initialAnswers[q._id] = null;
        });
        setAnswers(initialAnswers);
      } else {
        alert('Test not found. Please start a new test.');
        navigate('/exams');
      }
    } catch (error) {
      console.error('Error fetching test:', error);
      alert('Error loading test. Please start a new test.');
      navigate('/exams');
    } finally {
      setLoading(false);
    }
  };

  const autosaveAnswers = async () => {
    try {
      for (const [questionId, answer] of Object.entries(answers)) {
        if (answer !== null && answer !== undefined) {
          console.log('Autosaving answer:', { questionId, answer, type: typeof answer });
          await studentAPI.saveAnswer(testId, {
            questionId,
            answer,
          });
        }
      }
    } catch (error) {
      console.error('Autosave error:', error);
    }
  };

  const handleAnswerChange = async (questionId, answer) => {
    // Prevent changing answer if already answered
    if (answers[questionId] !== null && answers[questionId] !== undefined) {
      return;
    }

    console.log('Answer selected:', { questionId, answer, type: typeof answer });
    const numAnswer = Number(answer);
    setAnswers({ ...answers, [questionId]: numAnswer });
    
    // Immediately save to backend
    try {
      await studentAPI.saveAnswer(testId, { questionId, answer: numAnswer });
      console.log('Answer saved successfully:', { questionId, answer: numAnswer });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit the test?')) return;

    try {
      console.log('Submitting test with answers:', answers);
      const response = await studentAPI.submitTest(testId);
      console.log('Submit response:', response.data);
      navigate(`/results/${testId}`);
    } catch (error) {
      console.error('Submit error:', error);
      alert(error.response?.data?.error || 'Error submitting test');
    }
  };

  const handleResetTest = async () => {
    if (!window.confirm('Are you sure you want to reset the test? This will delete your current progress and start a new test.')) return;

    try {
      // Delete current test
      await studentAPI.deleteTest(testId);
      
      // Create new test with same parameters (preserve questionPaperId if it exists)
      const payload = {};
      if (test.questionPaperId) {
        // If test was created from a question paper, reset with same question paper
        payload.questionPaperId = test.questionPaperId;
      } else if (test.exam?._id) {
        // Otherwise use exam and subject
        payload.examId = test.exam._id;
        if (test.subject?._id) {
          payload.subjectId = test.subject._id;
        }
      } else {
        alert('Cannot reset test: Missing test information');
        return;
      }
      
      const response = await studentAPI.createTest(payload);
      
      if (response.data.testId) {
        // Navigate to new test
        navigate(`/test/${response.data.testId}`, { replace: true });
        // Force refresh
        window.location.reload();
      }
    } catch (error) {
      console.error('Reset error:', error);
      alert(error.response?.data?.error || 'Error resetting test');
    }
  };

  if (loading || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your test...</p>
        </div>
      </div>
    );
  }

  const totalQuestions = test.questions.length;
  const answeredCount = Object.values(answers).filter(a => a !== null && a !== undefined).length;
  
  // Pagination calculations
  const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);
  const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const endIndex = startIndex + QUESTIONS_PER_PAGE;
  const currentPageQuestions = test.questions.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block border-[3px] border-gray-900 px-8 py-3 mb-6 bg-white">
            <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide" style={{ letterSpacing: '0.05em' }}>
              {test.displayTitle || test.exam.title} QUESTIONS
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-4">
            <div className="text-sm font-medium text-gray-600">
              Progress: {answeredCount} / {totalQuestions} answered
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleResetTest}
                className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-all"
              >
                🔄 Reset Test
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-semibold shadow-md hover:shadow-lg transition-all"
              >
                ✓ Submit Test
              </button>
            </div>
          </div>
        </div>

        {/* Pagination Info */}
        {totalPages > 1 && (
          <div className="mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-6">
          {currentPageQuestions.map((question, localIdx) => {
            const globalIdx = startIndex + localIdx;
            const userAnswer = answers[question._id];
            const isAnswered = userAnswer !== null && userAnswer !== undefined;
            const isCorrect = isAnswered && userAnswer === question.correctIndex;

            return (
              <div key={question._id} className="bg-white rounded-2xl border-[3px] border-blue-600 shadow-md overflow-hidden">
                {/* Question */}
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-base">
                      #{question.questionNumber || globalIdx + 1}
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="text-base font-medium text-gray-800 leading-relaxed whitespace-pre-line">
                        {question.text}
                      </p>
                    </div>
                  </div>

                  {/* Question Media */}
                  {question.media && question.media.length > 0 && (
                    <div className="mb-5 ml-15 space-y-3">
                      {question.media.map((url, mediaIdx) => (
                        <img
                          key={mediaIdx}
                          src={url}
                          alt={`Question ${globalIdx + 1} media ${mediaIdx + 1}`}
                          className="max-w-full h-auto rounded-lg border border-gray-200"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-2.5">
                    {question.options.map((option, optionIdx) => {
                      const isSelected = userAnswer === optionIdx;
                      const correctIdx = Number(question.correctIndex);
                      const isCorrectOption = optionIdx === correctIdx;
                      
                      let optionClasses = 'bg-gray-50 border-gray-300';
                      
                      if (isAnswered) {
                        if (isCorrectOption) {
                          // Green for correct answer
                          optionClasses = 'bg-green-200 border-green-500';
                        } else if (isSelected) {
                          // Pink for incorrect selected answer
                          optionClasses = 'bg-pink-200 border-pink-500';
                        } else {
                          // Light gray for other options
                          optionClasses = 'bg-gray-100 border-gray-300';
                        }
                      } else if (isSelected) {
                        optionClasses = 'bg-blue-50 border-blue-600';
                      }

                      return (
                        <label
                          key={optionIdx}
                          className={`flex flex-col p-3.5 border-2 rounded-xl transition-all ${optionClasses} ${
                            isAnswered 
                              ? 'cursor-not-allowed opacity-90' 
                              : 'cursor-pointer hover:border-blue-600 hover:bg-blue-50'
                          }`}
                          onClick={(e) => {
                            // Prevent clicking if already answered
                            if (isAnswered) {
                              e.preventDefault();
                              e.stopPropagation();
                            }
                          }}
                        >
                          <div className="flex items-center">
                          <input
                            type="radio"
                            name={`question-${question._id}`}
                            value={optionIdx}
                            checked={isSelected}
                            disabled={isAnswered}
                            onChange={() => {
                              if (!isAnswered) {
                                handleAnswerChange(question._id, optionIdx);
                              }
                            }}
                            className="w-4 h-4 text-blue-600 focus:ring-0 mr-3.5 disabled:cursor-not-allowed"
                          />
                          <span className="font-medium text-gray-900 text-[15px] flex-1">
                              {String.fromCharCode(65 + optionIdx)}. {option.text}
                          </span>
                          {isAnswered && isCorrectOption && (
                            <span className="text-xl ml-2 text-green-700">✓</span>
                          )}
                          {isAnswered && isSelected && !isCorrectOption && (
                            <span className="text-xl ml-2 text-pink-700">✗</span>
                          )}
                          </div>
                          {option.media && (
                            <div className="mt-3 ml-7">
                            <img
                              src={option.media}
                                alt={`Option ${String.fromCharCode(65 + optionIdx)} image`}
                                className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200 bg-white"
                              loading="lazy"
                            />
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {/* Explanation - Show immediately after answering */}
                  {isAnswered && question.explanation && (
                    <div className="mt-5 bg-gray-50 rounded-xl border-l-4 border-blue-600 p-5 animate-fade-in">
                      <p className="text-blue-600 font-bold mb-2 text-sm">
                        Explanation:
                      </p>
                      <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-line">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination at Bottom */}
        {totalPages > 1 && (
          <div className="mt-8 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button at Bottom */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            className="px-12 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 font-bold text-base shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            ✓ Submit Test
          </button>
          <p className="mt-4 text-gray-600 text-sm">
            {answeredCount} of {totalQuestions} questions answered
          </p>
        </div>
      </div>
    </div>
  );
};

export default TakeTest;
