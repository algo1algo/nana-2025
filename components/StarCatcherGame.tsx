import React, { useRef, useEffect } from 'react';

interface StarCatcherGameProps {
  onGameOver: (score: number) => void;
}

export const StarCatcherGame: React.FC<StarCatcherGameProps> = ({ onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const score = useRef(0);
  const timeLeft = useRef(30);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const player = {
      x: canvas.width / 2,
      y: canvas.height - 60,
      width: 50,
      height: 50,
      dx: 15
    };

    let stars: { x: number; y: number; size: number; speed: number }[] = [];

    const drawPlayer = () => {
      ctx.fillStyle = '#f3d28c'; // soft-gold
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(player.x - player.width / 2, player.y + player.height);
      ctx.lineTo(player.x + player.width / 2, player.y + player.height);
      ctx.closePath();
      ctx.fill();
    };
    
    const drawStars = () => {
      stars.forEach(star => {
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'white';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(
            star.x + star.size * Math.cos((18 + i * 72) * Math.PI / 180),
            star.y + star.size * Math.sin((18 + i * 72) * Math.PI / 180)
          );
          ctx.lineTo(
            star.x + (star.size / 2) * Math.cos((54 + i * 72) * Math.PI / 180),
            star.y + (star.size / 2) * Math.sin((54 + i * 72) * Math.PI / 180)
          );
        }
        ctx.closePath();
        ctx.fill();
      });
      ctx.shadowBlur = 0;
    };

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPlayer();
      drawStars();

      stars.forEach((star, index) => {
        star.y += star.speed;
        if (star.y > canvas.height) {
          stars.splice(index, 1);
        }

        const playerLeft = player.x - player.width / 2;
        const playerRight = player.x + player.width / 2;
        if (
          star.x > playerLeft &&
          star.x < playerRight &&
          star.y > player.y &&
          star.y < player.y + player.height
        ) {
          score.current += 10;
          stars.splice(index, 1);
        }
      });
      
      // Draw score and time
      ctx.fillStyle = 'white';
      ctx.font = '24px Heebo, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`ניקוד: ${score.current}`, 20, 40);
      ctx.textAlign = 'right';
      ctx.fillText(`זמן: ${Math.ceil(timeLeft.current)}`, canvas.width - 20, 40);

      if (timeLeft.current > 0) {
        animationFrameId = requestAnimationFrame(update);
      }
    };

    const spawnStar = () => {
      if (timeLeft.current > 0) {
        stars.push({
          x: Math.random() * canvas.width,
          y: -20,
          size: Math.random() * 10 + 10,
          speed: Math.random() * 2 + 2,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        player.x = e.clientX - rect.left;
    };

    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        player.x = e.touches[0].clientX - rect.left;
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    const starInterval = setInterval(spawnStar, 500);
    const gameTimer = setInterval(() => {
        timeLeft.current -= 0.1;
        if (timeLeft.current <= 0) {
            timeLeft.current = 0;
            clearInterval(gameTimer);
            clearInterval(starInterval);
            cancelAnimationFrame(animationFrameId);
            onGameOver(score.current);
        }
    }, 100);

    update();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(starInterval);
      clearInterval(gameTimer);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [onGameOver]);

  return <canvas ref={canvasRef} className="w-full h-full bg-black/50 rounded-lg cursor-none" />;
};
