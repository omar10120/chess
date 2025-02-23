import { GameState } from '@/components/GameState';
import { Navigation } from '@/components/Navigation';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
            <div className="flex-1 bg-gray-800 p-6 rounded-2xl shadow-2xl">
              <GameState />
            </div>
            <div className="w-full lg:w-80 space-y-6">
              <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold text-amber-400 mb-4">Game Stats</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-300">
                    <span>Games Played</span>
                    <span className="text-amber-400 font-mono">24</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Win Rate</span>
                    <span className="text-amber-400 font-mono">68%</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Current Streak</span>
                    <span className="text-amber-400 font-mono">3</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold text-amber-400 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors">
                    New Game
                  </button>
                  <button className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
                    Join Game
                  </button>
                  <button className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
                    Practice Mode
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
