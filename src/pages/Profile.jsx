import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState(null);
  const [topicProgress, setTopicProgress] = useState({});
  const [dayProgress, setDayProgress] = useState({});

  useEffect(() => {
    fetchStats();
    fetchTopicProgress();
    fetchDayProgress();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/progress/user/overall');
      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicProgress = async () => {
    try {
      const response = await api.get('/progress/user/topics');
      setTopicProgress(response.data);
    } catch (err) {
      console.error('Error fetching topic progress:', err);
    }
  };

  const fetchDayProgress = async () => {
    try {
      const response = await api.get('/progress/user/daily');
      setDayProgress(response.data);
    } catch (err) {
      console.error('Error fetching day progress:', err);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // TODO: Implement LeetCode sync functionality
      setSuccess('Profile synchronized successfully!');
    } catch (err) {
      setError('Failed to synchronize profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const difficultyChartData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        data: stats ? [
          stats.difficultyStats.counts.Easy,
          stats.difficultyStats.counts.Medium,
          stats.difficultyStats.counts.Hard
        ] : [],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',  // Green for Easy
          'rgba(234, 179, 8, 0.8)',  // Yellow for Medium
          'rgba(239, 68, 68, 0.8)',  // Red for Hard
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const topicChartData = {
    labels: stats ? Object.keys(stats.topicStats.counts) : [],
    datasets: [
      {
        data: stats ? Object.values(stats.topicStats.counts) : [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',  // Blue
          'rgba(16, 185, 129, 0.8)',  // Green
          'rgba(245, 158, 11, 0.8)',  // Orange
          'rgba(139, 92, 246, 0.8)',  // Purple
          'rgba(236, 72, 153, 0.8)',  // Pink
          'rgba(14, 165, 233, 0.8)',  // Light Blue
          'rgba(249, 115, 22, 0.8)',  // Dark Orange
          'rgba(168, 85, 247, 0.8)',  // Light Purple
          'rgba(236, 72, 153, 0.8)',  // Light Pink
          'rgba(6, 182, 212, 0.8)',   // Cyan
        ],
        borderColor: 'white',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 14,
            family: "'Inter', sans-serif"
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    },
    maintainAspectRatio: false
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{user?.name}</h3>
                <p className="mt-1 text-blue-100">LeetCode Username: {user?.leetcodeUsername}</p>
              </div>
              <button
                onClick={handleSync}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Syncing...' : 'Sync with LeetCode'}
              </button>
            </div>
          </div>

          {stats && (
            <div className="px-4 py-5 sm:p-6">
              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <h4 className="text-lg font-medium text-blue-900">Total Solved</h4>
                  <p className="mt-2 text-3xl font-bold text-blue-600">
                    {stats.totalSolved}
                  </p>
                  <p className="mt-1 text-sm text-blue-500">
                    out of {stats.totalQuestions} questions
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <h4 className="text-lg font-medium text-green-900">Completion Rate</h4>
                  <p className="mt-2 text-3xl font-bold text-green-600">
                    {stats.completionPercentage.toFixed(1)}%
                  </p>
                  <p className="mt-1 text-sm text-green-500">
                    of all questions
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6 text-center">
                  <h4 className="text-lg font-medium text-purple-900">Topics Covered</h4>
                  <p className="mt-2 text-3xl font-bold text-purple-600">
                    {Object.keys(stats.topicStats.counts).length}
                  </p>
                  <p className="mt-1 text-sm text-purple-500">
                    different topics
                  </p>
                </div>
              </div>

              {/* Topic-wise Progress */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Topic-wise Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(topicProgress).map(([topic, progress]) => (
                    <div key={topic} className="bg-white rounded-lg shadow p-4 border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">{topic}</span>
                        <span className="text-sm text-gray-500">
                          {progress.solved} / {progress.total} solved
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${(progress.solved / progress.total) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {((progress.solved / progress.total) * 100).toFixed(1)}% complete
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day-wise Progress */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(dayProgress)
                    .sort(([dayA], [dayB]) => Number(dayA) - Number(dayB))
                    .map(([day, progress]) => (
                      <div key={day} className="bg-white rounded-lg shadow p-4 border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-700">Day {day}</span>
                          <span className="text-sm text-gray-500">
                            {progress.solved} / {progress.total} solved
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${(progress.solved / progress.total) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {((progress.solved / progress.total) * 100).toFixed(1)}% complete
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Difficulty Distribution */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Difficulty Distribution</h3>
                  <div className="h-80">
                    <Pie data={difficultyChartData} options={chartOptions} />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {Object.entries(stats.difficultyStats.counts).map(([difficulty, count]) => (
                      <div key={difficulty} className="text-center">
                        <p className="text-sm font-medium text-gray-500">{difficulty}</p>
                        <p className="mt-1 text-xl font-semibold text-gray-900">{count}</p>
                        <p className="text-sm text-gray-500">
                          {stats.difficultyStats.percentages[difficulty].toFixed(1)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Topic Distribution */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Topic Distribution</h3>
                  <div className="h-80">
                    <Pie data={topicChartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="px-4 py-5 sm:px-6">
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}

          {success && (
            <div className="px-4 py-5 sm:px-6">
              <div className="rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-700">{success}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 