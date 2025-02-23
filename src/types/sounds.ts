"use client";

export type GameSoundEffect = {
  checkmate: HTMLAudioElement | null;
  check: HTMLAudioElement | null;
  movepiece: HTMLAudioElement | null;
  capture: HTMLAudioElement | null;
};

export const gameSounds: GameSoundEffect = {
  checkmate: null,
  check: null,
  movepiece: null,
  capture: null
};

if (typeof window !== 'undefined') {
  gameSounds.checkmate = new Audio('/sounds/checkmate_sound_effect.mp3');
  gameSounds.check = new Audio('/sounds/Check.mp3');
  gameSounds.movepiece = new Audio('/sounds/chess_com_move_piece.mp3');
  gameSounds.capture = new Audio('/sounds/kill_pieace.mp3');
}