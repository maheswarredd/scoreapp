import React from 'react';

export default function CommentaryTab({ innings }) {
  if (!innings || !innings.overs || innings.overs.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-crex-border text-slate-400">
        No commentary recorded yet.
      </div>
    );
  }

  // Flatten all balls across overs
  const allBalls = [];
  innings.overs.forEach((over) => {
    over.balls.forEach((ball, bIdx) => {
      allBalls.push({
        ...ball,
        overDisplay: `${over.overNumber - 1}.${bIdx + 1}`
      });
    });
  });

  const reversedBalls = allBalls.reverse();

  return (
    <div className="space-y-2.5">
      {reversedBalls.map((ball) => {
        const isBoundary = ball.runs === 4 || ball.runs === 6;
        const isWicket = ball.isWicket;

        return (
          <div
            key={ball.ballId}
            className={`p-3.5 rounded-xl border transition-all ${
              isWicket
                ? 'bg-red-950/20 border-red-500/40'
                : isBoundary
                ? 'bg-blue-950/20 border-blue-500/30'
                : 'bg-[#121829] border-crex-border'
            }`}
          >
            <div className="flex items-start space-x-3">
              <span className="text-xs font-black text-slate-400 bg-slate-800/80 px-2 py-1 rounded shrink-0">
                {ball.overDisplay}
              </span>

              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-bold text-slate-300">
                    {ball.bowlerName} to {ball.strikerName}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-black ${
                      isWicket
                        ? 'bg-red-600 text-white'
                        : ball.runs === 6
                        ? 'bg-emerald-600 text-white'
                        : ball.runs === 4
                        ? 'bg-blue-600 text-white'
                        : ball.isWide
                        ? 'bg-amber-600 text-white'
                        : ball.isNoBall
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {ball.outcome}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {ball.commentary || `${ball.runs} runs scored.`}
                </p>

                {isWicket && ball.wicketDetail && (
                  <div className="mt-2 p-2 rounded bg-red-900/30 border border-red-500/30 text-xs font-semibold text-red-300">
                    WICKET: {ball.wicketDetail.batsmanName} ({ball.wicketDetail.dismissalType} - {ball.wicketDetail.fielderName || ball.wicketDetail.bowlerName})
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
