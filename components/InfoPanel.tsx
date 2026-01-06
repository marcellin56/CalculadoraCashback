import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Calendar, Clock, Ban, Trophy } from 'lucide-react';
import { CashbackMode, Platform } from '../types';
import { 
    EXCLUDED_GAMES_DAILY, EXCLUDED_GAMES_WEEKLY, EXCLUDED_GAMES_SPORTS, EXCLUDED_GAMES_AVIATOR, 
    VERA_EXCLUDED_GAMES_WEEKLY, VERA_EXCLUDED_GAMES_DAILY,
    PLATFORMS 
} from '../constants';

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
    deliveryText = `${config.rules.weekly.deliveryText} (Prazo: ${config.rules.weekly.maxDays}).`;
  } else if (mode === 'daily') {
    excluded = platform === 'Vera' ? VERA_EXCLUDED_GAMES_DAILY : EXCLUDED_GAMES_DAILY;
    title = "Diário (Slots)";
    deliveryText = `${config.rules.daily.deliveryText} (Prazo: ${config.rules.daily.maxDays}).`;
  } else if (mode === 'aviator') {
    excluded = EXCLUDED_GAMES_AVIATOR;
    title = "Diário (Aviator Crash)";
    deliveryText = `${config.rules.daily.deliveryText} (Prazo: ${config.rules.daily.maxDays}).`;
  } else {
    excluded = EXCLUDED_GAMES_SPORTS;
    title = "Esportivo (Semanal)";
    deliveryText = "Terças-feiras até às 14h.";
  }

  return (
    <div className="mt-8 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-neutral-800 shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
      >
        <span className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-brand" />
            Regras e Condições ({title}) - {config.name}
        </span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="p-6 pt-0 border-t border-neutral-100 dark:border-neutral-700/50 text-sm text-neutral-600 dark:text-neutral-300 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-neutral-50 dark:bg-neutral-700/30 p-4 rounded-lg">
                <h4 className="font-bold mb-2 flex items-center gap-2 text-brand-dark dark:text-brand">
                    <Calendar className="w-4 h-4" /> Período Base
                </h4>
                {mode === 'daily' || mode === 'aviator' ? (
                    <p>Das 00:00 às 23:59 do mesmo dia.</p>
                ) : (
                    <p>Segunda (00:00) até Domingo (23:59) - Horário de Brasília.</p>
                )}
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-700/30 p-4 rounded-lg">
                <h4 className="font-bold mb-2 flex items-center gap-2 text-brand-dark dark:text-brand">
                    <Clock className="w-4 h-4" /> Entrega
                </h4>
                <p>{deliveryText}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-neutral-800 dark:text-white mt-2">Detalhes Importantes:</h4>
            <ul className="list-disc pl-5 space-y-1 marker:text-brand">
                {mode === 'weekly' && (
                    <>
                        <li><strong>Mínimo:</strong> {platform === 'Vera' ? 'R$ 0,01' : 'R$ 0,50'} | <strong>Máximo:</strong> R$ 5.000,00</li>
                        <li><strong>Tipo:</strong> Saldo real (sem rollover)</li>
                    </>
                )}
                {(mode === 'daily' || mode === 'aviator') && (
                    <>
                        <li><strong>Mínimo:</strong> R$ 0,01 | <strong>Máximo:</strong> R$ 5.000,00</li>
                        <li><strong>Tipo:</strong> Saldo real</li>
                    </>
                )}
                {mode === 'sports' && (
                    <>
                        <li><strong>Mínimo:</strong> R$ 0,01 | <strong>Máximo:</strong> R$ 5.000,00</li>
                        <li><strong>Requisito:</strong> Apenas Múltiplas com Odds 3.0 a 1.000.</li>
                        <li><strong>Base:</strong> Limitado a 10% de R$ 50.000,00.</li>
                    </>
                )}
                <li><strong>Fórmula:</strong> Valor Apostado - Valor Ganhado (GGR Negativo).</li>
            </ul>
          </div>

          <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-lg">
             <h4 className="font-bold mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                <Ban className="w-4 h-4" /> Restrições / Excluídos
            </h4>
            <p>{excluded.join(", ")}.</p>
          </div>
        </div>
      )}
    </div>
  );
};