"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img src="/pieces/wk.svg" alt="Chess Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-amber-400">Chess Time</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-amber-100 hover:text-amber-400 transition-colors">
              Play
            </Link>
            <Link href="/leaderboard" className="text-amber-100 hover:text-amber-400 transition-colors">
              Leaderboard
            </Link>
            <Link href="/profile" className="text-amber-100 hover:text-amber-400 transition-colors">
              Profile
            </Link>
            <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors">
              Start Game
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-amber-100 hover:text-amber-400 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <Link href="/" className="text-amber-100 hover:text-amber-400 transition-colors">
                Play
              </Link>
              <Link href="/leaderboard" className="text-amber-100 hover:text-amber-400 transition-colors">
                Leaderboard
              </Link>
              <Link href="/profile" className="text-amber-100 hover:text-amber-400 transition-colors">
                Profile
              </Link>
              <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg transition-colors">
                Start Game
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};