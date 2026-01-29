import React, { useState, useEffect } from 'react';
import { calculateCashback, formatCurrency, formatPercent } from '../services/cashbackService';
import { Calculator as CalcIcon, DollarSign, Wallet, Scale, ArrowRight, TrendingDown } from 'lucide-react';
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

  useEffect(() => {
    setValues({ lossAmount: '' });
    setReceivedInput('');
    setResult(null);
  }, [mode, platform]);

  useEffect(() => {
    const normalizedLoss = values.lossAmount.replace(',', '.');
    const loss = parseFloat(normalizedLoss) || 0;
    if (loss > 0) {
      setResult(calculateCashback(loss, mode, platform));
    } else {
      setResult(null);
    }
  }, [values, mode, platform]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value === '' || /^\d*([.,]\d*)?$/.test(value)) {
      setValues({ lossAmount: value });
    }
  };

  const handleReceivedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value === '' || /^\d*([.,]\d*)?$/.test(value)) {
      setReceivedInput(value);
    }
  };

  const getDisclaimer = () => {
      if (mode === 'sports') return "Apenas apostas Múltiplas (Odds 3.0+).";
      if (mode === 'aviator') return "Apenas perdas no 'Aviator Crash'.";
      return "Cálculo sobre Saldo Negativo (GGR).";
  };

  const normalizedReceived = receivedInput.replace(',', '.');
  const receivedAmount = parseFloat(normalizedReceived) || 0;
  const diff = result ? result.cashbackAmount - receivedAmount : 0;
  const shouldCredit = Math.max(0, parseFloat(diff.toFixed(6)));
  const isDivergent = result && result.cashbackAmount > 0 && receivedInput !== '' && receivedAmount < result.cashbackAmount;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Input Section - Left Side */}
      <div className="lg:col-span-5 flex flex-col h-full">
        <div className="glass rounded-3xl p-6 md:p-8 h-full flex flex-col relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 flex items-center justify-center shadow-inner">
                <CalcIcon className="w-5 h-5 text-brand" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">Dados da Perda</h2>
                <p className="text-xs text-neutral-500">Informe o valor para calcular</p>
            </div>
          </div>
          
          <div id="tour-input-loss" className="flex-1 flex flex-col justify-center">
            <label className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-2 block">
              Saldo Negativo (R$)
            </label>
            <div className="relative group">
              <input
                type="text"
                inputMode="decimal"
                value={values.lossAmount}
                onChange={handleInputChange}
                placeholder="0,00"
                className="peer w-full bg-transparent text-4xl md:text-5xl font-black text-neutral-900 dark:text-white placeholder-neutral-200 dark:placeholder-neutral-800 outline-none py-2 border-b-2 border-neutral-200 dark:border-neutral-800 focus:border-brand transition-all"
                autoFocus
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-300 dark:text-neutral-700 peer-focus:text-brand transition-colors">
                  <TrendingDown className="w-6 h-6" />
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-2">Digite o valor sem o sinal de menos.</p>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
             <div className="flex items-center gap-3 text-xs font-medium text-neutral-500 bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-xl">
                <Wallet className="w-4 h-4 text-brand" />
                {getDisclaimer()}
             </div>
          </div>
        </div>
      </div>

      {/* Results Section - Right Side */}
      <div className="lg:col-span-7" id="tour-results-area">
         {result ? (
            <div className="h-full flex flex-col relative">
                {/* Main Ticket Card */}
                <div className="glass rounded-3xl overflow-hidden shadow-xl border-0 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
                    
                    {/* Active Header - Uses textOnBrand for labels, but forces white for value on 7K */}
                    <div className={`relative p-8 text-center overflow-hidden ${result.cashbackAmount > 0 ? `bg-brand ${config.textOnBrand}` : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'}`}>
                        {result.cashbackAmount > 0 && (
                            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                        )}
                        <div className="relative z-10">
                            <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Cashback Disponível</h3>
                            <h2 className={`text-5xl md:text-6xl font-black tracking-tight drop-shadow-lg ${platform === '7K' ? 'text-white' : ''}`}>
                                {formatCurrency(result.cashbackAmount)}
                            </h2>
                            {result.cashbackAmount > 0 && (
                                <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md border text-xs font-bold ${platform === '7K' || platform === 'Vera' ? 'bg-black/10 border-black/10 text-neutral-900' : 'bg-white/20 border-white/20 text-white'}`}>
                                    <span className={`w-2 h-2 rounded-full animate-pulse ${platform === '7K' || platform === 'Vera' ? 'bg-neutral-900' : 'bg-green-400'}`}></span>
                                    {formatPercent(result.appliedPercent)} aplicado sobre {formatCurrency(result.lossAmount)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Receipt Body */}
                    <div className="bg-white dark:bg-neutral-900 flex-1 p-8 flex flex-col relative">
                        {/* Perforated Edge Effect */}
                        <div className="absolute top-0 left-0 right-0 h-4 -mt-2 bg-[radial-gradient(circle,transparent_50%,var(--bg-card)_50%)] bg-[length:16px_16px] [background-position-y:-8px] dark:[--bg-card:#171717] [--bg-card:#ffffff]"></div>

                        {/* Divergence Calculator */}
                        {result.cashbackAmount > 0 && (
                            <div className="mt-2">
                                <div className="flex items-center gap-2 mb-4 text-neutral-400 font-bold text-xs uppercase tracking-wider">
                                    <Scale className="w-4 h-4" /> Calculadora de Diferença
                                </div>
                                
                                <div className="bg-neutral-100 dark:bg-black/40 rounded-2xl p-2 flex items-center justify-between border border-neutral-300 dark:border-neutral-700 shadow-inner">
                                    <div className="flex-1 px-4 py-2">
                                        <label className="block text-[10px] font-bold text-neutral-500 uppercase">Já Pago</label>
                                        <div className="flex items-center gap-1">
                                            <span className="text-neutral-500 font-semibold">R$</span>
                                            <input 
                                                type="text"
                                                inputMode="decimal"
                                                placeholder="0,00"
                                                value={receivedInput}
                                                onChange={handleReceivedChange}
                                                className="w-full bg-transparent font-bold text-lg text-neutral-900 dark:text-neutral-200 outline-none placeholder-neutral-400"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="text-neutral-400 dark:text-neutral-600">
                                        <ArrowRight className="w-6 h-6" />
                                    </div>

                                    {/* Updated Result Box */}
                                    <div className={`flex-1 px-4 py-3 rounded-xl text-right transition-colors ${isDivergent ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-brand/10 text-brand-dark'}`}>
                                        <label className="block text-[10px] font-bold opacity-70 uppercase">Pagar</label>
                                        <span className="text-xl font-black">{formatCurrency(shouldCredit)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-auto pt-6 text-center">
                            <p className="text-xs font-medium text-neutral-400">
                                Prazo: {mode === 'weekly' ? config.rules.weekly.deliveryText : config.rules.daily.deliveryText}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
         ) : (
             <div className="h-full min-h-[400px] glass rounded-3xl flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800/50">
                <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <DollarSign className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
                </div>
                <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-200 mb-2">Aguardando Dados</h3>
                <p className="text-sm text-neutral-500 max-w-xs mx-auto">
                    Preencha o saldo negativo ao lado para gerar o cálculo detalhado do benefício.
                </p>
             </div>
         )}
      </div>
    </div>
  );
};