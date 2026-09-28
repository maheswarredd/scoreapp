import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import BallAnimationOverlay from '../components/BallAnimationOverlay';
import RecentOversStrip from '../components/RecentOversStrip';
import LiveScorecard from '../components/LiveScorecard';
import FullScorecardTab from '../components/FullScorecardTab';
import OversTab from '../components/OversTab';
import CommentaryTab from '../components/CommentaryTab';
import MatchInfoTab from '../components/MatchInfoTab';
import TossCountdownModal from '../components/TossCountdownModal';
import { ArrowLeft, Shield, Radio, Activity, RefreshCw } from 'lucide-react';

export default function MatchDetailPage() {
  const { id } = useParams();
  const { socket, joinMatch, leaveMatch } = useSocket();
  const { isAuthenticated } = useAuth();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live');
  const [liveEvent, setLiveEvent] = useState(null);

  const fetchMatchDetails = async () => {
    try {
      const res = await api.get(`/matches/${id}`);
      if (res.data?.success) {
        setMatch(res.data.match);
      }
    } catch (err) {
      console.error('Error fetching match:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchDetails();
    joinMatch(id);

    return () => {
      leaveMatch(id);
    };
  }, [id]);

  // Real-time updates via Socket.io
  useEffect(() => {
    if (!socket) return;

    socket.on('match_updated', (updatedMatch) => {
      if (updatedMatch._id === id || updatedMatch.id === id) {
        setMatch(updatedMatch);
      }
    });

    socket.on('live_event', (eventData) => {
      setLiveEvent(eventData);
    });

    return () => {
      socket.off('match_updated');
      socket.off('live_event');
    };
  }, [socket, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm font-semibold">Connecting to CREX Live Feed...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] p-8 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Match Not Found</h2>
        <Link to="/" className="text-blue-400 hover:underline text-sm font-bold">
          ← Back to Live Matches
        </Link>
      </div>
    );
  }

  const currentInnings = match.innings?.[match.currentInningsIndex || 0] || match.innings?.[0];
  const isLive = match.status === 'live' || match.status === 'toss_done' || match.status === 'innings_break';

  const team1Innings = match.innings?.find(i => i.battingTeam === 'team1');
  const team2Innings = match.innings?.find(i => i.battingTeam === 'team2');

  const battingTeamKey = currentInnings?.battingTeam || 'team1';
  const battingTeamObj = battingTeamKey === 'team1' ? match.team1 : match.team2;
  const bowlingTeamObj = battingTeamKey === 'team1' ? match.team2 : match.team1;

  // Run rates
  const currentRR = (currentInnings?.legalBalls > 0)
    ? (currentInnings.totalRuns / (currentInnings.legalBalls / 6)).toFixed(2)
    : '0.00';

  let requiredRR = null;
  if (match.currentInningsIndex === 1 && match.innings?.[0]) {
    const target = match.innings[0].totalRuns + 1;
    const runsNeeded = target - currentInnings.totalRuns;
    const totalBallsMatch = (match.totalOvers || 20) * 6;
    const ballsRemaining = Math.max(0, totalBallsMatch - currentInnings.legalBalls);
    if (ballsRemaining > 0 && runsNeeded > 0) {
      requiredRR = ((runsNeeded / ballsRemaining) * 6).toFixed(2);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] pb-20">
      {/* Live Ball Animation Banner (Four, Six, Wicket, No-Ball, Wide) */}
      <BallAnimationOverlay liveEvent={liveEvent || match.liveEvent} />

      {/* Top Header / Back Navigation */}
      <div className="bg-[#0e1424] border-b border-crex-border py-3">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center space-x-2 text-xs font-bold text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Matches</span>
          </Link>

          <div className="flex items-center space-x-2">
            {isAuthenticated && (
              <Link
                to={`/admin/scoring/${match._id}`}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Open Admin Scorer Console</span>
              </Link>
            )}

            <button
              onClick={fetchMatchDetails}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition"
              title="Refresh match data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-5 space-y-5">
        {/* HERO LIVE MATCH HEADER */}
        <div className="bg-gradient-to-br from-[#121829] via-[#161f36] to-[#0e1424] border border-crex-border rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          {/* Background Cricket Accent */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Format & Live Status Pill */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs">
            <span className="font-extrabold text-blue-400 uppercase tracking-widest text-[11px]">
              {match.title} • {match.venue}
            </span>

            {isLive ? (
              <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-600/20 text-red-400 font-black text-xs border border-red-500/40">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                <span>LIVE</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-bold text-xs">
                {match.status === 'completed' ? 'Completed' : 'Scheduled'}
              </span>
            )}
          </div>

          {/* Teams and Big Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Team 1 Box */}
            <div className={`p-4 rounded-xl border transition-all ${
              battingTeamKey === 'team1' && isLive
                ? 'bg-blue-950/20 border-blue-500/40 shadow-lg shadow-blue-500/5'
                : 'bg-slate-900/50 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base text-white shadow-md ring-2 ring-white/10"
                    style={{ backgroundColor: match.team1.color || '#1e40af' }}
                  >
                    {match.team1.shortName?.slice(0, 3) || 'T1'}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center">
                      {match.team1.name}
                      {battingTeamKey === 'team1' && isLive && (
                        <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-blue-500 text-white font-extrabold uppercase">
                          Batting
                        </span>
                      )}
                    </h2>
                    <span className="text-xs text-slate-400">{match.team1.shortName}</span>
                  </div>
                </div>

                <div className="text-right">
                  {team1Innings ? (
                    <div>
                      <span className="text-2xl md:text-3xl font-black text-white">
                        {team1Innings.totalRuns}/{team1Innings.totalWickets}
                      </span>
                      <span className="text-xs text-slate-400 block font-semibold">
                        ({team1Innings.totalOvers?.toFixed(1) || '0.0'} / {match.totalOvers} ov)
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-semibold">Yet to bat</span>
                  )}
                </div>
              </div>
            </div>

            {/* Team 2 Box */}
            <div className={`p-4 rounded-xl border transition-all ${
              battingTeamKey === 'team2' && isLive
                ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/5'
                : 'bg-slate-900/50 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base text-white shadow-md ring-2 ring-white/10"
                    style={{ backgroundColor: match.team2.color || '#eab308' }}
                  >
                    {match.team2.shortName?.slice(0, 3) || 'T2'}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center">
                      {match.team2.name}
                      {battingTeamKey === 'team2' && isLive && (
                        <span className="ml-2 px-2 py-0.5 rounded text-[10px] bg-amber-500 text-slate-950 font-extrabold uppercase">
                          Batting
                        </span>
                      )}
                    </h2>
                    <span className="text-xs text-slate-400">{match.team2.shortName}</span>
                  </div>
                </div>

                <div className="text-right">
                  {team2Innings ? (
                    <div>
                      <span className="text-2xl md:text-3xl font-black text-white">
                        {team2Innings.totalRuns}/{team2Innings.totalWickets}
                      </span>
                      <span className="text-xs text-slate-400 block font-semibold">
                        ({team2Innings.totalOvers?.toFixed(1) || '0.0'} / {match.totalOvers} ov)
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 font-semibold">Yet to bat</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Match Status & Run Rates bar */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="font-bold text-amber-400">
                {match.statusNote}
              </span>
            </div>

            {currentInnings && (
              <div className="flex items-center space-x-4 text-slate-300 font-semibold">
                <div>
                  <span className="text-slate-400 mr-1.5 font-normal">CRR:</span>
                  <span className="text-white font-bold">{currentRR}</span>
                </div>
                {requiredRR && (
                  <div>
                    <span className="text-slate-400 mr-1.5 font-normal">RRR:</span>
                    <span className="text-amber-400 font-bold">{requiredRR}</span>
                  </div>
                )}
                {match.scoringRule?.customWideNoBall && (
                  <span className="px-2 py-0.5 rounded bg-blue-900/40 text-blue-300 font-bold text-[10px] border border-blue-500/30">
                    Custom Wd/Nb Rule Active (0 penalty)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Toss 1-Minute Live Transition Modal */}
        <TossCountdownModal match={match} onMatchStarted={fetchMatchDetails} />

        {/* Recent Overs Horizontal Strip (Just like CREX!) */}
        {currentInnings && (
          <RecentOversStrip overs={currentInnings.overs || []} />
        )}

        {/* Tab Navigation */}
        <div className="border-b border-crex-border">
          <nav className="flex space-x-2">
            {[
              { id: 'live', label: 'Live' },
              { id: 'scorecard', label: 'Scorecard' },
              { id: 'overs', label: 'Overs' },
              { id: 'commentary', label: 'Commentary' },
              { id: 'info', label: 'Match Info' }
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-4 font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${
                    active
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Tab Content */}
        <div>
          {activeTab === 'live' && (
            <div className="space-y-5">
              <LiveScorecard match={match} innings={currentInnings} />
              {currentInnings?.overs?.length > 0 && (
                <div className="bg-[#121829] border border-crex-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Live Commentary Highlights
                    </h3>
                    <button
                      onClick={() => setActiveTab('commentary')}
                      className="text-xs text-blue-400 hover:underline font-semibold"
                    >
                      View All Balls →
                    </button>
                  </div>
                  <CommentaryTab innings={currentInnings} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'scorecard' && (
            <FullScorecardTab match={match} />
          )}

          {activeTab === 'overs' && (
            <OversTab innings={currentInnings} />
          )}

          {activeTab === 'commentary' && (
            <CommentaryTab innings={currentInnings} />
          )}

          {activeTab === 'info' && (
            <MatchInfoTab match={match} />
          )}
        </div>
      </main>
    </div>
  );
}
