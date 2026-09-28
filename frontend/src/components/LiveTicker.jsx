import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function LiveTicker({ matches = [] }) {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="py-3 border-b border-crex-border bg-[#0b0f1d]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-thin">
          {matches.map((m) => {
            const isLive = m.status === 'live' || m.status === 'toss_done' || m.status === 'innings_break';
            const inn1 = m.innings?.[0];
            const inn2 = m.innings?.[1];

            const team1Innings = m.innings?.find(i => i.battingTeam === 'team1');
            const team2Innings = m.innings?.find(i => i.battingTeam === 'team2');

            return (
              <Link
                key={m._id}
                to={`/match/${m._id}`}
                className="min-w-[280px] max-w-[320px] bg-[#121829] hover:bg-[#161e33] border border-crex-border hover:border-blue-500/40 rounded-xl p-3 shadow-md transition-all shrink-0 group"
              >
                {/* Header */}
                <div className="flex items-center justify-between text-[11px] mb-2 pb-1.5 border-b border-slate-800">
                  <span className="font-extrabold text-blue-400 uppercase tracking-wider truncate max-w-[170px]">
                    {m.matchType} • {m.title?.split('-')[0] || 'Match'}
                  </span>
                  {isLive ? (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 font-extrabold text-[10px] border border-red-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                      <span>LIVE</span>
                    </span>
                  ) : m.status === 'completed' ? (
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px]">
                      Result
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-300 font-bold text-[10px]">
                      Upcoming
                    </span>
                  )}
                </div>

                {/* Team 1 Score */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{m.team1.logo || '🏏'}</span>
                    <span className="font-bold text-xs text-white">{m.team1.shortName || m.team1.name}</span>
                  </div>
                  <div className="text-right">
                    {team1Innings ? (
                      <span className="font-black text-xs text-white">
                        {team1Innings.totalRuns}/{team1Innings.totalWickets}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          ({team1Innings.totalOvers?.toFixed(1) || '0.0'})
                        </span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Yet to bat</span>
                    )}
                  </div>
                </div>

                {/* Team 2 Score */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{m.team2.logo || '🏏'}</span>
                    <span className="font-bold text-xs text-white">{m.team2.shortName || m.team2.name}</span>
                  </div>
                  <div className="text-right">
                    {team2Innings ? (
                      <span className="font-black text-xs text-white">
                        {team2Innings.totalRuns}/{team2Innings.totalWickets}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          ({team2Innings.totalOvers?.toFixed(1) || '0.0'})
                        </span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">Yet to bat</span>
                    )}
                  </div>
                </div>

                {/* Note / Result */}
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate max-w-[210px] text-amber-400/90 font-medium">
                    {m.statusNote || 'Match scheduled'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
