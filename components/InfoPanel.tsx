import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Calendar, Clock, Ban } from 'lucide-react';
import { 
    EXCLUDED_GAMES_DAILY, EXCLUDED_GAMES_WEEKLY, EXCLUDED_GAMES_SPORTS, EXCLUDED_GAMES_AVIATOR, 
    VERA_EXCLUDED_GAMES_WEEKLY, VERA_EXCLUDED_GAMES_DAILY,
    PLATFORMS 
} from '../constants';
import { CashbackMode, Platform } from '../types';
import { PlatformName } from './PlatformName';

interface InfoPanelProps {
  mode: CashbackMode;
  platform: Platform;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ mode, platform }) => {
  const [isOpen, setIsOpen] = useState(false);
  const config = PLATFORMS[platform];

  let excluded: string[] = [];
  let title = "";
  let deliveryText = "";

  if (mode === 'weekly') {
    excluded = platform === 'Vera' ? VERA_EXCLUDED_GAMES_WEEKLY : EXCLUDED_GAMES_WEEKLY;
    title = "Semanal (Casino)";
    deliveryText = `${config.rules.weekly.deliveryText}`;
  } else if (mode === 'daily') {
    excluded = platform === 'Vera' ? VERA_EXCLUDED_GAMES_DAILY : EXCLUDED_GAMES_DAILY;
    title = "Diário (Slots)";
    deliveryText = `${config.rules.daily.deliveryText}`;
  } else if (mode === 'aviator') {
    excluded = EXCLUDED_GAMES_AVIATOR;
    title = "Diário (Aviator Crash)";
    deliveryText = `${config.rules.daily.deliveryText}`;
  } else {
    excluded = EXCLUDED_GAMES_SPORTS;
    title = "Esportivo (Semanal)";
    deliveryText = "Terças-feiras até às 14h.";
  }

  return (
    <div className="mt-8 glass rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50/50 dark:hover:bg-white/5 transition-colors"
      >
        <span className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-brand/10 text-brand">
                 <AlertCircle className="w-5 h-5" />
            </div>
            <span>Regras e Condições - <PlatformName platform={platform} className="font-bold" /></span>
        </span>
        <div className={`p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
             <ChevronDown className="w-4 h-4 text-neutral-500" />
        </div>
      </button>

      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6 pt-0 border-t border-neutral-200/50 dark:border-neutral-800/50 text-sm text-neutral-600 dark:text-neutral-300 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-neutral-50 dark:bg-neutral-900/50 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <h4 className="font-bold mb-3 flex items-center gap-2 text-brand text-xs uppercase tracking-wider">
                    <Calendar className="w-4 h-4" /> Período
                </h4>
                {mode === 'daily' || mode === 'aviator' ? (
                    <p className="font-medium">00:00 às 23:59 do mesmo dia.</p>
                ) : (
                    <p className="font-medium">Segunda a Domingo (Horário de Brasília).</p>
                )}
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-900/50 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <h4 className="font-bold mb-3 flex items-center gap-2 text-brand text-xs uppercase tracking-wider">
                    <Clock className="w-4 h-4" /> Pagamento
                </h4>
                <p className="font-medium">{deliveryText}</p>
            </div>
          </div>

          <div>
             <h4 className="font-bold text-neutral-900 dark:text-white mb-3">Requisitos:</h4>
             <ul className="grid gap-2">
                 <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
                    <span>Mínimo: <strong>{platform === 'Vera' ? 'R$ 0,01' : 'R$ 0,50'}</strong> (Máx: R$ 5.000)</span>
                 </li>
                 <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
                    <span>Tipo: Saldo Real (Sem Rollover)</span>
                 </li>
                 {mode === 'sports' && (
                     <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
                        <span>Apenas Múltiplas (Odds 3.0 - 1000)</span>
                     </li>
                 )}
             </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-5 rounded-2xl">
             <h4 className="font-bold mb-2 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs uppercase tracking-wider">
                <Ban className="w-4 h-4" /> Jogos Excluídos
            </h4>
            <p className="leading-relaxed opacity-90">{excluded.join(", ")}.</p>
          </div>
        </div>
      </div>
    </div>
  );
};