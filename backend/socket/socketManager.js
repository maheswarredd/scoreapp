let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    // console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join room for specific match
    socket.on('join_match', (matchId) => {
      socket.join(`match_${matchId}`);
      // console.log(`[Socket.io] Client ${socket.id} joined match_${matchId}`);
    });

    // Leave match room
    socket.on('leave_match', (matchId) => {
      socket.leave(`match_${matchId}`);
      // console.log(`[Socket.io] Client ${socket.id} left match_${matchId}`);
    });

    socket.on('disconnect', () => {
      // console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized yet!');
  }
  return ioInstance;
}

function broadcastMatchUpdate(matchId, matchData) {
  if (ioInstance) {
    // Broadcast to specific room
    ioInstance.to(`match_${matchId}`).emit('match_updated', matchData);
    // Also broadcast to general list listeners
    ioInstance.emit('matches_list_updated', {
      _id: matchData._id,
      title: matchData.title,
      status: matchData.status,
      statusNote: matchData.statusNote,
      innings: matchData.innings,
      currentInningsIndex: matchData.currentInningsIndex,
      team1: matchData.team1,
      team2: matchData.team2,
      liveEvent: matchData.liveEvent
    });
  }
}

function broadcastLiveEvent(matchId, eventData) {
  if (ioInstance) {
    ioInstance.to(`match_${matchId}`).emit('live_event', eventData);
  }
}

module.exports = {
  initSocket,
  getIO,
  broadcastMatchUpdate,
  broadcastLiveEvent
};
