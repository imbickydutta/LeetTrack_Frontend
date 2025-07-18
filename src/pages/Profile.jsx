import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState(null);
  const [topicProgress, setTopicProgress] = useState({});
  const [dayProgress, setDayProgress] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    leetcodeUsername: '',
  });
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchTopicProgress();
    fetchDayProgress();
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        leetcodeUsername: user.leetcodeUsername || '',
      });
    }
  }, [user]);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/users/profile', {
        name: formData.name,
        leetcodeUsername: formData.leetcodeUsername,
      });
      updateUser(response.data);
      toast.success('Profile updated successfully!');
      setShowEditModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
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
          pointStyle: 'circle',
          color: 'rgb(156, 163, 175)' // text-gray-400
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">{user?.name}</h3>
                <p className="mt-1 text-blue-100">LeetCode Username: {user?.leetcodeUsername}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleSync}
                  disabled={true}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sync with LeetCode (Coming Soon)
                </button>
              </div>
            </div>
          </div>

          {stats && (
            <div className="px-4 py-5 sm:p-6">
              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

              {/* Topic-wise Progress */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Topic-wise Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(topicProgress).map(([topic, progress]) => (
                    <div key={topic} className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-600">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700 dark:text-gray-200">{topic}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {progress.solved} / {progress.total} solved
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${(progress.solved / progress.total) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {((progress.solved / progress.total) * 100).toFixed(1)}% complete
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day-wise Progress */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Day-wise Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(dayProgress).sort(([dayA], [dayB]) => parseInt(dayA) - parseInt(dayB)).map(([day, progress]) => (
                    <div key={day} className="bg-white dark:bg-gray-700 rounded-lg shadow p-4 border border-gray-100 dark:border-gray-600">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700 dark:text-gray-200">Day {day}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {progress.solved} / {progress.total} solved
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${(progress.solved / progress.total) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {((progress.solved / progress.total) * 100).toFixed(1)}% complete
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Difficulty Distribution */}
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Difficulty Distribution</h3>
                  <div className="h-80">
                    <Pie data={difficultyChartData} options={chartOptions} />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {Object.entries(stats.difficultyStats.counts).map(([difficulty, count]) => (
                      <div key={difficulty} className="text-center">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{difficulty}</p>
                        <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{count}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {stats.difficultyStats.percentages[difficulty].toFixed(1)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Topic Distribution */}
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Topic Distribution</h3>
                  <div className="h-80">
                    <Pie data={topicChartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="px-4 py-5 sm:px-6">
              <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
                <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Edit Profile</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Email (Read-only)
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="leetcodeUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  LeetCode Username
                </label>
                <input
                  type="text"
                  name="leetcodeUsername"
                  id="leetcodeUsername"
                  value={formData.leetcodeUsername}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 