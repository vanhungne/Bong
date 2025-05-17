import React, { useEffect, useRef, useState } from 'react';

const SIZE = 4;
const INIT_TILES = 2;
const TILE_COLORS = {
  2:   '#eee4da', 4:   '#ede0c8', 8:   '#f2b179', 16:  '#f59563',
  32:  '#f67c5f', 64:  '#f65e3b', 128: '#edcf72', 256: '#edcc61',
  512: '#edc850', 1024:'#edc53f', 2048:'#edc22e',
  4096:'#3c3a32', 8192:'#3c3a32', 16384:'#3c3a32',
};
const TILE_TEXT_COLORS = {
  2: '#776e65', 4: '#776e65', 8: '#fff', 16: '#fff', 32: '#fff', 64: '#fff', 128: '#fff', 256: '#fff', 512: '#fff', 1024: '#fff', 2048: '#fff', 4096: '#fff', 8192: '#fff', 16384: '#fff',
};

function getEmptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}
function getRandomEmptyCell(board) {
  const empty = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (board[r][c] === 0) empty.push([r, c]);
  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}
function addRandomTile(board) {
  const cell = getRandomEmptyCell(board);
  if (!cell) return board;
  const [r, c] = cell;
  const value = Math.random() < 0.9 ? 2 : 4;
  const newBoard = board.map(row => row.slice());
  newBoard[r][c] = value;
  return newBoard;
}
function clone(board) {
  return board.map(row => row.slice());
}
function canMove(board) {
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (board[r][c] === 0) return true;
    if (c < SIZE-1 && board[r][c] === board[r][c+1]) return true;
    if (r < SIZE-1 && board[r][c] === board[r+1][c]) return true;
  }
  return false;
}
function transpose(board) {
  return board[0].map((_,c) => board.map(row => row[c]));
}
function reverse(board) {
  return board.map(row => row.slice().reverse());
}
function moveLeft(board) {
  let moved = false;
  let score = 0;
  let merged = Array.from({length: SIZE}, () => Array(SIZE).fill(false));
  const newBoard = board.map(row => {
    let arr = row.filter(x => x !== 0);
    for (let i = 0; i < arr.length-1; i++) {
      if (arr[i] && arr[i] === arr[i+1] && !merged[row.indexOf(arr[i])][i] && !merged[row.indexOf(arr[i+1])][i+1]) {
        arr[i] *= 2;
        score += arr[i];
        arr[i+1] = 0;
        merged[row.indexOf(arr[i])][i] = true;
      }
    }
    arr = arr.filter(x => x !== 0);
    while (arr.length < SIZE) arr.push(0);
    return arr;
  });
  if (JSON.stringify(newBoard) !== JSON.stringify(board)) moved = true;
  return { board: newBoard, moved, score };
}
function moveRight(board) {
  const rev = reverse(board);
  const { board: moved, moved: didMove, score } = moveLeft(rev);
  return { board: reverse(moved), moved: didMove, score };
}
function moveUp(board) {
  const trans = transpose(board);
  const { board: moved, moved: didMove, score } = moveLeft(trans);
  return { board: transpose(moved), moved: didMove, score };
}
function moveDown(board) {
  const trans = transpose(board);
  const { board: moved, moved: didMove, score } = moveRight(trans);
  return { board: transpose(moved), moved: didMove, score };
}

function Game2048() {
  const [board, setBoard] = useState(() => {
    let b = getEmptyBoard();
    for (let i = 0; i < INIT_TILES; i++) b = addRandomTile(b);
    return b;
  });
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(localStorage.getItem('best2048')||0));
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [history, setHistory] = useState([]);
  const [anim, setAnim] = useState({});
  const boardRef = useRef();
  const touch = useRef({x:0,y:0});

  useEffect(() => {
    if (score > best) {
      setBest(score);
      localStorage.setItem('best2048', score);
    }
  }, [score, best]);

  useEffect(() => {
    if (!canMove(board)) setGameOver(true);
    if (board.flat().includes(2048)) setWon(true);
  }, [board]);

  useEffect(() => {
    const handleKey = e => {
      if (gameOver || won) return;
      if (['ArrowLeft','a','A'].includes(e.key)) move('left');
      if (['ArrowRight','d','D'].includes(e.key)) move('right');
      if (['ArrowUp','w','W'].includes(e.key)) move('up');
      if (['ArrowDown','s','S'].includes(e.key)) move('down');
      if (e.ctrlKey && e.key === 'z') undo();
      if (e.key === 'r' || e.key === 'R') restart();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  function move(dir) {
    let fn = moveLeft;
    if (dir==='right') fn = moveRight;
    if (dir==='up') fn = moveUp;
    if (dir==='down') fn = moveDown;
    const { board: newBoard, moved, score: addScore } = fn(board);
    if (!moved) return;
    setHistory(h => [...h.slice(-20), {board: clone(board), score}]);
    setBoard(addRandomTile(newBoard));
    setScore(s => s + addScore);
    setAnim({dir, time: Date.now()});
  }
  function undo() {
    if (history.length === 0) return;
    const last = history[history.length-1];
    setBoard(clone(last.board));
    setScore(last.score);
    setHistory(h => h.slice(0,-1));
    setGameOver(false);
    setWon(false);
  }
  function restart() {
    let b = getEmptyBoard();
    for (let i = 0; i < INIT_TILES; i++) b = addRandomTile(b);
    setBoard(b);
    setScore(0);
    setHistory([]);
    setGameOver(false);
    setWon(false);
    setAnim({});
  }
  // Vuốt trên mobile
  function handleTouchStart(e) {
    if (e.touches.length) {
      touch.current = {x: e.touches[0].clientX, y: e.touches[0].clientY};
    }
  }
  function handleTouchEnd(e) {
    if (!touch.current.x && !touch.current.y) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    if (Math.abs(dx) > 40 || Math.abs(dy) > 40) {
      if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 'right' : 'left');
      else move(dy > 0 ? 'down' : 'up');
    }
    touch.current = {x:0,y:0};
  }

  return (
    <div style={{
      maxWidth: 420, margin: '32px auto', padding: 8, borderRadius: 24,
      background: 'linear-gradient(135deg, #f8fafc 60%, #fda085 100%)',
      boxShadow: '0 8px 32px 0 #0002',
      minHeight: 520, position: 'relative',
      userSelect: 'none',
      fontFamily: 'inherit',
      width: '98vw',
    }}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{fontWeight:900,fontSize:32,color:'#f76d6d',letterSpacing:2,textShadow:'0 2px 8px #fff7e6'}}>2048</div>
        <div style={{display:'flex',gap:12}}>
          <div style={{background:'#fff7e6',borderRadius:12,padding:'8px 18px',fontWeight:700,color:'#f76d6d',fontSize:18,boxShadow:'0 2px 8px #fda085'}}>Điểm: {score}</div>
          <div style={{background:'#fff7e6',borderRadius:12,padding:'8px 18px',fontWeight:700,color:'#fda085',fontSize:18,boxShadow:'0 2px 8px #fda085'}}>Kỷ lục: {best}</div>
        </div>
      </div>
      <div style={{display:'flex',gap:12,marginBottom:16}}>
        <button onClick={undo} style={{flex:1,padding:'12px 0',borderRadius:10,fontWeight:700,fontSize:18,background:'#fda085',color:'#fff',border:'none',boxShadow:'0 2px 8px #fda085',cursor:'pointer'}}>Undo</button>
        <button onClick={restart} style={{flex:1,padding:'12px 0',borderRadius:10,fontWeight:700,fontSize:18,background:'#f76d6d',color:'#fff',border:'none',boxShadow:'0 2px 8px #f76d6d',cursor:'pointer'}}>Chơi lại</button>
      </div>
      <div
        ref={boardRef}
        style={{
          background:'#bbada0',borderRadius:18,padding:8,
          display:'grid',gridTemplateColumns:`repeat(${SIZE},1fr)`,gap:8,
          touchAction:'none',
          minHeight:320,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {board.map((row,r) => row.map((cell,c) => (
          <div key={r+','+c} style={{
            width:70,height:70,maxWidth:'20vw',maxHeight:'20vw',
            background: cell ? TILE_COLORS[cell] : '#cdc1b4',
            color: cell ? TILE_TEXT_COLORS[cell] : 'transparent',
            borderRadius:14,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontWeight:900,fontSize:cell>=1024?26:cell>=128?30:cell>=16?34:38,
            boxShadow: cell ? '0 2px 12px #fda085' : 'none',
            transition:'background 0.2s, color 0.2s, transform 0.2s',
            animation: anim.dir && cell && anim.time+100>Date.now() ? `tilePop 0.18s` : undefined,
            zIndex:2,
          }}>{cell||''}</div>
        )))}
      </div>
      {gameOver && (
        <div style={{
          position:'absolute',top:0,left:0,right:0,bottom:0,
          background:'rgba(0,0,0,0.7)',
          color:'#fff',fontWeight:900,fontSize:32,
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:100
        }}>
          <div style={{marginBottom:16}}>💥 Game Over!</div>
          <div style={{fontSize:20,marginBottom:24}}>Điểm của bạn: {score}</div>
          <button onClick={restart} style={{padding:'16px 36px',fontSize:22,borderRadius:14,background:'#fda085',color:'#fff',border:'none',fontWeight:700,boxShadow:'0 2px 8px #fda085',cursor:'pointer'}}>Chơi lại</button>
        </div>
      )}
      {won && (
        <div style={{
          position:'absolute',top:0,left:0,right:0,bottom:0,
          background:'rgba(0,0,0,0.5)',
          color:'#fff',fontWeight:900,fontSize:32,
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:100
        }}>
          <div style={{marginBottom:16}}>🎉 Bạn đã đạt 2048!</div>
          <div style={{fontSize:20,marginBottom:24}}>Điểm của bạn: {score}</div>
          <button onClick={restart} style={{padding:'16px 36px',fontSize:22,borderRadius:14,background:'#fda085',color:'#fff',border:'none',fontWeight:700,boxShadow:'0 2px 8px #fda085',cursor:'pointer'}}>Chơi lại</button>
        </div>
      )}
      <style>{`
        @keyframes tilePop {
          0% { transform: scale(0.7); }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default Game2048; 