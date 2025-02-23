import React from 'react';

interface GameOverDialogProps {
  isOpen: boolean;
  winner: string;
  onRestart: () => void;
}

export const GameOverDialog: React.FC<GameOverDialogProps> = ({ isOpen, winner, onRestart }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.3s_ease-in-out]">
      <div className="bg-white rounded-xl p-8 max-w-sm w-full mx-4 transform shadow-2xl border border-amber-200 animate-[slideIn_0.3s_ease-out]">
        <div className="text-center space-y-6">
          <div className="inline-block p-4 bg-amber-100 rounded-full mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-amber-800 animate-[bounceIn_0.5s_ease-out]">
            Game Over!
          </h2>
          <p className="text-xl text-gray-700 font-medium">
            {winner} wins!
          </p>
          <button
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            Play Again
          </button>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};