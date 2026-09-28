const mongoose = require('mongoose');

const PlayerSubSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['batter', 'bowler', 'all_rounder', 'wicketkeeper'], default: 'batter' },
  isCaptain: { type: Boolean, default: false },
  isWicketKeeper: { type: Boolean, default: false }
}, { _id: false });

const BatsmanInningsSchema = new mongoose.Schema({
  playerId: { type: String, required: true },
  name: { type: String, required: true },
  runs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  strikeRate: { type: Number, default: 0 },
  isOut: { type: Boolean, default: false },
  dismissal: { type: String, default: 'not out' },
  dismissalType: { type: String, default: 'not_out' },
  bowlerId: { type: String, default: '' },
  fielderName: { type: String, default: '' },
  battingOrder: { type: Number, default: 0 },
  isCurrentStriker: { type: Boolean, default: false },
  isCurrentNonStriker: { type: Boolean, default: false }
}, { _id: false });

const BowlerInningsSchema = new mongoose.Schema({
  playerId: { type: String, required: true },
  name: { type: String, required: true },
  overs: { type: Number, default: 0 },
  legalBalls: { type: Number, default: 0 },
  maidens: { type: Number, default: 0 },
  runsConceded: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  economy: { type: Number, default: 0 },
  noBalls: { type: Number, default: 0 },
  wides: { type: Number, default: 0 },
  isCurrentBowler: { type: Boolean, default: false }
}, { _id: false });

const BallSchema = new mongoose.Schema({
  ballId: { type: String, required: true },
  ballNumberInOver: { type: Number, default: 1 },
  legalBallNumber: { type: Number, default: 1 },
  outcome: { type: String, required: true }, // '0','1','2','3','4','6','W','Wd','Nb', etc.
  runs: { type: Number, default: 0 }, // runs added to score
  extraRuns: { type: Number, default: 0 },
  isWicket: { type: Boolean, default: false },
  wicketDetail: {
    batsmanName: String,
    dismissalType: String,
    fielderName: String,
    bowlerName: String
  },
  isWide: { type: Boolean, default: false },
  isNoBall: { type: Boolean, default: false },
  isBye: { type: Boolean, default: false },
  isLegBye: { type: Boolean, default: false },
  commentary: { type: String, default: '' },
  strikerName: { type: String, default: '' },
  nonStrikerName: { type: String, default: '' },
  bowlerName: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const OverSchema = new mongoose.Schema({
  overNumber: { type: Number, required: true },
  bowlerId: { type: String, default: '' },
  bowlerName: { type: String, default: '' },
  runsInOver: { type: Number, default: 0 },
  wicketsInOver: { type: Number, default: 0 },
  balls: [BallSchema]
}, { _id: false });

const InningsSchema = new mongoose.Schema({
  inningsNumber: { type: Number, required: true },
  battingTeam: { type: String, enum: ['team1', 'team2'], required: true },
  bowlingTeam: { type: String, enum: ['team1', 'team2'], required: true },
  totalRuns: { type: Number, default: 0 },
  totalWickets: { type: Number, default: 0 },
  totalOvers: { type: Number, default: 0 }, // e.g. 14.3
  legalBalls: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  extras: {
    wides: { type: Number, default: 0 },
    wideRuns: { type: Number, default: 0 },
    noBalls: { type: Number, default: 0 },
    noBallRuns: { type: Number, default: 0 },
    byes: { type: Number, default: 0 },
    legByes: { type: Number, default: 0 },
    totalExtras: { type: Number, default: 0 }
  },
  batsmen: [BatsmanInningsSchema],
  bowlers: [BowlerInningsSchema],
  overs: [OverSchema],
  fallOfWickets: [
    {
      wicketNumber: Number,
      batsmanName: String,
      score: Number,
      overs: Number
    }
  ],
  partnership: {
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 }
  }
}, { _id: false });

const MatchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  matchType: { type: String, default: 'T20' }, // T20, ODI, 10-Overs, Custom
  totalOvers: { type: Number, default: 20 },
  venue: { type: String, default: 'Stadium' },
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['scheduled', 'toss_done', 'live', 'innings_break', 'completed'],
    default: 'scheduled'
  },
  statusNote: { type: String, default: 'Match scheduled' },
  scoringRule: {
    customWideNoBall: { type: Boolean, default: true } // "wd and no ball is added but score not include it was shown only overs and no ball any runs is their added run only"
  },
  toss: {
    winner: { type: String, default: '' }, // 'team1' or 'team2'
    decision: { type: String, default: '' }, // 'bat' or 'bowl'
    completedAt: { type: Date, default: null },
    liveAt: { type: Date, default: null } // Toss time + 1 min countdown
  },
  team1: {
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    color: { type: String, default: '#1e40af' },
    logo: { type: String, default: '' },
    players: [PlayerSubSchema]
  },
  team2: {
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    color: { type: String, default: '#eab308' },
    logo: { type: String, default: '' },
    players: [PlayerSubSchema]
  },
  innings: [InningsSchema],
  currentInningsIndex: { type: Number, default: 0 },
  liveEvent: {
    type: { type: String, default: 'NONE' },
    text: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
  }
}, { timestamps: true });

module.exports = mongoose.model('Match', MatchSchema);
