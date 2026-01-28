import React, { useState, useEffect, useLayoutEffect } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface ProductTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const ProductTour: React.FC<ProductTourProps> = ({ steps, isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Preload Character Image
  useEffect(() => {
    const img = new Image();
    img.src = "https://i.imgur.com/8Q8N7mF.png";
  }, []);

  // Reset step when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      document.body.style.overflow = 'hidden'; // Lock scroll
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const step = steps[currentStep];
  const isCentered = step?.targetId === 'center';

  // Find target element and calculate position (Only for non-centered steps)
  useLayoutEffect(() => {
    if (!isOpen || isCentered) return;

    const updatePosition = () => {
      const element = document.getElementById(step.targetId);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    const timeout = setTimeout(updatePosition, 100);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      clearTimeout(timeout);
    };
  }, [currentStep, isOpen, step, isCentered]); 

  if (!isOpen) return null;
  // If not centered and no rect yet, don't render (wait for effect)
  if (!isCentered && !targetRect) return null;

  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  // Render Welcome Screen (Character Mode)
  if (isCentered) {
      return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-all duration-300">
              <div className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center p-6">
                  
                  {/* Speech Bubble */}
                  <div className="relative bg-white p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-md text-center mb-6 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-700 delay-300 border-2 border-neutral-100">
                      {/* Tail */}
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rotate-45 transform border-b-2 border-r-2 border-neutral-100"></div>
                      
                      <h3 className="text-2xl font-black text-brand mb-3 tracking-tight">{step.title}</h3>
                      <p className="text-lg text-neutral-800 font-medium leading-relaxed mb-6">
                          {step.content}
                      </p>
                      
                      <button 
                          onClick={handleNext}
                          className="w-full sm:w-auto px-8 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-brand/30 flex items-center justify-center gap-2 mx-auto"
                      >
                          Começar
                          <ChevronRight className="w-5 h-5" />
                      </button>
                  </div>

                  {/* Character Image - No Frame */}
                  <div className="relative z-10 h-[45vh] min-h-[300px] animate-in slide-in-from-bottom-20 fade-in duration-1000 ease-out">
                       <img 
                          src="https://i.imgur.com/8Q8N7mF.png" 
                          alt="GreenBack" 
                          className="h-full w-auto object-contain drop-shadow-2xl"
                          loading="eager"
                       />
                  </div>
              </div>
          </div>
      );
  }

  // Spotlight Mode Calculation
  let top = targetRect!.bottom + 20; 
  let left = targetRect!.left + (targetRect!.width / 2) - 192; 

  if (left < 10) left = 10;
  if (left + 384 > window.innerWidth) left = window.innerWidth - 394;
  
  if (top + 400 > window.innerHeight && targetRect!.top > 400) {
      top = targetRect!.top - 350; 
  }

  // Render Standard Step Card
  return (
    <>
      {/* Spotlight Overlay */}
      <div 
        className="fixed inset-0 z-[90] transition-all duration-300 ease-in-out pointer-events-none"
        style={{
          boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.75)`,
          borderRadius: '8px',
          top: targetRect!.top - 5,
          left: targetRect!.left - 5,
          width: targetRect!.width + 10,
          height: targetRect!.height + 10,
        }}
      />

      {/* Floating Card */}
      <div 
        className="fixed z-[100]"
        style={{ top, left, width: '384px' }}
      >
        <div className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-0 overflow-visible flex flex-col animate-in fade-in zoom-in-95 duration-300 max-w-sm w-full mx-auto border border-neutral-100 dark:border-neutral-700">
            {/* Header */}
            <div className="bg-brand/10 p-5 rounded-t-2xl border-b border-brand/10">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-xl font-bold text-brand">{step.title}</h3>
                   <span className="text-xs font-bold text-brand/60 uppercase tracking-wider bg-brand/10 px-2 py-1 rounded">
                        Passo {currentStep + 1} de {steps.length}
                   </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-4">
                <p className="text-neutral-700 dark:text-neutral-200 text-sm leading-relaxed mb-6 font-medium">
                    {step.content}
                </p>

                <div className="flex items-center justify-between mt-2">
                    <button 
                        onClick={onClose}
                        className="text-xs font-bold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                    >
                        Pular
                    </button>
                    
                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <button 
                                onClick={handlePrev}
                                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        )}
                        <button 
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-2 bg-brand hover:bg-brand-dark text-white rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg"
                        >
                            {isLastStep ? 'Concluir' : 'Próximo'}
                            {isLastStep ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
};