const { MatchStore } = require('./store');

async function seedInitialMatch() {
  const matches = await MatchStore.getAll();
  if (matches && matches.length > 0) {
    return; // Already has matches
  }

  console.log('[Seed] Seeding realistic CREX sample matches...');

  const liveMatchData = {
    title: "Final - ICC Men's T20 World Cup 2026",
    matchType: 'T20',
    totalOvers: 20,
    venue: 'Melbourne Cricket Ground, Melbourne',
    date: new Date(),
    status: 'live',
    statusNote: 'India won the toss and elected to bat - Match is LIVE!',
    scoringRule: {
      customWideNoBall: true
    },
    toss: {
      winner: 'team1',
      decision: 'bat',
      completedAt: new Date(Date.now() - 45 * 60 * 1000),
      liveAt: new Date(Date.now() - 44 * 60 * 1000)
    },
    team1: {
      name: 'India',
      shortName: 'IND',
      color: '#1e40af',
      logo: '🇮🇳',
      players: [
        { id: 'ind_1', name: 'Rohit Sharma', role: 'batter', isCaptain: true, isWicketKeeper: false },
        { id: 'ind_2', name: 'Virat Kohli', role: 'batter', isCaptain: false, isWicketKeeper: false },
        { id: 'ind_3', name: 'Suryakumar Yadav', role: 'batter', isCaptain: false, isWicketKeeper: false },
        { id: 'ind_4', name: 'Rishabh Pant', role: 'wicketkeeper', isCaptain: false, isWicketKeeper: true },
        { id: 'ind_5', name: 'Hardik Pandya', role: 'all_rounder', isCaptain: false, isWicketKeeper: false },
        { id: 'ind_6', name: 'Shivam Dube', role: 'all_rounder', isCaptain: false, isWicketKeeper: false },
        { id: 'ind_7', name: 'Ravindra Jadeja', role: 'all_rounder', isCaptain: false, isWicketKeeper: false },
        { id: 'ind_8', name: 'Axar Patel', role: 'all_rounder', isCaptain: false, isWicketKeeper: false },
        { id: 'ind_9', name: 'Kuldeep Yadav', role: 'bowler', isCaptain: false, isWicketKeeper: false },
        { id: 'ind_10', name: 'Jasprit Bumrah', role: 'bowler', isCaptain: false, isWicketKeeper: false },
        { id: 'ind_11', name: 'Arshdeep Singh', role: 'bowler', isCaptain: false, isWicketKeeper: false }
      ]
    },
    team2: {
      name: 'Australia',
      shortName: 'AUS',
      color: '#eab308',
      logo: '🇦🇺',
      players: [
        { id: 'aus_1', name: 'Travis Head', role: 'batter', isCaptain: false, isWicketKeeper: false },
        { id: 'aus_2', name: 'David Warner', role: 'batter', isCaptain: false, isWicketKeeper: false },
        { id: 'aus_3', name: 'Mitchell Marsh', role: 'all_rounder', isCaptain: true, isWicketKeeper: false },
        { id: 'aus_4', name: 'Glenn Maxwell', role: 'all_rounder', isCaptain: false, isWicketKeeper: false },
        { id: 'aus_5', name: 'Marcus Stoinis', role: 'all_rounder', isCaptain: false, isWicketKeeper: false },
        { id: 'aus_6', name: 'Tim David', role: 'batter', isCaptain: false, isWicketKeeper: false },
        { id: 'aus_7', name: 'Matthew Wade', role: 'wicketkeeper', isCaptain: false, isWicketKeeper: true },
        { id: 'aus_8', name: 'Pat Cummins', role: 'bowler', isCaptain: false, isWicketKeeper: false },
        { id: 'aus_9', name: 'Mitchell Starc', role: 'bowler', isCaptain: false, isWicketKeeper: false },
        { id: 'aus_10', name: 'Adam Zampa', role: 'bowler', isCaptain: false, isWicketKeeper: false },
        { id: 'aus_11', name: 'Josh Hazlewood', role: 'bowler', isCaptain: false, isWicketKeeper: false }
      ]
    },
    currentInningsIndex: 0,
    innings: [
      {
        inningsNumber: 1,
        battingTeam: 'team1',
        bowlingTeam: 'team2',
        totalRuns: 148,
        totalWickets: 2,
        totalOvers: 14.3,
        legalBalls: 87,
        isCompleted: false,
        extras: {
          wides: 3,
          wideRuns: 0, // Custom rule: 0 penalty unless batsman ran
          noBalls: 1,
          noBallRuns: 4, // 4 runs hit off the no ball
          byes: 0,
          legByes: 2,
          totalExtras: 6
        },
        batsmen: [
          {
            playerId: 'ind_1',
            name: 'Rohit Sharma',
            runs: 57,
            balls: 34,
            fours: 6,
            sixes: 3,
            strikeRate: 167.65,
            isOut: true,
            dismissal: 'c Maxwell b Starc',
            dismissalType: 'caught',
            bowlerId: 'aus_9',
            fielderName: 'Glenn Maxwell',
            battingOrder: 1,
            isCurrentStriker: false,
            isCurrentNonStriker: false
          },
          {
            playerId: 'ind_2',
            name: 'Virat Kohli',
            runs: 48,
            balls: 32,
            fours: 4,
            sixes: 2,
            strikeRate: 150.00,
            isOut: false,
            dismissal: 'not out',
            dismissalType: 'not_out',
            bowlerId: '',
            fielderName: '',
            battingOrder: 2,
            isCurrentStriker: true,
            isCurrentNonStriker: false
          },
          {
            playerId: 'ind_3',
            name: 'Suryakumar Yadav',
            runs: 18,
            balls: 9,
            fours: 2,
            sixes: 1,
            strikeRate: 200.00,
            isOut: true,
            dismissal: 'b Cummins',
            dismissalType: 'bowled',
            bowlerId: 'aus_8',
            fielderName: '',
            battingOrder: 3,
            isCurrentStriker: false,
            isCurrentNonStriker: false
          },
          {
            playerId: 'ind_4',
            name: 'Rishabh Pant',
            runs: 23,
            balls: 12,
            fours: 3,
            sixes: 1,
            strikeRate: 191.67,
            isOut: false,
            dismissal: 'not out',
            dismissalType: 'not_out',
            bowlerId: '',
            fielderName: '',
            battingOrder: 4,
            isCurrentStriker: false,
            isCurrentNonStriker: true
          },
          { playerId: 'ind_5', name: 'Hardik Pandya', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false, dismissal: 'yet to bat', dismissalType: 'not_out', battingOrder: 5, isCurrentStriker: false, isCurrentNonStriker: false },
          { playerId: 'ind_6', name: 'Shivam Dube', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false, dismissal: 'yet to bat', dismissalType: 'not_out', battingOrder: 6, isCurrentStriker: false, isCurrentNonStriker: false },
          { playerId: 'ind_7', name: 'Ravindra Jadeja', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false, dismissal: 'yet to bat', dismissalType: 'not_out', battingOrder: 7, isCurrentStriker: false, isCurrentNonStriker: false },
          { playerId: 'ind_8', name: 'Axar Patel', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false, dismissal: 'yet to bat', dismissalType: 'not_out', battingOrder: 8, isCurrentStriker: false, isCurrentNonStriker: false },
          { playerId: 'ind_9', name: 'Kuldeep Yadav', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false, dismissal: 'yet to bat', dismissalType: 'not_out', battingOrder: 9, isCurrentStriker: false, isCurrentNonStriker: false },
          { playerId: 'ind_10', name: 'Jasprit Bumrah', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false, dismissal: 'yet to bat', dismissalType: 'not_out', battingOrder: 10, isCurrentStriker: false, isCurrentNonStriker: false },
          { playerId: 'ind_11', name: 'Arshdeep Singh', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false, dismissal: 'yet to bat', dismissalType: 'not_out', battingOrder: 11, isCurrentStriker: false, isCurrentNonStriker: false }
        ],
        bowlers: [
          { playerId: 'aus_9', name: 'Mitchell Starc', overs: 3.0, legalBalls: 18, maidens: 0, runsConceded: 28, wickets: 1, economy: 9.33, noBalls: 0, wides: 1, isCurrentBowler: false },
          { playerId: 'aus_11', name: 'Josh Hazlewood', overs: 3.0, legalBalls: 18, maidens: 0, runsConceded: 24, wickets: 0, economy: 8.00, noBalls: 0, wides: 1, isCurrentBowler: false },
          { playerId: 'aus_8', name: 'Pat Cummins', overs: 3.0, legalBalls: 18, maidens: 0, runsConceded: 31, wickets: 1, economy: 10.33, noBalls: 0, wides: 0, isCurrentBowler: false },
          { playerId: 'aus_10', name: 'Adam Zampa', overs: 3.0, legalBalls: 18, maidens: 0, runsConceded: 33, wickets: 0, economy: 11.00, noBalls: 0, wides: 1, isCurrentBowler: false },
          { playerId: 'aus_4', name: 'Glenn Maxwell', overs: 2.3, legalBalls: 15, maidens: 0, runsConceded: 26, wickets: 0, economy: 10.40, noBalls: 1, wides: 0, isCurrentBowler: true }
        ],
        overs: [
          {
            overNumber: 13,
            bowlerId: 'aus_10',
            bowlerName: 'Adam Zampa',
            runsInOver: 12,
            wicketsInOver: 0,
            balls: [
              { ballId: 'b_13_1', ballNumberInOver: 1, legalBallNumber: 73, outcome: '1', runs: 1, extraRuns: 0, isWicket: false, isWide: false, isNoBall: false, commentary: 'Zampa to Pant, 1 run, pushed down to long off.', strikerName: 'Rishabh Pant', bowlerName: 'Adam Zampa', timestamp: new Date(Date.now() - 6 * 60 * 1000) },
              { ballId: 'b_13_2', ballNumberInOver: 2, legalBallNumber: 74, outcome: '4', runs: 4, extraRuns: 0, isWicket: false, isWide: false, isNoBall: false, commentary: 'FOUR! Smashed wide of mid-wicket! Kohli in top gear.', strikerName: 'Virat Kohli', bowlerName: 'Adam Zampa', timestamp: new Date(Date.now() - 5 * 60 * 1000) },
              { ballId: 'b_13_3', ballNumberInOver: 3, legalBallNumber: 75, outcome: '0', runs: 0, extraRuns: 0, isWicket: false, isWide: false, isNoBall: false, commentary: 'Zampa to Kohli, dot ball, leg break defended.', strikerName: 'Virat Kohli', bowlerName: 'Adam Zampa', timestamp: new Date(Date.now() - 4 * 60 * 1000) },
              { ballId: 'b_13_4', ballNumberInOver: 4, legalBallNumber: 76, outcome: 'Wd', runs: 0, extraRuns: 0, isWicket: false, isWide: true, isNoBall: false, commentary: 'Wide ball outside off stump (0 extra runs added under custom rule).', strikerName: 'Virat Kohli', bowlerName: 'Adam Zampa', timestamp: new Date(Date.now() - 4 * 60 * 1000) },
              { ballId: 'b_13_5', ballNumberInOver: 5, legalBallNumber: 76, outcome: '1', runs: 1, extraRuns: 0, isWicket: false, isWide: false, isNoBall: false, commentary: 'Zampa to Kohli, 1 run, tapped into the covers.', strikerName: 'Virat Kohli', bowlerName: 'Adam Zampa', timestamp: new Date(Date.now() - 3 * 60 * 1000) },
              { ballId: 'b_13_6', ballNumberInOver: 6, legalBallNumber: 77, outcome: '6', runs: 6, extraRuns: 0, isWicket: false, isWide: false, isNoBall: false, commentary: 'SIX! Pant deposits this clean into the deep mid-wicket terrace!', strikerName: 'Rishabh Pant', bowlerName: 'Adam Zampa', timestamp: new Date(Date.now() - 3 * 60 * 1000) }
            ]
          },
          {
            overNumber: 14,
            bowlerId: 'aus_8',
            bowlerName: 'Pat Cummins',
            runsInOver: 11,
            wicketsInOver: 0,
            balls: [
              { ballId: 'b_14_1', ballNumberInOver: 1, legalBallNumber: 79, outcome: '2', runs: 2, extraRuns: 0, isWicket: false, isWide: false, isNoBall: false, commentary: 'Cummins to Pant, 2 runs, nudged behind square.', strikerName: 'Rishabh Pant', bowlerName: 'Pat Cummins', timestamp: new Date(Date.now() - 2 * 60 * 1000) },
              { ballId: 'b_14_2', ballNumberInOver: 2, legalBallNumber: 80, outcome: '1', runs: 1, extraRuns: 0, isWicket: false, isWide: false, isNoBall: false, commentary: '1 run, guided towards backward point.', strikerName: 'Rishabh Pant', bowlerName: 'Pat Cummins', timestamp: new Date(Date.now() - 2 * 60 * 1000) },
              { ballId: 'b_14_3', ballNumberInOver: 3, legalBallNumber: 81, outcome: '4', runs: 4, extraRuns: 0, isWicket: false, isWide: false, isNoBall: false, commentary: 'FOUR! Vintage Kohli cover drive, pure perfection!', strikerName: 'Virat Kohli', bowlerName: 'Pat Cummins', timestamp: new Date(Date.now() - 90 * 1000) },
              { ballId: 'b_14_4', ballNumberInOver: 4, legalBallNumber: 82, outcome: '0', runs: 0, extraRuns: 0, isWicket: false, isWide: false, isNoBall: false, commentary: 'Dot ball, good bouncer by Cummins.', strikerName: 'Virat Kohli', bowlerName: 'Pat Cummins', timestamp: new Date(Date.now() - 75 * 1000) },
              { ballId: 'b_14_5', ballNumberInOver: 5, legalBallNumber: 83, outcome: '2', runs: 2, extraRuns: 0, isWicket: false, isWide: false, isNoBall: false, commentary: 'Kohli clips it off his pads for a comfortable brace.', strikerName: 'Virat Kohli', bowlerName: 'Pat Cummins', timestamp: new Date(Date.now() - 60 * 1000) },
              { ballId: 'b_14_6', ballNumberInOver: 6, legalBallNumber: 84, outcome: '2', runs: 2, extraRuns: 0, isWicket: false, isWide: false, isNoBall: false, commentary: 'Kohli punches through extra cover, keeps the strike.', strikerName: 'Virat Kohli', bowlerName: 'Pat Cummins', timestamp: new Date(Date.now() - 45 * 1000) }
            ]
          },
          {
            overNumber: 15,
            bowlerId: 'aus_4',
            bowlerName: 'Glenn Maxwell',
            runsInOver: 9,
            wicketsInOver: 0,
            balls: [
              { ballId: 'b_15_1', ballNumberInOver: 1, legalBallNumber: 85, outcome: 'Nb4', runs: 4, extraRuns: 0, isWicket: false, isWide: false, isNoBall: true, commentary: 'NO BALL! Oversteps, and Kohli punches it for FOUR! Free hit next ball.', strikerName: 'Virat Kohli', bowlerName: 'Glenn Maxwell', timestamp: new Date(Date.now() - 30 * 1000) },
              { ballId: 'b_15_2', ballNumberInOver: 2, legalBallNumber: 85, outcome: '4', runs: 4, extraRuns: 0, isWicket: false, isWide: false, isNoBall: false, commentary: 'FREE HIT! Kohli swings hard and dispatches it over mid-off for FOUR!', strikerName: 'Virat Kohli', bowlerName: 'Glenn Maxwell', timestamp: new Date(Date.now() - 20 * 1000) },
              { ballId: 'b_15_3', ballNumberInOver: 3, legalBallNumber: 86, outcome: '1', runs: 1, extraRuns: 0, isWicket: false, isWide: false, isNoBall: false, commentary: 'Maxwell to Kohli, 1 run, driven to long-on.', strikerName: 'Virat Kohli', bowlerName: 'Glenn Maxwell', timestamp: new Date(Date.now() - 10 * 1000) }
            ]
          }
        ],
        fallOfWickets: [
          { wicketNumber: 1, batsmanName: 'Rohit Sharma', score: 84, overs: 8.4 },
          { wicketNumber: 2, batsmanName: 'Suryakumar Yadav', score: 114, overs: 11.2 }
        ],
        partnership: { runs: 34, balls: 19 }
      }
    ],
    liveEvent: {
      type: 'FOUR',
      text: 'CRACKING FOUR! 🏏 Beautiful shot by Virat Kohli!',
      timestamp: new Date()
    }
  };

  // Also seed a completed match so the "Completed" archive tab has immediate content to show!
  const completedMatchData = {
    title: 'Semi-Final 1 - ICC Men’s T20 World Cup 2026',
    matchType: 'T20',
    totalOvers: 20,
    venue: 'Sydney Cricket Ground, Sydney',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'completed',
    statusNote: 'India won by 24 runs',
    scoringRule: { customWideNoBall: true },
    toss: {
      winner: 'team1',
      decision: 'bat',
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    team1: {
      name: 'India',
      shortName: 'IND',
      color: '#1e40af',
      logo: '🇮🇳',
      players: [
        { id: 'ind_c_1', name: 'Rohit Sharma', role: 'batter' },
        { id: 'ind_c_2', name: 'Virat Kohli', role: 'batter' },
        { id: 'ind_c_3', name: 'Jasprit Bumrah', role: 'bowler' }
      ]
    },
    team2: {
      name: 'England',
      shortName: 'ENG',
      color: '#dc2626',
      logo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      players: [
        { id: 'eng_c_1', name: 'Jos Buttler', role: 'wicketkeeper' },
        { id: 'eng_c_2', name: 'Phil Salt', role: 'batter' },
        { id: 'eng_c_3', name: 'Jofra Archer', role: 'bowler' }
      ]
    },
    currentInningsIndex: 1,
    innings: [
      {
        inningsNumber: 1,
        battingTeam: 'team1',
        bowlingTeam: 'team2',
        totalRuns: 192,
        totalWickets: 4,
        totalOvers: 20.0,
        legalBalls: 120,
        isCompleted: true,
        extras: { wides: 4, wideRuns: 0, noBalls: 0, noBallRuns: 0, byes: 1, legByes: 2, totalExtras: 7 },
        batsmen: [
          { playerId: 'ind_c_1', name: 'Rohit Sharma', runs: 76, balls: 42, fours: 7, sixes: 4, strikeRate: 180.95, isOut: true, dismissal: 'c Buttler b Archer', dismissalType: 'caught', battingOrder: 1 },
          { playerId: 'ind_c_2', name: 'Virat Kohli', runs: 82, balls: 54, fours: 8, sixes: 3, strikeRate: 151.85, isOut: false, dismissal: 'not out', dismissalType: 'not_out', battingOrder: 2 }
        ],
        bowlers: [
          { playerId: 'eng_c_3', name: 'Jofra Archer', overs: 4.0, legalBalls: 24, maidens: 0, runsConceded: 38, wickets: 2, economy: 9.50, noBalls: 0, wides: 1, isCurrentBowler: false }
        ],
        overs: [],
        fallOfWickets: [{ wicketNumber: 1, batsmanName: 'Rohit Sharma', score: 110, overs: 11.4 }]
      },
      {
        inningsNumber: 2,
        battingTeam: 'team2',
        bowlingTeam: 'team1',
        totalRuns: 168,
        totalWickets: 8,
        totalOvers: 20.0,
        legalBalls: 120,
        isCompleted: true,
        extras: { wides: 2, wideRuns: 0, noBalls: 1, noBallRuns: 2, byes: 0, legByes: 1, totalExtras: 5 },
        batsmen: [
          { playerId: 'eng_c_1', name: 'Jos Buttler', runs: 53, balls: 31, fours: 5, sixes: 2, strikeRate: 170.96, isOut: true, dismissal: 'b Bumrah', dismissalType: 'bowled', battingOrder: 1 },
          { playerId: 'eng_c_2', name: 'Phil Salt', runs: 34, balls: 22, fours: 4, sixes: 1, strikeRate: 154.54, isOut: true, dismissal: 'c Kohli b Bumrah', dismissalType: 'caught', battingOrder: 2 }
        ],
        bowlers: [
          { playerId: 'ind_c_3', name: 'Jasprit Bumrah', overs: 4.0, legalBalls: 24, maidens: 1, runsConceded: 19, wickets: 4, economy: 4.75, noBalls: 0, wides: 0, isCurrentBowler: false }
        ],
        overs: [],
        fallOfWickets: []
      }
    ]
  };

  await MatchStore.create(liveMatchData);
  await MatchStore.create(completedMatchData);
  console.log('[Seed] Sample matches created successfully.');
}

module.exports = { seedInitialMatch };
