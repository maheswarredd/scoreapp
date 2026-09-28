const { MatchStore } = require('../data/store');
const { broadcastMatchUpdate } = require('../socket/socketManager');
const { v4: uuidv4 } = require('uuid');

// Helper to create empty innings
function createEmptyInnings(inningsNumber, battingTeam, bowlingTeam, battingSquad, bowlingSquad) {
  return {
    inningsNumber,
    battingTeam,
    bowlingTeam,
    totalRuns: 0,
    totalWickets: 0,
    totalOvers: 0,
    legalBalls: 0,
    isCompleted: false,
    extras: {
      wides: 0,
      wideRuns: 0,
      noBalls: 0,
      noBallRuns: 0,
      byes: 0,
      legByes: 0,
      totalExtras: 0
    },
    batsmen: battingSquad.map((p, idx) => ({
      playerId: p.id || `p_${idx}`,
      name: p.name,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      strikeRate: 0,
      isOut: false,
      dismissal: 'not out',
      dismissalType: 'not_out',
      bowlerId: '',
      fielderName: '',
      battingOrder: idx + 1,
      isCurrentStriker: false,
      isCurrentNonStriker: false
    })),
    bowlers: bowlingSquad.map((p, idx) => ({
      playerId: p.id || `p_bowl_${idx}`,
      name: p.name,
      overs: 0,
      legalBalls: 0,
      maidens: 0,
      runsConceded: 0,
      wickets: 0,
      economy: 0,
      noBalls: 0,
      wides: 0,
      isCurrentBowler: false
    })),
    overs: [],
    fallOfWickets: [],
    partnership: {
      runs: 0,
      balls: 0
    }
  };
}

// Get all matches
const getMatches = async (req, res) => {
  try {
    const { status } = req.query;
    let matches = await MatchStore.getAll();

    if (status && status !== 'all') {
      if (status === 'live') {
        matches = matches.filter(m => m.status === 'live' || m.status === 'toss_done' || m.status === 'innings_break');
      } else if (status === 'upcoming') {
        matches = matches.filter(m => m.status === 'scheduled');
      } else if (status === 'completed') {
        matches = matches.filter(m => m.status === 'completed');
      }
    }

    return res.json({ success: true, count: matches.length, matches });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get single match by ID
const getMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const match = await MatchStore.getById(id);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    return res.json({ success: true, match });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new match
const createMatch = async (req, res) => {
  try {
    const {
      title,
      matchType = 'T20',
      totalOvers = 20,
      venue = 'National Stadium',
      date = new Date(),
      team1,
      team2,
      scoringRule = { customWideNoBall: true }
    } = req.body;

    if (!title || !team1?.name || !team2?.name) {
      return res.status(400).json({ success: false, message: 'Title and both team names are required.' });
    }

    // Ensure players have IDs
    const team1Players = (team1.players || []).map((p, idx) => ({
      ...p,
      id: p.id || `t1_p_${idx + 1}_${Date.now()}`
    }));

    const team2Players = (team2.players || []).map((p, idx) => ({
      ...p,
      id: p.id || `t2_p_${idx + 1}_${Date.now()}`
    }));

    const matchData = {
      title,
      matchType,
      totalOvers: Number(totalOvers) || 20,
      venue,
      date,
      status: 'scheduled',
      statusNote: 'Match scheduled',
      scoringRule: {
        customWideNoBall: scoringRule?.customWideNoBall !== false // Default true per user requirement!
      },
      toss: {
        winner: '',
        decision: '',
        completedAt: null,
        liveAt: null
      },
      team1: {
        name: team1.name,
        shortName: team1.shortName || team1.name.slice(0, 3).toUpperCase(),
        color: team1.color || '#1e40af',
        logo: team1.logo || '',
        players: team1Players
      },
      team2: {
        name: team2.name,
        shortName: team2.shortName || team2.name.slice(0, 3).toUpperCase(),
        color: team2.color || '#eab308',
        logo: team2.logo || '',
        players: team2Players
      },
      innings: [],
      currentInningsIndex: 0,
      liveEvent: {
        type: 'NONE',
        text: '',
        timestamp: new Date()
      }
    };

    const createdMatch = await MatchStore.create(matchData);
    broadcastMatchUpdate(createdMatch._id, createdMatch);

    return res.status(201).json({ success: true, match: createdMatch });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Conduct Toss with 1-Minute Live Transition
const conductToss = async (req, res) => {
  try {
    const { id } = req.params;
    const { winner, decision } = req.body; // winner: 'team1' | 'team2', decision: 'bat' | 'bowl'

    const match = await MatchStore.getById(id);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    if (!winner || !decision) {
      return res.status(400).json({ success: false, message: 'Winner and decision are required' });
    }

    const now = new Date();
    // 1-minute countdown until match is live!
    const liveAt = new Date(now.getTime() + 60 * 1000);

    const winnerName = winner === 'team1' ? match.team1.name : match.team2.name;
    const statusNote = `${winnerName} won the toss and elected to ${decision}`;

    // Determine who bats first in Innings 1
    let battingTeamKey = 'team1';
    let bowlingTeamKey = 'team2';
    if (winner === 'team1') {
      if (decision === 'bat') {
        battingTeamKey = 'team1';
        bowlingTeamKey = 'team2';
      } else {
        battingTeamKey = 'team2';
        bowlingTeamKey = 'team1';
      }
    } else {
      if (decision === 'bat') {
        battingTeamKey = 'team2';
        bowlingTeamKey = 'team1';
      } else {
        battingTeamKey = 'team1';
        bowlingTeamKey = 'team2';
      }
    }

    const battingSquad = battingTeamKey === 'team1' ? match.team1.players : match.team2.players;
    const bowlingSquad = bowlingTeamKey === 'team1' ? match.team1.players : match.team2.players;

    const innings1 = createEmptyInnings(1, battingTeamKey, bowlingTeamKey, battingSquad, bowlingSquad);

    const updated = await MatchStore.update(id, {
      status: 'toss_done',
      statusNote,
      toss: {
        winner,
        decision,
        completedAt: now,
        liveAt
      },
      innings: [innings1],
      currentInningsIndex: 0
    });

    broadcastMatchUpdate(id, updated);
    scheduleAutoLive(id, liveAt);
    return res.json({ success: true, match: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------------------------------------------------------------------
// Go LIVE logic (shared by the admin button, the browser countdown and the
// server-side timer). Safe to call many times: it only acts once.
// ---------------------------------------------------------------------------
const liveTimers = new Map();
const goingLive = new Set();

async function goLive(id, { strikerId, nonStrikerId, bowlerId } = {}) {
  if (goingLive.has(String(id))) {
    return { match: await MatchStore.getById(id), error: null };
  }
  goingLive.add(String(id));
  try {
    const found = await MatchStore.getById(id);
    if (!found) return { match: null, error: 'Match not found', code: 404 };

    const match = typeof found.toObject === 'function' ? found.toObject() : found;

    if (!match.innings || match.innings.length === 0) {
      return { match: found, error: 'Please conduct toss first', code: 400 };
    }
    if (match.status === 'live') {
      return { match: found, error: null }; // already live - nothing to do
    }

    const currInnings = match.innings[match.currentInningsIndex || 0];

    // Default openers: first two batters + first bowler
    const sId = strikerId || currInnings.batsmen[0]?.playerId;
    const nsId = nonStrikerId || currInnings.batsmen[1]?.playerId;
    const bId = bowlerId || currInnings.bowlers[0]?.playerId;

    currInnings.batsmen.forEach((b) => {
      b.isCurrentStriker = (b.playerId === sId);
      b.isCurrentNonStriker = (b.playerId === nsId);
    });
    currInnings.bowlers.forEach((b) => {
      b.isCurrentBowler = (b.playerId === bId);
    });

    const baseNote = String(match.statusNote || '').replace(/ - Match is LIVE!$/, '');
    const updated = await MatchStore.update(id, {
      status: 'live',
      statusNote: `${baseNote} - Match is LIVE!`,
      innings: match.innings
    });

    clearTimeout(liveTimers.get(String(id)));
    liveTimers.delete(String(id));

    broadcastMatchUpdate(id, updated);
    return { match: updated, error: null };
  } finally {
    goingLive.delete(String(id));
  }
}

// Make the match go LIVE automatically when the 1-minute countdown ends,
// even if nobody has the admin panel open.
function scheduleAutoLive(id, liveAt) {
  const key = String(id);
  clearTimeout(liveTimers.get(key));
  const delay = Math.max(0, new Date(liveAt).getTime() - Date.now()) + 500;
  const timer = setTimeout(() => {
    goLive(id).catch((err) => console.error('[AutoLive] failed for', id, err.message));
  }, delay);
  if (timer.unref) timer.unref();
  liveTimers.set(key, timer);
}

// After a restart, re-arm timers for matches that were waiting for their toss countdown
async function resumePendingTosses() {
  try {
    const all = await MatchStore.getAll();
    for (const m of all) {
      if (m.status === 'toss_done' && m.toss && m.toss.liveAt) {
        scheduleAutoLive(m._id, m.toss.liveAt);
      }
    }
  } catch (err) {
    console.error('[AutoLive] could not resume pending tosses:', err.message);
  }
}

// Start Match Live (after countdown or immediately via admin)
const startMatchLive = async (req, res) => {
  try {
    const { id } = req.params;
    const { match, error, code } = await goLive(id, req.body || {});
    if (error) {
      return res.status(code || 400).json({ success: false, message: error });
    }
    return res.json({ success: true, match });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update Match Information
const updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await MatchStore.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    broadcastMatchUpdate(id, updated);
    return res.json({ success: true, match: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Delete match
const deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await MatchStore.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }
    return res.json({ success: true, message: 'Match deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getMatches,
  getMatchById,
  createMatch,
  conductToss,
  startMatchLive,
  updateMatch,
  deleteMatch,
  resumePendingTosses
};
