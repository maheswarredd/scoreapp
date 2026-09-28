import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import LiveTicker from '../components/LiveTicker';
import { Radio, Calendar, Trophy, ChevronRight, Shield, Play } from 'lucide-react';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'all';

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

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

  // Listen for socket match list updates
  useEffect(() => {
    if (!socket) return;

    socket.on('matches_list_updated', (updatedMatch) => {
      setMatches((prev) => {
        const index = prev.findIndex(m => m._id === updatedMatch._id);
        if (index !== -1) {
          const newArr = [...prev];
          newArr[index] = { ...newArr[index], ...updatedMatch };
          return newArr;
        } else {
          return [updatedMatch, ...prev];
        }
      });
    });

    return () => {
      socket.off('matches_list_updated');
    };
  }, [socket]);

  // Filter matches based on active tab
  const filteredMatches = matches.filter((m) => {
    if (currentTab === 'live') {
      return m.status === 'live' || m.status === 'toss_done' || m.status === 'innings_break';
    }
    if (currentTab === 'upcoming') {
      return m.status === 'scheduled';
    }
    if (currentTab === 'completed') {
      return m.status === 'completed';
    }
    return true; // 'all'
  });

  return (
    <div className="min-h-screen bg-[#0a0e1a] pb-16">
      {/* Top Match Cards Ticker */}
      <LiveTicker matches={matches} />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6">
        {/* Category Tabs */}
        <div className="flex items-center justify-between border-b border-crex-border pb-3 mb-6">
          <div className="flex items-center space-x-2">
            {[
              { id: 'all', label: 'All Matches' },
              { id: 'live', label: '🔴 Live', icon: Radio },
              { id: 'upcoming', label: 'Upcoming', icon: Calendar },
              { id: 'completed', label: 'Completed', icon: Trophy }
            ].map((tab) => {
              const active = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSearchParams(tab.id === 'all' ? {} : { tab: tab.id })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <Link
            to="/admin/matches/create"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-bold transition"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Create Match</span>
          </Link>
        </div>

        {/* Matches Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-400 text-sm">Loading live matches...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="py-16 text-center bg-[#121829] border border-crex-border rounded-2xl p-8 max-w-lg mx-auto">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Matches Found</h3>
            <p className="text-xs text-slate-400 mb-5">
              {currentTab === 'live'
                ? 'No live cricket matches right now.'
                : 'No matches in this category.'}
            </p>
            <Link
              to="/admin/matches/create"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-500 transition"
            >
              <Shield className="w-4 h-4" />
              <span>Create Match in Admin Panel</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMatches.map((match) => {
              const isLive = match.status === 'live' || match.status === 'toss_done' || match.status === 'innings_break';
              const team1Innings = match.innings?.find(i => i.battingTeam === 'team1');
              const team2Innings = match.innings?.find(i => i.battingTeam === 'team2');

              return (
                <div
                  key={match._id}
                  className="bg-[#121829] border border-crex-border hover:border-blue-500/50 rounded-2xl p-4 shadow-lg hover:shadow-blue-900/10 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                      <span className="font-extrabold text-blue-400 uppercase tracking-wider truncate max-w-[190px]">
                        {match.matchType} • {match.title}
                      </span>
                      {isLive ? (
                        <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 font-extrabold text-[10px] border border-red-500/40">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                          <span>LIVE</span>
                        </span>
                      ) : match.status === 'completed' ? (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px]">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-300 font-bold text-[10px]">
                          Upcoming
                        </span>
                      )}
                    </div>

                    {/* Venue & Date */}
                    <p className="text-[11px] text-slate-400 mt-2 truncate">
                      {match.venue}
                    </p>

                    {/* Teams & Scores */}
                    <div className="space-y-3 my-4">
                      {/* Team 1 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm"
                            style={{ backgroundColor: match.team1.color || '#1e40af' }}
                          >
                            {match.team1.shortName?.slice(0, 3) || 'T1'}
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-white block">
                              {match.team1.name}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          {team1Innings ? (
                            <div>
                              <span className="text-base font-black text-white">
                                {team1Innings.totalRuns}/{team1Innings.totalWickets}
                              </span>
                              <span className="text-[11px] text-slate-400 block">
                                ({team1Innings.totalOvers?.toFixed(1) || '0.0'} ov)
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">Yet to bat</span>
                          )}
                        </div>
                      </div>

                      {/* Team 2 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm"
                            style={{ backgroundColor: match.team2.color || '#eab308' }}
                          >
                            {match.team2.shortName?.slice(0, 3) || 'T2'}
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-white block">
                              {match.team2.name}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          {team2Innings ? (
                            <div>
                              <span className="text-base font-black text-white">
                                {team2Innings.totalRuns}/{team2Innings.totalWickets}
                              </span>
                              <span className="text-[11px] text-slate-400 block">
                                ({team2Innings.totalOvers?.toFixed(1) || '0.0'} ov)
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">Yet to bat</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status / Note & Action button */}
                  <div className="pt-3 border-t border-slate-800/80">
                    <p className="text-xs font-semibold text-amber-400 mb-3 truncate">
                      {match.statusNote}
                    </p>

                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/match/${match._id}`}
                        className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/20"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Match Center</span>
                      </Link>

                      <Link
                        to={`/admin/scoring/${match._id}`}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
                        title="Live Scorer Console"
                      >
                        <Shield className="w-4 h-4 text-emerald-400" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
