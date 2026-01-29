import React, { useState, useEffect } from 'react';
import { Calculator } from './components/Calculator';
import { InfoPanel } from './components/InfoPanel';
import { ProductTour, TourStep } from './components/ProductTour';
import { PlatformName } from './components/PlatformName';
import { CashbackMode, Platform } from './types';
import { PLATFORMS } from './constants';
import { Moon, Sun, Dice5, CalendarDays, Trophy, Layers, Check, Plane, HelpCircle, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [platform, setPlatform] = useState<Platform>('7K');
  const [mode, setMode] = useState<CashbackMode>('weekly');
  const [isPlatformMenuOpen, setIsPlatformMenuOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- SECURITY: ANTI-DEBUG & ANTI-INSPECT ---
  useEffect(() => {
    const noop = () => {};
    ['log', 'debug', 'info', 'warn', 'error', 'table', 'trace'].forEach((method) => {
        // @ts-ignore
        console[method] = noop;
    });

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') { e.preventDefault(); return; }
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) { e.preventDefault(); return; }
      if (e.ctrlKey && e.key.toUpperCase() === 'U') { e.preventDefault(); return; }
      if (e.ctrlKey && e.key.toUpperCase() === 'S') { e.preventDefault(); return; }
      if (e.ctrlKey && e.key.toUpperCase() === 'P') { e.preventDefault(); return; }
    };

    const antiDebugInterval = setInterval(() => {
        (function(){}).constructor('debugger')();
    }, 500);

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(antiDebugInterval);
    };
  }, []);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenCashbackTour');
    if (!hasSeenTour) {
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('hasSeenCashbackTour', 'true');
  };

  useEffect(() => {
    const root = document.documentElement;
    const colors = PLATFORMS[platform].colors;
    root.style.setProperty('--brand-default', colors.default);
    root.style.setProperty('--brand-dark', colors.dark);
    root.style.setProperty('--brand-light', colors.light);
  }, [platform]);

  useEffect(() => {
      const config = PLATFORMS[platform];
      if (!config.hasSports && mode === 'sports') { setMode('weekly'); }
      if (!config.hasAviator && mode === 'aviator') { setMode('weekly'); }
  }, [platform, mode]);

  const config = PLATFORMS[platform];

  const getSubTitle = () => {
    switch(mode) {
      case 'weekly': return 'Calcule o retorno do jogador em perdas no Cassino ao Vivo.';
      case 'daily': return 'Calcule o retorno do jogador em perdas em Slots e Betting Games.';
      case 'sports': return 'Calcule o retorno do jogador em perdas em Apostas Esportivas.';
      case 'aviator': return 'Calcule o retorno do jogador em perdas no Aviator Crash.';
      default: return '';
    }
  };

  const getTitle = () => {
    switch(mode) {
      case 'weekly': return 'Cashback Semanal';
      case 'daily': return 'Cashback Diário';
      case 'sports': return 'Cashback Esportivo';
      case 'aviator': return 'Cashback Aviator';
      default: return '';
    }
  };

  const tourSteps: TourStep[] = [
    { targetId: 'center', title: 'Bem-vindo!', content: 'Olá! Me chamo "GreenBack" e irei lhe mostrar como funciona a nossa ferramenta.' },
    { targetId: 'tour-platform-selector', title: 'Selecione a Plataforma', content: 'Comece escolhendo a plataforma desejada. Cada uma possui regras específicas.' },
    { targetId: 'tour-theme-toggle', title: 'Tema', content: 'Alterne entre o modo Claro e Escuro conforme sua preferência visual.' },
    { targetId: 'tour-mode-tabs', title: 'Escolha o Tipo', content: 'Alterne entre Cassino, Slots, Esportes ou Aviator. O simulador atualizará as regras.' },
    { targetId: 'tour-input-loss', title: 'Informe o Prejuízo', content: 'Digite o "Saldo Negativo" (Apostado - Ganho). O cálculo é instantâneo!' },
    { targetId: 'tour-results-area', title: 'Resultado', content: 'O valor devido aparecerá aqui, junto com a calculadora de divergência.' }
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden selection:bg-brand selection:text-white">
      
      {/* Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <ProductTour steps={tourSteps} isOpen={showTour} onClose={handleTourComplete} onComplete={handleTourComplete} />

      {/* Floating Header */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <header className="glass relative shadow-lg shadow-black/5 dark:shadow-black/20 rounded-full px-2 py-2 max-w-4xl w-full flex items-center justify-between backdrop-blur-md">
          
          {/* Logo Area (Left) */}
          <div className="flex items-center gap-4 pl-3">
            {/* Platform Logo */}
            <div className="h-8 md:h-9 w-auto flex items-center justify-center">
               <img src={darkMode ? config.logoUrls.dark : config.logoUrls.light} alt="Platform Logo" className="h-full w-auto object-contain" />
            </div>
          </div>
          
          {/* ConvertaX Logo (Center Absolute) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-5 md:h-6 w-auto flex items-center justify-center opacity-90 transition-opacity hover:opacity-100">
               <img 
                  src={darkMode ? 'https://i.imgur.com/qQtOrAS.png' : 'https://i.imgur.com/o3GZGTk.png'} 
                  alt="ConvertaX" 
                  className="h-full w-auto object-contain" 
               />
            </div>
          </div>
          
          {/* Controls (Right) */}
          <div className="flex items-center gap-2">
             <div className="relative" id="tour-platform-selector">
                <button 
                  onClick={() => setIsPlatformMenuOpen(!isPlatformMenuOpen)}
                  onBlur={() => setTimeout(() => setIsPlatformMenuOpen(false), 200)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100/50 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-all hover:scale-105 active:scale-95"
                >
                    <span className="hidden sm:inline">Plataforma:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      <PlatformName platform={platform} />
                    </span>
                    <Layers className="w-4 h-4 text-neutral-400" />
                </button>
                
                {isPlatformMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-60 glass rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-1.5">
                        {Object.values(PLATFORMS).map((p) => (
                            <button
                                key={p.id}
                                onClick={() => { setPlatform(p.id); setIsPlatformMenuOpen(false); }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all mb-1 last:mb-0 ${platform === p.id ? 'bg-brand text-white shadow-md' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50'}`}
                            >
                                <span className="flex items-center gap-3 font-medium">
                                   <div className={`w-6 h-6 flex items-center justify-center rounded-lg p-0.5 ${platform === p.id ? 'bg-white' : 'bg-neutral-100 dark:bg-neutral-800'}`}>
                                      <img src={p.logoUrls.light} alt="" className="w-full h-full object-contain" />
                                   </div>
                                   <PlatformName platform={p.id} isOnBrandBg={platform === p.id} />
                                </span>
                                {platform === p.id && <Check className="w-4 h-4 text-white" />}
                            </button>
                        ))}
                  </div>
                )}
             </div>

            <button
                id="tour-theme-toggle"
                onClick={() => setDarkMode(!darkMode)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-all hover:rotate-12"
            >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>
      </div>

      <main className="max-w-4xl mx-auto px-4 pt-32 pb-12 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-10">
           <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold tracking-wider mb-4 animate-in fade-in slide-in-from-bottom-3">
              <Sparkles className="w-3 h-3" /> Simulador interno
           </div>
           <h2 className="text-3xl md:text-5xl font-black text-neutral-900 dark:text-white mb-3 tracking-tight">
             {getTitle()}
           </h2>
           <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-xl mx-auto">
             {getSubTitle()}
           </p>
        </div>

        {/* Navigation Tabs */}
        <div id="tour-mode-tabs" className="flex justify-center mb-10">
            <div className="glass p-1.5 rounded-2xl inline-flex flex-wrap justify-center gap-1 shadow-sm">
                {[
                    { id: 'weekly', icon: CalendarDays, label: 'Semanal', show: true },
                    { id: 'daily', icon: Dice5, label: 'Diário', show: true },
                    { id: 'sports', icon: Trophy, label: 'Esportes', show: config.hasSports },
                    { id: 'aviator', icon: Plane, label: 'Aviator', show: config.hasAviator }
                ].map(item => item.show && (
                    <button
                        key={item.id}
                        onClick={() => setMode(item.id as any)}
                        className={`
                            relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
                            ${mode === item.id 
                                ? 'text-white shadow-lg scale-105 z-10' 
                                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'}
                        `}
                    >   
                        {mode === item.id && (
                            <div className="absolute inset-0 bg-brand rounded-xl -z-10 animate-in zoom-in-95 duration-200"></div>
                        )}
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </button>
                ))}
            </div>
        </div>

        <Calculator mode={mode} platform={platform} />

        <InfoPanel mode={mode} platform={platform} />

      </main>

      <footer className="text-center pb-8 pt-4">
        <button 
            onClick={() => setShowTour(true)}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:border-brand dark:hover:border-brand hover:text-brand transition-all text-xs font-semibold shadow-sm hover:shadow-md mb-6"
        >
            <HelpCircle className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            Reiniciar Tutorial
        </button>
        <div className="flex flex-col items-center justify-center gap-2">
            <div className="h-6 opacity-80">
                <img 
                    src={darkMode ? 'https://i.imgur.com/qQtOrAS.png' : 'https://i.imgur.com/o3GZGTk.png'} 
                    alt="ConvertaX Logo" 
                    className="h-full w-auto object-contain"
                />
            </div>
            <p className="text-[10px] text-neutral-400 opacity-60">
                &copy; 2026 ConvertaX Calculadora de Cashback. Ferramenta interna para cálculo.
            </p>
            <p className="text-[10px] text-neutral-400 opacity-60 font-bold tracking-widest uppercase">
                BY: Marcelo FILHO
            </p>
        </div>
      </footer>
    </div>
  );
};

export default App;