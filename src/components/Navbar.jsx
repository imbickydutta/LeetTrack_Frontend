import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
            LeetTrack
          </Link>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <>
                <Link
                  to="/leaderboard"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  Leaderboard
                </Link>
                <Link
                  to="/profile"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  Profile
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 