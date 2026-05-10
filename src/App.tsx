/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Play, Trophy, Clock, Info } from 'lucide-react';

// --- Constants & Types ---

type Color = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'black';
type GameMode = 'markers' | 'papers';

interface SortableItem {
  id: string;
  color: Color;
  x: number;
  y: number;
  rotation: number;
  isSorted: boolean;
}

const COLORS: Color[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'black'];

const COLOR_MAP: Record<Color, string> = {
  red: '#e63946',
  blue: '#457b9d',
  green: '#2a9d8f',
  yellow: '#e9c46a',
  purple: '#6d597a',
  orange: '#f4a261',
  black: '#264653', // Dark slate black
};

// --- Helper Components ---

const PixelMarker = ({ color }: { color: Color }) => (
  <div className="relative w-4 h-12 flex flex-col items-center">
    {/* Marker Cap */}
    <div 
      className="w-full h-4 border-2 border-slate-900 rounded-t-sm mb-[-2px] z-10"
      style={{ backgroundColor: COLOR_MAP[color] }}
    />
    {/* Marker Body */}
    <div className="w-10/12 h-8 border-2 border-slate-900 bg-slate-200" />
    {/* Marker Bottom */}
    <div className="w-10/12 h-1 border-2 border-t-0 border-slate-900 bg-slate-200" />
  </div>
);

const PixelJar = ({ color, isFull }: { color: Color, isFull: boolean }) => (
  <div className="relative w-16 h-20 flex flex-col items-center group">
    {/* Jar Opening */}
    <div className="w-14 h-4 border-2 border-slate-900 rounded-full bg-slate-100 mb-[-4px] z-20 flex items-center justify-center">
      <div className="w-10 h-2 bg-slate-300 rounded-full opacity-30" />
    </div>
    {/* Jar Body */}
    <div 
      className="w-full h-full border-2 border-slate-900 rounded-b-lg relative overflow-hidden transition-all duration-300"
      style={{ 
        backgroundColor: `${COLOR_MAP[color]}33`, // Semi-transparent
        borderColor: COLOR_MAP[color],
        borderWidth: '3px'
      }}
    >
      {/* Liquid/Content Level */}
      <motion.div 
        initial={{ height: 0 }}
        animate={{ height: isFull ? '70%' : '0%' }}
        className="absolute bottom-0 left-0 right-0"
        style={{ backgroundColor: COLOR_MAP[color] }}
      />
      {/* Glass Reflection */}
      <div className="absolute top-2 left-2 w-2 h-10 bg-white opacity-20 rounded-full" />
    </div>
    <span className="mt-2 text-[10px] font-mono uppercase font-bold text-slate-700">{color}</span>
  </div>
);

const PixelPaper = ({ color }: { color: Color }) => (
  <div 
    className="w-12 h-16 border-2 border-slate-900 relative shadow-sm"
    style={{ backgroundColor: COLOR_MAP[color] }}
  >
    {/* Paper lines */}
    <div className="absolute inset-0 flex flex-col gap-2 p-2 pointer-events-none opacity-20">
      <div className="h-0.5 bg-black w-full" />
      <div className="h-0.5 bg-black w-full" />
      <div className="h-0.5 bg-black w-3/4" />
    </div>
    {/* Folded corner */}
    <div className="absolute top-0 right-0 w-3 h-3 bg-white border-l-2 border-b-2 border-slate-900" />
  </div>
);

const PixelTray = ({ color, count }: { color: Color, count: number }) => (
  <div className="relative w-20 h-24 flex flex-col items-center">
    {/* Tray Body */}
    <div 
      className="w-full h-16 border-b-4 border-slate-900 relative rounded-sm shadow-md flex items-center justify-center p-1"
      style={{ 
        backgroundColor: '#d1d5db',
        borderLeft: `6px solid ${COLOR_MAP[color]}`,
        borderRight: `6px solid ${COLOR_MAP[color]}`,
        borderTop: '2px solid #9ca3af'
      }}
    >
      <AnimatePresence>
        {count > 0 && Array.from({ length: Math.min(count, 5) }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            className="absolute h-10 w-8 border border-black opacity-80"
            style={{ 
              backgroundColor: COLOR_MAP[color],
              zIndex: i,
              transform: `translate(${i * 2}px, ${-i * 2}px) rotate(${i * 2}deg)`
            }}
          />
        ))}
      </AnimatePresence>
    </div>
    <span className="mt-2 text-[10px] font-mono uppercase font-bold text-slate-700">{color}</span>
  </div>
);

// --- Main App Component ---

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'result'>('menu');
  const [mode, setMode] = useState<GameMode>('markers');
  const [items, setItems] = useState<SortableItem[]>([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Initialize Game
  const startNewGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setScore(0);
    setTimer(0);
    setGameState('playing');
    setMessage(null);

    const newItems: SortableItem[] = [];
    const count = 14; // 2 of each color

    for (let i = 0; i < count; i++) {
        const color = COLORS[i % COLORS.length];
        newItems.push({
            id: `item-${i}`,
            color,
            x: 20 + Math.random() * 60, // Percentage
            y: 25 + Math.random() * 40, // Percentage (mostly middle area)
            rotation: (Math.random() - 0.5) * 60,
            isSorted: false
        });
    }

    setItems(newItems);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = window.setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && items.length > 0 && items.every(item => item.isSorted)) {
        setGameState('result');
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  }, [items, gameState]);

  const handleDragEnd = (itemId: string, info: any) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // Get drop targets
    const containers = document.querySelectorAll(mode === 'markers' ? '.jar-target' : '.tray-target');
    let hitTargetColor: Color | null = null;

    containers.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (
        info.point.x >= rect.left &&
        info.point.x <= rect.right &&
        info.point.y >= rect.top &&
        info.point.y <= rect.bottom
      ) {
        hitTargetColor = el.getAttribute('data-color') as Color;
      }
    });

    if (hitTargetColor === item.color) {
      // Correct!
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, isSorted: true } : i));
      setScore(s => s + 10);
      setMessage({ text: "✨ PERFECT! +10", success: true });
      
      // Visual feedback via temporary scale up on the container could be added if needed
      // but the items disappearing into the jar is already good
      
      setTimeout(() => setMessage(null), 1000);
    } else if (hitTargetColor) {
      // Wrong!
      setMessage({ text: "❌ WRONG BOX!", success: false });
      
      // Simple shake effect is handled by the user's perception of the item 
      // returning to its original messy position plus the red toast.
      setTimeout(() => setMessage(null), 1000);
    }
  };

  const sortedCountByColor = (color: Color) => {
    return items.filter(i => i.color === color && i.isSorted).length;
  };

  // Format timer
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div className="min-h-screen bg-[#c2b280] font-mono flex flex-col items-center select-none overflow-hidden touch-none">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ 
          backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* HUD Header */}
      <div className="w-full max-w-4xl px-4 py-3 flex justify-between items-center z-50 bg-white/80 border-b-4 border-black shadow-lg">
        <h1 className="text-xl md:text-2xl font-black italic tracking-tight text-slate-800">
          RETRO SORT <span className="text-blue-600">WORKSHOP</span>
        </h1>
        
        {gameState === 'playing' && (
          <div className="flex gap-4 md:gap-8 items-center font-bold">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span>{score}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
            </div>
            <button 
              onClick={() => setGameState('menu')}
              className="p-1 hover:bg-slate-200 rounded transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        )}

        <button 
          onClick={() => setShowInstructions(!showInstructions)}
          className="p-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 w-full flex items-center justify-center p-4 relative" ref={containerRef}>
        
        {/* The Wooden Table Container */}
        <div className="relative w-full max-w-5xl aspect-[16/10] bg-[#a67c52] border-4 border-black shadow-[0_20px_0_rgba(0,0,0,0.2)] rounded-sm overflow-hidden flex flex-col">
          {/* Table Legs Shade */}
          <div className="absolute bottom-0 left-8 w-8 h-full bg-black/10 pointer-events-none" />
          <div className="absolute bottom-0 right-8 w-8 h-full bg-black/10 pointer-events-none" />
          
          {/* Table Surface Items (Decoration) */}
          <div className="absolute top-4 left-10 p-2 bg-yellow-100 border-2 border-black rotate-[-5deg] shadow-sm z-0">
            <p className="text-[10px] text-blue-900 leading-tight">TO SORT:<br/>RED x 2<br/>BLUE x 2...</p>
          </div>
          <div className="absolute top-6 right-12 w-20 h-28 bg-[#224488] border-2 border-black rotate-[3deg] shadow-md z-0 p-1">
            <div className="w-full h-full bg-white border border-black flex flex-col p-2 gap-1">
                <div className="h-1 bg-slate-200 w-full" />
                <div className="h-1 bg-slate-200 w-3/4" />
                <div className="h-1 bg-slate-200 w-full" />
                <div className="mt-4 flex flex-col gap-1">
                   {COLORS.slice(0, 4).map(c => <div key={c} className="h-1 w-2 rounded-full" style={{backgroundColor: COLOR_MAP[c]}} />)}
                </div>
            </div>
          </div>

          {/* Game Interaction Layers */}
          <AnimatePresence mode="wait">
            {gameState === 'menu' && (
              <motion.div 
                key="menu"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-4 text-center"
              >
                <div className="bg-white border-4 border-black p-8 max-w-md shadow-[8px_8px_0_rgba(0,0,0,1)]">
                  <h2 className="text-2xl font-black mb-2">PICK YOUR TASK</h2>
                  <p className="text-sm text-slate-600 mb-8 italic">Choose what needs organizing today.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <button 
                      onClick={() => startNewGame('markers')}
                      className="group flex flex-col items-center gap-4 p-4 border-4 border-black hover:bg-blue-50 transition-all hover:translate-y-[-4px] active:translate-y-0"
                    >
                      <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PixelMarker color="blue" />
                      </div>
                      <span className="font-bold flex items-center gap-2">
                        <Play className="w-4 h-4 fill-current" /> MARKERS
                      </span>
                    </button>

                    <button 
                      onClick={() => startNewGame('papers')}
                      className="group flex flex-col items-center gap-4 p-4 border-4 border-black hover:bg-orange-50 transition-all hover:translate-y-[-4px] active:translate-y-0"
                    >
                      <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PixelPaper color="orange" />
                      </div>
                      <span className="font-bold flex items-center gap-2">
                        <Play className="w-4 h-4 fill-current" /> PAPERS
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {gameState === 'playing' && (
              <motion.div 
                key="playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 relative"
              >
                {/* Targets Area (Drop Zones) */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:gap-4 px-4 h-24 items-end">
                    {COLORS.map((color) => (
                      <div 
                        key={color} 
                        data-color={color}
                        className={`${mode === 'markers' ? 'jar-target' : 'tray-target'} relative group`}
                      >
                         {mode === 'markers' ? (
                           <PixelJar color={color} isFull={sortedCountByColor(color) >= 2} />
                         ) : (
                           <PixelTray color={color} count={sortedCountByColor(color)} />
                         )}
                         
                         {/* Drop Indicator */}
                         <div className="absolute inset-0 border-2 border-dashed border-white/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
                      </div>
                    ))}
                </div>

                {/* Items to sort */}
                <div className="absolute inset-0 pointer-events-none">
                  {items.map((item) => !item.isSorted && (
                    <motion.div
                      key={item.id}
                      drag
                      dragMomentum={false}
                      onDragEnd={(_, info) => handleDragEnd(item.id, info)}
                      className="absolute pointer-events-auto cursor-grab active:cursor-grabbing z-10"
                      initial={{ left: `${item.x}%`, top: `${item.y}%`, rotate: item.rotation }}
                      style={{ originX: 0.5, originY: 0.5 }}
                      whileHover={{ scale: 1.1, zIndex: 20 }}
                      whileDrag={{ scale: 1.2, zIndex: 30 }}
                    >
                      {mode === 'markers' ? <PixelMarker color={item.color} /> : <PixelPaper color={item.color} />}
                    </motion.div>
                  ))}
                </div>

                {/* Feedback Messages */}
                <AnimatePresence>
                  {message && (
                    <motion.div 
                      initial={{ opacity: 0, y: 50, scale: 0.5 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.2 }}
                      className={`absolute bottom-40 left-1/2 -translate-x-1/2 px-4 py-2 border-4 border-black font-black text-white shadow-lg pointer-events-none ${message.success ? 'bg-green-500' : 'bg-red-500'}`}
                    >
                      {message.text}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {gameState === 'result' && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-green-500/80 backdrop-blur-sm p-4"
              >
                 <div className="bg-white border-4 border-black p-8 max-w-sm w-full shadow-[8px_8px_0_rgba(0,0,0,1)] text-center">
                    <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
                    <h2 className="text-3xl font-black mb-2">LEVEL CLEAR!</h2>
                    <div className="flex flex-col gap-2 mb-8 bg-slate-100 p-4 border-2 border-black">
                        <p className="flex justify-between font-bold"><span>TIME:</span> <span>{minutes}:{seconds.toString().padStart(2, '0')}</span></p>
                        <p className="flex justify-between font-bold"><span>SCORE:</span> <span>{score}</span></p>
                    </div>
                    
                    <button 
                      onClick={() => setGameState('menu')}
                      className="w-full py-4 bg-slate-800 text-white font-black hover:bg-slate-700 transition-all flex items-center justify-center gap-2 border-b-4 border-black active:border-b-0 active:translate-y-1"
                    >
                      <RefreshCw className="w-5 h-5" /> REPLAY
                    </button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Instructions Modal */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
              onClick={() => setShowInstructions(false)}
            >
              <motion.div 
                initial={{ y: 20, scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                className="bg-white border-4 border-black p-6 md:p-8 max-w-md w-full relative"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-yellow-400 border-2 border-black">
                    <Info className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black uppercase">How to Play</h3>
                </div>
                <ul className="space-y-4 font-bold text-slate-700 text-sm md:text-base">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs">1</span>
                    Pick a mode (Markers or Papers).
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs">2</span>
                    Drag items on the table into the matching colored container at the bottom.
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs">3</span>
                    Clear all items as fast as you can to win!
                  </li>
                </ul>
                <button 
                  onClick={() => setShowInstructions(false)}
                  className="mt-8 w-full py-3 bg-blue-600 text-white font-black border-4 border-black hover:bg-blue-500 transition-colors"
                >
                  GOT IT!
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Branding */}
      <div className="w-full p-4 flex justify-center items-center gap-4 text-xs font-bold text-slate-800">
        <div className="flex gap-1">
          {COLORS.map(c => <div key={c} className="w-3 h-3 border border-black" style={{backgroundColor: COLOR_MAP[c]}} />)}
        </div>
        <span>© 2026 PIXEL SORT OFFICE LTD.</span>
        <div className="flex gap-1">
          {COLORS.reverse().map(c => <div key={c} className="w-3 h-3 border border-black" style={{backgroundColor: COLOR_MAP[c]}} />)}
        </div>
      </div>

    </div>
  );
}

