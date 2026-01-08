
import React, { useState, useEffect, useCallback } from 'react';
import { SoundType, SleepTip } from './types';
import MetronomeEngine from './components/MetronomeEngine';
import { getSleepTips } from './services/geminiService';

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(65);
  const [soundType, setSoundType] = useState<SoundType>(SoundType.HEARTBEAT);
  const [volume, setVolume] = useState(50);
  const [tips, setTips] = useState<SleepTip[]>([]);
  const [isPulse, setIsPulse] = useState(false);

  useEffect(() => {
    const fetchTips = async () => {
      const data = await getSleepTips();
      setTips(data);
    };
    fetchTips();
  }, []);

  const handleBeat = useCallback(() => {
    setIsPulse(true);
    setTimeout(() => setIsPulse(false), 150);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 transition-colors duration-1000">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="z-10 w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 shadow-2xl space-y-8 text-center">
        <header>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            DreamBeat 65
          </h1>
          <p className="text-slate-400 text-sm mt-2">溫柔的 65 BPM 守護寶寶的夢境</p>
        </header>

        {/* Visualizer Circle */}
        <div className="relative flex items-center justify-center py-4">
          <div 
            className={`w-32 h-32 rounded-full border-4 border-indigo-400/30 flex items-center justify-center transition-all duration-300 ${
              isPulse ? 'scale-110 border-indigo-300 shadow-[0_0_30px_rgba(129,140,248,0.5)]' : 'scale-100'
            }`}
          >
            <div className={`w-24 h-24 rounded-full bg-indigo-500/10 flex flex-col items-center justify-center transition-transform duration-300 ${isPulse ? 'scale-105' : 'scale-100'}`}>
               <span className="text-4xl font-light text-indigo-200">{bpm}</span>
               <span className="text-xs text-indigo-400 uppercase tracking-widest">BPM</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all transform active:scale-95 ${
              isPlaying 
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50' 
              : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
            }`}
          >
            {isPlaying ? '停止播放' : '開始安撫'}
          </button>

          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar scroll-smooth">
             {Object.values(SoundType).map((type) => (
               <button
                 key={type}
                 onClick={() => setSoundType(type)}
                 className={`py-2.5 px-3 text-[10px] uppercase tracking-tighter font-medium rounded-xl border transition-all ${
                   soundType === type 
                   ? 'bg-indigo-500/30 border-indigo-400 text-indigo-100 shadow-[0_0_10px_rgba(129,140,248,0.3)]' 
                   : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:bg-slate-700 hover:border-slate-500'
                 }`}
               >
                 {type.replace('_', ' ')}
               </button>
             ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400 px-1">
              <span>音量</span>
              <span>{volume}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={volume} 
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Tips Section */}
        {tips.length > 0 && (
          <div className="pt-6 border-t border-slate-700/50 space-y-4 text-left overflow-hidden">
            <h3 className="text-indigo-300 text-sm font-semibold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              AI 睡眠建議
            </h3>
            <div className="space-y-3">
              {tips.slice(0, 3).map((tip, idx) => (
                <div key={idx} className="bg-slate-700/20 p-3 rounded-xl border border-slate-600/30">
                  <h4 className="text-slate-200 text-xs font-medium mb-1">{tip.title}</h4>
                  <p className="text-slate-400 text-[10px] leading-relaxed line-clamp-2">{tip.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <MetronomeEngine 
        isPlaying={isPlaying} 
        bpm={bpm} 
        soundType={soundType} 
        volume={volume} 
        onBeat={handleBeat} 
      />

      <footer className="mt-8 text-slate-500 text-[10px] tracking-widest uppercase">
        Designed for Gentle Sleep • 65 BPM
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
};

export default App;
