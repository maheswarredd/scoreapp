import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export default function BallAnimationOverlay({ liveEvent }) {
  const [visible, setVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  useEffect(() => {
    if (!liveEvent || !liveEvent.type || liveEvent.type === 'NONE') return;

    setCurrentEvent(liveEvent);
    setVisible(true);

    // Trigger confetti on Four, Six, or Wicket
    if (liveEvent.type === 'SIX') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ffffff']
      });
    } else if (liveEvent.type === 'FOUR') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#60a5fa', '#93c5fd']
      });
    } else if (liveEvent.type === 'WICKET') {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#dc2626', '#fca5a5']
      });
    }

    const timer = setTimeout(() => {
      setVisible(false);
    }, 2800);

    return () => clearTimeout(timer);
  }, [liveEvent]);

  if (!visible || !currentEvent) return null;

  const getStyle = () => {
    switch (currentEvent.type) {
      case 'FOUR':
        return {
          bg: 'from-blue-600/90 via-sky-600/90 to-blue-800/90',
          border: 'border-blue-400',
          badge: 'bg-blue-500',
          title: 'FOUR!',
          subtitle: 'CRACKING BOUNDARY'
        };
      case 'SIX':
        return {
          bg: 'from-amber-500/95 via-yellow-600/95 to-amber-700/95',
          border: 'border-yellow-300',
          badge: 'bg-amber-400 text-slate-950',
          title: 'MAXIMUM! 6',
          subtitle: 'INTO THE STANDS'
        };
      case 'WICKET':
        return {
          bg: 'from-red-600/95 via-rose-700/95 to-red-900/95',
          border: 'border-red-400',
          badge: 'bg-red-500',
          title: 'WICKET!',
          subtitle: 'TIMBER FALLS'
        };
      case 'NO_BALL':
        return {
          bg: 'from-purple-600/95 via-pink-600/95 to-purple-800/95',
          border: 'border-purple-300',
          badge: 'bg-purple-500',
          title: 'NO BALL!',
          subtitle: 'FREE HIT NEXT BALL'
        };
      case 'WIDE':
        return {
          bg: 'from-amber-600/90 via-orange-600/90 to-amber-800/90',
          border: 'border-amber-400',
          badge: 'bg-amber-500',
          title: 'WIDE BALL',
          subtitle: 'EXTRA DELIVERY'
        };
      case 'OVER':
        return {
          bg: 'from-slate-800/95 via-slate-700/95 to-slate-900/95',
          border: 'border-slate-500',
          badge: 'bg-slate-600',
          title: 'OVER COMPLETE',
          subtitle: 'BOWLING CHANGE'
        };
      default:
        return {
          bg: 'from-blue-700/90 to-indigo-900/90',
          border: 'border-blue-400',
          badge: 'bg-blue-600',
          title: currentEvent.type,
          subtitle: currentEvent.text
        };
    }
  };

  const style = getStyle();

  return (
    <div className="fixed inset-x-0 top-20 z-50 flex items-center justify-center pointer-events-none px-4">
      <div className={`relative px-8 py-4 rounded-2xl bg-gradient-to-r ${style.bg} border-2 ${style.border} shadow-2xl shadow-black/80 flex flex-col items-center animate-pop-in`}>
        <div className="flex items-center space-x-3">
          <span className="text-3xl md:text-5xl font-black tracking-widest text-white drop-shadow-md">
            {style.title}
          </span>
        </div>
        <p className="text-xs md:text-sm font-bold tracking-wider text-slate-100 uppercase mt-1">
          {style.subtitle}
        </p>
        {currentEvent.text && currentEvent.text !== style.subtitle && (
          <p className="text-xs text-white/90 font-medium mt-1 text-center max-w-sm">
            {currentEvent.text}
          </p>
        )}
      </div>
    </div>
  );
}
