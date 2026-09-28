import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import RecentOversStrip from '../components/RecentOversStrip';
import { Shield, ArrowLeft, RefreshCw, Zap, CheckCircle2, AlertCircle, ArrowLeftRight, Trophy } from 'lucide-react';

export default function AdminScoringConsolePage() {
  const { id } = useParams();
  const { socket, joinMatch, leaveMatch } = useSocket();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);

  // Crease selections
  const [selectedStrikerId, setSelectedStrikerId] = useState('');
  const [selectedNonStrikerId, setSelectedNonStrikerId] = useState('');
  const [selectedBowlerId, setSelectedBowlerId] = useState('');

  // Commentary
  const [customCommentary, setCustomCommentary] = useState('');

  // Wicket modal state
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [dismissalType, setDismissalType] = useState('bowled');
  const [fielderName, setFielderName] = useState('');
  const [outBatsmanId, setOutBatsmanId] = useState('');
  const [newBatsmanId, setNewBatsmanId] = useState('');

  // Custom Extra runs selector (for No-Ball bat runs or Wide runs)
  const [extraBatRuns, setExtraBatRuns] = useState(0);

  // Fetch match details
  const fetchMatch = async () => {
    try {
      const res = await api.get(`/matches/${id}`);
      if (res.data?.success) {
        const m = res.data.match;
        setMatch(m);

        // Pre-select active striker, non-striker, bowler
        const currInnings = m.innings?.[m.currentInningsIndex || 0];
        if (currInnings) {
          const striker = currInnings.batsmen.find(b => b.isCurrentStriker && !b.isOut) ||
                          currInnings.batsmen.find(b => !b.isOut);
          const nonStriker = currInnings.batsmen.find(b => b.isCurrentNonStriker && !b.isOut) ||
                             currInnings.batsmen.filter(b => !b.isOut && b.playerId !== striker?.playerId)[0];
          const bowler = currInnings.bowlers.find(b => b.isCurrentBowler) || currInnings.bowlers[0];

          if (striker) setSelectedStrikerId(striker.playerId);
          if (nonStriker) setSelectedNonStrikerId(nonStriker.playerId);
          if (bowler) setSelectedBowlerId(bowler.playerId);
        }
      }
    } catch (err) {
      console.error('Error fetching match:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
    joinMatch(id);

    return () => {
      leaveMatch(id);
    };
  }, [id]);

  // Listen for socket match updates
  useEffect(() => {
    if (!socket) return;

    socket.on('match_updated', (updatedMatch) => {
      if (updatedMatch._id === id || updatedMatch.id === id) {
        setMatch(updatedMatch);
      }
    });

    return () => {
      socket.off('match_updated');
    };
  }, [socket, id]);

  const handleApplyCrease = async () => {
    try {
      await api.post(`/matches/${id}/set-crease`, {
        strikerId: selectedStrikerId,
        nonStrikerId: selectedNonStrikerId,
        bowlerId: selectedBowlerId
      });
      fetchMatch();
    } catch (err) {
      alert('Error setting crease players: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSwapStrike = async () => {
    const temp = selectedStrikerId;
    setSelectedStrikerId(selectedNonStrikerId);
    setSelectedNonStrikerId(temp);

    try {
      await api.post(`/matches/${id}/set-crease`, {
        strikerId: selectedNonStrikerId,
        nonStrikerId: temp,
        bowlerId: selectedBowlerId
      });
      fetchMatch();
    } catch (err) {
      console.error(err);
    }
  };

  // Record a Ball
  const handleScoreBall = async (ballConfig) => {
    if (scoring) return;
    setScoring(true);

    try {
      const payload = {
        strikerId: selectedStrikerId,
        nonStrikerId: selectedNonStrikerId,
        bowlerId: selectedBowlerId,
        customCommentary,
        ...ballConfig
      };

      const res = await api.post(`/matches/${id}/score-ball`, payload);
      if (res.data?.success) {
        setCustomCommentary('');
        setShowWicketModal(false);
        setExtraBatRuns(0);

        // Check if over was completed
        if (res.data.isOverCompleted) {
          // Alert admin to pick new bowler
          const updatedMatch = res.data.match;
          const currInn = updatedMatch.innings[updatedMatch.currentInningsIndex || 0];
          // Suggest another bowler
          const otherBowler = currInn.bowlers.find(b => b.playerId !== selectedBowlerId);
          if (otherBowler) setSelectedBowlerId(otherBowler.playerId);
        }

        fetchMatch();
      } else {
        alert('Error: ' + res.data?.message);
      }
    } catch (err) {
      alert('Error recording ball: ' + (err.response?.data?.message || err.message));
    } finally {
      setScoring(false);
    }
  };

  // Submit Wicket
  const handleConfirmWicket = () => {
    handleScoreBall({
      runs: 0,
      isWicket: true,
      wicketDetail: {
        dismissalType,
        fielderName,
        outBatsmanId: outBatsmanId || selectedStrikerId,
        newBatsmanId
      }
    });

    if (newBatsmanId) {
      if ((outBatsmanId || selectedStrikerId) === selectedStrikerId) {
        setSelectedStrikerId(newBatsmanId);
      } else {
        setSelectedNonStrikerId(newBatsmanId);
      }
    }
  };

  const handleStartSecondInnings = async () => {
    if (!window.confirm('Start 2nd Innings now?')) return;
    try {
      await api.post(`/matches/${id}/start-second-innings`, {});
      fetchMatch();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEndMatch = async () => {
    const note = window.prompt('Enter final match result note:', match?.statusNote);
    if (note === null) return;
    try {
      await api.post(`/matches/${id}/end-match`, { resultNote: note });
      fetchMatch();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-slate-400 text-xs font-semibold">Loading Scorer Console...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] p-8 text-center text-white">
        Match not found.
      </div>
    );
  }

  const currentInnings = match.innings?.[match.currentInningsIndex || 0];
  const battingTeamKey = currentInnings?.battingTeam || 'team1';
  const bowlingTeamKey = currentInnings?.bowlingTeam || 'team2';

  const battingTeam = battingTeamKey === 'team1' ? match.team1 : match.team2;
  const bowlingTeam = bowlingTeamKey === 'team1' ? match.team1 : match.team2;

  const currentStrikerObj = currentInnings?.batsmen.find(b => b.playerId === selectedStrikerId);
  const currentNonStrikerObj = currentInnings?.batsmen.find(b => b.playerId === selectedNonStrikerId);
  const currentBowlerObj = currentInnings?.bowlers.find(b => b.playerId === selectedBowlerId);

  const availableBatters = currentInnings?.batsmen.filter(b => !b.isOut) || [];
  const yetToBatBatters = currentInnings?.batsmen.filter(b => !b.isOut && b.playerId !== selectedStrikerId && b.playerId !== selectedNonStrikerId) || [];

  return (
    <div className="min-h-screen bg-[#0a0e1a] pb-24 text-slate-100">
      {/* Top Header */}
      <div className="bg-[#0e1424] border-b border-crex-border py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link to="/admin" className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-400 font-extrabold text-[10px] border border-emerald-500/30 uppercase">
                  Live Scorer Engine
                </span>
                <span className="text-xs text-slate-400">{match.title}</span>
              </div>
              <h1 className="text-lg font-black text-white mt-0.5">
                {match.team1.shortName} vs {match.team2.shortName} ({match.status.toUpperCase()})
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={`/match/${match._id}`}
              target="_blank"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow transition"
            >
              Preview Public Match Page ↗
            </Link>
            <button
              onClick={fetchMatch}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Score & Innings Summary Bar */}
        <div className="bg-[#121829] border border-crex-border rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-base shadow-md"
              style={{ backgroundColor: battingTeam.color || '#1e40af' }}
            >
              {battingTeam.shortName}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">
                {battingTeam.name} Innings ({match.currentInningsIndex === 1 ? '2nd Innings' : '1st Innings'})
              </span>
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-black text-white">
                  {currentInnings?.totalRuns || 0}/{currentInnings?.totalWickets || 0}
                </span>
                <span className="text-sm font-semibold text-slate-400">
                  Overs: <strong className="text-white">{currentInnings?.totalOvers?.toFixed(1) || '0.0'}</strong> / {match.totalOvers}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Innings Controls */}
          <div className="flex items-center space-x-2">
            {match.currentInningsIndex === 0 && (
              <button
                onClick={handleStartSecondInnings}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
              >
                Start 2nd Innings →
              </button>
            )}
            <button
              onClick={handleEndMatch}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
            >
              End Match / Result
            </button>
          </div>
        </div>

        {/* Custom Rule Notification */}
        {match.scoringRule?.customWideNoBall && (
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-bold text-amber-300">
                Custom Rule Active: Wide (Wd) and No Ball (Nb) are recorded in overs, but 0 penalty run is added to total score. Only runs hit/ran are added.
              </span>
            </div>
          </div>
        )}

        {/* CREASE ASSIGNMENT SECTION (Striker, Non-Striker, Bowler) */}
        <div className="bg-[#121829] border border-crex-border rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Active Crease Players
            </h2>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleSwapStrike}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-slate-700 transition"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Swap Strike Ends</span>
              </button>
              <button
                type="button"
                onClick={handleApplyCrease}
                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition"
              >
                Apply Crease
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Striker */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-blue-500/30">
              <label className="block text-[11px] font-bold uppercase text-amber-400 mb-1 flex items-center justify-between">
                <span>* Striker (Facing)</span>
                {currentStrikerObj && (
                  <span className="text-white font-mono">{currentStrikerObj.runs} ({currentStrikerObj.balls})</span>
                )}
              </label>
              <select
                value={selectedStrikerId}
                onChange={(e) => setSelectedStrikerId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
              >
                {availableBatters.map((b) => (
                  <option key={b.playerId} value={b.playerId}>
                    {b.name} ({b.runs}r, {b.balls}b)
                  </option>
                ))}
              </select>
            </div>

            {/* Non-Striker */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1 flex items-center justify-between">
                <span>Non-Striker (Runner)</span>
                {currentNonStrikerObj && (
                  <span className="text-white font-mono">{currentNonStrikerObj.runs} ({currentNonStrikerObj.balls})</span>
                )}
              </label>
              <select
                value={selectedNonStrikerId}
                onChange={(e) => setSelectedNonStrikerId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
              >
                {availableBatters.map((b) => (
                  <option key={b.playerId} value={b.playerId}>
                    {b.name} ({b.runs}r, {b.balls}b)
                  </option>
                ))}
              </select>
            </div>

            {/* Bowler */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-amber-500/30">
              <label className="block text-[11px] font-bold uppercase text-amber-400 mb-1 flex items-center justify-between">
                <span>Active Bowler</span>
                {currentBowlerObj && (
                  <span className="text-white font-mono">{currentBowlerObj.wickets}/{currentBowlerObj.runsConceded} ({currentBowlerObj.overs} ov)</span>
                )}
              </label>
              <select
                value={selectedBowlerId}
                onChange={(e) => setSelectedBowlerId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold"
              >
                {currentInnings?.bowlers.map((b) => (
                  <option key={b.playerId} value={b.playerId}>
                    {b.name} ({b.wickets}w - {b.runsConceded}r - {b.overs}ov)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* BALL ACTION PAD (Core Scoring Engine) */}
        <div className="bg-[#121829] border border-crex-border rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Live Ball Action Controls
              </h2>
              <p className="text-xs text-slate-400">
                Click any button to immediately broadcast the delivery to all live viewers
              </p>
            </div>

            {scoring && (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs border border-amber-500/30 animate-pulse">
                Recording delivery...
              </span>
            )}
          </div>

          {/* Standard Bat Runs Row */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Standard Deliveries (Runs off bat)
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[
                { label: '0 (Dot)', runs: 0, bg: 'bg-slate-800 hover:bg-slate-700 text-slate-300' },
                { label: '1 Run', runs: 1, bg: 'bg-slate-800 hover:bg-slate-700 text-white' },
                { label: '2 Runs', runs: 2, bg: 'bg-slate-800 hover:bg-slate-700 text-white' },
                { label: '3 Runs', runs: 3, bg: 'bg-slate-800 hover:bg-slate-700 text-white' },
                { label: '4 (FOUR)', runs: 4, bg: 'bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/30' },
                { label: '6 (SIX)', runs: 6, bg: 'bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-lg shadow-emerald-600/30' },
              ].map((btn) => (
                <button
                  key={btn.label}
                  disabled={scoring}
                  onClick={() => handleScoreBall({ runs: btn.runs })}
                  className={`py-3.5 px-2 rounded-xl text-center font-bold text-sm transition-transform active:scale-95 border border-slate-700/60 ${btn.bg}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Extras and Custom Wide / No-Ball Row */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-2">
              Extras & Custom Wide / No-Ball (0 Penalty Runs under Custom Rule)
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Wide (0 runs) */}
              <button
                disabled={scoring}
                onClick={() => handleScoreBall({ runs: 0, isWide: true })}
                className="py-3 px-3 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/50 text-xs font-black transition"
              >
                Wide (Wd) (+0 Runs)
              </button>

              {/* Wide with ran runs */}
              <button
                disabled={scoring}
                onClick={() => {
                  const runs = prompt('How many runs ran by batsmen on Wide?', '1');
                  if (runs !== null) {
                    handleScoreBall({ runs: Number(runs) || 0, isWide: true });
                  }
                }}
                className="py-3 px-3 rounded-xl bg-amber-700/20 hover:bg-amber-700/40 text-amber-300 border border-amber-600/50 text-xs font-bold transition"
              >
                Wide + Ran Runs...
              </button>

              {/* No Ball (0 runs) */}
              <button
                disabled={scoring}
                onClick={() => handleScoreBall({ runs: 0, isNoBall: true })}
                className="py-3 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/50 text-xs font-black transition"
              >
                No Ball (Nb) (+0 Runs)
              </button>

              {/* No Ball with Bat Runs */}
              <button
                disabled={scoring}
                onClick={() => {
                  const runs = prompt('Runs hit off bat on No Ball? (e.g. 1, 4, 6)', '4');
                  if (runs !== null) {
                    handleScoreBall({ runs: Number(runs) || 0, isNoBall: true });
                  }
                }}
                className="py-3 px-3 rounded-xl bg-purple-700/20 hover:bg-purple-700/40 text-purple-300 border border-purple-600/50 text-xs font-bold transition"
              >
                No Ball + Bat Runs...
              </button>
            </div>
          </div>

          {/* Leg Bye & Bye */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              disabled={scoring}
              onClick={() => {
                const runs = prompt('Leg Bye runs (1, 2, 4)?', '1');
                if (runs !== null) handleScoreBall({ runs: Number(runs) || 1, isLegBye: true });
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
            >
              Leg Bye (LB)...
            </button>

            <button
              disabled={scoring}
              onClick={() => {
                const runs = prompt('Bye runs (1, 2, 4)?', '1');
                if (runs !== null) handleScoreBall({ runs: Number(runs) || 1, isBye: true });
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
            >
              Bye (B)...
            </button>

            {/* WICKET BUTTON (Large Red) */}
            <button
              disabled={scoring}
              onClick={() => {
                setOutBatsmanId(selectedStrikerId);
                setShowWicketModal(true);
              }}
              className="col-span-2 sm:col-span-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm shadow-lg shadow-red-600/30 transition active:scale-95"
            >
              ⚡ WICKET (OUT)
            </button>
          </div>

          {/* Commentary Note Bar */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Custom Commentary Description (Optional)
            </label>
            <input
              type="text"
              value={customCommentary}
              onChange={(e) => setCustomCommentary(e.target.value)}
              placeholder="e.g. Smashed through cover point with pure timing!"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Live Recent Overs Component Preview */}
        {currentInnings && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Live Recent Overs Strip
            </h3>
            <RecentOversStrip overs={currentInnings.overs || []} />
          </div>
        )}
      </main>

      {/* WICKET DISMISSAL MODAL */}
      {showWicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#121829] border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center space-x-2 text-red-500 mb-3">
              <Zap className="w-5 h-5 fill-current" />
              <h3 className="text-base font-black text-white">Record Wicket Dismissal</h3>
            </div>

            <div className="space-y-4 text-xs">
              {/* Dismissed Batsman */}
              <div>
                <label className="block font-bold uppercase text-slate-400 mb-1">
                  Out Batsman
                </label>
                <select
                  value={outBatsmanId}
                  onChange={(e) => setOutBatsmanId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value={selectedStrikerId}>Striker: {currentStrikerObj?.name}</option>
                  <option value={selectedNonStrikerId}>Non-Striker: {currentNonStrikerObj?.name}</option>
                </select>
              </div>

              {/* Dismissal Type */}
              <div>
                <label className="block font-bold uppercase text-slate-400 mb-1">
                  Dismissal Type
                </label>
                <select
                  value={dismissalType}
                  onChange={(e) => setDismissalType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="bowled">Bowled</option>
                  <option value="caught">Caught</option>
                  <option value="lbw">LBW</option>
                  <option value="run_out">Run Out</option>
                  <option value="stumped">Stumped</option>
                  <option value="hit_wicket">Hit Wicket</option>
                </select>
              </div>

              {/* Fielder involved */}
              {(dismissalType === 'caught' || dismissalType === 'run_out' || dismissalType === 'stumped') && (
                <div>
                  <label className="block font-bold uppercase text-slate-400 mb-1">
                    Fielder Involved
                  </label>
                  <input
                    type="text"
                    value={fielderName}
                    onChange={(e) => setFielderName(e.target.value)}
                    placeholder="Enter fielder's name"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              )}

              {/* Next incoming batsman */}
              <div>
                <label className="block font-bold uppercase text-slate-400 mb-1">
                  Next Incoming Batsman
                </label>
                <select
                  value={newBatsmanId}
                  onChange={(e) => setNewBatsmanId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
                >
                  <option value="">-- Select New Batsman --</option>
                  {yetToBatBatters.map((b) => (
                    <option key={b.playerId} value={b.playerId}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowWicketModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmWicket}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black shadow-lg shadow-red-600/30 transition"
                >
                  Confirm Wicket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
