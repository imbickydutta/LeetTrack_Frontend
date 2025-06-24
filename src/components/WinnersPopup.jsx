import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

const winners = [
  {
    name: 'Golla Ravitheja',
    username: '@ravitheja_',
    problems: 43,
    medal: '🥇',
  },
  {
    name: 'Bharath Raj S',
    username: '@bharathrajs1807',
    problems: 29,
    medal: '🥈',
  },
];

const WinnersPopup = ({ onClose }) => {
  const [show, setShow] = useState(false);
  const [sealPop, setSealPop] = useState(false);
  const [winnerVisible, setWinnerVisible] = useState([false, false]);
  const [confetti, setConfetti] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    // Animate in after mount
    const timer = setTimeout(() => {
      setShow(true);
      setSealPop(true);
      setConfetti(true);
      setTimeout(() => setWinnerVisible([true, false]), 350);
      setTimeout(() => setWinnerVisible([true, true]), 650);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Get window size for confetti
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleReveal = () => {
    setRevealed(true);
    setTimeout(() => setContentVisible(true), 700);
  };

  const handleShowFront = () => {
    setContentVisible(false);
    setTimeout(() => setRevealed(false), 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      {/* Confetti */}
      {confetti && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          numberOfPieces={220}
          recycle={false}
          gravity={0.25}
          initialVelocityY={10}
        />
      )}
      <div
        className={`relative w-[90vw] md:w-[60vw] max-w-2xl rounded-2xl shadow-2xl p-0 sm:p-0 bg-transparent border-0 transition-all duration-700 ease-out
          ${show ? 'opacity-100 scale-100 translate-y-0 animate-bounceIn' : 'opacity-0 scale-90 translate-y-8'}
        `}
        style={{
          animation: show ? 'popup-bounce-in 0.7s cubic-bezier(.68,-0.55,.27,1.55)' : undefined,
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 bg-white dark:bg-gray-800 rounded-full p-2 shadow transition-colors border border-gray-200 dark:border-gray-700 z-20"
          aria-label="Close winners popup"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content Container */}
        <div className="relative w-full h-full min-h-[480px] sm:min-h-[520px] overflow-hidden bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
          {/* Initial View */}
          <div 
            className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 transition-transform duration-1000 ease-in-out ${
              revealed ? '-translate-y-full' : 'translate-y-0'
            }`}
          >
            <div
              className={`w-20 h-20 rounded-full bg-red-600 border-4 border-red-800 flex items-center justify-center text-white font-bold text-2xl shadow-md mb-4 select-none transition-transform duration-500 ${
                sealPop ? 'scale-110 rotate-6' : 'scale-75 rotate-0'
              }`}
              style={{
                transition: 'transform 0.5s cubic-bezier(.68,-0.55,.27,1.55)',
              }}
            >
              MASAI
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              🎉 Congratulations! 🎉
            </h2>
            <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-4 text-center font-medium">
              Click to reveal the winners!
            </p>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
              onClick={handleReveal}
            >
              Reveal Winners
              <span className="text-xl">🎯</span>
            </button>
          </div>

          {/* Winners View */}
          <div 
            className={`absolute inset-0 w-full h-full flex flex-col transition-transform duration-1000 ease-in-out ${
              revealed ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            {/* Winners content with bounce-in animation, no delay */}
            <div className={`flex flex-col h-full items-center ${contentVisible ? 'animate-bounceIn' : 'opacity-0'}`} style={{animationDuration: '0.7s'}}>
              {/* Centered Masai Seal/Logo and heading */}
              <div className="flex flex-col items-center w-full pt-8 pb-2 px-4">
                <div
                  className={`w-20 h-20 rounded-full bg-red-600 border-4 border-red-800 flex items-center justify-center text-white font-bold text-2xl shadow-md mb-4 select-none transition-transform duration-500 ${
                    sealPop ? 'scale-110 rotate-6' : 'scale-75 rotate-0'
                  }`}
                  style={{
                    transition: 'transform 0.5s cubic-bezier(.68,-0.55,.27,1.55)',
                  }}
                >
                  MASAI
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center break-words">
                  🎉 Congratulations! 🎉
                </h2>
                <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-4 text-center font-medium break-words">
                  Winners of Week 1 Challenge
                </p>
              </div>
              {/* Winners List */}
              <div className="px-4 sm:px-6 pb-4 flex-1 w-full" style={{maxHeight: 'calc(100% - 220px)', overflowY: 'auto'}}>
                <ul className="space-y-4">
                  {winners.map((winner, idx) => (
                    <li
                      key={winner.username}
                      className={`flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-3 sm:px-4 py-3 shadow-sm transition-all duration-700
                        ${winnerVisible[idx] && contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                      `}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <span className="text-2xl select-none animate-bounceOnce flex-shrink-0" style={{ animationDelay: `${0.3 + idx * 0.2}s` }}>
                          {winner.medal}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg truncate">
                            {winner.name}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400 text-sm truncate">
                            {winner.username}
                          </div>
                        </div>
                      </div>
                      <div className="text-blue-600 dark:text-blue-400 font-bold text-base sm:text-lg flex-shrink-0 ml-2">
                        {winner.problems} <span className="font-normal text-sm">problems</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Message */}
              <div className="px-4 sm:px-6 pb-8 pt-2 text-center">
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 break-words">
                  Please reach out to <span className="font-semibold text-blue-700 dark:text-blue-400">Bicky</span> at{' '}
                  <a
                    href="mailto:bicky.dutta@masaischool.com"
                    className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 break-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    bicky.dutta@masaischool.com
                  </a>{' '}
                  to claim your prize!
                </p>
                <button 
                  className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2 mx-auto"
                  onClick={handleShowFront}
                >
                  Show Front
                  <span className="text-xl">↩️</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Custom keyframes for bounce in and medal bounce */}
        <style>{`
          @keyframes popup-bounce-in {
            0% { opacity: 0; transform: scale(0.9) translateY(40px); }
            60% { opacity: 1; transform: scale(1.05) translateY(-8px); }
            80% { transform: scale(0.98) translateY(2px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-bounceIn {
            animation: popup-bounce-in 0.7s cubic-bezier(.68,-0.55,.27,1.55);
          }
          @keyframes medal-bounce-once {
            0% { transform: translateY(0); }
            30% { transform: translateY(-12px); }
            60% { transform: translateY(0); }
            100% { transform: translateY(0); }
          }
          .animate-bounceOnce {
            animation: medal-bounce-once 0.7s 1;
          }
        `}</style>
      </div>
    </div>
  );
};

export default WinnersPopup; 