import React from 'react';
import { Shield, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export default function MatchInfoTab({ match }) {
  return (
    <div className="space-y-6">
      {/* Match Details */}
      <div className="bg-[#121829] border border-crex-border rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-crex-border pb-2.5">
          Match Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Series / Tournament</span>
            <span className="font-bold text-white text-sm">{match.title}</span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Match Type & Overs</span>
            <span className="font-bold text-white text-sm">{match.matchType} ({match.totalOvers} Overs per side)</span>
          </div>

          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block mb-0.5">Venue</span>
              <span className="font-bold text-white">{match.venue || 'Stadium'}</span>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 block mb-0.5">Date & Time</span>
              <span className="font-bold text-white">
                {match.date ? new Date(match.date).toLocaleString() : 'Today'}
              </span>
            </div>
          </div>

          <div className="md:col-span-2 p-3 rounded-lg bg-blue-950/20 border border-blue-500/20">
            <span className="text-blue-400 font-bold block mb-1">Toss Result</span>
            <span className="text-slate-200 font-semibold">{match.statusNote}</span>
          </div>

          <div className="md:col-span-2 p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-amber-400 font-bold block">Scoring Rule Configuration</span>
              <p className="text-slate-300 text-[11px] mt-0.5">
                {match.scoringRule?.customWideNoBall
                  ? 'Custom Wide & No Ball Rule Active: Wide and No Ball deliveries are logged in the over breakdown without penalty runs (+0). Only runs scored off the bat or ran by batsmen are added to the total score.'
                  : 'Standard Cricket Extras Rule: 1 penalty run automatically awarded per Wide and No Ball.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Playing XIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Team 1 Squad */}
        <div className="bg-[#121829] border border-crex-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-crex-border pb-3 mb-3">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: match.team1?.color || '#1e40af' }}></span>
            <h4 className="text-sm font-extrabold text-white">
              {match.team1?.name} Playing XI
            </h4>
          </div>

          <div className="space-y-2">
            {match.team1?.players?.map((p, idx) => (
              <div
                key={p.id || idx}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-4 text-slate-500 font-bold text-[10px]">{idx + 1}</span>
                  <span className="font-semibold text-slate-200">{p.name}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {p.isCaptain && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-400 font-black text-[9px] border border-blue-500/30">
                      (C)
                    </span>
                  )}
                  {p.isWicketKeeper && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-600/30 text-amber-400 font-black text-[9px] border border-amber-500/30">
                      (WK)
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 capitalize">
                    {p.role?.replace('_', ' ') || 'Player'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team 2 Squad */}
        <div className="bg-[#121829] border border-crex-border rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 border-b border-crex-border pb-3 mb-3">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: match.team2?.color || '#eab308' }}></span>
            <h4 className="text-sm font-extrabold text-white">
              {match.team2?.name} Playing XI
            </h4>
          </div>

          <div className="space-y-2">
            {match.team2?.players?.map((p, idx) => (
              <div
                key={p.id || idx}
                className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-4 text-slate-500 font-bold text-[10px]">{idx + 1}</span>
                  <span className="font-semibold text-slate-200">{p.name}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  {p.isCaptain && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-400 font-black text-[9px] border border-blue-500/30">
                      (C)
                    </span>
                  )}
                  {p.isWicketKeeper && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-600/30 text-amber-400 font-black text-[9px] border border-amber-500/30">
                      (WK)
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 capitalize">
                    {p.role?.replace('_', ' ') || 'Player'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
