import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function ProgressStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/progress/user/overall');
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch progress statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">{error}</div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold">Your Progress</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
              {stats.totalSolved} / {stats.totalQuestions} solved
            </span>
            <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
              {stats.completionPercentage.toFixed(1)}% complete
            </span>
          </div>
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
        <div className="p-6">
          {/* Basic Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6 text-center">
              <h4 className="text-lg font-medium text-blue-900 dark:text-blue-100">Total Solved</h4>
              <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalSolved}
              </p>
              <p className="mt-1 text-sm text-blue-500 dark:text-blue-300">
                out of {stats.totalQuestions} questions
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-6 text-center">
              <h4 className="text-lg font-medium text-green-900 dark:text-green-100">Completion Rate</h4>
              <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.completionPercentage.toFixed(1)}%
              </p>
              <p className="mt-1 text-sm text-green-500 dark:text-green-300">
                of all questions
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-6 text-center">
              <h4 className="text-lg font-medium text-purple-900 dark:text-purple-100">Topics Covered</h4>
              <p className="mt-2 text-3xl font-bold text-purple-600 dark:text-purple-400">
                {Object.keys(stats.topicStats.counts).length}
              </p>
              <p className="mt-1 text-sm text-purple-500 dark:text-purple-300">
                different topics
              </p>
            </div>
          </div>

          {/* Difficulty Summary */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Difficulty Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats.difficultyStats.counts).map(([difficulty, count]) => (
                <div key={difficulty} className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 text-center">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{difficulty}</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{count}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {stats.difficultyStats.percentages[difficulty].toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Visit your profile page for detailed statistics and progress tracking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 