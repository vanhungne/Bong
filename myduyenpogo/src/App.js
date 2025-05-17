import './App.css';
import './BongPage.css';
import { useEffect, useState, useRef } from 'react';

const AVATAR_URL = 'https://res.cloudinary.com/dpuim19bu/image/upload/v1747496030/adro3tqcenv6rk418f9a.jpg';
const NUM_AVATARS = 18;

const BONG_INFO = {
  name: 'Nguyễn Mỹ Duyên',
  nickname: 'Bong',
  desc: 'Duyên là một con rắn'
};

function MovingAvatars() {
  const [avatars, setAvatars] = useState([]);
  const [active, setActive] = useState(null); // {id, top, left, size}
  const [dragging, setDragging] = useState(null); // {id, offsetX, offsetY}

  useEffect(() => {
    const arr = Array.from({ length: NUM_AVATARS }).map((_, i) => ({
      id: i,
      top: Math.random() * 80 + 5 + '%',
      left: Math.random() * 80 + 5 + '%',
      duration: 7 + Math.random() * 6,
      delay: Math.random() * 4,
      direction: Math.random() > 0.5 ? 'normal' : 'reverse',
      size: 90 + Math.random() * 60,
      rotate: Math.random() * 360,
    }));
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

  const handleClick = (a) => {
    setActive({ ...a });
    setTimeout(() => setActive(null), 1000);
  };
  const handleClose = () => setActive(null);

  return (
    <>
      <div className="moving-avatars">
        {avatars.map((a, idx) => (
          <img
            key={a.id}
            src={AVATAR_URL}
            className={
              'moving-avatar snake' +
              (idx === 0 ? ' snake-head' : '') +
              (active && active.id === a.id ? ' moving-avatar-active' : '') +
              (dragging && dragging.id === a.id ? ' dragging' : '')
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
            alt="Bong"
            onClick={() => handleClick(a)}
            onMouseDown={e => handleMouseDown(e, a)}
          />
        ))}
      </div>
      {active && (
        <div
          className="avatar-popup"
          style={{
            top: active.top,
            left: active.left,
            minWidth: 260,
            zIndex: 1000
          }}
        >
          <button className="popup-close" onClick={handleClose}>×</button>
          <div className="popup-avatar-row">
            <img src={AVATAR_URL} alt="Bong" className="popup-avatar" />
            <div>
              <div className="popup-name">{BONG_INFO.name}</div>
              <div className="popup-nickname">({BONG_INFO.nickname})</div>
            </div>
          </div>
          <div className="popup-desc">{BONG_INFO.desc}</div>
        </div>
      )}
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
  return (
    <div className="bong-bg">
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
    </div>
  );
}

export default App;
