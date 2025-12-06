import { memo } from 'react';

const QuestionCard = memo(({ question, selectedAnswer, showResult = false }) => {
  const isCorrect = showResult && selectedAnswer === question.correctIndex;
  const isIncorrect = showResult && selectedAnswer !== null && selectedAnswer !== question.correctIndex;

  return (
    <div className="bg-white rounded-2xl border-4 border-blue-600 shadow-xl overflow-hidden mb-6">
      {/* Question */}
      <div className="p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-lg">
            Q
          </div>
          <div className="flex-1">
            <p className="text-lg font-semibold text-gray-800 leading-relaxed whitespace-pre-line">
              {question.text}
            </p>
          </div>
        </div>

        {/* Question Media */}
        {question.media && question.media.length > 0 && (
          <div className="mb-6 space-y-4">
            {question.media.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Question media ${idx + 1}`}
                className="max-w-full h-auto rounded-xl border-2 border-gray-200"
                loading="lazy"
              />
            ))}
          </div>
        )}

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrectOption = showResult && idx === question.correctIndex;
            
            let optionClasses = 'bg-gray-50 border-gray-300';
            
            if (showResult) {
              if (isCorrectOption) {
                // Green for correct answer
                optionClasses = 'bg-green-200 border-green-500';
              } else if (isSelected && !isCorrectOption) {
                // Pink for incorrect answer
                optionClasses = 'bg-pink-200 border-pink-500';
              } else {
                // Gray for unselected options
                optionClasses = 'bg-gray-100 border-gray-300';
              }
            } else if (isSelected) {
              optionClasses = 'bg-blue-50 border-blue-600';
            }

            return (
              <div
                key={idx}
                className={`p-4 border-2 rounded-xl transition-all ${optionClasses}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <input
                      type="radio"
                      name={`question-${question._id}`}
                      value={idx}
                      checked={isSelected}
                      disabled={showResult}
                      readOnly
                      className="w-5 h-5 mr-4"
                    />
                    <span className="font-semibold text-gray-800 text-base">
                      {option.text}
                    </span>
                  </div>
                  {showResult && isCorrectOption && (
                    <span className="text-2xl ml-2">✓</span>
                  )}
                  {showResult && isSelected && !isCorrectOption && (
                    <span className="text-2xl ml-2">✗</span>
                  )}
                </div>
                {option.media && (
                  <img
                    src={option.media}
                    alt={`Option ${idx + 1}`}
                    className="mt-3 max-w-full h-auto rounded-lg ml-9 border border-gray-200"
                    loading="lazy"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        {showResult && question.explanation && (
          <div className="mt-6 p-6 bg-gray-50 rounded-xl border-l-4 border-blue-600">
            <p className="text-blue-700 font-bold mb-2 text-sm uppercase tracking-wide">
              Explanation:
            </p>
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

QuestionCard.displayName = 'QuestionCard';

export default QuestionCard;
