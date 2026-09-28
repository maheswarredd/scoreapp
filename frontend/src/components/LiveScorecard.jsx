import React from 'react';
import { Award, Zap } from 'lucide-react';

export default function LiveScorecard({ match, innings }) {
  if (!innings) {
    return (
      <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-crex-border text-slate-400">
        Innings has not started yet.
      </div>
    );
  }

  // Active batsmen at crease (current striker and current non-striker or not out)
  const activeBatsmen = innings.batsmen.filter(b => !b.isOut && (b.isCurrentStriker || b.isCurrentNonStriker));
  // Current bowler
  const activeBowler = innings.bowlers.find(b => b.isCurrentBowler) || innings.bowlers[0];

  return (
    <div className="space-y-4">
      {/* Batting Section */}
      <div className="bg-[#121829] border border-crex-border rounded-xl overflow-hidden shadow-lg">
        <div className="px-4 py-2.5 bg-slate-900/80 border-b border-crex-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Batters at Crease
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            * Indicates current striker
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                <th className="py-2.5 px-4">Batter</th>
                <th className="py-2.5 px-3 text-right">R</th>
                <th className="py-2.5 px-3 text-right">B</th>
                <th className="py-2.5 px-3 text-right">4s</th>
                <th className="py-2.5 px-3 text-right">6s</th>
                <th className="py-2.5 px-4 text-right">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {activeBatsmen.length > 0 ? (
                activeBatsmen.map((batter) => (
                  <tr
                    key={batter.playerId}
                    className={`hover:bg-slate-800/30 transition-colors ${
                      batter.isCurrentStriker ? 'bg-blue-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-100 flex items-center">
                          {batter.name}
                          {batter.isCurrentStriker && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-black border border-amber-500/30">
                              * STRIKER
                            </span>
                          )}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium flex items-center mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1"></span>
                        not out
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-sm text-white">
                      {batter.runs}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {batter.balls}
                    </td>
                    <td className="py-3 px-3 text-right text-blue-400 font-semibold">
                      {batter.fours}
                    </td>
                    <td className="py-3 px-3 text-right text-amber-400 font-semibold">
                      {batter.sixes}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-300">
                      {batter.strikeRate?.toFixed(1) || '0.0'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-slate-500">
                    No active batsmen selected at crease
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bowling Section */}
      <div className="bg-[#121829] border border-crex-border rounded-xl overflow-hidden shadow-lg">
        <div className="px-4 py-2.5 bg-slate-900/80 border-b border-crex-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Current Bowler
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Active Delivery</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                <th className="py-2.5 px-4">Bowler</th>
                <th className="py-2.5 px-3 text-right">O</th>
                <th className="py-2.5 px-3 text-right">M</th>
                <th className="py-2.5 px-3 text-right">R</th>
                <th className="py-2.5 px-3 text-right">W</th>
                <th className="py-2.5 px-4 text-right">ECON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {activeBowler ? (
                <tr className="bg-amber-950/15 hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-slate-100">{activeBowler.name}</span>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Wides: {activeBowler.wides || 0} | No-Balls: {activeBowler.noBalls || 0}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-200">
                    {activeBowler.overs?.toFixed(1) || '0.0'}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400">
                    {activeBowler.maidens || 0}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-sm text-white">
                    {activeBowler.runsConceded || 0}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-sm text-red-400">
                    {activeBowler.wickets || 0}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-300">
                    {activeBowler.economy?.toFixed(2) || '0.00'}
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-slate-500">
                    No active bowler assigned
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partnership & Extras Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Partnership */}
        <div className="bg-[#121829] border border-crex-border rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Current Partnership
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-lg font-black text-white">
                  {innings.partnership?.runs || 0}
                </span>
                <span className="text-xs text-slate-400">
                  runs ({innings.partnership?.balls || 0} balls)
                </span>
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
            {activeBatsmen.map(b => b.name?.split(' ').pop()).join(' & ') || 'Crease'}
          </span>
        </div>

        {/* Extras Breakdown */}
        <div className="bg-[#121829] border border-crex-border rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Extras ({match.scoringRule?.customWideNoBall ? 'Custom Rule: 0 Wd/Nb Penalty' : 'Standard'})
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-lg font-black text-white">
                  {innings.extras?.totalExtras || 0}
                </span>
                <span className="text-[11px] text-slate-400">
                  (wd {innings.extras?.wides || 0}, nb {innings.extras?.noBalls || 0}, b {innings.extras?.byes || 0}, lb {innings.extras?.legByes || 0})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
