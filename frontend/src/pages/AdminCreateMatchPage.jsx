import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Shield, Plus, Trash2, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';

const PRESET_IND_AUS = {
  team1: {
    name: 'India',
    shortName: 'IND',
    color: '#1e40af',
    players: [
      { name: 'Rohit Sharma', role: 'batter', isCaptain: true, isWicketKeeper: false },
      { name: 'Virat Kohli', role: 'batter', isCaptain: false, isWicketKeeper: false },
      { name: 'Suryakumar Yadav', role: 'batter', isCaptain: false, isWicketKeeper: false },
      { name: 'Rishabh Pant', role: 'wicketkeeper', isCaptain: false, isWicketKeeper: true },
      { name: 'Hardik Pandya', role: 'all_rounder', isCaptain: false, isWicketKeeper: false },
      { name: 'Shivam Dube', role: 'all_rounder', isCaptain: false, isWicketKeeper: false },
      { name: 'Ravindra Jadeja', role: 'all_rounder', isCaptain: false, isWicketKeeper: false },
      { name: 'Axar Patel', role: 'all_rounder', isCaptain: false, isWicketKeeper: false },
      { name: 'Kuldeep Yadav', role: 'bowler', isCaptain: false, isWicketKeeper: false },
      { name: 'Jasprit Bumrah', role: 'bowler', isCaptain: false, isWicketKeeper: false },
      { name: 'Arshdeep Singh', role: 'bowler', isCaptain: false, isWicketKeeper: false }
    ]
  },
  team2: {
    name: 'Australia',
    shortName: 'AUS',
    color: '#eab308',
    players: [
      { name: 'Travis Head', role: 'batter', isCaptain: false, isWicketKeeper: false },
      { name: 'David Warner', role: 'batter', isCaptain: false, isWicketKeeper: false },
      { name: 'Mitchell Marsh', role: 'all_rounder', isCaptain: true, isWicketKeeper: false },
      { name: 'Glenn Maxwell', role: 'all_rounder', isCaptain: false, isWicketKeeper: false },
      { name: 'Marcus Stoinis', role: 'all_rounder', isCaptain: false, isWicketKeeper: false },
      { name: 'Tim David', role: 'batter', isCaptain: false, isWicketKeeper: false },
      { name: 'Matthew Wade', role: 'wicketkeeper', isCaptain: false, isWicketKeeper: true },
      { name: 'Pat Cummins', role: 'bowler', isCaptain: false, isWicketKeeper: false },
      { name: 'Mitchell Starc', role: 'bowler', isCaptain: false, isWicketKeeper: false },
      { name: 'Adam Zampa', role: 'bowler', isCaptain: false, isWicketKeeper: false },
      { name: 'Josh Hazlewood', role: 'bowler', isCaptain: false, isWicketKeeper: false }
    ]
  }
};

export default function AdminCreateMatchPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("Final - T20 Championship 2026");
  const [matchType, setMatchType] = useState('T20');
  const [totalOvers, setTotalOvers] = useState(20);
  const [venue, setVenue] = useState('Melbourne Cricket Ground, Melbourne');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [customWideNoBall, setCustomWideNoBall] = useState(true);

  // Teams
  const [team1Name, setTeam1Name] = useState('India');
  const [team1Short, setTeam1Short] = useState('IND');
  const [team1Color, setTeam1Color] = useState('#1e40af');
  const [team1Players, setTeam1Players] = useState(PRESET_IND_AUS.team1.players);

  const [team2Name, setTeam2Name] = useState('Australia');
  const [team2Short, setTeam2Short] = useState('AUS');
  const [team2Color, setTeam2Color] = useState('#eab308');
  const [team2Players, setTeam2Players] = useState(PRESET_IND_AUS.team2.players);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Add player to Team 1
  const addPlayerTeam1 = () => {
    setTeam1Players([
      ...team1Players,
      { name: `Player ${team1Players.length + 1}`, role: 'batter', isCaptain: false, isWicketKeeper: false }
    ]);
  };

  // Remove player from Team 1
  const removePlayerTeam1 = (index) => {
    setTeam1Players(team1Players.filter((_, idx) => idx !== index));
  };

  // Add player to Team 2
  const addPlayerTeam2 = () => {
    setTeam2Players([
      ...team2Players,
      { name: `Player ${team2Players.length + 1}`, role: 'batter', isCaptain: false, isWicketKeeper: false }
    ]);
  };

  // Remove player from Team 2
  const removePlayerTeam2 = (index) => {
    setTeam2Players(team2Players.filter((_, idx) => idx !== index));
  };

  const handleApplyPreset = () => {
    setTeam1Name(PRESET_IND_AUS.team1.name);
    setTeam1Short(PRESET_IND_AUS.team1.shortName);
    setTeam1Color(PRESET_IND_AUS.team1.color);
    setTeam1Players(PRESET_IND_AUS.team1.players);

    setTeam2Name(PRESET_IND_AUS.team2.name);
    setTeam2Short(PRESET_IND_AUS.team2.shortName);
    setTeam2Color(PRESET_IND_AUS.team2.color);
    setTeam2Players(PRESET_IND_AUS.team2.players);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !team1Name || !team2Name) {
      setError('Title, Team 1 name, and Team 2 name are required.');
      return;
    }

    if (team1Players.length === 0 || team2Players.length === 0) {
      setError('Please add at least 2 players to each squad.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        matchType,
        totalOvers: Number(totalOvers),
        venue,
        date: new Date(date),
        scoringRule: {
          customWideNoBall
        },
        team1: {
          name: team1Name,
          shortName: team1Short || team1Name.slice(0, 3).toUpperCase(),
          color: team1Color,
          players: team1Players
        },
        team2: {
          name: team2Name,
          shortName: team2Short || team2Name.slice(0, 3).toUpperCase(),
          color: team2Color,
          players: team2Players
        }
      };

      const res = await api.post('/matches', payload);
      if (res.data?.success) {
        navigate(`/admin/scoring/${res.data.match._id}`);
      } else {
        setError(res.data?.message || 'Failed to create match');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] pb-24">
      {/* Header */}
      <div className="bg-[#0e1424] border-b border-crex-border py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            to="/admin"
            className="flex items-center space-x-2 text-xs font-bold text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Panel</span>
          </Link>

          <button
            type="button"
            onClick={handleApplyPreset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Preset Squad (IND vs AUS)</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white">Create New Cricket Match</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure teams, manual players, overs, venue, and custom wide/no-ball scoring rule
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Match Basic Information */}
          <div className="bg-[#121829] border border-crex-border rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400 border-b border-slate-800 pb-2">
              1. Match Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Match Title / Tournament
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. ICC T20 World Cup Final"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Match Format
                </label>
                <select
                  value={matchType}
                  onChange={(e) => {
                    setMatchType(e.target.value);
                    if (e.target.value === 'T20') setTotalOvers(20);
                    if (e.target.value === 'ODI') setTotalOvers(50);
                    if (e.target.value === '10-Overs') setTotalOvers(10);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="T20">T20 (20 Overs)</option>
                  <option value="ODI">ODI (50 Overs)</option>
                  <option value="10-Overs">10-Overs Match</option>
                  <option value="Custom">Custom Overs</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Total Overs per Innings
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={totalOvers}
                  onChange={(e) => setTotalOvers(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Venue / Ground
                </label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Melbourne Cricket Ground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Custom Wide & No Ball Rule Feature */}
            <div className="mt-4 p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start space-x-3">
              <input
                type="checkbox"
                id="customRuleCheck"
                checked={customWideNoBall}
                onChange={(e) => setCustomWideNoBall(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
              />
              <label htmlFor="customRuleCheck" className="cursor-pointer">
                <span className="font-bold text-amber-400 text-xs block">
                  Enable Custom Wide (Wd) & No Ball (Nb) Scoring Rule
                </span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  "wd and no ball is added but score not include it was shown only overs and no ball any runs is their added run only".
                  When enabled, Wide and No Ball deliveries show in the over breakdown and ball logs, but 0 penalty runs are added to total score unless the batsman actually scored runs off it.
                </p>
              </label>
            </div>
          </div>

          {/* Teams & Squad Players */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team 1 Configuration */}
            <div className="bg-[#121829] border border-crex-border rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">
                  2. Team 1 (Home)
                </h2>
                <button
                  type="button"
                  onClick={addPlayerTeam1}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Player</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase">Team Name</label>
                  <input
                    type="text"
                    required
                    value={team1Name}
                    onChange={(e) => setTeam1Name(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase">Short Code</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={team1Short}
                    onChange={(e) => setTeam1Short(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Players List */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Playing Squad ({team1Players.length} Players)
                </span>
                {team1Players.map((player, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-xs font-bold w-4">{idx + 1}</span>
                    <input
                      type="text"
                      required
                      value={player.name}
                      onChange={(e) => {
                        const updated = [...team1Players];
                        updated[idx].name = e.target.value;
                        setTeam1Players(updated);
                      }}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      placeholder="Player Name"
                    />
                    <select
                      value={player.role}
                      onChange={(e) => {
                        const updated = [...team1Players];
                        updated[idx].role = e.target.value;
                        setTeam1Players(updated);
                      }}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300"
                    >
                      <option value="batter">Batter</option>
                      <option value="bowler">Bowler</option>
                      <option value="all_rounder">All-Rounder</option>
                      <option value="wicketkeeper">WK</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...team1Players];
                        updated[idx].isCaptain = !updated[idx].isCaptain;
                        setTeam1Players(updated);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-black border ${
                        player.isCaptain
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                      title="Captain"
                    >
                      C
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...team1Players];
                        updated[idx].isWicketKeeper = !updated[idx].isWicketKeeper;
                        setTeam1Players(updated);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-black border ${
                        player.isWicketKeeper
                          ? 'bg-amber-600 text-white border-amber-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                      title="Wicketkeeper"
                    >
                      WK
                    </button>

                    <button
                      type="button"
                      onClick={() => removePlayerTeam1(idx)}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Team 2 Configuration */}
            <div className="bg-[#121829] border border-crex-border rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400">
                  3. Team 2 (Away)
                </h2>
                <button
                  type="button"
                  onClick={addPlayerTeam2}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Player</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase">Team Name</label>
                  <input
                    type="text"
                    required
                    value={team2Name}
                    onChange={(e) => setTeam2Name(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase">Short Code</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={team2Short}
                    onChange={(e) => setTeam2Short(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Players List */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                  Playing Squad ({team2Players.length} Players)
                </span>
                {team2Players.map((player, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-500 text-xs font-bold w-4">{idx + 1}</span>
                    <input
                      type="text"
                      required
                      value={player.name}
                      onChange={(e) => {
                        const updated = [...team2Players];
                        updated[idx].name = e.target.value;
                        setTeam2Players(updated);
                      }}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                      placeholder="Player Name"
                    />
                    <select
                      value={player.role}
                      onChange={(e) => {
                        const updated = [...team2Players];
                        updated[idx].role = e.target.value;
                        setTeam2Players(updated);
                      }}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300"
                    >
                      <option value="batter">Batter</option>
                      <option value="bowler">Bowler</option>
                      <option value="all_rounder">All-Rounder</option>
                      <option value="wicketkeeper">WK</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...team2Players];
                        updated[idx].isCaptain = !updated[idx].isCaptain;
                        setTeam2Players(updated);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-black border ${
                        player.isCaptain
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                      title="Captain"
                    >
                      C
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...team2Players];
                        updated[idx].isWicketKeeper = !updated[idx].isWicketKeeper;
                        setTeam2Players(updated);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-black border ${
                        player.isWicketKeeper
                          ? 'bg-amber-600 text-white border-amber-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                      title="Wicketkeeper"
                    >
                      WK
                    </button>

                    <button
                      type="button"
                      onClick={() => removePlayerTeam2(idx)}
                      className="p-1 text-slate-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-black shadow-xl shadow-blue-600/30 transition disabled:opacity-50"
            >
              {submitting ? 'Creating Match...' : 'Create Match & Launch Scorer Console →'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
