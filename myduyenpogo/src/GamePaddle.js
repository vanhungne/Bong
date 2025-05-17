import React, { useEffect, useRef, useState } from 'react';

const AVATAR_IMG = 'https://res.cloudinary.com/dpuim19bu/image/upload/v1747496030/adro3tqcenv6rk418f9a.jpg';
const PADDLE_WIDTH = 120;
const PADDLE_HEIGHT = 32;
const BALL_SIZE = 48;
const GAME_RATIO = 7/10; // width/height
const INIT_LIVES = 3;

function randomX(width) {
  return Math.random() * (width - BALL_SIZE);
}

function ConfettiScreen({gameW, gameH}) {
  // Render confetti toàn màn hình
  const confetti = Array.from({ length: 36 }).map((_, i) => {
    const color = ['#fda085', '#f76d6d', '#f6d365', '#fff7e6', '#00fff0', '#ff00ea'][i % 6];
    const left = Math.random() * gameW;
    const top = Math.random() * gameH * 0.7;
    const rotate = Math.random() * 360;
    const delay = Math.random() * 0.3;
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left,
          top,
          width: 18 + Math.random() * 12,
          height: 18 + Math.random() * 12,
          background: color,
          borderRadius: '50%',
          opacity: 0.85,
          transform: `rotate(${rotate}deg)`,
          animation: `confetti-fall 1.2s ${delay}s ease-out forwards`,
          zIndex: 3000
        }}
      />
    );
  });
  return <div style={{position:'fixed',left:0,top:0,width:'100vw',height:'100vh',pointerEvents:'none',zIndex:3000}}>{confetti}</div>;
}

function FireworkFullScreen({gameW, gameH}) {
  // Render nhiều FireworkEffect random toàn màn hình
  const fireworks = Array.from({ length: 8 }).map((_, i) => {
    const x = Math.random() * gameW;
    const y = Math.random() * gameH * 0.7 + 40;
    return <FireworkEffect key={i} x={x + 'px'} y={y + 'px'} />;
  });
  return <>{fireworks}</>;
}

function SnowEffectScreen() {
  // Render nhiều bông tuyết rơi toàn màn hình
  const snowflakes = Array.from({ length: 60 }).map((_, i) => {
    const left = Math.random() * 100;
    const size = 16 + Math.random() * 22;
    const duration = 1.5 + Math.random() * 1.2;
    const delay = Math.random() * 0.7;
    return (
      <div
        key={i}
        className="snowflake"
        style={{
          left: left + 'vw',
          width: size,
          height: size,
          animationDuration: duration + 's',
          animationDelay: delay + 's',
        }}
      />
    );
  });
  return <div className="snow-effect">{snowflakes}</div>;
}

function FireworkEffect({ x, y }) {
  // Đơn giản: render các tia pháo hoa
  const bursts = Array.from({ length: 8 }).map((_, i) => {
    const color = ['#fda085', '#f76d6d', '#f6d365', '#fff7e6'][i % 4];
    const rotate = i * 45;
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `calc(${x} - 4px)`,
          top: `calc(${y} - 40px)`,
          width: 8,
          height: 80,
          background: `linear-gradient(to top, #fff7e6, ${color})`,
          borderRadius: 8,
          opacity: 0.85,
          transform: `rotate(${rotate}deg)`,
          animation: 'firework-burst 0.9s cubic-bezier(0.4,0,0.2,1) forwards',
          zIndex: 2000
        }}
      />
    );
  });
  return <>{bursts}</>;
}

function MilestoneOverlay({ type, onClose, gameW, gameH, score }) {
  let effect = null;
  let text = '';
  if (type === 'confetti') {
    effect = <ConfettiScreen gameW={window.innerWidth} gameH={window.innerHeight} />;
    text = `🎉 Chúc mừng! Đạt ${score} điểm!`;
  } else if (type === 'firework') {
    effect = <FireworkFullScreen gameW={window.innerWidth} gameH={window.innerHeight} />;
    text = `🎆 Tuyệt vời! Đạt ${score} điểm!`;
  } else if (type === 'snow') {
    effect = <SnowEffectScreen />;
    text = `❄️ Siêu đỉnh! Đạt ${score} điểm!`;
  }
  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
      background: 'rgba(30,40,60,0.55)',
      zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column',
      pointerEvents: 'auto',
      animation: 'fadeInMilestone 0.5s',
    }} onClick={onClose}>
      {effect}
      <div style={{
        position: 'relative',
        color: '#fff',
        fontWeight: 900,
        fontSize: window.innerWidth < 600 ? 32 : 54,
        textShadow: '0 4px 32px #fda085, 0 0 32px #fff7e6',
        marginTop: 40,
        background: 'rgba(0,0,0,0.18)',
        borderRadius: 24,
        padding: '24px 36px',
        boxShadow: '0 4px 32px #fda085',
        letterSpacing: 2,
        textAlign: 'center',
        animation: 'popMilestone 0.7s',
      }}>{text}</div>
      <div style={{color:'#fff',marginTop:24,fontSize:18,opacity:0.8}}>Bấm vào màn hình để tiếp tục</div>
    </div>
  );
}

function GamePaddle() {
  // Responsive width/height
  const [gameW, setGameW] = useState(420);
  const [gameH, setGameH] = useState(600);
  const [balls, setBalls] = useState([]); // {x, y, type: 'avatar'|'bomb', id}
  const [paddleX, setPaddleX] = useState(150);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [paused, setPaused] = useState(false);
  const [full, setFull] = useState(false);
  const [effect, setEffect] = useState(null); // 'score'|'bomb'|'life'
  const [lives, setLives] = useState(INIT_LIVES);
  const [timer, setTimer] = useState(0); // giây
  const [speed, setSpeed] = useState(2.2);
  const gameRef = useRef();
  const paddleRef = useRef();
  const animRef = useRef();
  const touchId = useRef(null);
  const timerRef = useRef();
  const [milestones, setMilestones] = useState({50:false,100:false,150:false});
  const [milestoneShow, setMilestoneShow] = useState(null); // 'confetti'|'firework'|'snow'

  // Responsive
  useEffect(() => {
    function resize() {
      let w = window.innerWidth < 500 ? window.innerWidth - 16 : 420;
      let h = Math.round(w / GAME_RATIO);
      if (window.innerHeight < h + 80) h = window.innerHeight - 80;
      setGameW(w);
      setGameH(h);
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Focus game khi mở lại
  useEffect(() => {
    if (gameRef.current) gameRef.current.focus();
  }, [playing, full]);

  // Thêm bóng mới định kỳ
  useEffect(() => {
    if (!playing || paused) return;
    const interval = setInterval(() => {
      setBalls(balls => [
        ...balls,
        {
          x: randomX(gameW),
          y: -BALL_SIZE,
          type: Math.random() < 0.8 ? 'avatar' : 'bomb',
          id: Math.random().toString(36).slice(2)
        }
      ]);
    }, 1100);
    return () => clearInterval(interval);
  }, [playing, paused, gameW]);

  // Di chuyển bóng
  useEffect(() => {
    if (!playing || paused) return;
    function step() {
      setBalls(balls => balls.map(b => ({ ...b, y: b.y + speed })));
      animRef.current = requestAnimationFrame(step);
    }
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, paused, speed]);

  // Tăng tốc độ bóng dần theo thời gian
  useEffect(() => {
    if (!playing || paused) return;
    const interval = setInterval(() => {
      setSpeed(s => Math.min(s + 0.08, 10));
    }, 2500);
    return () => clearInterval(interval);
  }, [playing, paused]);

  // Đếm thời gian
  useEffect(() => {
    if (!playing || paused) return;
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [playing, paused]);

  // Kiểm tra va chạm
  useEffect(() => {
    if (!playing || paused) return;
    setBalls(balls => balls.filter(b => {
      // Nếu bóng chạm paddle
      if (
        b.y + BALL_SIZE >= gameH - PADDLE_HEIGHT - 8 &&
        b.y + BALL_SIZE <= gameH + 12 &&
        b.x + BALL_SIZE > paddleX &&
        b.x < paddleX + PADDLE_WIDTH
      ) {
        if (b.type === 'avatar') {
          setScore(s => s + 1);
          setEffect('score');
          setTimeout(() => setEffect(null), 350);
        }
        if (b.type === 'bomb') {
          setLives(l => l - 1);
          setEffect('bomb');
          setTimeout(() => setEffect(null), 350);
        }
        return false; // Xoá bóng
      }
      // Nếu bóng rơi ra ngoài
      if (b.y > gameH + 32) {
        // Nếu là avatar thì mất mạng
        if (b.type === 'avatar') {
          setLives(l => l - 1);
          setEffect('life');
          setTimeout(() => setEffect(null), 350);
        }
        return false;
      }
      return true;
    }));
  }, [balls, paddleX, playing, paused, gameH]);

  // Game over khi hết mạng
  useEffect(() => {
    if (lives <= 0 && playing) {
      setGameOver(true);
      setPlaying(false);
    }
  }, [lives, playing]);

  // Điều khiển paddle bằng phím
  useEffect(() => {
    if (!playing || paused) return;
    const handleKey = e => {
      if (e.key === 'ArrowLeft') setPaddleX(x => Math.max(0, x - 32));
      if (e.key === 'ArrowRight') setPaddleX(x => Math.min(gameW - PADDLE_WIDTH, x + 32));
      if (e.key === ' ' || e.key === 'Spacebar') setPaused(p => !p);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [playing, paused, gameW]);

  // Điều khiển paddle bằng chuột
  function handleMouseMove(e) {
    if (!gameRef.current || paused) return;
    const rect = gameRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left - PADDLE_WIDTH/2;
    x = Math.max(0, Math.min(gameW - PADDLE_WIDTH, x));
    setPaddleX(x);
  }

  // Điều khiển paddle bằng chạm (mobile)
  function handleTouchStart(e) {
    if (e.touches.length > 0) touchId.current = e.touches[0].identifier;
  }
  function handleTouchMove(e) {
    if (!gameRef.current || paused) return;
    let t = Array.from(e.touches).find(t => t.identifier === touchId.current) || e.touches[0];
    const rect = gameRef.current.getBoundingClientRect();
    let x = t.clientX - rect.left - PADDLE_WIDTH/2;
    x = Math.max(0, Math.min(gameW - PADDLE_WIDTH, x));
    setPaddleX(x);
  }
  function handleTouchEnd() {
    touchId.current = null;
  }

  function handleRestart() {
    setBalls([]);
    setScore(0);
    setGameOver(false);
    setPlaying(true);
    setPaused(false);
    setLives(INIT_LIVES);
    setTimer(0);
    setSpeed(2.2);
    setPaddleX(gameW/2 - PADDLE_WIDTH/2);
    setEffect(null);
    if (gameRef.current) gameRef.current.focus();
  }

  function handleFullScreen() {
    if (!document.fullscreenElement && gameRef.current) {
      gameRef.current.requestFullscreen?.();
      setFull(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen?.();
      setFull(false);
    }
  }

  function handlePause() {
    setPaused(p => !p);
    if (!paused && gameRef.current) gameRef.current.focus();
  }

  // Hiệu ứng milestone
  useEffect(() => {
    if (!milestones[50] && score >= 50) {
      setMilestones(m => ({...m, 50:true}));
      setMilestoneShow('confetti');
    }
    if (!milestones[100] && score >= 100) {
      setMilestones(m => ({...m, 100:true}));
      setMilestoneShow('firework');
    }
    if (!milestones[150] && score >= 150) {
      setMilestones(m => ({...m, 150:true}));
      setMilestoneShow('snow');
    }
  }, [score, milestones]);

  return (
    <div
      style={{
        width: gameW,
        height: gameH,
        background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
        borderRadius: 24,
        boxShadow: '0 8px 32px 0 #0008',
        margin: '32px auto',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        border: '4px solid #fda085',
        zIndex: 100,
        maxWidth: '98vw',
        maxHeight: '90vh',
        touchAction: 'none',
        outline: 'none',
        transition: 'width 0.2s, height 0.2s',
        fontFamily: 'inherit',
      }}
      ref={gameRef}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
    >
      {/* Score + Fullscreen + Pause + Lives + Timer */}
      <div style={{position:'absolute',top:12,left:20,fontWeight:700,fontSize:18,color:'#fff',textShadow:'0 2px 8px #fda085',zIndex:20,display:'flex',alignItems:'center',gap:12}}>
        <span>Điểm: {score}</span>
        <span>⏱ {Math.floor(timer/60)}:{(timer%60).toString().padStart(2,'0')}</span>
        <span>
          {Array.from({length: lives}).map((_,i) => <span key={i} style={{color:'#fda085',fontSize:22,marginRight:2}}>❤️</span>)}
        </span>
        <button
          onClick={handlePause}
          style={{padding:'6px 14px',fontSize:16,borderRadius:8,background:'#fda085',color:'#fff',border:'none',fontWeight:700,boxShadow:'0 2px 8px #fda085',cursor:'pointer'}}
        >
          {paused ? 'Tiếp tục' : 'Tạm dừng'}
        </button>
        <button
          onClick={handleFullScreen}
          style={{padding:'6px 14px',fontSize:16,borderRadius:8,background:'#fda085',color:'#fff',border:'none',fontWeight:700,boxShadow:'0 2px 8px #fda085',cursor:'pointer'}}
        >
          {full ? 'Thu nhỏ' : 'Toàn màn hình'}
        </button>
      </div>
      {/* Paddle */}
      <div
        ref={paddleRef}
        style={{
          position: 'absolute',
          left: paddleX,
          bottom: 16,
          width: PADDLE_WIDTH,
          height: PADDLE_HEIGHT,
          background: effect==='bomb' ? '#ff3b3b' : '#fff7e6',
          borderRadius: 18,
          boxShadow: effect==='score' ? '0 0 32px 8px #fda085, 0 0 0 8px #fff7e6' : '0 2px 12px #fda085',
          border: '2px solid #fda085',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 18,
          color: effect==='bomb' ? '#fff' : '#f76d6d',
          letterSpacing: 2,
          transition: 'left 0.1s, background 0.2s, box-shadow 0.2s, color 0.2s',
          zIndex: 10
        }}
      >
        <img src={AVATAR_IMG} alt="paddle" style={{height:28,width:28,borderRadius:'50%',marginRight:8}} />
        <span>Thanh chắn</span>
      </div>
      {/* Balls */}
      {balls.map(b => (
        <div key={b.id} style={{
          position: 'absolute',
          left: b.x,
          top: b.y,
          width: BALL_SIZE,
          height: BALL_SIZE,
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          {b.type === 'avatar' ? (
            <img src={AVATAR_IMG} alt="avatar" style={{width:BALL_SIZE,height:BALL_SIZE,borderRadius:'50%',boxShadow:'0 2px 12px #fda085'}} />
          ) : (
            <div style={{width:BALL_SIZE-8,height:BALL_SIZE-8,borderRadius:'50%',background:'#ff3b3b',boxShadow:'0 0 24px #ff3b3b,0 0 8px #fff',border:'4px solid #fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:22,color:'#fff',animation:'bombPulse 0.7s'}}>💣</div>
          )}
        </div>
      ))}
      {/* Hiệu ứng ăn điểm/mất mạng */}
      {effect==='score' && (
        <div style={{
          position:'absolute',left:paddleX+PADDLE_WIDTH/2-18,top:gameH-80,
          color:'#fda085',fontWeight:900,fontSize:32,textShadow:'0 2px 8px #fff7e6',
          zIndex:30,animation:'scorePop 0.4s'
        }}>+1</div>
      )}
      {effect==='life' && (
        <div style={{
          position:'absolute',left:paddleX+PADDLE_WIDTH/2-18,top:gameH-80,
          color:'#ff3b3b',fontWeight:900,fontSize:32,textShadow:'0 2px 8px #fff7e6',
          zIndex:30,animation:'scorePop 0.4s'
        }}>-1</div>
      )}
      {/* Game Over */}
      {gameOver && (
        <div style={{
          position:'absolute',top:0,left:0,right:0,bottom:0,
          background:'rgba(0,0,0,0.7)',
          color:'#fff',fontWeight:900,fontSize:32,
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:100
        }}>
          <div style={{marginBottom:16}}>💥 Game Over!</div>
          <div style={{fontSize:20,marginBottom:24}}>Điểm của bạn: {score}</div>
          <div style={{fontSize:18,marginBottom:24}}>Thời gian: {Math.floor(timer/60)}:{(timer%60).toString().padStart(2,'0')}</div>
          <button onClick={handleRestart} style={{padding:'16px 36px',fontSize:22,borderRadius:14,background:'#fda085',color:'#fff',border:'none',fontWeight:700,boxShadow:'0 2px 8px #fda085',cursor:'pointer'}}>Chơi lại</button>
        </div>
      )}
      {/* Overlay tạm dừng */}
      {paused && playing && !gameOver && (
        <div style={{
          position:'absolute',top:0,left:0,right:0,bottom:0,
          background:'rgba(0,0,0,0.35)',
          color:'#fff',fontWeight:900,fontSize:32,
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:100
        }}>
          <div style={{marginBottom:16}}>⏸ Đang tạm dừng</div>
          <button onClick={handlePause} style={{padding:'16px 36px',fontSize:22,borderRadius:14,background:'#fda085',color:'#fff',border:'none',fontWeight:700,boxShadow:'0 2px 8px #fda085',cursor:'pointer'}}>Tiếp tục</button>
        </div>
      )}
      {milestoneShow && (
        <MilestoneOverlay
          type={milestoneShow}
          score={milestoneShow==='confetti'?50:milestoneShow==='firework'?100:150}
          gameW={gameW}
          gameH={gameH}
          onClose={() => setMilestoneShow(null)}
        />
      )}
    </div>
  );
}

export default GamePaddle; 