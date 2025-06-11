import React, { useState } from 'react';

export default function FilterBar({ onFilterChange }) {
  const [activeTab, setActiveTab] = useState('day');
  const [selectedDay, setSelectedDay] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [status, setStatus] = useState('all');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    onFilterChange({
      activeTab: tab,
      day: selectedDay,
      topic: selectedTopic,
      status: status
    });
  };

  const handleDayChange = (day) => {
    setSelectedDay(day);
    onFilterChange({
      activeTab,
      day,
      topic: selectedTopic,
      status: status
    });
  };

  const handleTopicChange = (topic) => {
    setSelectedTopic(topic);
    onFilterChange({
      activeTab,
      day: selectedDay,
      topic,
      status: status
    });
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    onFilterChange({
      activeTab,
      day: selectedDay,
      topic: selectedTopic,
      status: newStatus
    });
  };

  return (
    <div className="mb-6">
      {/* Status Filter */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => handleStatusChange('all')}
          className={`px-4 py-2 rounded-md ${
            status === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => handleStatusChange('solved')}
          className={`px-4 py-2 rounded-md ${
            status === 'solved'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Solved
        </button>
        <button
          onClick={() => handleStatusChange('unsolved')}
          className={`px-4 py-2 rounded-md ${
            status === 'unsolved'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Unsolved
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('day')}
            className={`${
              activeTab === 'day'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Day-wise
          </button>
          <button
            onClick={() => handleTabChange('topic')}
            className={`${
              activeTab === 'topic'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Topic-wise
          </button>
          <button
            onClick={() => handleTabChange('all')}
            className={`${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            All Questions
          </button>
        </nav>
      </div>

      {/* Day/Topic Selector */}
      {activeTab === 'day' && (
        <div className="mb-4">
          <label htmlFor="day-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Day
          </label>
          <select
            id="day-select"
            value={selectedDay}
            onChange={(e) => handleDayChange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All Days</option>
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>
                Day {day}
              </option>
            ))}
          </select>
        </div>
      )}

      {activeTab === 'topic' && (
        <div className="mb-4">
          <label htmlFor="topic-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Topic
          </label>
          <select
            id="topic-select"
            value={selectedTopic}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All Topics</option>
            <option value="Array">Array</option>
            <option value="String">String</option>
            <option value="Linked List">Linked List</option>
            <option value="Tree">Tree</option>
            <option value="Graph">Graph</option>
            <option value="Dynamic Programming">Dynamic Programming</option>
            <option value="Backtracking">Backtracking</option>
            <option value="Greedy">Greedy</option>
            <option value="Math">Math</option>
            <option value="Hash Table">Hash Table</option>
          </select>
        </div>
      )}
    </div>
  );
} 