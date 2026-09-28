const express = require('express');
const router = express.Router();
const {
  getMatches,
  getMatchById,
  createMatch,
  conductToss,
  startMatchLive,
  updateMatch,
  deleteMatch
} = require('../controllers/matchController');
const {
  recordBall,
  setCreasePlayers,
  startSecondInnings,
  endMatch
} = require('../controllers/scoringController');
const { verifyAdminToken } = require('../controllers/authController');

// Public match routes
router.get('/', getMatches);
router.get('/:id', getMatchById);

// Admin-protected match management routes
router.post('/', verifyAdminToken, createMatch);
router.put('/:id', verifyAdminToken, updateMatch);
router.delete('/:id', verifyAdminToken, deleteMatch);
router.post('/:id/toss', verifyAdminToken, conductToss);
router.post('/:id/start-live', verifyAdminToken, startMatchLive);

// Scoring routes
router.post('/:id/score-ball', verifyAdminToken, recordBall);
router.post('/:id/set-crease', verifyAdminToken, setCreasePlayers);
router.post('/:id/start-second-innings', verifyAdminToken, startSecondInnings);
router.post('/:id/end-match', verifyAdminToken, endMatch);

module.exports = router;
