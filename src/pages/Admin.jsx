import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import AdminSubmissions from '../components/AdminSubmissions';

ChartJS.register(ArcElement, Tooltip, Legend);

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'totalSolved', direction: 'desc' });
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'submissions'
  const [recentSubs, setRecentSubs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async (userId) => {
    try {
      setUserStats(null);
      setRecentSubs([]);
      const response = await api.get(`/admin/users/${userId}/stats`);
      setUserStats(response.data);
      // Fetch recent submissions for this user
      const subsRes = await api.get(`/admin/submissions?userId=${userId}`);
      setRecentSubs(subsRes.data);
    } catch (err) {
      setError('Failed to fetch user stats');
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    fetchUserStats(user._id);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortConfig.key === 'totalSolved') {
      return sortConfig.direction === 'asc' 
        ? a.totalSolved - b.totalSolved 
        : b.totalSolved - a.totalSolved;
    }
    return 0;
  });

  const difficultyData = userStats && {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        data: [
          userStats.difficultyStats.easy,
          userStats.difficultyStats.medium,
          userStats.difficultyStats.hard
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',  // Green for Easy
          'rgba(245, 158, 11, 0.8)',  // Orange for Medium
          'rgba(239, 68, 68, 0.8)',   // Red for Hard
        ],
        borderColor: 'white',
        borderWidth: 1,
      },
    ],
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
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Users Management
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`${
                  activeTab === 'submissions'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Submissions Management
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'users' ? (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Users Management
              </h3>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('totalSolved')}
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('totalSolved')}
                    >
                      Total Solved
                      {sortConfig.key === 'totalSolved' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleUserClick(user)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {user.totalSolved}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUserClick(user);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <AdminSubmissions />
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedUser.name}'s Details
                    </h2>
                    <div className="text-gray-500 text-sm">LeetCode: {selectedUser.leetcodeUsername}</div>
                    <div className="text-gray-500 text-sm">User ID: {selectedUser._id}</div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {userStats ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Overall Progress */}
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Overall Progress</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Total Questions:</span>
                            <span className="text-gray-900 dark:text-white">{userStats.totalQuestions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Solved:</span>
                            <span className="text-gray-900 dark:text-white">{userStats.totalSolved}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Completion:</span>
                            <span className="text-gray-900 dark:text-white">
                              {userStats.completionPercentage.toFixed(1)}%
                            </span>
                          </div>
                          {userStats.rank && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">Rank:</span>
                              <span className="text-gray-900 dark:text-white">{userStats.rank}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Difficulty Distribution */}
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Difficulty Distribution</h3>
                        <div className="h-48 flex flex-col items-center justify-center">
                          <Pie
                            data={{
                              labels: ['Easy', 'Medium', 'Hard'],
                              datasets: [{
                                data: [
                                  userStats.difficultyStats.counts.Easy,
                                  userStats.difficultyStats.counts.Medium,
                                  userStats.difficultyStats.counts.Hard
                                ],
                                backgroundColor: [
                                  '#22c55e', // Easy
                                  '#eab308', // Medium
                                  '#ef4444', // Hard
                                ],
                                borderColor: 'white',
                                borderWidth: 1,
                              }]
                            }}
                            options={{
                              plugins: { legend: { display: false } },
                              maintainAspectRatio: false
                            }}
                          />
                          <div className="flex justify-center gap-4 mt-2">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#22c55e] inline-block"></span>Easy</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#eab308] inline-block"></span>Medium</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#ef4444] inline-block"></span>Hard</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Topic-wise Progress */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Topic-wise Progress</h3>
                      <div className="space-y-3">
                        {userStats.topicStats && Object.entries(userStats.topicStats.totals).map(([topic, total]) => {
                          const solved = userStats.topicStats.counts[topic] || 0;
                          const percent = total ? (solved / total) * 100 : 0;
                          return (
                            <div key={topic} className="flex items-center gap-4">
                              <span className="w-32 truncate text-gray-700 dark:text-gray-200">{topic}</span>
                              <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mx-2">
                                <div
                                  className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 w-28 text-right">
                                {solved} / {total} ({percent.toFixed(1)}%)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Recent Submissions Table */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Submissions</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <thead>
                            <tr>
                              <th className="text-left">Question</th>
                              <th className="text-left">Status</th>
                              <th className="text-left">Date</th>
                              <th className="text-left">Solution</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentSubs.length === 0 && (
                              <tr>
                                <td colSpan={4} className="text-gray-400 text-center py-2">No submissions.</td>
                              </tr>
                            )}
                            {recentSubs.map(sub => (
                              <tr key={sub._id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                                <td>{sub.questionTitle}</td>
                                <td>
                                  <span className={
                                    sub.reviewStatus === 'correct'
                                      ? 'text-green-600'
                                      : sub.reviewStatus === 'incorrect'
                                      ? 'text-red-600'
                                      : sub.reviewStatus === 'pending'
                                      ? 'text-yellow-600 font-semibold'
                                      : 'text-gray-600'
                                  }>
                                    {sub.reviewStatus.charAt(0).toUpperCase() + sub.reviewStatus.slice(1)}
                                  </span>
                                </td>
                                <td>{new Date(sub.submittedAt).toLocaleString()}</td>
                                <td>
                                  {sub.solutionUrl
                                    ? <a href={sub.solutionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View</a>
                                    : <span className="text-gray-400">N/A</span>
                                  }
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="mt-4 flex gap-2">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => {}}>
                        All Submissions
                      </button>
                      <button className="px-3 py-1 bg-gray-300 rounded" onClick={() => {navigator.clipboard.writeText(selectedUser._id)}}>
                        Copy User ID
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-48">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin; 