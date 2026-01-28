import React, { useState, useEffect } from 'react';
import { Calculator } from './components/Calculator';
import { InfoPanel } from './components/InfoPanel';
import { CashbackMode, Platform } from './types';
import { PLATFORMS } from './constants';
import { Moon, Sun, Dice5, CalendarDays, Trophy, Layers, Check, Plane } from 'lucide-react';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [platform, setPlatform] = useState<Platform>('7K');
  const [mode, setMode] = useState<CashbackMode>('weekly');
  const [isPlatformMenuOpen, setIsPlatformMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Apply Brand Colors
  useEffect(() => {
    const root = document.documentElement;
    const colors = PLATFORMS[platform].colors;
    root.style.setProperty('--brand-default', colors.default);
    root.style.setProperty('--brand-dark', colors.dark);
    root.style.setProperty('--brand-light', colors.light);
  }, [platform]);

  // Handle mode switching when platform changes
  useEffect(() => {
      const config = PLATFORMS[platform];
      // If current mode is sports and platform doesn't have sports, switch to weekly
      if (!config.hasSports && mode === 'sports') {
          setMode('weekly');
      }
      // If current mode is aviator and platform doesn't have aviator, switch to weekly
      if (!config.hasAviator && mode === 'aviator') {
          setMode('weekly');
      }
  }, [platform, mode]);

  const config = PLATFORMS[platform];

  const getSubTitle = () => {
    switch(mode) {
      case 'weekly': return 'Calcule seu retorno em jogos de Cassino ao Vivo.';
      case 'daily': return 'Calcule seu retorno em Slots e Betting Games.';
      case 'sports': return 'Calcule seu retorno em Apostas Esportivas.';
      case 'aviator': return 'Calcule seu retorno no Aviator Crash.';
      default: return '';
    }
  };

  const getTitle = () => {
    switch(mode) {
      case 'weekly': return 'Simulador de Cashback Semanal';
      case 'daily': return 'Simulador de Cashback Diário';
      case 'sports': return 'Simulador de Cashback Esportivo';
      case 'aviator': return 'Cashback Aviator Crash';
      default: return '';
    }
  };

  // Determine grid columns based on active features
  const getGridCols = () => {
    let cols = 2; // Default Weekly + Daily
    if (config.hasSports) cols++;
    if (config.hasAviator) cols++;
    return `grid-cols-${cols}`;
  };

  return (
    <div className="min-h-screen pb-12 transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-black/80 border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-8 md:h-10 flex items-center justify-center">
               <img 
                 src={config.logoUrl} 
                 alt={`${config.name} Logo`} 
                 className="h-full w-auto object-contain max-w-[140px]"
               />
            </div>
            <div className="hidden sm:block border-l border-neutral-200 dark:border-neutral-700 pl-4 h-8 flex items-center">
               <h1 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                 Calculadora Cashback
               </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {/* Improved Platform Switcher */}
             <div className="relative">
                <button 
                  onClick={() => setIsPlatformMenuOpen(!isPlatformMenuOpen)}
                  onBlur={() => setTimeout(() => setIsPlatformMenuOpen(false), 200)}
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-100/50 dark:bg-neutral-800/50 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-brand dark:hover:border-brand hover:text-brand transition-all group"
                >
                    <Layers className="w-4 h-4 group-hover:text-brand transition-colors" />
                    <span className="mr-1 hidden md:inline">{config.name}</span>
                    <div className="bg-white dark:bg-black rounded-full p-0.5">
                       <Check className="w-3 h-3 text-brand" />
                    </div>
                </button>
                
                {isPlatformMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-neutral-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="p-2 space-y-1">
                        <div className="px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                          Selecione a Plataforma
                        </div>
                        {Object.values(PLATFORMS).map((p) => (
                            <button
                                key={p.id}
                                onClick={() => {
                                  setPlatform(p.id);
                                  setIsPlatformMenuOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all ${platform === p.id ? 'bg-brand/10 dark:bg-brand/20 text-brand font-bold' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'}`}
                            >
                                <span className="flex items-center gap-3">
                                   <div className="w-6 h-6 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 rounded p-0.5">
                                      <img src={p.logoUrl} alt="" className="w-full h-full object-contain" />
                                   </div>
                                   {p.name}
                                </span>
                                {platform === p.id && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                      </div>
                  </div>
                )}
             </div>

            <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800"></div>

            <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-400"
                aria-label="Toggle Theme"
            >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* Intro Text */}
        <div className="mb-8 text-center">
           <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-2">
             {getTitle()}
           </h2>
           <p className="text-neutral-500 dark:text-neutral-400">
             {getSubTitle()}
           </p>
        </div>

        {/* Navigation Tabs */}
        <div className={`grid gap-1 p-1 bg-white dark:bg-neutral-800 rounded-xl mb-8 border border-neutral-200 dark:border-neutral-700 shadow-sm ${getGridCols()}`} style={{gridTemplateColumns: `repeat(${[true, true, config.hasSports, config.hasAviator].filter(Boolean).length}, minmax(0, 1fr))`}}>
        <button
            onClick={() => setMode('weekly')}
            className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 ${
            mode === 'weekly'
                ? `bg-brand ${config.textOnBrand} shadow-md`
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
            }`}
        >
            <CalendarDays className="w-4 h-4" />
            <span className="hidden sm:inline">Cassino (Semanal)</span>
            <span className="sm:hidden">Cassino</span>
        </button>
        
        <button
            onClick={() => setMode('daily')}
            className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 ${
            mode === 'daily'
                ? `bg-brand ${config.textOnBrand} shadow-md`
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
            }`}
        >
            <Dice5 className="w-4 h-4" />
            <span className="hidden sm:inline">Slots (Diário)</span>
            <span className="sm:hidden">Slots</span>
        </button>

        {config.hasSports && (
            <button
                onClick={() => setMode('sports')}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 ${
                mode === 'sports'
                    ? `bg-brand ${config.textOnBrand} shadow-md`
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                }`}
            >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Esportivo (Semanal)</span>
                <span className="sm:hidden">Sport</span>
            </button>
        )}

        {config.hasAviator && (
            <button
                onClick={() => setMode('aviator')}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 ${
                mode === 'aviator'
                    ? `bg-brand ${config.textOnBrand} shadow-md`
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                }`}
            >
                <Plane className="w-4 h-4" />
                <span className="hidden sm:inline">Aviator (Diário)</span>
                <span className="sm:hidden">Aviator</span>
            </button>
        )}
        </div>

        {/* Calculator */}
        <Calculator mode={mode} platform={platform} />

        {/* Rules & Info */}
        <InfoPanel mode={mode} platform={platform} />

      </main>

      <footer className="max-w-4xl mx-auto px-4 mt-12 text-center text-xs text-neutral-400 dark:text-neutral-600">
        <p>&copy; {new Date().getFullYear()} {config.name} Cashback Calculator. Ferramenta não oficial para simulação.</p>
      </footer>
    </div>
  );
};

export default App;