import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
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

// Fixed color for the tutorial elements
const TOUR_COLOR = '#13DA87';
const TOUR_COLOR_HOVER = '#0FB86F';

export const ProductTour: React.FC<ProductTourProps> = ({ steps, isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [cardRect, setCardRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  // 1. Measure Target
  useLayoutEffect(() => {
    if (!isOpen || isCentered) return;

    const updatePosition = () => {
      const element = document.getElementById(step.targetId);
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTargetRect(element.getBoundingClientRect());
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    // Double check after scroll animation
    const timeout = setTimeout(updatePosition, 400);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      clearTimeout(timeout);
    };
  }, [currentStep, isOpen, step, isCentered]); 

  // 2. Measure Card (after render) to adjust position
  useLayoutEffect(() => {
      if(cardRef.current) {
          setCardRect(cardRef.current.getBoundingClientRect());
      }
  }, [targetRect, currentStep, isCentered]);


  if (!isOpen) return null;
  // If not centered and no rect yet, don't render target overlay yet
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

  // --- WELCOME SCREEN (ANIMATED) ---
  if (isCentered) {
      return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm transition-all duration-300">
              <style>{`
                  @keyframes float {
                      0% { transform: translateY(0px); }
                      50% { transform: translateY(-15px); }
                      100% { transform: translateY(0px); }
                  }
                  @keyframes popIn {
                      0% { opacity: 0; transform: scale(0.5) translateY(20px); }
                      70% { opacity: 1; transform: scale(1.05); }
                      100% { opacity: 1; transform: scale(1); }
                  }
              `}</style>
              <div className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center p-6">
                  
                  {/* Background Glow */}
                  <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none animate-pulse"
                    style={{ backgroundColor: `${TOUR_COLOR}33` }} // 33 is approx 20% hex opacity
                  ></div>

                  {/* Speech Bubble with Pop Animation */}
                  <div 
                    className="relative bg-white p-8 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-md text-center mb-6 border-4 border-white/50"
                    style={{ animation: 'popIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
                  >
                      {/* Tail */}
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white rotate-45 transform border-b-4 border-r-4 border-white/50"></div>
                      
                      <h3 
                        className="text-3xl font-black mb-3 tracking-tight drop-shadow-sm"
                        style={{ color: TOUR_COLOR }}
                      >
                        {step.title}
                      </h3>
                      <p className="text-lg text-neutral-800 font-bold leading-relaxed mb-6">
                          {step.content}
                      </p>
                      
                      <button 
                          onClick={handleNext}
                          style={{ backgroundColor: TOUR_COLOR }}
                          className="w-full sm:w-auto px-8 py-4 text-white rounded-2xl font-black text-xl transition-all transform hover:scale-105 shadow-xl flex items-center justify-center gap-2 mx-auto active:scale-95 hover:brightness-95"
                      >
                          Começar
                          <ChevronRight className="w-6 h-6" />
                      </button>
                  </div>

                  {/* Character Image - Floating Animation */}
                  <div 
                    className="relative z-10 h-[45vh] min-h-[300px]"
                    style={{ animation: 'float 4s ease-in-out infinite' }}
                  >
                       <img 
                          src="https://i.imgur.com/8Q8N7mF.png" 
                          alt="GreenBack" 
                          className="h-full w-auto object-contain drop-shadow-2xl filter contrast-110"
                          loading="eager"
                       />
                  </div>
              </div>
          </div>
      );
  }

  // --- SPOTLIGHT MODE (SMART POSITIONING) ---

  const CARD_WIDTH = 384; 
  const SPACING = 16;
  const VIEWPORT_PADDING = 16;

  // 1. Horizontal Calculation
  let left = targetRect!.left + (targetRect!.width / 2) - (CARD_WIDTH / 2); 
  // Clamp to viewport
  if (left < VIEWPORT_PADDING) left = VIEWPORT_PADDING;
  if (left + CARD_WIDTH > window.innerWidth - VIEWPORT_PADDING) {
      left = window.innerWidth - CARD_WIDTH - VIEWPORT_PADDING;
  }

  // 2. Vertical Calculation (Smart Collision)
  // Default: Place below
  let top = targetRect!.bottom + SPACING;
  const cardHeight = cardRect ? cardRect.height : 300; // Estimated or real
  let isPlacedBelow = true;

  // Check if it fits below
  const fitsBelow = (top + cardHeight) <= (window.innerHeight - VIEWPORT_PADDING);
  
  if (!fitsBelow) {
      // Doesn't fit below. Try placing ABOVE.
      const topAbove = targetRect!.top - cardHeight - SPACING;
      
      // Check if fits above (considering standard header height ~70px)
      if (topAbove >= 70) {
          top = topAbove;
          isPlacedBelow = false;
      } else {
          // Fits NEITHER above nor below (Element is huge or screen is tiny).
          // Strategy: Clamp to bottom of viewport.
          top = window.innerHeight - cardHeight - VIEWPORT_PADDING;
      }
  }

  // Calculate Connection Line Points
  let connectionPath = '';
  if (!isCentered && cardRect) {
      const cardCenterX = left + (cardRect.width / 2);
      const targetCenterX = targetRect!.left + (targetRect!.width / 2);
      
      if (isPlacedBelow) {
          // From Target Bottom to Card Top
          const startX = targetCenterX;
          const startY = targetRect!.bottom;
          const endX = cardCenterX;
          const endY = top;
          
          connectionPath = `M ${startX} ${startY} C ${startX} ${startY + 20}, ${endX} ${endY - 20}, ${endX} ${endY}`;
      } else {
          // From Target Top to Card Bottom
          const startX = targetCenterX;
          const startY = targetRect!.top;
          const endX = cardCenterX;
          const endY = top + cardRect.height;
          
          connectionPath = `M ${startX} ${startY} C ${startX} ${startY - 20}, ${endX} ${endY + 20}, ${endX} ${endY}`;
      }
  }

  return (
    <>
      {/* Spotlight Overlay */}
      <div 
        className="fixed inset-0 z-[90] transition-all duration-300 ease-in-out pointer-events-none"
        style={{
          boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 0 4px ${TOUR_COLOR}80`, // Glow ring
          border: `2px solid ${TOUR_COLOR}`, // Solid border
          borderRadius: '12px',
          top: targetRect!.top - 4,
          left: targetRect!.left - 4,
          width: targetRect!.width + 8,
          height: targetRect!.height + 8,
        }}
      />

      {/* Connecting Line */}
      {connectionPath && (
          <svg className="fixed inset-0 z-[95] pointer-events-none w-full h-full">
              <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill={TOUR_COLOR} />
                  </marker>
              </defs>
              <path 
                d={connectionPath} 
                stroke={TOUR_COLOR} 
                strokeWidth="2" 
                fill="none" 
                strokeDasharray="4 2"
                className="animate-pulse"
                markerEnd="url(#arrowhead)"
              />
              <circle cx={targetRect!.left + (targetRect!.width / 2)} cy={isPlacedBelow ? targetRect!.bottom : targetRect!.top} r="3" fill={TOUR_COLOR} />
          </svg>
      )}

      {/* Floating Card */}
      <div 
        ref={cardRef}
        className="fixed z-[100] flex flex-col transition-all duration-500 ease-out"
        style={{ 
            left, 
            top,
            width: '384px',
            maxWidth: `calc(100vw - ${VIEWPORT_PADDING * 2}px)`,
        }}
      >
        <div 
            className="relative bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-0 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300 w-full mx-auto max-h-[80vh] flex-shrink-0"
            style={{ borderColor: TOUR_COLOR, borderWidth: '2px' }}
        >
            {/* Header */}
            <div 
                className="p-5 rounded-t-lg border-b flex-shrink-0"
                style={{ backgroundColor: TOUR_COLOR, borderColor: `${TOUR_COLOR}33` }}
            >
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-xl font-bold text-white">{step.title}</h3>
                   <span className="text-xs font-bold text-white uppercase tracking-wider bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                        Passo {currentStep + 1} de {steps.length}
                   </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 pt-4 overflow-y-auto custom-scrollbar">
                <p className="text-neutral-700 dark:text-neutral-200 text-sm leading-relaxed mb-6 font-medium">
                    {step.content}
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-700/50">
                    <button 
                        onClick={onClose}
                        className="text-xs font-bold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors px-2 py-1"
                    >
                        Pular
                    </button>
                    
                    <div className="flex gap-2">
                        {currentStep > 0 && (
                            <button 
                                onClick={handlePrev}
                                className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        )}
                        <button 
                            onClick={handleNext}
                            style={{ backgroundColor: TOUR_COLOR }}
                            className="flex items-center gap-2 px-6 py-2 text-white rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg transform active:scale-95 hover:brightness-95"
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