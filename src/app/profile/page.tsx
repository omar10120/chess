"use client";

import { Navigation } from '@/components/Navigation';

export default function Profile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-2xl p-6">
          <h1 className="text-2xl font-bold text-amber-400 mb-6">Profile</h1>
          
          <div className="space-y-6">
            {/* Profile Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-amber-400">24</div>
                <div className="text-gray-300">Games Played</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-amber-400">68%</div>
                <div className="text-gray-300">Win Rate</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-amber-400">3</div>
                <div className="text-gray-300">Current Streak</div>
              </div>
            </div>

            {/* Recent Games */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-amber-400 mb-4">Recent Games</h2>
              <div className="space-y-3">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                    <div className="text-gray-300">
                      <span className="font-semibold">Game #{index + 1}</span>
                      <span className="mx-2">vs</span>
                      <span className="text-amber-400">Player {index + 2}</span>
                    </div>
                    <div className="text-green-400 font-semibold">
                      {Math.random() > 0.5 ? 'Won' : 'Lost'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}