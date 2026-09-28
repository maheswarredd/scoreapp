import React, { useState } from 'react';

export default function FullScorecardTab({ match }) {
  const [selectedInningsIndex, setSelectedInningsIndex] = useState(0);

  if (!match.innings || match.innings.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/50 rounded-xl border border-crex-border text-slate-400">
        Scorecard not available yet. Toss is pending or match hasn't started.
      </div>
    );
  }

  const innings = match.innings[selectedInningsIndex] || match.innings[0];
  const battingTeamObj = innings.battingTeam === 'team1' ? match.team1 : match.team2;
  const bowlingTeamObj = innings.bowlingTeam === 'team1' ? match.team1 : match.team2;

  const didNotBat = innings.batsmen.filter(b => !b.isOut && b.balls === 0 && !b.isCurrentStriker && !b.isCurrentNonStriker);

  return (
    <div className="space-y-6">
      {/* Innings Tabs */}
      {match.innings.length > 1 && (
        <div className="flex space-x-2 border-b border-crex-border pb-2">
          {match.innings.map((inn, idx) => {
            const team = inn.battingTeam === 'team1' ? match.team1 : match.team2;
            const active = selectedInningsIndex === idx;
            return (
              <button
                key={inn.inningsNumber}
                onClick={() => setSelectedInningsIndex(idx)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {team.shortName} Innings ({inn.totalRuns}/{inn.totalWickets})
              </button>
            );
          })}
        </div>
      )}

      {/* Innings Header Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-indigo-900/30 border border-crex-border rounded-xl p-4 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-extrabold text-blue-400">
            {battingTeamObj.name} Innings
          </span>
          <h2 className="text-2xl font-black text-white mt-0.5">
            {innings.totalRuns}/{innings.totalWickets}
            <span className="text-sm font-semibold text-slate-400 ml-2">
              ({innings.totalOvers?.toFixed(1) || '0.0'} Overs, RR: {(innings.legalBalls > 0 ? (innings.totalRuns / (innings.legalBalls / 6)).toFixed(2) : '0.00')})
            </span>
          </h2>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Target</span>
          <div className="text-base font-bold text-amber-400">
            {match.innings[0] && innings.inningsNumber === 2 ? `${match.innings[0].totalRuns + 1} Runs` : '1st Innings'}
          </div>
        </div>
      </div>

      {/* Batting Card */}
      <div className="bg-[#121829] border border-crex-border rounded-xl overflow-hidden shadow-md">
        <div className="px-4 py-3 bg-slate-900/80 border-b border-crex-border flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Batting
          </h3>
          <span className="text-[11px] text-slate-400">R (Runs) • B (Balls) • 4s • 6s • SR</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                <th className="py-2.5 px-4">Batter</th>
                <th className="py-2.5 px-3">Dismissal</th>
                <th className="py-2.5 px-3 text-right">R</th>
                <th className="py-2.5 px-3 text-right">B</th>
                <th className="py-2.5 px-3 text-right">4s</th>
                <th className="py-2.5 px-3 text-right">6s</th>
                <th className="py-2.5 px-4 text-right">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {innings.batsmen
                .filter(b => b.balls > 0 || b.isOut || b.isCurrentStriker || b.isCurrentNonStriker)
                .map((batter) => (
                  <tr
                    key={batter.playerId}
                    className={`hover:bg-slate-800/20 transition-colors ${
                      batter.isCurrentStriker || batter.isCurrentNonStriker ? 'bg-blue-950/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <span>{batter.name}</span>
                        {!batter.isOut && (
                          <span className="text-emerald-400 font-black">*</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {!batter.isOut ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          not out
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          {batter.dismissal || 'out'}
                        </span>
                      )}
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
                ))}

              {/* Extras Row */}
              <tr className="bg-slate-900/40 text-slate-300 border-t border-slate-700/60 font-semibold">
                <td className="py-2.5 px-4 font-bold">Extras</td>
                <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                  (b {innings.extras?.byes || 0}, lb {innings.extras?.legByes || 0}, w {innings.extras?.wides || 0}, nb {innings.extras?.noBalls || 0})
                </td>
                <td className="py-2.5 px-3 text-right font-black text-white">
                  {innings.extras?.totalExtras || 0}
                </td>
                <td colSpan="4"></td>
              </tr>

              {/* Total Row */}
              <tr className="bg-slate-900/80 text-white font-extrabold border-t border-slate-700">
                <td className="py-3 px-4 text-sm">TOTAL</td>
                <td className="py-3 px-3 text-slate-400 text-xs">
                  ({innings.totalOvers?.toFixed(1) || '0.0'} Ov, RR: {(innings.legalBalls > 0 ? (innings.totalRuns / (innings.legalBalls / 6)).toFixed(2) : '0.00')})
                </td>
                <td className="py-3 px-3 text-right text-base text-amber-400">
                  {innings.totalRuns}/{innings.totalWickets}
                </td>
                <td colSpan="4"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Did Not Bat */}
        {didNotBat.length > 0 && (
          <div className="px-4 py-3 bg-slate-900/60 border-t border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold mr-2">Did not bat:</span>
            <span className="text-slate-300">
              {didNotBat.map(p => p.name).join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Fall of Wickets (FOW) */}
      {innings.fallOfWickets && innings.fallOfWickets.length > 0 && (
        <div className="bg-[#121829] border border-crex-border rounded-xl p-4 shadow-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            Fall of Wickets
          </h3>
          <div className="flex flex-wrap gap-2">
            {innings.fallOfWickets.map((fow) => (
              <span
                key={fow.wicketNumber}
                className="inline-flex items-center px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs"
              >
                <span className="font-extrabold text-red-400 mr-1.5">
                  {fow.score}-{fow.wicketNumber}
                </span>
                <span className="text-slate-300 mr-1.5">{fow.batsmanName}</span>
                <span className="text-slate-500 text-[10px]">({fow.overs?.toFixed(1) || fow.overs} ov)</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bowling Card */}
      <div className="bg-[#121829] border border-crex-border rounded-xl overflow-hidden shadow-md">
        <div className="px-4 py-3 bg-slate-900/80 border-b border-crex-border flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Bowling
          </h3>
          <span className="text-[11px] text-slate-400">O • M • R • W • ECON • Wd • NB</span>
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
                <th className="py-2.5 px-3 text-right">ECON</th>
                <th className="py-2.5 px-3 text-right">WD</th>
                <th className="py-2.5 px-4 text-right">NB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {innings.bowlers
                .filter(b => b.legalBalls > 0 || b.overs > 0 || b.isCurrentBowler)
                .map((bowler) => (
                  <tr
                    key={bowler.playerId}
                    className={`hover:bg-slate-800/20 transition-colors ${
                      bowler.isCurrentBowler ? 'bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-100">
                      <div className="flex items-center space-x-1.5">
                        <span>{bowler.name}</span>
                        {bowler.isCurrentBowler && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                            BOWLING
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-200">
                      {bowler.overs?.toFixed(1) || '0.0'}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {bowler.maidens || 0}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-sm text-white">
                      {bowler.runsConceded || 0}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-sm text-red-400">
                      {bowler.wickets || 0}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-300">
                      {bowler.economy?.toFixed(2) || '0.00'}
                    </td>
                    <td className="py-3 px-3 text-right text-amber-400">
                      {bowler.wides || 0}
                    </td>
                    <td className="py-3 px-4 text-right text-purple-400">
                      {bowler.noBalls || 0}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
