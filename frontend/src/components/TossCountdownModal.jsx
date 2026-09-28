import React, { useState, useEffect } from 'react';
import { Timer, PlayCircle, Radio } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function TossCountdownModal({ match, onMatchStarted }) {
  const { isAuthenticated } = useAuth();
  const [timeLeft, setTimeLeft] = useState(60);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!match || match.status !== 'toss_done') return;

    const liveAtTime = match.toss?.liveAt ? new Date(match.toss.liveAt).getTime() : Date.now() + 60000;

    const interval = setInterval(() => {
      const now = Date.now();
      const diffSecs = Math.max(0, Math.floor((liveAtTime - now) / 1000));
      setTimeLeft(diffSecs);

      // Auto start when countdown expires
      if (diffSecs <= 0) {
        clearInterval(interval);
        // The server starts the match by itself; an admin browser just nudges it too.
        if (isAuthenticated) handleTriggerLive();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [match?.toss?.liveAt, match?.status]);

  const handleTriggerLive = async () => {
    if (starting) return;
    setStarting(true);
    try {
      // First two batsmen as openers
      const currentInnings = match.innings?.[0];
      const strikerId = currentInnings?.batsmen?.[0]?.playerId;
      const nonStrikerId = currentInnings?.batsmen?.[1]?.playerId;
      const bowlerId = currentInnings?.bowlers?.[0]?.playerId;

      await api.post(`/matches/${match._id}/start-live`, {
        strikerId,
        nonStrikerId,
        bowlerId
      });
      if (onMatchStarted) onMatchStarted();
    } catch (err) {
      console.error('Error starting live match:', err);
    } finally {
      setStarting(false);
    }
  };

  if (match.status !== 'toss_done') return null;

  return (
    <div className="bg-gradient-to-r from-blue-900/60 via-indigo-950/80 to-purple-900/60 border border-blue-500/40 rounded-2xl p-5 shadow-2xl my-4 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0">
            <Radio className="w-7 h-7 text-red-500 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                TOSS COMPLETED
              </span>
              <span className="text-xs text-slate-300">
                {match.statusNote}
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1">
              Match starting in <span className="text-blue-400 font-mono text-xl">{timeLeft}s</span>
            </h3>
            <p className="text-xs text-slate-400">
              Live score broadcast will activate automatically when timer expires.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isAuthenticated && (
            <button
              onClick={handleTriggerLive}
              disabled={starting}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-transform active:scale-95"
            >
              <PlayCircle className="w-4 h-4" />
              <span>{starting ? 'Activating Live...' : 'Start Match Now (Admin)'}</span>
            </button>
          )}

          <div className="w-12 h-12 rounded-full border-4 border-blue-500/30 border-t-blue-500 flex items-center justify-center animate-spin">
            <span className="text-xs font-black text-white -rotate-90">
              {timeLeft}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
