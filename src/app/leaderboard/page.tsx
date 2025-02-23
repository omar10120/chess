"use client";

import { Navigation } from '@/components/Navigation';

export default function Leaderboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-2xl p-6">
          <h1 className="text-2xl font-bold text-amber-400 mb-6">Leaderboard</h1>
          <div className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-5 text-gray-400 font-semibold py-2 border-b border-gray-700">
              <div className="col-span-1">Rank</div>
              <div className="col-span-2">Player</div>
              <div className="col-span-1">Games</div>
              <div className="col-span-1">Win Rate</div>
            </div>
            
            {/* Leaderboard Items */}
            {[...Array(10)].map((_, index) => (
              <div key={index} className="grid grid-cols-5 text-gray-300 py-3 hover:bg-gray-700 rounded-lg transition-colors">
                <div className="col-span-1 font-mono text-amber-400">{index + 1}</div>
                <div className="col-span-2 font-semibold">Player {index + 1}</div>
                <div className="col-span-1">{Math.floor(Math.random() * 100)}</div>
                <div className="col-span-1">{Math.floor(Math.random() * 100)}%</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}