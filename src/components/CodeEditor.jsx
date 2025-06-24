import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import api from '../api/axios';
import ReactMarkdown from 'react-markdown';

const languages = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
];

export default function CodeEditor({ questionId, onClose, questionTitle }) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiOutput, setAiOutput] = useState('');

  useEffect(() => {
    fetchExistingSolution();
  }, [questionId]);

  const fetchExistingSolution = async () => {
    try {
      const response = await api.get(`/progress/${questionId}`);
      if (response.data) {
        setCode(response.data.notes || '');
        setLanguage(response.data.language || 'javascript');
      }
    } catch (err) {
      console.error('Failed to fetch solution:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      // Save code for persistence
      await api.post(`/progress/${questionId}`, {
        notes: code,
        language,
      });
      // Get AI feedback
      setFeedbackLoading(true);
      setFeedback('');
      setAiInput('');
      setAiOutput('');
      const res = await api.post(`/questions/ai-feedback/${questionId}`, {
        code,
        language,
        questionTitle,
      });
      setFeedback(res.data.feedback || 'No feedback received.');
      // For testing: if input/output missing, use sample values
      setAiInput(res.data.input || 'Example: [2,7,11,15], 9\n[3,2,4], 6');
      setAiOutput(res.data.output || 'Example: [0,1]\n[1,2]');
      // Remove the above defaults in production
    } catch (err) {
      setError('Failed to save code or get feedback');
      setFeedback('');
      setAiInput('');
      setAiOutput('');
      console.error(err);
    } finally {
      setSaving(false);
      setFeedbackLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Code Editor</h3>
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

        <div className="mb-4">
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700"
          >
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {languages.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="h-96 mb-4">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={setCode}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
            }}
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {feedbackLoading && (
          <div className="rounded-md bg-blue-50 p-4 mb-4">
            <div className="text-sm text-blue-700">Analyzing your code with AI...</div>
          </div>
        )}

        {feedback && !feedbackLoading && (
          <div className="rounded-md bg-green-50 p-4 mb-4">
            {(aiInput || aiOutput) && (
              <div className="mb-4">
                {aiInput && (
                  <div className="mb-2">
                    <div className="font-semibold text-green-800 mb-1">Sample Input:</div>
                    <pre className="bg-green-100 text-green-900 rounded p-2 overflow-x-auto text-sm"><code>{aiInput}</code></pre>
                  </div>
                )}
                {aiOutput && (
                  <div>
                    <div className="font-semibold text-green-800 mb-1">Sample Output:</div>
                    <pre className="bg-green-100 text-green-900 rounded p-2 overflow-x-auto text-sm"><code>{aiOutput}</code></pre>
                  </div>
                )}
              </div>
            )}
            <div className="prose max-w-none text-green-700">
              <ReactMarkdown>{typeof feedback === 'string' ? feedback : String(feedback)}</ReactMarkdown>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {saving ? 'Saving...' : 'Save Code'}
          </button>
        </div>
      </div>
    </div>
  );
} 