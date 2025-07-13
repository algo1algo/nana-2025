import React, { useState } from 'react';
import { GameId, Score } from '../types';
import { GameControllerIcon, HeartIcon } from './icons';
import { Scoreboard } from './Scoreboard';
import { StarCatcherGame } from './StarCatcherGame';
import { SnakeGame } from './SnakeGame';
import { GameOverModal } from './GameOverModal';

interface GamesSectionProps {
  scores: Record<GameId, Score[]>;
  onAddScore: (gameId: GameId, name: string, score: number) => void;
}

export const GamesSection: React.FC<GamesSectionProps> = ({ scores, onAddScore }) => {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [lastGameResult, setLastGameResult] = useState<{ gameId: GameId, score: number } | null>(null);

  const handleGameOver = (score: number) => {
    if (activeGame) {
      setLastGameResult({ gameId: activeGame, score });
      setActiveGame(null);
    }
  };
  
  const handleScoreSubmit = (name: string) => {
    if (lastGameResult) {
      onAddScore(lastGameResult.gameId, name, lastGameResult.score);
      setLastGameResult(null);
    }
  };

  const getGameTitle = (gameId: GameId | null): string => {
    if(gameId === 'starCatcher') return 'תופס הכוכבים';
    if(gameId === 'snake') return 'נחש קוסמי';
    return '';
  }

  const renderGame = () => {
    switch (activeGame) {
      case 'starCatcher':
        return <StarCatcherGame onGameOver={handleGameOver} />;
      case 'snake':
        return <SnakeGame onGameOver={handleGameOver} />;
      default:
        return null;
    }
  };

  return (
    <section id="games" className="py-20 px-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <GameControllerIcon className="w-20 h-20 text-soft-gold mb-4" />
        <h2 className="text-4xl md:text-5xl font-bold text-warm-off-white font-serif mb-4 glow-white-text">פינת משחקים</h2>
        <p className="text-lg text-center text-gray-200 mb-12 font-sans">
          קצת כיף לכבוד יום ההולדת! נסו לשבור את השיא.
        </p>

        {activeGame ? (
          <div className="w-full max-w-4xl h-[60vh] md:h-[70vh] rounded-lg shadow-2xl overflow-hidden mb-8">
            {renderGame()}
             <button
              onClick={() => setActiveGame(null)}
              className="mt-4 bg-muted-rose text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition"
            >
              חזור לבחירת משחק
            </button>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Game Launchers & Scoreboards */}
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={() => setActiveGame('starCatcher')}
                className="w-full bg-soft-gold text-midnight-blue font-bold text-2xl py-6 rounded-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg glow-gold-button"
              >
                שחק: תופס הכוכבים
              </button>
              <Scoreboard title="אלופי תופס הכוכבים" scores={scores.starCatcher} />
            </div>
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={() => setActiveGame('snake')}
                className="w-full bg-soft-gold text-midnight-blue font-bold text-2xl py-6 rounded-lg hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg glow-gold-button"
              >
                שחק: נחש קוסמי
              </button>
              <Scoreboard title="אלופי הנחש הקוסמי" scores={scores.snake} />
            </div>
          </div>
        )}
      </div>
      {lastGameResult && (
        <GameOverModal 
            score={lastGameResult.score}
            gameTitle={getGameTitle(lastGameResult.gameId)}
            onClose={() => setLastGameResult(null)}
            onSubmit={handleScoreSubmit}
        />
      )}
    </section>
  );
};