import { render, screen } from '@testing-library/react';
import QuestionCard from '../components/QuestionCard';

const mockQuestion = {
  _id: '1',
  text: 'What is 2+2?',
  options: [
    { text: '3' },
    { text: '4' },
    { text: '5' },
    { text: '6' },
  ],
  correctIndex: 1,
  explanation: 'Basic math',
};

describe('QuestionCard Component', () => {
  it('renders question text and options', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        selectedAnswer={null}
        onAnswerChange={() => {}}
      />
    );

    expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('shows explanation when showResult is true', () => {
    render(
      <QuestionCard
        question={mockQuestion}
        selectedAnswer={1}
        onAnswerChange={() => {}}
        showResult={true}
      />
    );

    expect(screen.getByText(/explanation/i)).toBeInTheDocument();
    expect(screen.getByText('Basic math')).toBeInTheDocument();
  });
});

