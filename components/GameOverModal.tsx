import React, { useState } from 'react';
import { SparkleIcon, CloseIcon } from './icons';

interface GameOverModalProps {
  score: number;
  gameTitle: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ score, gameTitle, onClose, onSubmit }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-midnight-blue text-warm-off-white border-2 border-soft-gold/50 rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 relative transform transition-all duration-300 scale-95" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors">
          <CloseIcon className="w-7 h-7" />
        </button>

        <h3 className="text-3xl font-bold text-center mb-2 text-soft-gold font-serif glow-gold-text">כל הכבוד!</h3>
        <p className="text-center text-lg text-gray-300 mb-4">סיימת את "{gameTitle}"</p>
        
        <div className="text-center my-6">
          <p className="text-xl font-sans">הניקוד שלך:</p>
          <p className="text-6xl font-black text-soft-gold drop-shadow-lg glow-gold-text">{score.toLocaleString()}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="playerName" className="block text-lg font-bold text-center text-warm-off-white mb-2">רשום את שמך בטבלת השיאים</label>
            <input
              type="text"
              id="playerName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-white/10 border-2 border-gray-500 rounded-lg text-white text-center focus:ring-2 focus:ring-soft-gold focus:border-soft-gold transition"
              placeholder="השם שלך..."
              required
            />
          </div>

          <button type="submit" className="w-full bg-soft-gold text-midnight-blue font-bold text-xl py-4 rounded-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg glow-gold-button">
            שמור תוצאה
          </button>
        </form>
      </div>
    </div>
  );
};