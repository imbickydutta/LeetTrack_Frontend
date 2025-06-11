import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SolutionUrlModal({ isOpen, onClose, onSubmit, questionTitle, isSolved, solutionUrl: existingSolutionUrl }) {
  const [solutionUrl, setSolutionUrl] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const validateSolutionUrl = (url) => {
    try {
      // Check if URL is from LeetCode
      if (!url.includes('leetcode.com/problems/')) {
        return 'Invalid URL format';
      }

      // Extract problem slug and username
      const urlParts = url.split('/');
      const problemsIndex = urlParts.indexOf('problems');
      
      if (problemsIndex === -1 || problemsIndex === urlParts.length - 1) {
        return 'Invalid URL format';
      }

      const problemSlug = urlParts[problemsIndex + 1];
      if (!problemSlug) {
        return 'Invalid URL format';
      }

      // Get the expected slug from the question title
      const expectedSlug = questionTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Validate problem slug matches
      if (problemSlug !== expectedSlug) {
        return 'Not the solution for the current problem';
      }

      // Find username in the URL (it's usually after /solutions/ and before the last part)
      const solutionsIndex = urlParts.indexOf('solutions');
      if (solutionsIndex === -1) {
        return 'Invalid URL format';
      }

      // Extract username from the URL
      // Format: .../solutions/123456/username-title-xyz/
      const solutionPart = urlParts[solutionsIndex + 2];
      if (!solutionPart) {
        return 'Invalid URL format';
      }

      // Check if the URL contains the user's LeetCode username
      if (!solutionPart.includes(user.leetcodeUsername)) {
        return 'Not the solution of the current user';
      }

      return null;
    } catch (error) {
      return 'Invalid URL format';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateSolutionUrl(solutionUrl);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    onSubmit(solutionUrl);
  };

  const handleMarkAsNotSolved = () => {
    onSubmit(null); // Pass null to indicate marking as not solved
  };

  const handleViewSolution = (e) => {
    e.preventDefault();
    if (existingSolutionUrl) {
      window.open(existingSolutionUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {isSolved ? 'Solution Details' : 'Mark as Solved'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {isSolved ? (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              This problem has been marked as solved.
            </p>
            <div className="flex justify-between items-center">
              <a
                href={existingSolutionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Solution
              </a>
              <button
                onClick={handleMarkAsNotSolved}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Mark as Not Solved
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                To mark this question as solved, please provide the URL to your LeetCode solution.
                <br /><br />
                <strong>How to get your solution URL:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Solve the problem on LeetCode</li>
                  <li>Click "Submit" to submit your solution</li>
                  <li>After successful submission, go to Solutions Tab</li>
                  <li>Click on "Share my submission"</li>
                  <li>Give a title and post your solution</li>
                  <li>Copy the Posted solution URL</li>
                </ol>
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700 mb-1">Format of URL:</p>
                  <p className="text-sm text-gray-600 break-all">
                    https://leetcode.com/problems/{questionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}/solutions/6828601/by-{user.leetcodeUsername}-title-xyz/
                  </p>
                </div>
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="solutionUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  Solution URL
                </label>
                <input
                  type="url"
                  id="solutionUrl"
                  value={solutionUrl}
                  onChange={(e) => setSolutionUrl(e.target.value)}
                  placeholder="https://leetcode.com/problems/..."
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Mark as Solved
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
} 