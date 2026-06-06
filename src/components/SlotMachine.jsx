'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Maximize, Minimize } from 'lucide-react';

export default function SlotMachine({ names, addWinner }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayName, setDisplayName] = useState('SUPER AI 888');
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
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);
      
      // Louder initial volume, quick fade
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
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
    } catch (e) {
      console.log('Audio play failed:', e);
    }
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
        const currentInterval = 30 + Math.pow(progress, 3) * 370; 
        
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
      
      const fullName = fullNameParts.join(' ');
      
      const houseColorClass = getHouseColorClass(house);
      
      return (
        <div className="flex flex-col items-center justify-center gap-3 md:gap-4 w-full">
          <div className="text-2xl md:text-3xl text-slate-700 font-mono font-bold tracking-widest bg-slate-100 px-5 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            {id}
          </div>
          <div className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight my-1">
            {fullName}
          </div>
          <div className={`text-lg md:text-xl font-bold tracking-widest uppercase px-6 py-2 rounded-full border ${houseColorClass}`}>
            {house}
          </div>
        </div>
      );
    }
    
    // Fallback
    return <div className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">{name}</div>;
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative">
      
      {/* Slot Window */}
      <div className="relative bg-white rounded-3xl p-3 md:p-5 mb-6 w-full max-w-4xl xl:max-w-5xl shadow-xl border border-slate-200 transition-all">
        
        <div className="bg-slate-50 rounded-2xl p-4 md:p-8 border border-slate-100 shadow-inner relative overflow-hidden flex items-center justify-center min-h-[250px] h-[35vh] lg:h-[40vh] max-h-[380px]">
          
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
