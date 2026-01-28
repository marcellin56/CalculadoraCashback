import React, { useState, useRef, useMemo } from 'react';
import { Upload, FileSpreadsheet, X, AlertTriangle, CheckCircle, Calendar, Filter, ChevronRight } from 'lucide-react';
import { processFile } from '../services/excelService';
import { formatCurrency, formatPercent } from '../services/cashbackService';
import { Platform, BatchReport } from '../types';

interface FileUploaderProps {
  platform: Platform;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ platform }) => {
  const [report, setReport] = useState<BatchReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setReport(null);
    setSelectedWeekIndex(null);

    try {
      const result = await processFile(file, platform);
      setReport(result);
    } catch (err) {
      setError("Erro ao processar arquivo. Verifique se é um Excel válido e contém colunas 'Data', 'Jogo' e 'GGR'.");
      console.error(err);
    } finally {
      setLoading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearReport = () => {
      setReport(null);
      setSelectedWeekIndex(null);
  };

  const translateMode = (mode: string) => {
      switch(mode) {
          case 'weekly': return 'Cassino (Semanal)';
          case 'daily': return 'Slots (Diário)';
          case 'sports': return 'Esportes';
          case 'aviator': return 'Aviator';
          default: return mode;
      }
  };

  const formatRowDate = (date: string, mode: string) => {
      if (mode === 'weekly' || mode === 'sports') {
          return `Semana de ${date}`;
      }
      return date;
  };

  // Calculate available weeks from data
  const availableWeeks = useMemo(() => {
      if (!report) return [];
      const weeksMap = new Map<string, { key: string, labelRange: string, startTs: number, endTs: number }>();

      report.summary.forEach(item => {
          // Parse date DD/MM/YYYY
          const [d, m, y] = item.date.split('/').map(Number);
          const date = new Date(y, m - 1, d);
          
          // Determine Monday of that week
          const day = date.getDay(); 
          const diffToMon = day === 0 ? 6 : day - 1; 
          
          const monday = new Date(date);
          monday.setDate(date.getDate() - diffToMon);
          monday.setHours(0,0,0,0);

          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          sunday.setHours(23,59,59,999);

          const key = monday.toISOString().split('T')[0]; // YYYY-MM-DD
          
          if (!weeksMap.has(key)) {
              weeksMap.set(key, { 
                  key, 
                  labelRange: `${monday.getDate().toString().padStart(2,'0')}/${(monday.getMonth()+1).toString().padStart(2,'0')} a ${sunday.getDate().toString().padStart(2,'0')}/${(sunday.getMonth()+1).toString().padStart(2,'0')}`,
                  startTs: monday.getTime(), 
                  endTs: sunday.getTime() 
              });
          }
      });

      // Sort chronological
      return Array.from(weeksMap.values()).sort((a, b) => a.startTs - b.startTs);
  }, [report]);

  // Filter Logic
  const filteredData = useMemo(() => {
      if (!report) return null;
      
      // Filter items
      const filteredSummary = report.summary.filter(item => {
          if (selectedWeekIndex === null) return true; // Show all
          
          const targetWeek = availableWeeks[selectedWeekIndex];
          if (!targetWeek) return true;

          const [d, m, y] = item.date.split('/').map(Number);
          const itemTs = new Date(y, m - 1, d).getTime();
          
          // Check if item date falls within the selected week range
          return itemTs >= targetWeek.startTs && itemTs <= targetWeek.endTs;
      });

      // Recalculate Totals
      const details = { weekly: 0, daily: 0, sports: 0, aviator: 0 };
      let total = 0;

      filteredSummary.forEach(item => {
          // @ts-ignore - dynamic key access
          if (details[item.mode] !== undefined) {
              // @ts-ignore
              details[item.mode] += item.cashback;
          }
          total += item.cashback;
      });

      return {
          summary: filteredSummary,
          totalCashback: total,
          detailsByMode: details
      };

  }, [report, selectedWeekIndex, availableWeeks]);


  return (
    <div className="space-y-6">
      
      {/* Upload Area */}
      {!report && (
        <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors bg-white dark:bg-neutral-800"
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".xlsx, .xls, .csv"
            />
            {loading ? (
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand"></div>
            ) : (
                <>
                    <div className="bg-brand/10 p-4 rounded-full mb-4">
                        <Upload className="w-8 h-8 text-brand" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">Carregar Planilha GGR</h3>
                    <p className="text-sm text-neutral-500 text-center max-w-xs mt-2">
                        Suporta .xlsx e .csv. O arquivo deve conter colunas: <strong>Data</strong>, <strong>Jogo</strong> e <strong>GGR</strong> (ou Valor Apostado/Ganho).
                    </p>
                </>
            )}
            {error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                </div>
            )}
        </div>
      )}

      {/* Results Display */}
      {filteredData && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-neutral-50 dark:bg-neutral-900/50">
                <div>
                    <h3 className="text-xl font-bold text-neutral-800 dark:text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-brand" />
                        Relatório Consolidado
                    </h3>
                    <p className="text-sm text-neutral-500">GGR calculado conforme as regras de negócio.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={clearReport}
                        className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors ml-auto md:ml-0 order-2 md:order-last"
                        title="Fechar / Novo Upload"
                    >
                        <X className="w-5 h-5 text-neutral-500" />
                    </button>
                </div>
            </div>

            {/* Week Selector (Calendar Filter) */}
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                    <Calendar className="w-4 h-4 text-brand" />
                    Filtrar por Semana:
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                     <button
                        onClick={() => setSelectedWeekIndex(null)}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                            selectedWeekIndex === null 
                            ? 'bg-brand text-white border-brand shadow-md' 
                            : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-brand/50'
                        }`}
                    >
                        Todas
                    </button>
                    
                    {availableWeeks.map((week, idx) => (
                        <button
                            key={week.key}
                            onClick={() => setSelectedWeekIndex(idx)}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg text-left transition-all border group ${
                                selectedWeekIndex === idx 
                                ? 'bg-brand text-white border-brand shadow-md' 
                                : 'bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-brand/50'
                            }`}
                        >
                            <div className="text-xs font-bold uppercase tracking-wider opacity-80 mb-0.5">Semana {idx + 1}</div>
                            <div className={`text-xs font-medium ${selectedWeekIndex === idx ? 'text-white/90' : 'text-neutral-500 group-hover:text-brand'}`}>
                                {week.labelRange}
                            </div>
                        </button>
                    ))}
                    
                    {availableWeeks.length === 0 && (
                        <span className="text-xs text-neutral-400 italic py-2">Nenhuma semana identificada.</span>
                    )}
                </div>
            </div>

            {/* Totals Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-brand/5">
                <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-brand/10 shadow-sm">
                    <span className="text-xs uppercase font-bold text-neutral-400">Total {selectedWeekIndex !== null ? `(Semana ${selectedWeekIndex + 1})` : 'Geral'}</span>
                    <div className="text-xl md:text-2xl font-black text-brand mt-1">{formatCurrency(filteredData.totalCashback)}</div>
                </div>
                {(Object.entries(filteredData.detailsByMode) as [string, number][]).map(([mode, val]) => (
                    val > 0 && (
                        <div key={mode} className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                            <span className="text-xs uppercase font-bold text-neutral-400">{translateMode(mode)}</span>
                            <div className="text-lg font-bold text-neutral-700 dark:text-neutral-200 mt-1">{formatCurrency(val)}</div>
                        </div>
                    )
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-100 dark:bg-neutral-900 text-xs uppercase text-neutral-500 font-semibold">
                        <tr>
                            <th className="p-4">Período / Data</th>
                            <th className="p-4">Categoria</th>
                            <th className="p-4 text-right">Perda (GGR)</th>
                            <th className="p-4 text-center">% Aplicado</th>
                            <th className="p-4 text-right text-brand">Cashback</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700 text-sm">
                        {filteredData.summary.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-neutral-400">
                                    {report && report.summary.length > 0 
                                        ? "Nenhum registro encontrado para a semana selecionada." 
                                        : "Nenhum cashback aplicável encontrado para os dados fornecidos."}
                                </td>
                            </tr>
                        ) : (
                            filteredData.summary.map((row, idx) => (
                                <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors">
                                    <td className="p-4 font-medium text-neutral-700 dark:text-neutral-300">
                                        {formatRowDate(row.date, row.mode)}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            row.mode === 'daily' ? 'bg-blue-100 text-blue-700' :
                                            row.mode === 'weekly' ? 'bg-purple-100 text-purple-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {translateMode(row.mode)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right text-neutral-600 dark:text-neutral-400">{formatCurrency(row.loss)}</td>
                                    <td className="p-4 text-center text-neutral-500">{formatPercent(row.percent)}</td>
                                    <td className="p-4 text-right font-bold text-brand">{formatCurrency(row.cashback)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};