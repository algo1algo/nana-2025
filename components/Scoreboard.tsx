import React from 'react';
import { Score } from '../types';
import { SparkleIcon } from './icons';

interface ScoreboardProps {
  title: string;
  scores: Score[];
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ title, scores }) => {
  const sortedScores = [...scores].sort((a, b) => b.score - a.score).slice(0, 10);

  return (
    <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl w-full">
      <h4 className="text-2xl font-bold text-soft-gold text-center mb-4 font-serif glow-gold-text">{title}</h4>
      {sortedScores.length > 0 ? (
        <ol className="space-y-2 text-warm-off-white font-sans">
          {sortedScores.map((score, index) => (
            <li key={index} className="flex justify-between items-center bg-black/20 p-2 rounded-md">
              <span className="flex items-center">
                <span className="font-bold text-lg mr-3 w-6 text-center">{index + 1}.</span>
                <span className="truncate">{score.name}</span>
              </span>
              <span className="font-bold text-soft-gold glow-gold-text">{score.score.toLocaleString()}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-center text-gray-300 italic py-4">הטבלה עדיין ריקה... שחקו והיו הראשונים!</p>
      )}
    </div>
  );
};