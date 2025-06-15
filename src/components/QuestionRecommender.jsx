import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import SolutionUrlModal from './SolutionUrlModal';

export default function QuestionRecommender() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showSolutionModal, setShowSolutionModal] = useState(false);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/recommendations');
      setRecommendations(response.data);
    } catch (err) {
      setError('Failed to fetch recommendations');
      toast.error('Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = () => {
    if (!isExpanded && recommendations.length === 0) {
      fetchRecommendations();
    }
    setIsExpanded(!isExpanded);
  };

  const handleMarkAsSolved = (question) => {
    setSelectedQuestion(question);
    setShowSolutionModal(true);
  };

  const handleSolutionSubmit = async (solutionUrl) => {
    try {
      await api.post('/progress/update', {
        questionId: selectedQuestion._id,
        isSolved: true,
        solutionUrl
      });
      
      // Update the recommendations list
      setRecommendations(prev => 
        prev.filter(q => q._id !== selectedQuestion._id)
      );
      
      toast.success('Question marked as solved!');
      setShowSolutionModal(false);
      setSelectedQuestion(null);
    } catch (err) {
      toast.error('Failed to mark question as solved');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <button
        onClick={handleExpand}
        className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold">AI Recommendations</h2>
          <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
            Get personalized question suggestions
          </span>
        </div>
        <svg
          className={`w-6 h-6 transform transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
              <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
            </div>
          ) : !recommendations.length ? (
            <div className="text-center text-gray-500 dark:text-gray-400">
              No recommendations available
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((question) => (
                <div
                  key={question._id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white truncate">
                        {question.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {question.reason}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          question.difficulty === 'Easy'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                            : question.difficulty === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                        }`}
                      >
                        {question.difficulty}
                      </span>
                      <button
                        onClick={() => handleMarkAsSolved(question)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-200 dark:hover:bg-green-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Mark as Solved
                      </button>
                      <a
                        href={question.leetcodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Solve
                      </a>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {question.topics.map((topic) => (
                      <span
                        key={topic}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showSolutionModal && selectedQuestion && (
        <SolutionUrlModal
          isOpen={showSolutionModal}
          onClose={() => {
            setShowSolutionModal(false);
            setSelectedQuestion(null);
          }}
          onSubmit={handleSolutionSubmit}
          questionTitle={selectedQuestion.title}
          isSolved={false}
        />
      )}
    </div>
  );
} 