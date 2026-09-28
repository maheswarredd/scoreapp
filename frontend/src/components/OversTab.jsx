import React from 'react';

export default function OversTab({ innings }) {
  if (!innings || !innings.overs || innings.overs.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-crex-border text-slate-400">
        No overs bowled yet in this innings.
      </div>
    );
  }

  // Reverse to show most recent over at top
  const reversedOvers = [...innings.overs].reverse();

  const getBallBadge = (ball) => {
    const outcome = ball.outcome || `${ball.runs || 0}`;

    if (ball.isWicket || outcome.includes('W') && !outcome.includes('Wd')) {
      return (
        <span key={ball.ballId} className="w-7 h-7 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center shadow-sm">
          W
        </span>
      );
    }
    if (ball.isNoBall || outcome.startsWith('Nb')) {
      return (
        <span key={ball.ballId} className="px-2 h-7 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
          {outcome}
        </span>
      );
    }
    if (ball.isWide || outcome.startsWith('Wd')) {
      return (
        <span key={ball.ballId} className="px-2 h-7 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">
          {outcome}
        </span>
      );
    }
    if (ball.runs === 6 || outcome === '6') {
      return (
        <span key={ball.ballId} className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center">
          6
        </span>
      );
    }
    if (ball.runs === 4 || outcome === '4') {
      return (
        <span key={ball.ballId} className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
          4
        </span>
      );
    }
    if (ball.runs === 0 || outcome === '0') {
      return (
        <span key={ball.ballId} className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 text-xs font-medium flex items-center justify-center border border-slate-700">
          •
        </span>
      );
    }
    return (
      <span key={ball.ballId} className="w-7 h-7 rounded-full bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center border border-slate-700">
        {outcome}
      </span>
    );
  };

  return (
    <div className="space-y-3">
      {reversedOvers.map((over) => (
        <div
          key={over.overNumber}
          className="bg-[#121829] border border-crex-border rounded-xl p-4 shadow-sm hover:border-slate-700 transition"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-3">
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 font-extrabold text-xs border border-blue-500/30">
                OVER {over.overNumber}
              </span>
              <span className="text-sm font-bold text-white">
                {over.bowlerName}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-400">
                Runs: <strong className="text-amber-400 font-extrabold">{over.runsInOver}</strong>
              </span>
              {over.wicketsInOver > 0 && (
                <span className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 font-bold border border-red-500/30">
                  {over.wicketsInOver} Wkt
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {over.balls.map((b) => getBallBadge(b))}
          </div>
        </div>
      ))}
    </div>
  );
}
