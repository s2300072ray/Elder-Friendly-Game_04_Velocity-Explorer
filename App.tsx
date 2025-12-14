import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import { GameState, LevelData } from './types';
import { LEVELS } from './constants';
import { generateLevel } from './services/geminiService';
import { Heart, Coins, RotateCcw, Play, Zap, Wand2, Timer as TimerIcon } from 'lucide-react';

const TimerDisplay = ({ active }: { active: boolean }) => {
  const [time, setTime] = useState(0);
  useEffect(() => {
    if (!active) {
      setTime(0);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
        setTime((Date.now() - start) / 1000);
    }, 50);
    return () => clearInterval(interval);
  }, [active]);
  
  return <span className="w-16 text-right">{time.toFixed(2)}s</span>
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [currentLevel, setCurrentLevel] = useState<LevelData>(LEVELS[0]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [finalTime, setFinalTime] = useState(0);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const startGame = (level: LevelData) => {
    setCurrentLevel(level);
    setScore(0);
    setLives(3);
    setFinalTime(0);
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = (finalScore: number, time: number, win: boolean) => {
    setScore(finalScore);
    setFinalTime(time);
    setGameState(win ? GameState.VICTORY : GameState.GAME_OVER);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setErrorMsg('');
    const level = await generateLevel(aiPrompt);
    setIsGenerating(false);
    
    if (level) {
      startGame(level);
    } else {
      setErrorMsg('Failed to generate level. Try a different prompt or check API Key.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      {/* UI Overlay for HUD */}
      {gameState === GameState.PLAYING && (
        <div className="absolute top-4 w-[800px] flex justify-between px-6 py-3 bg-gray-800/80 rounded-xl border border-gray-600 backdrop-blur-sm z-20 font-pixel text-shadow">
          <div className="flex items-center gap-2 text-yellow-400">
             <Coins size={24} />
             <span className="text-xl">{score.toString().padStart(5, '0')}</span>
          </div>
          
          <div className="flex items-center gap-2 text-cyan-400">
             <TimerIcon size={24} />
             <span className="text-xl"><TimerDisplay active={true} /></span>
          </div>

          <div className="flex items-center gap-2 text-red-500">
             <Heart fill="currentColor" size={24} />
             <span className="text-xl">x {lives}</span>
          </div>
        </div>
      )}

      {/* Main Game Container - Fixed size and centered relative container */}
      <div className="relative w-[800px] h-[600px] shadow-2xl rounded-lg mx-auto">
        {gameState === GameState.MENU && (
          <div className="w-full h-full bg-gradient-to-b from-sky-800 to-indigo-900 rounded-lg flex flex-col items-center justify-center p-8 border-4 border-indigo-500 absolute inset-0 z-10">
            <h1 className="font-pixel text-6xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-md">
              VELOCITY EXPLORER
            </h1>
            <p className="text-blue-200 mb-8 text-xl font-light">A 2D Classic Platformer Adventure</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
              <div className="bg-white/10 p-6 rounded-xl border border-white/20 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Play /> Select Level</h3>
                <div className="space-y-3">
                  {LEVELS.map((level, idx) => (
                    <button 
                      key={level.id}
                      onClick={() => startGame(level)}
                      className="w-full text-left p-3 hover:bg-white/20 rounded transition flex items-center justify-between group"
                    >
                      <span className="font-pixel text-sm">{idx + 1}. {level.name}</span>
                      <span className="text-xs text-gray-400 group-hover:text-white transition">{level.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-purple-900/40 p-6 rounded-xl border border-purple-500/30 backdrop-blur-sm">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-300"><Wand2 /> AI Level Generator</h3>
                <div className="space-y-4">
                  <p className="text-xs text-gray-300">Enter a theme (e.g. "Volcano Panic", "Ice Kingdom") to generate a new level instantly.</p>
                  <input 
                    type="text" 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Enter theme..."
                    className="w-full bg-black/50 border border-purple-500/50 rounded p-2 text-white focus:outline-none focus:border-purple-400"
                  />
                  <button 
                    onClick={handleAiGenerate}
                    disabled={isGenerating || !aiPrompt}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-2 rounded font-bold transition disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {isGenerating ? <RotateCcw className="animate-spin" /> : <Zap />}
                    {isGenerating ? 'Generating...' : 'Generate Level'}
                  </button>
                  {errorMsg && <p className="text-red-400 text-xs">{errorMsg}</p>}
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-gray-400 text-sm">
              Controls: <span className="text-white font-bold bg-white/20 px-1 rounded">A/D/Arrows</span> to Move • <span className="text-white font-bold bg-white/20 px-1 rounded">Space</span> to Jump • <span className="text-white font-bold bg-white/20 px-1 rounded">Hold Jump</span> for higher
            </div>
          </div>
        )}

        {gameState === GameState.PLAYING && (
          <GameCanvas 
            level={currentLevel} 
            onGameOver={handleGameOver}
            onScoreUpdate={setScore}
            onLivesUpdate={setLives}
          />
        )}

        {(gameState === GameState.GAME_OVER || gameState === GameState.VICTORY) && (
          <div className="w-full h-full bg-black/90 absolute inset-0 rounded-lg flex flex-col items-center justify-center z-50 animate-in fade-in duration-500">
            <h2 className={`font-pixel text-5xl mb-6 ${gameState === GameState.VICTORY ? 'text-green-400' : 'text-red-500'}`}>
              {gameState === GameState.VICTORY ? 'LEVEL CLEARED!' : 'GAME OVER'}
            </h2>
            
            <div className="grid grid-cols-2 gap-8 mb-8 text-2xl">
              <div className="flex flex-col items-center">
                 <span className="text-gray-400 text-sm mb-1">SCORE</span>
                 <span className="text-yellow-400 font-bold">{score}</span>
              </div>
              <div className="flex flex-col items-center">
                 <span className="text-gray-400 text-sm mb-1">TIME</span>
                 <span className="text-cyan-400 font-bold">{finalTime.toFixed(2)}s</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => startGame(currentLevel)}
                className="px-6 py-3 bg-white text-black font-bold rounded hover:bg-gray-200 transition flex items-center gap-2"
              >
                <RotateCcw size={20} /> Retry Level
              </button>
              <button 
                onClick={() => setGameState(GameState.MENU)}
                className="px-6 py-3 border border-white text-white font-bold rounded hover:bg-white/10 transition"
              >
                Main Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;