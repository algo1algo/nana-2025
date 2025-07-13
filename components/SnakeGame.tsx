import React, { useRef, useEffect, useCallback } from 'react';

interface SnakeGameProps {
  onGameOver: (score: number) => void;
}

const GRID_SIZE = 20;

export const SnakeGame: React.FC<SnakeGameProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useRef({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    score: 0,
    speed: 150, // ms per tick
  });

  const generateFood = useCallback((canvas: HTMLCanvasElement, snake: {x: number, y: number}[]) => {
      let foodPos;
      do {
          foodPos = {
              x: Math.floor(Math.random() * (canvas.width / GRID_SIZE)),
              y: Math.floor(Math.random() * (canvas.height / GRID_SIZE)),
          };
      } while (snake.some(segment => segment.x === foodPos.x && segment.y === foodPos.y));
      return foodPos;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = Math.floor(canvas.offsetWidth / GRID_SIZE) * GRID_SIZE;
    canvas.height = Math.floor(canvas.offsetHeight / GRID_SIZE) * GRID_SIZE;
    
    gameState.current.food = generateFood(canvas, gameState.current.snake);

    const gameLoop = () => {
      const { snake, food, direction, score, speed } = gameState.current;
      
      // Update direction
      direction.x = gameState.current.nextDirection.x;
      direction.y = gameState.current.nextDirection.y;
      
      const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

      // Wall collision
      if (head.x < 0 || head.x >= canvas.width / GRID_SIZE || head.y < 0 || head.y >= canvas.height / GRID_SIZE) {
        onGameOver(score);
        return;
      }
      // Self collision
      for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
          onGameOver(score);
          return;
        }
      }

      const newSnake = [head, ...snake];

      // Food collision
      if (head.x === food.x && head.y === food.y) {
        gameState.current.score += 10;
        gameState.current.food = generateFood(canvas, newSnake);
        if(gameState.current.speed > 60) {
            gameState.current.speed -= 2; // Speed up
        }
      } else {
        newSnake.pop();
      }
      
      gameState.current.snake = newSnake;

      // Draw everything
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw food (a glowing star)
      ctx.fillStyle = '#f3d28c';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f3d28c';
      ctx.fillRect(food.x * GRID_SIZE, food.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
      ctx.shadowBlur = 0;

      // Draw snake
      newSnake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#d9a6a4' : '#fcfaf5'; // Muted Rose head, white body
        ctx.fillRect(segment.x * GRID_SIZE, segment.y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
      });
      
      // Draw score
      ctx.fillStyle = 'white';
      ctx.font = '24px Heebo, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`ניקוד: ${gameState.current.score}`, 10, 30);
      
      setTimeout(gameLoop, gameState.current.speed);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const { direction } = gameState.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (direction.y === 0) gameState.current.nextDirection = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
          if (direction.y === 0) gameState.current.nextDirection = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
          if (direction.x === 0) gameState.current.nextDirection = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
          if (direction.x === 0) gameState.current.nextDirection = { x: 1, y: 0 };
          break;
      }
      e.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown);
    const gameTimeout = setTimeout(gameLoop, gameState.current.speed);

    return () => {
      clearTimeout(gameTimeout);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onGameOver, generateFood]);

  return <canvas ref={canvasRef} className="w-full h-full bg-black/50 rounded-lg" />;
};
