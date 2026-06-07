'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SlotMachine({ names, addWinner }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayName, setDisplayName] = useState('SUPER AI 666 SUPER LUCKY DRAW');
  const [winner, setWinner] = useState(null);
  
  const audioCtxRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playTick = () => {
    try {
      const ctx = initAudio();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      // Sharp, percussive tick sound
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.02);
      
      // Louder initial volume, quick fade
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.02);
    } catch (e) {
      console.log('Audio play failed:', e);
    }
  };

  const playWin = () => {
    try {
      const ctx = initAudio();
      // Simple major chord: C5, E5, G5, C6
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5 + (i * 0.2));
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + (i * 0.1));
        osc.stop(ctx.currentTime + 2);
      });
      
      // Play kids cheering "Yay!" sound
      const yayAudio = new Audio('./yay.mp3');
      yayAudio.volume = 1.0;
      yayAudio.play().catch(e => console.log('Yay audio play failed:', e));
      
    } catch (e) {
      console.log('Audio play failed:', e);
    }
  };

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#2563eb', '#16a34a', '#ea580c', '#ca8a04', '#dc2626', '#9333ea']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#2563eb', '#16a34a', '#ea580c', '#ca8a04', '#dc2626', '#9333ea']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const spin = useCallback(() => {
    if (names.length === 0) {
      alert("No names left in the pool!");
      return;
    }

    // Ensure audio context is ready on user interaction
    initAudio();

    setIsSpinning(true);
    setWinner(null);

    const duration = 5000 + Math.floor(Math.random() * 4000); // Random spin time between 5s and 9s
    const startTime = Date.now();
    let animationFrame;
    let lastUpdate = 0;

    const pickRandomName = () => names[Math.floor(Math.random() * names.length)];

    // Pre-determine target winner
    const winningName = pickRandomName();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = elapsed / duration;

      if (progress < 1) {
        // We update the display name rapidly. We slow it down at the end.
        const currentInterval = 50 + Math.pow(progress, 3) * 350; 
        
        if (now - lastUpdate > currentInterval) {
          setDisplayName(pickRandomName());
          lastUpdate = now;
          playTick();
        }
        
        animationFrame = requestAnimationFrame(animate);
      } else {
        // Stop spinning
        setIsSpinning(false);
        setDisplayName(winningName);
        setWinner(winningName);
        
        playWin();
        fireConfetti();

        // Add to winners (this removes from names pool)
        setTimeout(() => {
           addWinner(winningName);
        }, 2000);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [names, addWinner]);

  const getHouseColorClass = (houseName) => {
    const name = houseName.toLowerCase();
    if (name.includes('exp')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (name.includes('kiddee')) return 'bg-green-100 text-green-700 border-green-200';
    if (name.includes('machima')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (name.includes('optimizer')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (name.includes('pangpuriye')) return 'bg-red-100 text-red-700 border-red-200';
    if (name.includes('scamper')) return 'bg-purple-100 text-purple-700 border-purple-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const renderDisplayName = (name) => {
    if (!name) return null;
    
    if (name === 'SUPER AI 666 SUPER LUCKY DRAW') {
      return (
        <div className="flex flex-col items-center justify-center gap-2 md:gap-4 w-full">
          <div className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight">
            SUPER AI 666
          </div>
          <div className="text-xl md:text-2xl lg:text-3xl font-semibold text-slate-500 tracking-widest uppercase mt-2">
            SUPER LUCKY DRAW
          </div>
        </div>
      );
    }

    const parts = name.trim().split(/\s+/);
    
    // Standard format: ID Title First Last House (at least 4 parts)
    if (parts.length >= 4) {
      const id = parts[0];
      let house = parts[parts.length - 1];
      let fullNameParts = parts.slice(1, parts.length - 1);
      
      // Handle houses with two words like "The Scamper"
      if (fullNameParts.length > 0 && fullNameParts[fullNameParts.length - 1].toLowerCase() === 'the' && house.toLowerCase() === 'scamper') {
        house = fullNameParts.pop() + ' ' + house;
      }
      
      // Extract nickname (first part of full name) and real name
      let nickname = '';
      let realName = '';
      
      if (fullNameParts.length >= 2) {
        nickname = fullNameParts[0];
        realName = fullNameParts.slice(1).join(' ');
      } else {
        realName = fullNameParts.join(' ');
      }
      
      const houseColorClass = getHouseColorClass(house);
      
      return (
        <div className={`flex flex-col items-center justify-center gap-3 md:gap-4 w-full transition-all duration-700 ${winner === name ? 'scale-[1.15] drop-shadow-2xl translate-y-[-10px]' : ''}`}>
          <div className={`text-2xl md:text-3xl text-slate-700 font-mono font-bold tracking-widest bg-slate-100 px-5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-all duration-700 ${winner === name ? 'bg-yellow-100 border-yellow-300 text-yellow-800 scale-110 shadow-lg' : ''}`}>
            {id}
          </div>
          <div className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight my-1 transition-all duration-700 flex flex-wrap justify-center items-center gap-x-3 md:gap-x-4 gap-y-2">
            {nickname && (
              <span className={winner === name ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500 drop-shadow-sm' : isSpinning ? 'text-slate-900' : 'text-indigo-600'}>
                {nickname}
              </span>
            )}
            <span className={winner === name ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 drop-shadow-sm' : 'text-slate-900'}>
              {realName}
            </span>
          </div>
          <div className={`text-lg md:text-xl font-bold tracking-widest uppercase px-6 py-2 rounded-full border transition-all duration-700 ${houseColorClass} ${winner === name ? 'scale-110 shadow-md ring-4 ring-offset-2 ring-indigo-100' : ''}`}>
            {house}
          </div>
        </div>
      );
    }
    
    // Fallback
    return <div className={`text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight transition-all duration-700 ${winner === name ? 'scale-125 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 drop-shadow-xl' : ''}`}>{name}</div>;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative">
      
      {/* Slot Window */}
      <div className="relative bg-white rounded-3xl p-3 md:p-5 mb-6 w-full max-w-4xl xl:max-w-5xl shadow-xl border border-slate-200 transition-all">
        
        <div className="bg-slate-50 rounded-2xl p-4 md:p-8 border border-slate-100 shadow-inner relative overflow-hidden flex items-center justify-center min-h-[380px] h-[50vh] lg:h-[55vh] max-h-[550px]">
          
          <div className={`relative z-20 text-center w-full px-4 transition-all duration-75 flex items-center justify-center ${
            isSpinning ? 'blur-[1px] scale-y-110 opacity-70' : 
            winner ? 'scale-105' : ''
          }`}>
            <div className="w-full break-words whitespace-pre-wrap text-center max-w-[95%]">
              {renderDisplayName(displayName)}
            </div>
          </div>
          
        </div>
      </div>

      {/* Spin Button */}
      <button 
        onClick={spin}
        disabled={isSpinning || names.length === 0}
        className={`relative px-8 py-3 md:px-10 md:py-4 rounded-full font-bold text-xl md:text-2xl tracking-widest uppercase overflow-hidden transition-all duration-300
          ${names.length === 0 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
            : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg cursor-pointer transform hover:-translate-y-1'
          }
        `}
      >
        <span className="relative z-10">
          {isSpinning ? 'SPINNING...' : 'SPIN'}
        </span>
      </button>
      
      {/* Name count indicator */}
      <div className="mt-6 text-slate-500 font-medium tracking-wider uppercase text-sm">
        {names.length} Participant{names.length !== 1 ? 's' : ''} Ready
      </div>
    </div>
  );
}
