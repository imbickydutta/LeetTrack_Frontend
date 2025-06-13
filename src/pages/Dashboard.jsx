import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import CodeEditor from '../components/CodeEditor';
import SolutionUrlModal from '../components/SolutionUrlModal';
import ProgressStats from '../components/ProgressStats';
import toast from 'react-hot-toast';

// Cache management
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = {
  data: {},
  timestamps: {},
};

const getCacheKey = (activeTab, filter, selectedDay, selectedTopic) => {
  return `${activeTab}-${filter}-${selectedDay}-${selectedTopic}`;
};

const getFromCache = (key) => {
  const timestamp = cache.timestamps[key];
  if (!timestamp || Date.now() - timestamp > CACHE_DURATION) {
    delete cache.data[key];
    delete cache.timestamps[key];
    return null;
  }
  return cache.data[key];
};

const setInCache = (key, data) => {
  cache.data[key] = data;
  cache.timestamps[key] = Date.now();
};

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('activeTab') || 'day');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState(() => localStorage.getItem('filter') || 'all');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedDay, setSelectedDay] = useState(() => {
    const savedDay = localStorage.getItem('selectedDay');
    return savedDay ? parseInt(savedDay) : 1;
  });
  const [selectedTopic, setSelectedTopic] = useState(() => localStorage.getItem('selectedTopic') || '');
  const [availableDays, setAvailableDays] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [selectedQuestionForSolution, setSelectedQuestionForSolution] = useState(null);
  const [filteredProgress, setFilteredProgress] = useState(null);
  const [stats, setStats] = useState({
    totalSolved: 0,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
  });

  // Save filter values to localStorage when they change
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
    localStorage.setItem('filter', filter);
    localStorage.setItem('selectedDay', selectedDay.toString());
    localStorage.setItem('selectedTopic', selectedTopic);
  }, [activeTab, filter, selectedDay, selectedTopic]);

  useEffect(() => {
    fetchDaysAndTopics();
  }, []);

  useEffect(() => {
    fetchFilteredProgress();
  }, [selectedDay, selectedTopic, activeTab]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/progress/user/overall');
        setStats(response.data);
      } catch (error) {
        toast.error('Failed to fetch stats');
      }
    };

    fetchStats();
  }, []);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      let url = '/questions';
      const params = new URLSearchParams();

      if (activeTab === 'day') {
        params.append('dayPlan', selectedDay.toString());
      } else if (activeTab === 'topic') {
        params.append('topic', selectedTopic);
      }

      if (filter !== 'all') {
        params.append('status', filter);
      }

      const cacheKey = getCacheKey(activeTab, filter, selectedDay, selectedTopic);
      const cachedData = getFromCache(cacheKey);

      if (cachedData) {
        setQuestions(cachedData);
        setLoading(false);
        return;
      }

      const response = await api.get(`${url}?${params.toString()}`);
      setQuestions(response.data);
      setInCache(cacheKey, response.data);
    } catch (err) {
      setError('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  }, [activeTab, filter, selectedDay, selectedTopic]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const fetchDaysAndTopics = async () => {
    try {
      const [daysResponse, topicsResponse] = await Promise.all([
        api.get('/questions/days/all'),
        api.get('/questions/topics/all')
      ]);
      
      if (!daysResponse.data || !Array.isArray(daysResponse.data)) {
        setError('Invalid days data received from server');
        return;
      }
      
      if (!topicsResponse.data || !Array.isArray(topicsResponse.data)) {
        setError('Invalid topics data received from server');
        return;
      }
      
      setAvailableDays(daysResponse.data);
      setAvailableTopics(topicsResponse.data);
      
      // Set initial topic if available and not already set
      if (topicsResponse.data.length > 0 && !selectedTopic) {
        setSelectedTopic(topicsResponse.data[0]);
      }
      
      // Set initial day if available and not already set
      if (daysResponse.data.length > 0 && !selectedDay) {
        setSelectedDay(daysResponse.data[0]);
      }
    } catch (err) {
      setError('Failed to fetch days and topics');
    }
  };

  const fetchFilteredProgress = async () => {
    try {
      let endpoint = '/progress/user/overall';
      
      if (activeTab === 'day' && selectedDay !== 'all') {
        endpoint = `/progress/user/daily/${selectedDay}`;
      } else if (activeTab === 'topic' && selectedTopic !== 'all') {
        endpoint = `/progress/user/topics/${selectedTopic}`;
      }

      const response = await api.get(endpoint);
      setFilteredProgress(response.data);
    } catch (err) {
      setFilteredProgress(null);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleDayChange = (day) => {
    setSelectedDay(day);
  };

  const handleSolveClick = (question) => {
    setSelectedQuestion(question);
  };

  const handleCloseEditor = () => {
    setSelectedQuestion(null);
    // Invalidate cache for the current view
    const cacheKey = getCacheKey(activeTab, filter, selectedDay, selectedTopic);
    delete cache.data[cacheKey];
    delete cache.timestamps[cacheKey];
    fetchQuestions();
    fetchFilteredProgress();
  };

  const handleMarkAsDone = (question) => {
    setSelectedQuestionForSolution(question);
    setShowSolutionModal(true);
  };

  const handleViewSolution = (question) => {
    setSelectedQuestionForSolution(question);
    setShowSolutionModal(true);
  };

  const handleSolutionSubmit = async (solutionUrl) => {
    try {
      await api.post(`/progress/${selectedQuestionForSolution._id}`, {
        isSolved: solutionUrl !== null,
        solutionUrl: solutionUrl || '',
        notes: ''
      });
      setShowSolutionModal(false);
      setSelectedQuestionForSolution(null);
      // Invalidate cache for the current view
      const cacheKey = getCacheKey(activeTab, filter, selectedDay, selectedTopic);
      delete cache.data[cacheKey];
      delete cache.timestamps[cacheKey];
      fetchQuestions();
      fetchFilteredProgress();
    } catch (err) {
      setError('Failed to update question status');
    }
  };

  const handleCloseModal = () => {
    setShowSolutionModal(false);
    setSelectedQuestionForSolution(null);
  };

  const renderFilterProgress = () => {
    if (!filteredProgress) return null;

    let title = 'Overall Progress';
    let solved = 0;
    let total = 0;

    if (activeTab === 'day' && selectedDay !== 'all') {
      title = selectedDay === -1 ? 'Optional (Hard) Progress' : `Day ${selectedDay} Progress`;
      solved = filteredProgress.solved || 0;
      total = filteredProgress.total || 0;
    } else if (activeTab === 'topic' && selectedTopic !== 'all') {
      title = `${selectedTopic} Progress`;
      solved = filteredProgress.solved || 0;
      total = filteredProgress.total || 0;
    } else {
      solved = filteredProgress.totalSolved || 0;
      total = filteredProgress.totalQuestions || 0;
    }

    const percentage = total > 0 ? ((solved / total) * 100).toFixed(1) : 0;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4
       mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">{title}</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {solved} / {total} solved
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="px-0 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Welcome, {user?.name}!
            </h1>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-3 py-2 rounded-md text-sm ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleFilterChange('solved')}
                className={`px-3 py-2 rounded-md text-sm ${
                  filter === 'solved'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Solved
              </button>
              <button
                onClick={() => handleFilterChange('unsolved')}
                className={`px-3 py-2 rounded-md text-sm ${
                  filter === 'unsolved'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Unsolved
              </button>
            </div>
          </div>

          <div className="mb-8">
            <ProgressStats />
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-x-auto pb-4">
              <button
                onClick={() => setActiveTab('day')}
                className={`${
                  activeTab === 'day'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Day-wise
              </button>
              <button
                onClick={() => setActiveTab('topic')}
                className={`${
                  activeTab === 'topic'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Topic-wise
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                All Questions
              </button>
            </nav>
          </div>

          {activeTab === 'day' && (
            <div className="mb-6">
              <label htmlFor="day-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Day
              </label>
              <select
                id="day-select"
                value={selectedDay}
                onChange={(e) => handleDayChange(Number(e.target.value))}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
              >
                {availableDays && availableDays.length > 0 ? (
                  availableDays.map((day) => (
                    <option key={day} value={day}>
                      {day === -1 ? 'Optional (Hard)' : `Day ${day}`}
                    </option>
                  ))
                ) : (
                  <option value="">No days available</option>
                )}
              </select>
            </div>
          )}

          {activeTab === 'topic' && (
            <div className="mb-6">
              <label htmlFor="topic-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select Topic
              </label>
              <select
                id="topic-select"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
              >
                {availableTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>
          )}

          {renderFilterProgress()}

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {questions.map((question) => (
              <div
                key={question._id}
                className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {question.title}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
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
                        ? handleViewSolution(question) 
                        : handleMarkAsDone(question)}
                      className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                        question.userProgress?.isSolved
                          ? 'text-green-700 bg-green-100 hover:bg-green-200'
                          : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      {question.userProgress?.isSolved ? 'View Solution' : 'Mark as Solved'}
                    </button>
                    <button
                      onClick={() => handleSolveClick(question)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Solve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedQuestion && (
        <CodeEditor
          questionId={selectedQuestion._id}
          onClose={handleCloseEditor}
        />
      )}

      {showSolutionModal && selectedQuestionForSolution && (
        <SolutionUrlModal
          isOpen={showSolutionModal}
          onClose={handleCloseModal}
          onSubmit={handleSolutionSubmit}
          questionTitle={selectedQuestionForSolution.title}
          isSolved={selectedQuestionForSolution.userProgress?.isSolved}
          solutionUrl={selectedQuestionForSolution.userProgress?.solutionUrl}
        />
      )}
    </div>
  );
} 