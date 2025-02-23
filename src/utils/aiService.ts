import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  dangerouslyAllowBrowser: true // Enable browser environment support
});

interface ChessMove {
  from: string;
  to: string;
}

export const aiService = {
  async getNextMove(boardState: string[][], currentPlayer: 'white' | 'black'): Promise<ChessMove> {
    try {
      const boardString = boardState.map(row => row.join('')).join('\n');
      
      const prompt = `Given this chess board state (empty squares are '.', uppercase letters are white pieces, lowercase are black):\n${boardString}\n\nAs ${currentPlayer}, what's the best next move? Respond only with the move in format 'e2 e4' (from square to square).`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a chess engine. Analyze the board and provide the best move in the format 'from_square to_square' (e.g., 'e2 e4'). Only output the move coordinates, no explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 10
      });

      const moveText = response.choices[0].message.content?.trim() || '';
      const [from, to] = moveText.split(' ');

      if (!from || !to) {
        throw new Error('Invalid move format received from AI');
      }

      return { from, to };
    } catch (error) {
      console.error('Error getting AI move:', error);
      throw error;
    }
  }
};