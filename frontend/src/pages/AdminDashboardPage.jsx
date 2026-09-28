import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Shield, Plus, Play, Trash2, Trophy, Coins, Radio } from 'lucide-react';

export default function AdminDashboardPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tossModalMatch, setTossModalMatch] = useState(null);
  const [tossWinner, setTossWinner] = useState('team1');
  const [tossDecision, setTossDecision] = useState('bat');
  const [submittingToss, setSubmittingToss] = useState(false);

  const fetchMatches = async () => {
    try {
      const res = await api.get('/matches');
      if (res.data?.success) {
        setMatches(res.data.matches || []);
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleDeleteMatch = async (id) => {
    if (!window.confirm('Are you sure you want to delete this match?')) return;
    try {
      await api.delete(`/matches/${id}`);
      setMatches(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      alert('Error deleting match: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleConductToss = async (e) => {
    e.preventDefault();
    if (!tossModalMatch) return;
    setSubmittingToss(true);

    try {
      const res = await api.post(`/matches/${tossModalMatch._id}/toss`, {
        winner: tossWinner,
        decision: tossDecision
      });
      if (res.data?.success) {
        setTossModalMatch(null);
        fetchMatches();
      }
    } catch (err) {
      alert('Error conducting toss: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingToss(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] pb-20">
      <div className="bg-[#0e1424] border-b border-crex-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-500" />
              <h1 className="text-xl font-black text-white">CREX Admin Control Panel</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Create matches, manually enter ball-by-ball score, conduct toss, and configure live feeds
            </p>
          </div>

          <Link
            to="/admin/matches/create"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Match</span>
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            All Matches ({matches.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-slate-400 text-xs">Loading matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="py-16 text-center bg-[#121829] border border-crex-border rounded-2xl p-8 max-w-lg mx-auto">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Matches Created Yet</h3>
            <p className="text-xs text-slate-400 mb-5">
              Click below to create your first match with custom teams and squad players.
            </p>
            <Link
              to="/admin/matches/create"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Match</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((m) => {
              const isLive = m.status === 'live' || m.status === 'toss_done' || m.status === 'innings_break';
              const inn1 = m.innings?.[0];
              const inn2 = m.innings?.[1];

              return (
                <div
                  key={m._id}
                  className="bg-[#121829] border border-crex-border rounded-2xl p-5 shadow-lg flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs mb-3">
                      <span className="font-extrabold text-blue-400 uppercase tracking-wider truncate max-w-[180px]">
                        {m.matchType} • {m.title}
                      </span>
                      {isLive ? (
                        <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 font-extrabold text-[10px] border border-red-500/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                          <span>{m.status.toUpperCase()}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] uppercase">
                          {m.status}
                        </span>
                      )}
                    </div>

                    {/* Teams */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.team1.color }}></span>
                          <span>{m.team1.name}</span>
                        </span>
                        <span className="font-mono text-slate-300">
                          {inn1 ? `${inn1.totalRuns}/${inn1.totalWickets} (${inn1.totalOvers?.toFixed(1) || '0.0'})` : '-'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.team2.color }}></span>
                          <span>{m.team2.name}</span>
                        </span>
                        <span className="font-mono text-slate-300">
                          {inn2 ? `${inn2.totalRuns}/${inn2.totalWickets} (${inn2.totalOvers?.toFixed(1) || '0.0'})` : '-'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-amber-400 font-medium mb-4 line-clamp-1">
                      {m.statusNote}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    {/* Live Scorer Console Link */}
                    <Link
                      to={`/admin/scoring/${m._id}`}
                      className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-700/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Live Scorer</span>
                    </Link>

                    {/* Conduct Toss Button (if scheduled) */}
                    {m.status === 'scheduled' && (
                      <button
                        onClick={() => {
                          setTossModalMatch(m);
                          setTossWinner('team1');
                          setTossDecision('bat');
                        }}
                        className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition"
                        title="Conduct Toss (1-min live countdown)"
                      >
                        <Coins className="w-3.5 h-3.5 inline mr-1" />
                        <span>Toss</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteMatch(m._id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 border border-slate-700 transition"
                      title="Delete Match"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Conduct Toss Modal */}
      {tossModalMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#121829] border border-crex-border rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <Coins className="w-6 h-6 text-amber-400" />
              <h3 className="text-base font-black text-white">
                Conduct Toss for {tossModalMatch.team1.shortName} vs {tossModalMatch.team2.shortName}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Once conducted, a 1-minute live countdown timer will activate, and the match will transition to LIVE.
            </p>

            <form onSubmit={handleConductToss} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  Toss Winner
                </label>
                <select
                  value={tossWinner}
                  onChange={(e) => setTossWinner(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="team1">{tossModalMatch.team1.name}</option>
                  <option value="team2">{tossModalMatch.team2.name}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  Decision
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTossDecision('bat')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      tossDecision === 'bat'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    Elected to Bat
                  </button>
                  <button
                    type="button"
                    onClick={() => setTossDecision('bowl')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      tossDecision === 'bowl'
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}
                  >
                    Elected to Bowl
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setTossModalMatch(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingToss}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition"
                >
                  {submittingToss ? 'Saving...' : 'Confirm Toss'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
