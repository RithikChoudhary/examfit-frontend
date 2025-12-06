import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import './Results.css';

const StudentResults = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchResult();
  }, [testId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getTestResult(testId);
      console.log('Test Result:', response.data);
      console.log('Score:', response.data.score);
      console.log('Correct:', response.data.correct);
      console.log('Total:', response.data.total);
      if (response.data.results && response.data.results.length > 0) {
        console.log('Sample question result:', response.data.results[0]);
      }
      setResult(response.data);
    } catch (error) {
      console.error('Error fetching result:', error);
      alert('Error loading results');
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeTest = async () => {
    try {
      // Extract test parameters to create a new test with same scope
      const payload = {};
      
      // Priority 1: If test was created from a question paper, use questionPaperId
      if (result.questionPaperId) {
        payload.questionPaperId = result.questionPaperId;
      } else if (result.examId) {
        // Priority 2: Use examId and subjectId if available
        payload.examId = result.examId;
        if (result.subjectId) {
          payload.subjectId = result.subjectId;
        }
      } else {
        alert('Cannot retake test: Test information not available');
        return;
      }
      
      console.log('Retaking test with payload:', payload);
      const response = await studentAPI.createTest(payload);
      if (response.data.testId) {
        navigate(`/test/${response.data.testId}`);
      }
    } catch (error) {
      console.error('Error creating new test:', error);
      alert(error.response?.data?.error || 'Error creating new test');
    }
  };

  if (loading || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  const percentage = Math.round(result.score);
  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getScoreEmoji = (score) => {
    if (score >= 80) return '🎉';
    if (score >= 60) return '👍';
    return '💪';
  };

  const getScoreMessage = (score) => {
    if (score >= 80) return 'Excellent Performance!';
    if (score >= 60) return 'Good Job!';
    return 'Keep Practicing!';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Results Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{getScoreEmoji(result.score)}</div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
              {getScoreMessage(result.score)}
            </h1>
            <p className="text-gray-600 text-lg">Here's how you performed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Score Card */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <div className="text-center">
                <div className="text-gray-600 text-sm font-bold mb-3 uppercase tracking-wide">Overall Score</div>
                <div className={`text-6xl font-extrabold bg-gradient-to-r ${getScoreColor(result.score)} bg-clip-text text-transparent mb-2`}>
                  {percentage}%
                </div>
                <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getScoreColor(result.score)} rounded-full transition-all duration-1000`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Correct Answers Card */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <div className="text-center">
                <div className="text-gray-600 text-sm font-bold mb-3 uppercase tracking-wide">Correct Answers</div>
                <div className="text-6xl font-extrabold text-green-600 mb-2">
                  {result.correct}
                  <span className="text-3xl text-gray-400">/{result.total}</span>
                </div>
                <div className="flex items-center justify-center gap-1 mt-4">
                  {[...Array(result.total)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-10 rounded-full ${
                        i < result.correct
                          ? 'bg-gradient-to-t from-green-500 to-green-600'
                          : 'bg-gray-200'
                      }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Below Results Summary */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <button
              onClick={handleRetakeTest}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retake Test
            </button>
            {result.examId && result.boardId && (
              <button
                onClick={() => navigate(`/subjects?exam=${result.examId}&board=${result.boardId}`)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                More Subjects
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-600 text-white rounded-xl hover:from-blue-800 hover:to-blue-700 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </button>
          </div>
        </div>

        {/* Question Review Section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <div className="inline-block border-[3px] border-gray-900 px-8 py-3 bg-white">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide" style={{ letterSpacing: '0.05em' }}>
                Detailed Review
              </h2>
            </div>
          </div>
          
          <div className="space-y-6">
            {result.results.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl border-[3px] border-blue-600 shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-base">
                      #{item.question.questionNumber || idx + 1}
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="text-base font-medium text-gray-800 leading-relaxed whitespace-pre-line">
                        {item.question.text}
                      </p>
                    </div>
                  </div>

                  {/* Question Media */}
                  {item.question.media && item.question.media.length > 0 && (
                    <div className="mb-5 ml-15 space-y-3">
                      {item.question.media.map((url, mediaIdx) => (
                        <img
                          key={mediaIdx}
                          src={url}
                          alt={`Question ${idx + 1} media ${mediaIdx + 1}`}
                          className="max-w-full h-auto rounded-lg border border-gray-200"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-2.5">
                    {item.question.options.map((option, optionIdx) => {
                      // Use Number() for consistent comparison
                      const userAnswer = Number(item.userAnswer);
                      const correctAnswer = Number(item.correctAnswer);
                      const isSelected = userAnswer === optionIdx;
                      const isCorrectOption = optionIdx === correctAnswer;
                      
                      let optionClasses = 'bg-gray-100 border-gray-300';
                      
                      if (isCorrectOption) {
                        optionClasses = 'bg-green-200 border-green-500';
                      } else if (isSelected && !isCorrectOption) {
                        optionClasses = 'bg-pink-200 border-pink-500';
                      }

                      return (
                        <div
                          key={optionIdx}
                          className={`flex items-center p-3.5 border-2 rounded-xl ${optionClasses}`}
                        >
                          <input
                            type="radio"
                            checked={isSelected}
                            disabled
                            readOnly
                            className="w-4 h-4 mr-3.5"
                          />
                          <span className="font-medium text-gray-900 text-[15px] flex-1">
                            {option.text}
                          </span>
                          {isCorrectOption && (
                            <span className="text-xl ml-2 text-green-700">✓</span>
                          )}
                          {isSelected && !isCorrectOption && (
                            <span className="text-xl ml-2 text-pink-700">✗</span>
                          )}
                          {option.media && (
                            <img
                              src={option.media}
                              alt={`Option ${optionIdx + 1}`}
                              className="mt-2 max-w-full h-auto rounded-lg ml-7 border border-gray-200"
                              loading="lazy"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {item.question.explanation && (
                    <div className="mt-5 bg-gray-50 rounded-xl border-l-4 border-blue-600 p-5">
                      <p className="text-blue-600 font-bold mb-2 text-sm">
                        Explanation:
                      </p>
                      <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-line">
                        {item.question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Message */}
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg font-medium">
            Keep practicing to improve your score! 🚀
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;
