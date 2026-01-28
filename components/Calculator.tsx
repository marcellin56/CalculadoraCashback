import React, { useState, useEffect } from 'react';
import { calculateCashback, formatCurrency, formatPercent } from '../services/cashbackService';
import { Calculator as CalcIcon, DollarSign, Wallet, Scale, ArrowRight } from 'lucide-react';
import { PLATFORMS } from '../constants';
import { CashbackMode, Platform, CashbackResult } from '../types';

interface CalculatorProps {
  mode: CashbackMode;
  platform: Platform;
}

interface ValuesState {
  lossAmount: string;
}

export const Calculator: React.FC<CalculatorProps> = ({ mode, platform }) => {
  const [values, setValues] = useState<ValuesState>({ lossAmount: '' });
  const [receivedInput, setReceivedInput] = useState<string>('');
  const [result, setResult] = useState<CashbackResult | null>(null);
  const config = PLATFORMS[platform];

  // Reset when switching modes or platforms
  useEffect(() => {
    setValues({ lossAmount: '' });
    setReceivedInput('');
    setResult(null);
  }, [mode, platform]);

  useEffect(() => {
    const loss = parseFloat(values.lossAmount) || 0;

    if (loss > 0) {
      setResult(calculateCashback(loss, mode, platform));
    } else {
      setResult(null);
    }
  }, [values, mode, platform]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Allow only numbers and decimals
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setValues({ lossAmount: value });
    }
  };

  const handleReceivedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setReceivedInput(value);
    }
  };

  const getPayoutTime = () => {
      switch(mode) {
          case 'weekly': return `Crédito: ${config.rules.weekly.deliveryText}`;
          case 'sports': return 'Crédito: Terça-feira (até 14h)';
          case 'daily': return `Crédito: ${config.rules.daily.deliveryText}`;
          case 'aviator': return `Crédito: ${config.rules.daily.deliveryText}`;
          default: return '';
      }
  };

  const getDisclaimer = () => {
      if (mode === 'sports') {
          return "Ferramenta interna: Insira o saldo negativo apenas de apostas Múltiplas (Odds 3.0 - 1000) finalizadas na semana.";
      }
      if (mode === 'aviator') {
          return "Ferramenta interna: Insira o saldo negativo apurado EXCLUSIVAMENTE em jogos 'Aviator Crash'. Outros jogos de crash não contam.";
      }
      return "Ferramenta interna: O cálculo assume que o valor inserido já é o GGR Negativo (Perdas - Ganhos) validado.";
  };

  // Divergence Calculation
  const receivedAmount = parseFloat(receivedInput) || 0;
  const shouldCredit = result ? Math.max(0, result.cashbackAmount - receivedAmount) : 0;
  const isDivergent = result && result.cashbackAmount > 0 && receivedInput !== '' && receivedAmount < result.cashbackAmount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-lg border border-neutral-100 dark:border-neutral-700 h-full flex flex-col justify-center">
          <h2 className="text-xl font-bold mb-8 text-neutral-800 dark:text-white flex items-center gap-2">
            <CalcIcon className="w-6 h-6 text-brand" />
            Dados do Jogador
          </h2>
          
          <div id="tour-input-loss">
            <label className="block text-base font-medium text-neutral-600 dark:text-neutral-400 mb-3">
              Saldo Negativo (Prejuízo Apurado)
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xl group-focus-within:text-brand transition-colors">R$</span>
              <input
                type="text"
                name="lossAmount"
                inputMode="decimal"
                value={values.lossAmount}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full pl-14 pr-4 py-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 focus:border-brand focus:ring-0 outline-none transition-all text-2xl font-bold text-neutral-800 dark:text-white placeholder:text-neutral-300 dark:placeholder:text-neutral-700"
              />
            </div>
            <p className="mt-3 text-sm text-neutral-400 dark:text-neutral-500">
              Insira o valor absoluto da perda do jogador (ex: 500.00).
            </p>
          </div>

          <div className="mt-8 bg-brand/5 dark:bg-brand/5 p-4 rounded-xl border border-brand/10 text-sm text-brand-dark dark:text-brand-light flex items-start gap-3">
             <div className="p-1 bg-brand/20 rounded-md shrink-0">
                <Wallet className="w-4 h-4" />
             </div>
             <p className="leading-relaxed opacity-90">
                {getDisclaimer()}
             </p>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6" id="tour-results-area">
         {result ? (
            <div className="flex flex-col h-full bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-lg border-2 border-brand/20 relative overflow-hidden">
                
                {/* Header Result */}
                <div className="text-center mb-6">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        Base de Cálculo
                    </span>
                    
                    <h3 className="text-4xl font-bold text-neutral-800 dark:text-white">
                         {formatCurrency(result.lossAmount)}
                    </h3>
                </div>

                {/* Cashback Display */}
                <div className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-500 mb-6 ${result.cashbackAmount > 0 ? `bg-gradient-to-br from-brand to-brand-dark ${config.textOnBrand} shadow-brand/40 shadow-xl` : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-400'}`}>
                    <div className="relative z-10 flex flex-col items-center">
                        <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Cashback Total Devido</p>
                        <h2 className="text-4xl font-black tracking-tight drop-shadow-sm">
                            {formatCurrency(result.cashbackAmount)}
                        </h2>
                        
                        {result.cashbackAmount > 0 && (
                             <div className={`mt-2 inline-flex items-center gap-2 ${config.textOnBrand === 'text-white' ? 'bg-white/20 border-white/20' : 'bg-black/10 border-black/10'} px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm border`}>
                                {formatPercent(result.appliedPercent)} aplicado
                             </div>
                        )}
                        
                         {/* Background decoration */}
                        {result.cashbackAmount > 0 && (
                            <>
                                <div className={`absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full blur-2xl ${config.textOnBrand === 'text-white' ? 'bg-white/20' : 'bg-black/10'}`}></div>
                                <div className={`absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full blur-2xl ${config.textOnBrand === 'text-white' ? 'bg-black/20' : 'bg-white/20'}`}></div>
                            </>
                        )}
                    </div>
                </div>

                {/* Divergence Section */}
                {result.cashbackAmount > 0 && (
                  <div className="mt-auto border-t border-neutral-100 dark:border-neutral-700 pt-6">
                      <div className="flex items-center gap-2 mb-3 text-neutral-500 dark:text-neutral-400">
                          <Scale className="w-4 h-4" />
                          <h4 className="text-xs font-bold uppercase tracking-wide">Cálculo de Divergência</h4>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-3 items-end">
                          <div className="col-span-3">
                              <label className="block text-xs font-medium text-neutral-400 mb-1.5 ml-1">
                                  Valor Recebido
                              </label>
                              <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs">R$</span>
                                  <input 
                                      type="text"
                                      inputMode="decimal"
                                      placeholder="0.00"
                                      value={receivedInput}
                                      onChange={handleReceivedChange}
                                      className="w-full pl-9 pr-3 py-2 text-sm font-bold rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 focus:border-brand focus:ring-0 outline-none text-neutral-800 dark:text-white"
                                  />
                              </div>
                          </div>
                          
                          <div className="col-span-1 flex justify-center pb-2 text-neutral-300">
                              <ArrowRight className="w-5 h-5" />
                          </div>

                          <div className={`col-span-3 rounded-xl p-2.5 border text-center transition-all ${isDivergent ? 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30' : 'bg-neutral-50 border-neutral-100 dark:bg-neutral-900 dark:border-neutral-800'}`}>
                              <span className="block text-[10px] font-bold uppercase text-neutral-400 mb-0.5">
                                  Restante a Creditar
                              </span>
                              <span className={`text-lg font-black ${isDivergent ? 'text-red-600 dark:text-red-400' : 'text-neutral-300 dark:text-neutral-600'}`}>
                                  {formatCurrency(shouldCredit)}
                              </span>
                          </div>
                      </div>
                  </div>
                )}
                
                <div className="mt-6 text-center">
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        {getPayoutTime()}
                    </p>
                </div>

            </div>
         ) : (
             <div className="h-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 text-neutral-400 p-12 text-center transition-all">
                <div className="max-w-xs">
                    <div className="w-20 h-20 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-6">
                        <DollarSign className="w-10 h-10 opacity-50 text-neutral-500 dark:text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-300 mb-2">Aguardando Valor</h3>
                    <p className="text-sm">Preencha o campo de saldo negativo para visualizar o cálculo do benefício.</p>
                </div>
             </div>
         )}
      </div>
    </div>
  );
};