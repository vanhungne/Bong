import './App.css';
import './BongPage.css';
import { useEffect, useState } from 'react';
import GamePaddle from './GamePaddle';
import Game2048 from './Game2048';
import GameSnake from './GameSnake';

// Thêm mảng hiệu ứng
const EFFECTS = [
  'pulse',      // 0
  'shake',      // 1
  'rotate',     // 2
  'confetti',   // 3
  'firework',   // 4 (tại avatar)
  'firework-full', // 5 (toàn màn hình)
  'ice',        // 6 (băng giá)
  'jump',       // 7 (avatar nhảy toàn map)
  'snow',       // 8 (tuyết rơi)
];

// Danh sách avatar mẫu, bạn có thể thay đổi ảnh và text tùy ý
const AVATARS = [
  {
    image: 'https://res.cloudinary.com/dpuim19bu/image/upload/v1747496030/adro3tqcenv6rk418f9a.jpg',
    name: 'Nguyễn Mỹ Duyên',
    nickname: 'Bong',
    desc: 'Duyên là một con rắn .'
  },
  {
    image: 'https://res.cloudinary.com/dpuim19bu/image/upload/v1747496030/adro3tqcenv6rk418f9a.jpg',
    name: 'Nguyễn Mỹ Duyên',
    nickname: 'Bong',
    desc: 'Duyên là một con rắn .'
  },
  {
    image: 'https://res.cloudinary.com/dpuim19bu/image/upload/v1747496030/adro3tqcenv6rk418f9a.jpg',
    name: 'Nguyễn Mỹ Duyên',
    nickname: 'Bong',
    desc: 'Duyên là một con snake .'
  },
  {
    image: 'https://res.cloudinary.com/dpuim19bu/image/upload/v1747496030/adro3tqcenv6rk418f9a.jpg',
    name: 'Nguyễn Mỹ Duyên',
    nickname: 'Bong',
    desc: 'Duyên là một con rắn .'
  },
  // Thêm nhiều object nữa nếu muốn
];
const NUM_AVATARS = 18;

const BG_GRADIENTS = [
  {
    name: 'Xanh biển',
    value: 'linear-gradient(135deg, #0f2027 0%, #2c5364 40%, #fda085 100%)'
  },
  {
    name: 'Hồng tím',
    value: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)'
  },
  {
    name: 'Xanh lá - vàng',
    value: 'linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)'
  },
  {
    name: 'Tím xanh',
    value: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)'
  },
  {
    name: 'Cam vàng',
    value: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)'
  },
];

function ConfettiEffect({ x, y }) {
  // Đơn giản: render các div nhỏ màu sắc random tại vị trí x, y
  const confetti = Array.from({ length: 24 }).map((_, i) => {
    const color = ['#fda085', '#f76d6d', '#f6d365', '#fff7e6', '#00fff0', '#ff00ea'][i % 6];
    const left = Math.random() * 80 - 40;
    const top = Math.random() * 80 - 40;
    const rotate = Math.random() * 360;
    const delay = Math.random() * 0.3;
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `calc(${x} + ${left}px)`,
          top: `calc(${y} + ${top}px)`,
          width: 10 + Math.random() * 6,
          height: 10 + Math.random() * 6,
          background: color,
          borderRadius: '50%',
          opacity: 0.85,
          transform: `rotate(${rotate}deg)`,
          animation: `confetti-fall 0.9s ${delay}s ease-out forwards`,
          zIndex: 2000
        }}
      />
    );
  });
  return <>{confetti}</>;
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

function FireworkFullScreen() {
  // Render nhiều FireworkEffect random toàn màn hình
  const fireworks = Array.from({ length: 6 }).map((_, i) => {
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight * 0.7 + 40;
    return <FireworkEffect key={i} x={x + 'px'} y={y + 'px'} />;
  });
  return <>{fireworks}</>;
}

function IceEffect({ x, y }) {
  // Render hiệu ứng băng giá tại vị trí avatar
  return (
    <div style={{
      position: 'absolute',
      left: `calc(${x} - 40px)`,
      top: `calc(${y} - 40px)`,
      width: 80,
      height: 80,
      pointerEvents: 'none',
      zIndex: 2000,
      animation: 'ice-freeze 1.2s cubic-bezier(0.4,0,0.2,1) forwards'
    }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <g stroke="#b3e0ff" strokeWidth="4" strokeLinecap="round">
          <line x1="40" y1="10" x2="40" y2="70" />
          <line x1="10" y1="40" x2="70" y2="40" />
          <line x1="20" y1="20" x2="60" y2="60" />
          <line x1="60" y1="20" x2="20" y2="60" />
        </g>
      </svg>
    </div>
  );
}

function SnowEffect() {
  // Render nhiều bông tuyết rơi toàn màn hình
  const snowflakes = Array.from({ length: 40 }).map((_, i) => {
    const left = Math.random() * 100;
    const size = 12 + Math.random() * 18;
    const duration = 1.1 + Math.random() * 0.7;
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

function MovingAvatars() {
  const [avatars, setAvatars] = useState([]);
  const [active, setActive] = useState(null); // {id, top, left, size, info, effect}
  const [dragging, setDragging] = useState(null); // {id, offsetX, offsetY}
  const [specialEffect, setSpecialEffect] = useState(null); // {type, x, y, id}
  const [fireworkFull, setFireworkFull] = useState(false);
  const [showSnow, setShowSnow] = useState(false);

  useEffect(() => {
    // Random hóa vị trí, hiệu ứng, và gán info cho từng avatar
    const arr = Array.from({ length: NUM_AVATARS }).map((_, i) => {
      const info = AVATARS[i % AVATARS.length];
      return {
        id: i,
        top: Math.random() * 80 + 5 + '%',
        left: Math.random() * 80 + 5 + '%',
        duration: 7 + Math.random() * 6,
        delay: Math.random() * 4,
        direction: Math.random() > 0.5 ? 'normal' : 'reverse',
        size: 90 + Math.random() * 60,
        rotate: Math.random() * 360,
        info,
        effect: EFFECTS[i % EFFECTS.length],
      };
    });
    setAvatars(arr);
  }, []);

  // Xử lý kéo avatar
  const handleMouseDown = (e, a) => {
    e.stopPropagation();
    const rect = e.target.getBoundingClientRect();
    setDragging({
      id: a.id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    });
  };

  useEffect(() => {
    if (dragging) {
      const handleMouseMove = (e) => {
        setAvatars(prev =>
          prev.map(av =>
            av.id === dragging.id
              ? {
                  ...av,
                  left: ((e.clientX - dragging.offsetX) / window.innerWidth) * 100 + '%',
                  top: ((e.clientY - dragging.offsetY) / window.innerHeight) * 100 + '%'
                }
              : av
          )
        );
      };
      const handleMouseUp = () => setDragging(null);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging]);

  // Hiệu ứng khi click
  const handleClick = (a, e) => {
    setActive({ ...a });
    const rect = e.target.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + window.scrollX;
    const y = rect.top + rect.height / 2 + window.scrollY;
    if (a.effect === 'confetti' || a.effect === 'firework') {
      setSpecialEffect({ type: a.effect, x: `${x}px`, y: `${y}px`, id: a.id });
      setTimeout(() => setSpecialEffect(null), 1200);
    } else if (a.effect === 'firework-full') {
      setFireworkFull(true);
      setTimeout(() => setFireworkFull(false), 1200);
    } else if (a.effect === 'ice') {
      setSpecialEffect({ type: 'ice', x: `${x}px`, y: `${y}px`, id: a.id });
      setTimeout(() => setSpecialEffect(null), 1200);
    } else if (a.effect === 'jump') {
      // Avatar nhảy lên rồi rơi xuống vị trí mới random
      setAvatars(prev => prev.map(av =>
        av.id === a.id
          ? { ...av, jumping: true }
          : av
      ));
      setTimeout(() => {
        setAvatars(prev => prev.map(av =>
          av.id === a.id
            ? {
                ...av,
                jumping: false,
                top: Math.random() * 80 + 5 + '%',
                left: Math.random() * 80 + 5 + '%',
              }
            : av
        ));
      }, 700);
    } else if (a.effect === 'snow') {
      setShowSnow(true);
      setTimeout(() => setShowSnow(false), 1200);
    }
    setTimeout(() => setActive(null), 1200);
  };

  return (
    <>
      <div className="moving-avatars">
        {avatars.map((a, idx) => (
          <img
            key={a.id}
            src={a.info.image}
            className={
              'moving-avatar snake' +
              (idx === 0 ? ' snake-head' : '') +
              (active && active.id === a.id ? ` moving-avatar-active avatar-effect-${a.effect}` : '') +
              (dragging && dragging.id === a.id ? ' dragging' : '') +
              (a.jumping ? ' avatar-jumping' : '')
            }
            style={{
              top: a.top,
              left: a.left,
              width: a.size + 'px',
              height: a.size + 'px',
              animationDuration: a.duration + 's',
              animationDelay: (idx * 0.25) + 's',
              animationDirection: a.direction,
              '--rotate': `${a.rotate}deg`,
              '--duration': `${a.duration}s`,
              pointerEvents: 'auto',
              zIndex: dragging && dragging.id === a.id ? 999 : undefined
            }}
            alt={a.info.name}
            onClick={e => handleClick(a, e)}
            onMouseDown={e => handleMouseDown(e, a)}
          />
        ))}
        {/* Render hiệu ứng đặc biệt nếu có */}
        {specialEffect && specialEffect.type === 'confetti' && (
          <ConfettiEffect x={specialEffect.x} y={specialEffect.y} />
        )}
        {specialEffect && specialEffect.type === 'firework' && (
          <FireworkEffect x={specialEffect.x} y={specialEffect.y} />
        )}
        {specialEffect && specialEffect.type === 'ice' && (
          <IceEffect x={specialEffect.x} y={specialEffect.y} />
        )}
        {fireworkFull && <FireworkFullScreen />}
        {showSnow && <SnowEffect />}
      </div>
    </>
  );
}

function Snake() {
  const NUM_SEGMENTS = 60;
  const SEG_SIZE = 36;
  const SPEED = 8;
  const [segments, setSegments] = useState(
    Array.from({ length: NUM_SEGMENTS }).map((_, i) => ({
      x: window.innerWidth / 2 - i * SEG_SIZE,
      y: window.innerHeight / 2
    }))
  );
  const [dir, setDir] = useState({ x: 1, y: 0 });

  // Đổi hướng ngẫu nhiên mỗi 400ms
  useEffect(() => {
    const interval = setInterval(() => {
      setDir(d => {
        if (Math.random() < 0.6) return d;
        const dirs = [
          { x: 1, y: 0 },
          { x: -1, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: -1 }
        ];
        const filtered = dirs.filter(nd => nd.x !== -d.x || nd.y !== -d.y);
        return filtered[Math.floor(Math.random() * filtered.length)];
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Di chuyển rắn
  useEffect(() => {
    const move = setInterval(() => {
      setSegments(prev => {
        const head = {
          x: prev[0].x + dir.x * SPEED,
          y: prev[0].y + dir.y * SPEED
        };
        let newDir = dir;
        if (
          head.x < 0 ||
          head.x > window.innerWidth - SEG_SIZE ||
          head.y < 0 ||
          head.y > window.innerHeight - SEG_SIZE
        ) {
          const dirs = [
            { x: 1, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: -1 }
          ];
          newDir = dirs[Math.floor(Math.random() * dirs.length)];
          setDir(newDir);
        }
        const newSegs = [head, ...prev.slice(0, -1)];
        return newSegs;
      });
    }, 60);
    return () => clearInterval(move);
  }, [dir]);

  return (
    <div className="snake">
      {segments.map((seg, i) => (
        <div
          key={i}
          className={'snake-segment' + (i === 0 ? ' snake-head' : '')}
          style={{
            left: seg.x,
            top: seg.y,
            width: SEG_SIZE,
            height: SEG_SIZE
          }}
        />
      ))}
    </div>
  );
}

function App() {
  const [bg, setBg] = useState(BG_GRADIENTS[0].value);
  const [showGame, setShowGame] = useState(false);
  const [show2048, setShow2048] = useState(false);
  const [showSnake, setShowSnake] = useState(false);
  return (
    <div className="bong-bg" style={{ background: bg }}>
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 100, display: 'flex', gap: 12 }}>
        <select
          style={{ padding: 8, borderRadius: 8, fontWeight: 600, fontSize: 16 }}
          value={bg}
          onChange={e => setBg(e.target.value)}
        >
          {BG_GRADIENTS.map(g => (
            <option key={g.value} value={g.value}>{g.name}</option>
          ))}
        </select>
        <button
          style={{ padding: '8px 18px', borderRadius: 8, fontWeight: 700, fontSize: 16, background: '#fda085', color: '#fff', border: 'none', boxShadow: '0 2px 8px #fda085', cursor: 'pointer' }}
          onClick={() => { setShowGame(g => !g); setShow2048(false); setShowSnake(false); }}
        >
          {showGame ? 'Quay lại hiệu ứng' : 'thanh chắn'}
        </button>
        <button
          style={{ padding: '8px 18px', borderRadius: 8, fontWeight: 700, fontSize: 16, background: '#f76d6d', color: '#fff', border: 'none', boxShadow: '0 2px 8px #f76d6d', cursor: 'pointer' }}
          onClick={() => { setShow2048(g => !g); setShowGame(false); setShowSnake(false); }}
        >
          {show2048 ? 'Quay lại hiệu ứng' : '2048'}
        </button>
        <button
          style={{ padding: '8px 18px', borderRadius: 8, fontWeight: 700, fontSize: 16, background: '#43cea2', color: '#fff', border: 'none', boxShadow: '0 2px 8px #43cea2', cursor: 'pointer' }}
          onClick={() => { setShowSnake(g => !g); setShowGame(false); setShow2048(false); }}
        >
          {showSnake ? 'Quay lại hiệu ứng' : 'Snake'}
        </button>
      </div>
      {showSnake ? (
        <GameSnake />
      ) : show2048 ? (
        <Game2048 />
      ) : showGame ? (
        <GamePaddle />
      ) : (
        <>
          <div className="neon-lights">
            <div className="neon-bar neon-bar1"></div>
            <div className="neon-bar neon-bar2"></div>
            <div className="neon-bar neon-bar3"></div>
          </div>
          <Snake />
          <MovingAvatars />
          <div className="bong-glow-orbs">
            <div className="orb orb1"></div>
            <div className="orb orb2"></div>
            <div className="orb orb3"></div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
