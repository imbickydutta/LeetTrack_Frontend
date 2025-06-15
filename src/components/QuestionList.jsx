import React from 'react';

export default function QuestionList({ 
  questions, 
  onSolveClick, 
  onMarkAsDone, 
  onViewSolution 
}) {
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No questions found for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {questions.map((question) => (
        <div
          key={question._id}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="px-4 py-5 sm:p-6 overflow-x-hidden">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 truncate whitespace-nowrap max-w-full">
                  {question.title}
                </h3>
              </div>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                  question.difficulty === 'Easy'
                    ? 'bg-green-100 text-green-800'
                    : question.difficulty === 'Medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {question.difficulty}
              </span>
            </div>
            <div className="mt-2">
              <div className="flex flex-wrap gap-2">
                {question.topics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <a
                href={question.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View on LeetCode
              </a>
              <button
                onClick={() => question.userProgress?.isSolved 
                  ? onViewSolution(question) 
                  : onMarkAsDone(question)}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                  question.userProgress?.isSolved
                    ? 'text-green-700 bg-green-100 hover:bg-green-200'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {question.userProgress?.isSolved ? 'View Solution' : 'Mark as Solved'}
              </button>
              <button
                onClick={() => onSolveClick(question)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Solve
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 