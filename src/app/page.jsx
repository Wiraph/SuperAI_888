'use client';
import { useState, useEffect } from 'react';
import { useLuckyDraw } from '../hooks/useLuckyDraw';
import SlotMachine from '../components/SlotMachine';
import ControlPanel from '../components/ControlPanel';
import { Maximize, Minimize } from 'lucide-react';
import logoImg from './Logo-Super-AI.png';

export default function Home() {
  const {
    names,
    winners,
    addNames,
    removeName,
    editName,
    addWinner,
    clearWinners,
    removeWinner,
    clearNames,
    isLoaded
  } = useLuckyDraw();

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync state with native fullscreen changes (e.g. user pressing ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
        // Fallback to just hiding UI if native fullscreen fails
        setIsFullscreen(true);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Prevent hydration mismatch by returning a loading state until LocalStorage is read
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900">
        <div className="animate-pulse text-xl font-medium tracking-wider">INITIALIZING SYSTEM...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden flex flex-col md:flex-row font-sans">
      
      {/* Header Logo */}
      <div className={`absolute top-6 left-6 z-20 flex items-center gap-4 transition-all duration-500 ${isFullscreen ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        <div className="h-14 w-auto flex items-center justify-center">
          <img src={logoImg.src} alt="SUPER AI" className="h-full w-auto object-contain drop-shadow-sm" />
        </div>
        <div className="hidden sm:block">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            SUPER AI ENGINEER
          </h2>
          <p className="text-xs text-slate-500 tracking-widest uppercase font-medium">Season 6 Lucky Draw</p>
        </div>
      </div>

      {/* Main Slot Machine Area */}
      <div className={`flex-1 relative z-10 flex items-center justify-center p-6 transition-all duration-500 ${isFullscreen ? 'pt-6' : 'pt-20 md:pt-24'}`}>
        <button 
          onClick={toggleFullscreen}
          className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
        </button>
        <SlotMachine 
          names={names} 
          addWinner={addWinner} 
        />
      </div>

      {/* Control Panel Sidebar */}
      <div className={`p-0 relative z-10 flex-shrink-0 md:h-screen transition-all duration-500 origin-right ${
        isFullscreen 
          ? 'w-0 opacity-0 overflow-hidden pointer-events-none scale-x-0 absolute right-0' 
          : 'w-full md:w-[400px] lg:w-[450px] opacity-100 scale-x-100 bg-white border-l border-slate-200 shadow-xl'
      }`}>
        <ControlPanel 
          names={names}
          winners={winners}
          addNames={addNames}
          removeName={removeName}
          editName={editName}
          clearWinners={clearWinners}
          removeWinner={removeWinner}
          clearNames={clearNames}
        />
      </div>
    </main>
  );
}
