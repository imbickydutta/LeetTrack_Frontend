import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState({
    daily: [],
    weekly: [],
    allTime: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch each leaderboard separately to handle errors individually
        const dailyResponse = await api.get('/leaderboard/daily');
        const weeklyResponse = await api.get('/leaderboard/weekly');
        const allTimeResponse = await api.get('/leaderboard/all-time');

        setLeaderboardData({
          daily: dailyResponse.data || [],
          weekly: weeklyResponse.data || [],
          allTime: allTimeResponse.data || []
        });
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        setError('Failed to fetch leaderboard data');
        toast.error('Failed to fetch leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const LeaderboardSection = ({ title, data, timeFrame }) => {
    if (!Array.isArray(data)) {
      console.error(`Invalid data for ${timeFrame} leaderboard:`, data);
      return null;
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
        {data.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No submissions in this time period</p>
        ) : (
          <div className="space-y-4">
            {data.map((user, index) => (
              <div
                key={`${timeFrame}-${user._id}-${index}`}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
                    ${index === 0 ? 'bg-yellow-400' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-amber-600' : 
                      'bg-blue-500'}`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.leetcodeUsername}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user.solvedCount} {user.solvedCount === 1 ? 'problem' : 'problems'}
                  </p>
                  {timeFrame !== 'all-time' && user.lastSolvedAt && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last solved: {new Date(user.lastSolvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Leaderboard</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <LeaderboardSection
            title="Top 5 - Last 24 Hours"
            data={leaderboardData.daily}
            timeFrame="daily"
          />
          <LeaderboardSection
            title="Top 5 - Last Week"
            data={leaderboardData.weekly}
            timeFrame="weekly"
          />
        </div>
        <div>
          <LeaderboardSection
            title="Top 10 - All Time"
            data={leaderboardData.allTime}
            timeFrame="all-time"
          />
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 