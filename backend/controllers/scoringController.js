const { MatchStore } = require('../data/store');
const { broadcastMatchUpdate, broadcastLiveEvent } = require('../socket/socketManager');
const { v4: uuidv4 } = require('uuid');

// Calculate over string (e.g. 15.2 from total legal balls 92)
function calculateOverString(legalBalls) {
  const overs = Math.floor(legalBalls / 6);
  const balls = legalBalls % 6;
  return Number(`${overs}.${balls}`);
}

// Format dismissal text
function getDismissalText(type, bowlerName, fielderName) {
  switch (type) {
    case 'bowled':
      return `b ${bowlerName}`;
    case 'caught':
      return fielderName ? `c ${fielderName} b ${bowlerName}` : `c & b ${bowlerName}`;
    case 'lbw':
      return `lbw b ${bowlerName}`;
    case 'run_out':
      return fielderName ? `run out (${fielderName})` : 'run out';
    case 'stumped':
      return fielderName ? `st ${fielderName} b ${bowlerName}` : `st b ${bowlerName}`;
    case 'hit_wicket':
      return `hit wicket b ${bowlerName}`;
    default:
      return 'out';
  }
}

// Record a delivery / ball
const recordBall = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      strikerId,
      nonStrikerId,
      bowlerId,
      runs = 0, // runs scored (off bat / ran)
      isWide = false,
      isNoBall = false,
      isBye = false,
      isLegBye = false,
      isWicket = false,
      wicketDetail = null, // { dismissalType, fielderName, outBatsmanId, newBatsmanId }
      customCommentary = ''
    } = req.body;

    const match = await MatchStore.getById(id);
    if (!match) {
      return res.status(404).json({ success: false, message: 'Match not found' });
    }

    if (match.status !== 'live') {
      return res.status(400).json({ success: false, message: `Cannot score when match is in ${match.status} state` });
    }

    const inningsIndex = match.currentInningsIndex || 0;
    const innings = match.innings[inningsIndex];
    if (!innings) {
      return res.status(400).json({ success: false, message: 'Active innings not found' });
    }
    // Identify current striker and non-striker
  const striker = innings.batsmen.find(
    b => b.playerId === (
    strikerId ||
    innings.batsmen.find(x => x.isCurrentStriker)?.playerId
   )
   );

  const nonStriker = innings.batsmen.find(
    b => b.playerId === (
     nonStrikerId ||
      innings.batsmen.find(x => x.isCurrentNonStriker)?.playerId
     )
    );

  // IMPORTANT:
   // Backend controls the active bowler.
   // Do NOT allow a different bowler on every ball.
  const currentBowler = innings.bowlers.find(
   b => b.isCurrentBowler
   );

  if (!currentBowler) {
   return res.status(400).json({
    success: false,
    message: 'Over completed. Please select the next bowler.'
    });
    }

  // If a bowler was sent from frontend, it MUST match
  // the bowler already active for this over.
  if (bowlerId && bowlerId !== currentBowler.playerId) {
   return res.status(400).json({
    success: false,
    message: 'Bowler cannot be changed until the over is completed.'
   });
   }

 const bowler = currentBowler;

  if (!striker || !bowler) {
    return res.status(400).json({
    success: false,
    message: 'Striker and Bowler must be selected'
   });
   }
    

    // Determine legal delivery
    const isIllegal = isWide || isNoBall;
    const runsNum = Number(runs) || 0;

    // CUSTOM RULE:
    // "wd and no ball is added but score not include it was shown only overs and no ball any runs is their added run only"
    // Under custom rule, penalty for Wd/Nb = 0. Only runs scored (runsNum) are added to score.
    const customRuleActive = match.scoringRule?.customWideNoBall !== false;

    let scoreToAdd = 0;
    let extraRuns = 0;
    let bowlerRunsConceded = 0;
    let batRuns = 0;

    if (customRuleActive) {
      // Custom rule: 0 penalty. Only the runs scored (if any) are added.
      scoreToAdd = runsNum;
      batRuns = (!isWide && !isBye && !isLegBye) ? runsNum : 0;
      bowlerRunsConceded = (!isBye && !isLegBye) ? runsNum : 0;
      extraRuns = (isBye || isLegBye || isWide) ? runsNum : 0;
    } else {
      // Standard cricket rule (if custom rule turned off)
      const penalty = isIllegal ? 1 : 0;
      scoreToAdd = runsNum + penalty;
      batRuns = (!isWide && !isBye && !isLegBye) ? runsNum : 0;
      bowlerRunsConceded = (isWide || isNoBall) ? (runsNum + 1) : (!isBye && !isLegBye ? runsNum : 0);
      extraRuns = (isWide || isNoBall) ? 1 : (isBye || isLegBye ? runsNum : 0);
    }

    // 1. Update Match Total Runs
    innings.totalRuns += scoreToAdd;

    // 2. Extras tracking
    if (isWide) {
      innings.extras.wides += 1;
      innings.extras.wideRuns += (customRuleActive ? runsNum : (runsNum + 1));
      bowler.wides = (bowler.wides || 0) + 1;
    }
    if (isNoBall) {
      innings.extras.noBalls += 1;
      innings.extras.noBallRuns += (customRuleActive ? runsNum : (runsNum + 1));
      bowler.noBalls = (bowler.noBalls || 0) + 1;
    }
    if (isBye) innings.extras.byes += runsNum;
    if (isLegBye) innings.extras.legByes += runsNum;
    innings.extras.totalExtras = innings.extras.wideRuns + innings.extras.noBallRuns + innings.extras.byes + innings.extras.legByes;

    // 3. Update Striker Stats (balls faced increments on legal ball or no-ball, not wide)
    if (!isWide) {
      striker.balls += 1;
    }
    striker.runs += batRuns;
    if (batRuns === 4) striker.fours += 1;
    if (batRuns === 6) striker.sixes += 1;
    striker.strikeRate = striker.balls > 0 ? Number(((striker.runs / striker.balls) * 100).toFixed(2)) : 0;

    // 4. Update Bowler Stats
    bowler.runsConceded += bowlerRunsConceded;
    if (!isIllegal) {
      bowler.legalBalls += 1;
      bowler.overs = calculateOverString(bowler.legalBalls);
    }
    const bowlerTotalOversFloat = bowler.legalBalls / 6;
    bowler.economy = bowlerTotalOversFloat > 0 ? Number((bowler.runsConceded / bowlerTotalOversFloat).toFixed(2)) : 0;

    // 5. Update Innings Legal Balls & Overs
    if (!isIllegal) {
      innings.legalBalls += 1;
      innings.totalOvers = calculateOverString(innings.legalBalls);
    }

    // 6. Build Ball Outcome Tag
    let ballOutcome = `${runsNum}`;
    if (isWicket) {
      ballOutcome = 'W';
    } else if (isWide) {
      ballOutcome = runsNum > 0 ? `Wd+${runsNum}` : 'Wd';
    } else if (isNoBall) {
      ballOutcome = runsNum > 0 ? `Nb+${runsNum}` : 'Nb';
    } else if (isLegBye) {
      ballOutcome = `Lb${runsNum}`;
    } else if (isBye) {
      ballOutcome = `B${runsNum}`;
    }

    // 7. Manage Over Container
    let currentOver = innings.overs[innings.overs.length - 1];
    const isNewOver = !currentOver || (currentOver.balls.filter(b => !b.isWide && !b.isNoBall).length >= 6);

    if (isNewOver) {
      const overNum = innings.overs.length + 1;
      currentOver = {
        overNumber: overNum,
        bowlerId: bowler.playerId,
        bowlerName: bowler.name,
        runsInOver: 0,
        wicketsInOver: 0,
        balls: []
      };
      innings.overs.push(currentOver);
    }

    currentOver.runsInOver += scoreToAdd;
    if (isWicket) currentOver.wicketsInOver += 1;

    // Build Commentary line
    let commentaryLine = customCommentary;
    if (!commentaryLine) {
      if (isWicket) {
        commentaryLine = `OUT! ${striker.name} departs!`;
      } else if (runsNum === 6) {
        commentaryLine = `SIX! ${striker.name} launches it high and handsome over the boundary rope!`;
      } else if (runsNum === 4) {
        commentaryLine = `FOUR! Glorious stroke by ${striker.name}, finds the gap to perfection!`;
      } else if (isWide) {
        commentaryLine = `Wide ball from ${bowler.name}. Fired well outside the tramlines.`;
      } else if (isNoBall) {
        commentaryLine = `No ball called! ${bowler.name} oversteps the crease.`;
      } else if (runsNum === 1) {
        commentaryLine = `${bowler.name} to ${striker.name}, 1 run taken, worked into the gap.`;
      } else if (runsNum === 0) {
        commentaryLine = `No run. Dot ball, solid defense by ${striker.name}.`;
      } else {
        commentaryLine = `${bowler.name} to ${striker.name}, ${runsNum} runs.`;
      }
    }

    const ballRecord = {
      ballId: uuidv4(),
      ballNumberInOver: currentOver.balls.length + 1,
      legalBallNumber: innings.legalBalls,
      outcome: ballOutcome,
      runs: scoreToAdd,
      extraRuns,
      isWicket,
      wicketDetail: isWicket ? {
        batsmanName: striker.name,
        dismissalType: wicketDetail?.dismissalType || 'bowled',
        fielderName: wicketDetail?.fielderName || '',
        bowlerName: bowler.name
      } : null,
      isWide,
      isNoBall,
      isBye,
      isLegBye,
      commentary: commentaryLine,
      strikerName: striker.name,
      nonStrikerName: nonStriker ? nonStriker.name : '',
      bowlerName: bowler.name,
      timestamp: new Date()
    };

    currentOver.balls.push(ballRecord);

    // 8. Handle Wickets & Fall of Wicket
    let outBatsmanName = striker.name;
    if (isWicket) {
      innings.totalWickets += 1;
      const dismissalType = wicketDetail?.dismissalType || 'bowled';
      const fielderName = wicketDetail?.fielderName || '';
      const dismissalText = getDismissalText(dismissalType, bowler.name, fielderName);

      const outBatsman = (wicketDetail?.outBatsmanId && innings.batsmen.find(b => b.playerId === wicketDetail.outBatsmanId)) || striker;
      outBatsman.isOut = true;
      outBatsman.dismissal = dismissalText;
      outBatsman.dismissalType = dismissalType;
      outBatsman.bowlerId = bowler.playerId;
      outBatsman.fielderName = fielderName;
      outBatsman.isCurrentStriker = false;
      outBatsmanName = outBatsman.name;

      if (dismissalType !== 'run_out') {
        bowler.wickets += 1;
      }

      // Record Fall of Wicket
      innings.fallOfWickets.push({
        wicketNumber: innings.totalWickets,
        batsmanName: outBatsman.name,
        score: innings.totalRuns,
        overs: calculateOverString(innings.legalBalls)
      });

      // New batsman coming in
      if (wicketDetail?.newBatsmanId) {
        const newBatsman = innings.batsmen.find(b => b.playerId === wicketDetail.newBatsmanId);
        if (newBatsman) {
          if (outBatsman.playerId === striker.playerId) {
            newBatsman.isCurrentStriker = true;
          } else if (nonStriker && outBatsman.playerId === nonStriker.playerId) {
            newBatsman.isCurrentNonStriker = true;
          }
        }
      }
    }

    // 9. Strike Rotation
    // Odd runs scored off the bat or ran swaps strike
    const ranRuns = isWide ? (customRuleActive ? runsNum : 0) : runsNum;
    let shouldSwapEnds = (ranRuns % 2 === 1);

    // Check if over is completed (6 legal balls in current over)
    const legalBallsInCurrentOver = currentOver.balls.filter(b => !b.isWide && !b.isNoBall).length;
    let isOverCompleted = false;

    if (legalBallsInCurrentOver >= 6) {
      isOverCompleted = true;
      // Over ends -> Swap strike ends for next over
      shouldSwapEnds = !shouldSwapEnds;
      // Bowler finished their over
      bowler.isCurrentBowler = false;
    }

    if (shouldSwapEnds && nonStriker && !isWicket) {
      striker.isCurrentStriker = false;
      striker.isCurrentNonStriker = true;
      nonStriker.isCurrentStriker = true;
      nonStriker.isCurrentNonStriker = false;
    }

    // 10. Animation / Live Event triggers
    let liveEventType = 'NONE';
    let liveEventText = '';

    if (isWicket) {
      liveEventType = 'WICKET';
      liveEventText = `WICKET! ${outBatsmanName} is OUT!`;
    } else if (batRuns === 6) {
      liveEventType = 'SIX';
      liveEventText = `MASSIVE SIX! 🔥 ${striker.name} smashes it!`;
    } else if (batRuns === 4) {
      liveEventType = 'FOUR';
      liveEventText = `CRACKING FOUR! 🏏 Beautiful shot by ${striker.name}!`;
    } else if (isNoBall) {
      liveEventType = 'NO_BALL';
      liveEventText = `NO BALL! 🚨 Free Hit incoming!`;
    } else if (isWide) {
      liveEventType = 'WIDE';
      liveEventText = `WIDE BALL! ⚡`;
    } else if (isOverCompleted) {
      liveEventType = 'OVER';
      liveEventText = `End of Over ${currentOver.overNumber} (${currentOver.runsInOver} runs)`;
    }

    match.liveEvent = {
      type: liveEventType,
      text: liveEventText,
      timestamp: new Date()
    };

    // 11. Match Completion / Innings Transition Check
    const totalOversLimit = match.totalOvers || 20;
    const maxWickets = Math.min(10, innings.batsmen.length - 1);
    const isInningsOver = (innings.legalBalls >= totalOversLimit * 6) || (innings.totalWickets >= maxWickets);

    if (inningsIndex === 0) {
      // First Innings
      if (isInningsOver) {
        innings.isCompleted = true;
        const target = innings.totalRuns + 1;
        match.status = 'innings_break';
        match.statusNote = `Innings break: Target is ${target} runs`;
      }
    } else if (inningsIndex === 1) {
      // Second Innings
      const firstInnings = match.innings[0];
      const target = firstInnings ? firstInnings.totalRuns + 1 : 0;

      if (target > 0 && innings.totalRuns >= target) {
        // Chasing team won!
        innings.isCompleted = true;
        match.status = 'completed';
        const battingTeamName = innings.battingTeam === 'team1' ? match.team1.name : match.team2.name;
        const wicketsRemaining = (match.team1.players.length || 11) - innings.totalWickets;
        match.statusNote = `${battingTeamName} won by ${wicketsRemaining} wickets!`;
      } else if (isInningsOver) {
        // Second innings completed without reaching target
        innings.isCompleted = true;
        match.status = 'completed';
        const defendingTeamName = innings.bowlingTeam === 'team1' ? match.team1.name : match.team2.name;
        if (innings.totalRuns === (target - 1)) {
          match.statusNote = `Match Tied!`;
        } else {
          const runMargin = target - 1 - innings.totalRuns;
          match.statusNote = `${defendingTeamName} won by ${runMargin} runs!`;
        }
      }
    }

    const updatedMatch = await MatchStore.update(id, match);

    // Broadcast updates to all live clients!
    broadcastMatchUpdate(id, updatedMatch);
    if (liveEventType !== 'NONE') {
      broadcastLiveEvent(id, match.liveEvent);
    }

    return res.json({
      success: true,
      match: updatedMatch,
      ball: ballRecord,
      isOverCompleted
    });
  } catch (err) {
    console.error('Error recording ball:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Switch Batsmen / Bowler Selection
const setCreasePlayers = async (req, res) => {
  try {
    const { id } = req.params;
    const { strikerId, nonStrikerId, bowlerId } = req.body;

    const match = await MatchStore.getById(id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    const innings = match.innings[match.currentInningsIndex || 0];
    if (!innings) return res.status(400).json({ success: false, message: 'Innings not found' });

    if (strikerId || nonStrikerId) {
      innings.batsmen.forEach(b => {
        b.isCurrentStriker = (b.playerId === strikerId);
        b.isCurrentNonStriker = (b.playerId === nonStrikerId);
      });
    }

    if (bowlerId) {
      innings.bowlers.forEach(b => {
        b.isCurrentBowler = (b.playerId === bowlerId);
      });
    }

    const updated = await MatchStore.update(id, match);
    broadcastMatchUpdate(id, updated);
    return res.json({ success: true, match: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Start Second Innings
const startSecondInnings = async (req, res) => {
  try {
    const { id } = req.params;
    const { strikerId, nonStrikerId, bowlerId } = req.body;

    const match = await MatchStore.getById(id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    if (match.innings.length < 1) return res.status(400).json({ success: false, message: 'Innings 1 does not exist' });

    const inn1 = match.innings[0];
    inn1.isCompleted = true;

    // Swap batting and bowling teams for Innings 2
    const battingTeamKey = inn1.bowlingTeam;
    const bowlingTeamKey = inn1.battingTeam;

    const battingSquad = battingTeamKey === 'team1' ? match.team1.players : match.team2.players;
    const bowlingSquad = bowlingTeamKey === 'team1' ? match.team1.players : match.team2.players;

    const { createEmptyInnings } = require('./matchController');
    // Helper inline
    const inn2 = {
      inningsNumber: 2,
      battingTeam: battingTeamKey,
      bowlingTeam: bowlingTeamKey,
      totalRuns: 0,
      totalWickets: 0,
      totalOvers: 0,
      legalBalls: 0,
      isCompleted: false,
      extras: { wides: 0, wideRuns: 0, noBalls: 0, noBallRuns: 0, byes: 0, legByes: 0, totalExtras: 0 },
      batsmen: battingSquad.map((p, idx) => ({
        playerId: p.id || `p_inn2_${idx}`,
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
        isCurrentStriker: (p.id === strikerId) || (idx === 0 && !strikerId),
        isCurrentNonStriker: (p.id === nonStrikerId) || (idx === 1 && !nonStrikerId)
      })),
      bowlers: bowlingSquad.map((p, idx) => ({
        playerId: p.id || `p_bowl2_${idx}`,
        name: p.name,
        overs: 0,
        legalBalls: 0,
        maidens: 0,
        runsConceded: 0,
        wickets: 0,
        economy: 0,
        noBalls: 0,
        wides: 0,
        isCurrentBowler: (p.id === bowlerId) || (idx === 0 && !bowlerId)
      })),
      overs: [],
      fallOfWickets: [],
      partnership: { runs: 0, balls: 0 }
    };

    match.innings.push(inn2);
    match.currentInningsIndex = 1;
    match.status = 'live';
    const target = inn1.totalRuns + 1;
    const battingTeamName = battingTeamKey === 'team1' ? match.team1.name : match.team2.name;
    match.statusNote = `${battingTeamName} need ${target} runs to win`;

    const updated = await MatchStore.update(id, match);
    broadcastMatchUpdate(id, updated);
    return res.json({ success: true, match: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// End Match Manually
const endMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { resultNote } = req.body;

    const match = await MatchStore.getById(id);
    if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

    match.status = 'completed';
    if (resultNote) match.statusNote = resultNote;
    if (match.innings[match.currentInningsIndex]) {
      match.innings[match.currentInningsIndex].isCompleted = true;
    }

    const updated = await MatchStore.update(id, match);
    broadcastMatchUpdate(id, updated);
    return res.json({ success: true, match: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  recordBall,
  setCreasePlayers,
  startSecondInnings,
  endMatch
};
