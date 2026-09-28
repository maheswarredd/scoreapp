import React from 'react';

export default function RecentOversStrip({ overs = [] }) {
  if (!overs || overs.length === 0) {
    return (
      <div className="py-2.5 px-4 bg-slate-900/60 rounded-xl border border-crex-border text-center text-xs text-slate-400">
        Waiting for first ball of the innings...
      </div>
    );
  }

  // Get last 4 overs, reverse or order as recent
  const recentOvers = overs.slice(-4);

  const getBallBadge = (ball) => {
    const outcome = ball.outcome || `${ball.runs || 0}`;

    if (ball.isWicket || outcome.includes('W') && !outcome.includes('Wd')) {
      return (
        <span
          key={ball.ballId}
          title={ball.commentary || 'Wicket'}
          className="w-7 h-7 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center shadow-sm shadow-red-600/40 ring-1 ring-red-400"
        >
          W
        </span>
      );
    }

    if (ball.isNoBall || outcome.startsWith('Nb')) {
      return (
        <span
          key={ball.ballId}
          title={ball.commentary || 'No Ball'}
          className="px-2 h-7 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-sm shadow-purple-600/30 ring-1 ring-purple-400"
        >
          {outcome}
        </span>
      );
    }

    if (ball.isWide || outcome.startsWith('Wd')) {
      return (
        <span
          key={ball.ballId}
          title={ball.commentary || 'Wide Ball'}
          className="px-2 h-7 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center shadow-sm shadow-amber-600/30 ring-1 ring-amber-400"
        >
          {outcome}
        </span>
      );
    }

    if (ball.runs === 6 || outcome === '6') {
      return (
        <span
          key={ball.ballId}
          title={ball.commentary || 'Six'}
          className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shadow-sm shadow-emerald-600/40 ring-1 ring-emerald-400"
        >
          6
        </span>
      );
    }

    if (ball.runs === 4 || outcome === '4') {
      return (
        <span
          key={ball.ballId}
          title={ball.commentary || 'Four'}
          className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-sm shadow-blue-600/40 ring-1 ring-blue-400"
        >
          4
        </span>
      );
    }

    if (ball.runs === 0 || outcome === '0') {
      return (
        <span
          key={ball.ballId}
          title={ball.commentary || 'Dot ball'}
          className="w-7 h-7 rounded-full bg-slate-800/90 text-slate-400 text-xs font-medium flex items-center justify-center border border-slate-700/60"
        >
          •
        </span>
      );
    }

    return (
      <span
        key={ball.ballId}
        title={ball.commentary}
        className="w-7 h-7 rounded-full bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center border border-slate-700"
      >
        {outcome}
      </span>
    );
  };

  return (
    <div className="bg-[#121829] border border-crex-border rounded-xl p-3 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Recent Overs
        </span>
        <span className="text-[11px] text-slate-500">
          Scroll left/right for past balls
        </span>
      </div>

      <div className="flex items-center space-x-4 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
        {recentOvers.map((over) => (
          <div
            key={over.overNumber}
            className="flex items-center space-x-2 bg-slate-900/70 border border-slate-800/90 rounded-lg px-3 py-1.5 shrink-0"
          >
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold text-slate-300">
                Ov {over.overNumber}
              </span>
              <span className="text-[9px] text-slate-500 truncate max-w-[70px]">
                {over.bowlerName?.split(' ').pop() || ''}
              </span>
            </div>

            <div className="h-5 w-px bg-slate-800"></div>

            <div className="flex items-center space-x-1.5">
              {over.balls.map((ball) => getBallBadge(ball))}
            </div>

            <div className="h-5 w-px bg-slate-800"></div>

            <span className="text-xs font-black text-amber-400">
              = {over.runsInOver}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
