import React, { useEffect, useRef, useState } from 'react';

const BOARD_SIZE = 20;
const INIT_SNAKE = [
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
];
const INIT_DIR = { x: 1, y: 0 };
const LEVELS = [
  { name: 'Dễ', speed: 180 },
  { name: 'Trung bình', speed: 150 },
  { name: 'Khó', speed: 100 },
];
const COLORS = {
  bg: '#22223b',
  snake: 'linear-gradient(135deg, #fda085 60%, #f76d6d 100%)',
  head: 'linear-gradient(135deg, #f6d365 60%, #fda085 100%)',
  food: 'radial-gradient(circle, #fff7e6 60%, #f76d6d 100%)',
};

function getRandomFood(snake) {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
  } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
  return pos;
}

function GameSnake() {
  const [snake, setSnake] = useState([...INIT_SNAKE]);
  const [dir, setDir] = useState(INIT_DIR);
  const [food, setFood] = useState(getRandomFood(INIT_SNAKE));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('bestSnake') || 0));
  const [gameOver, setGameOver] = useState(false);
  const [moveLock, setMoveLock] = useState(false);
  const [effect, setEffect] = useState(null); // {x, y, time}
  const [level, setLevel] = useState(1); // 0: dễ, 1: tb, 2: khó
  const touch = useRef({ x: 0, y: 0, handled: false });

  // Di chuyển rắn
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake(prev => {
        const newHead = { x: prev[0].x + dir.x, y: prev[0].y + dir.y };
        // Va chạm tường
        if (
          newHead.x < 0 ||
          newHead.x >= BOARD_SIZE ||
          newHead.y < 0 ||
          newHead.y >= BOARD_SIZE ||
          prev.some(seg => seg.x === newHead.x && seg.y === newHead.y)
        ) {
          setGameOver(true);
          return prev;
        }
        let newSnake;
        if (newHead.x === food.x && newHead.y === food.y) {
          newSnake = [newHead, ...prev];
          setFood(getRandomFood(newSnake));
          setScore(s => s + 1);
          setEffect({ x: newHead.x, y: newHead.y, time: Date.now() });
        } else {
          newSnake = [newHead, ...prev.slice(0, -1)];
        }
        return newSnake;
      });
      setMoveLock(false);
    }, LEVELS[level].speed);
    return () => clearInterval(interval);
  }, [dir, food, gameOver, level]);

  // Cập nhật kỷ lục
  useEffect(() => {
    if (score > best) {
      setBest(score);
      localStorage.setItem('bestSnake', score);
    }
  }, [score, best]);

  // Điều khiển bằng phím
  useEffect(() => {
    function handleKey(e) {
      if (gameOver) return;
      let newDir = null;
      if (["ArrowUp", "w", "W"].includes(e.key) && dir.y !== 1) newDir = { x: 0, y: -1 };
      else if (["ArrowDown", "s", "S"].includes(e.key) && dir.y !== -1) newDir = { x: 0, y: 1 };
      else if (["ArrowLeft", "a", "A"].includes(e.key) && dir.x !== 1) newDir = { x: -1, y: 0 };
      else if (["ArrowRight", "d", "D"].includes(e.key) && dir.x !== -1) newDir = { x: 1, y: 0 };
      if (newDir && !moveLock) {
        setDir(newDir);
        setMoveLock(true);
      }
      if (e.key === 'r' || e.key === 'R') restart();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dir, gameOver, moveLock]);

  // Điều khiển vuốt mobile
  function handleTouchStart(e) {
    if (e.touches.length) {
      touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, handled: false };
    }
  }
  function handleTouchMove(e) {
    if (!touch.current.x && !touch.current.y) return;
    if (touch.current.handled) return;
    const dx = e.touches[0].clientX - touch.current.x;
    const dy = e.touches[0].clientY - touch.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const threshold = 24;
    let newDir = null;
    if (absDx > threshold || absDy > threshold) {
      if (absDx > absDy) {
        if (dx > 0 && dir.x !== -1) newDir = { x: 1, y: 0 };
        else if (dx < 0 && dir.x !== 1) newDir = { x: -1, y: 0 };
      } else {
        if (dy > 0 && dir.y !== -1) newDir = { x: 0, y: 1 };
        else if (dy < 0 && dir.y !== 1) newDir = { x: 0, y: -1 };
      }
      if (newDir && !moveLock) {
        setDir(newDir);
        setMoveLock(true);
      }
      touch.current.handled = true;
    }
    e.preventDefault();
  }
  function handleTouchEnd() {
    touch.current = { x: 0, y: 0, handled: false };
  }

  function restart() {
    setSnake([...INIT_SNAKE]);
    setDir(INIT_DIR);
    setFood(getRandomFood(INIT_SNAKE));
    setScore(0);
    setGameOver(false);
    setMoveLock(false);
    setEffect(null);
  }

  function handleLevelChange(e) {
    setLevel(Number(e.target.value));
    restart();
  }

  return (
    <div
      style={{
        maxWidth: 420,
        margin: '32px auto',
        padding: 8,
        borderRadius: 24,
        background: 'linear-gradient(135deg, #f8fafc 60%, #fda085 100%)',
        boxShadow: '0 8px 32px 0 #0002',
        minHeight: 520,
        position: 'relative',
        userSelect: 'none',
        fontFamily: 'inherit',
        width: '98vw',
        touchAction: 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontWeight: 900, fontSize: 32, color: '#f76d6d', letterSpacing: 2, textShadow: '0 2px 8px #fff7e6' }}>Snake</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select value={level} onChange={handleLevelChange} style={{ padding: 8, borderRadius: 8, fontWeight: 700, fontSize: 16, color: '#f76d6d', background: '#fff7e6', border: 'none', boxShadow: '0 2px 8px #fda085' }}>
            {LEVELS.map((l, i) => <option key={l.name} value={i}>{l.name}</option>)}
          </select>
          <div style={{ background: '#fff7e6', borderRadius: 12, padding: '8px 18px', fontWeight: 700, color: '#f76d6d', fontSize: 18, boxShadow: '0 2px 8px #fda085' }}>Điểm: {score}</div>
          <div style={{ background: '#fff7e6', borderRadius: 12, padding: '8px 18px', fontWeight: 700, color: '#fda085', fontSize: 18, boxShadow: '0 2px 8px #fda085' }}>Kỷ lục: {best}</div>
        </div>
      </div>
      <div style={{
        background: COLORS.bg,
        borderRadius: 18,
        margin: '0 auto',
        width: 'min(90vw, 90vw, 420px)',
        height: 'min(90vw, 90vw, 420px)',
        maxWidth: 420,
        maxHeight: 420,
        display: 'grid',
        gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
        gap: 1,
        position: 'relative',
        boxShadow: '0 2px 12px #fda085',
      }}>
        {/* Snake */}
        {snake.map((seg, i) => (
          i === 0 ? (
            <div
              key={i}
              style={{
                gridColumn: seg.x + 1,
                gridRow: seg.y + 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}
            >
              <img
                src="https://res.cloudinary.com/dpuim19bu/image/upload/v1747496030/adro3tqcenv6rk418f9a.jpg"
                alt="Snake Head"
                style={{
                  width: '90%',
                  height: '90%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: '0 0 16px #fda085',
                  background: COLORS.head,
                }}
              />
            </div>
          ) : (
            <div
              key={i}
              style={{
                gridColumn: seg.x + 1,
                gridRow: seg.y + 1,
                borderRadius: 6,
                background: COLORS.snake,
                boxShadow: '0 0 6px #fda085',
                width: '100%',
                height: '100%',
                zIndex: 2,
                transition: 'background 0.2s',
              }}
            />
          )
        ))}
        {/* Food */}
        <div
          style={{
            gridColumn: food.x + 1,
            gridRow: food.y + 1,
            borderRadius: 10,
            background: COLORS.food,
            boxShadow: '0 0 12px #fff7e6',
            width: '100%',
            height: '100%',
            zIndex: 1,
            animation: effect && effect.x === food.x && effect.y === food.y && effect.time + 300 > Date.now() ? 'pop 0.3s' : undefined,
          }}
        />
      </div>
      <div style={{ textAlign: 'center', marginTop: 18, color: '#f76d6d', fontWeight: 600, fontSize: 16 }}>
        Dùng phím mũi tên hoặc vuốt để điều khiển. Nhấn R để chơi lại.
      </div>
      {gameOver && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          color: '#fff', fontWeight: 900, fontSize: 32,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{ marginBottom: 16 }}>💥 Game Over!</div>
          <div style={{ fontSize: 20, marginBottom: 24 }}>Điểm của bạn: {score}</div>
          <button onClick={restart} style={{ padding: '16px 36px', fontSize: 22, borderRadius: 14, background: '#fda085', color: '#fff', border: 'none', fontWeight: 700, boxShadow: '0 2px 8px #fda085', cursor: 'pointer' }}>Chơi lại</button>
        </div>
      )}
      <style>{`
        @keyframes pop {
          0% { transform: scale(0.7); }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default GameSnake; 