require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
require('./models/Match'); // register the Mongoose model (needed when MongoDB is used)
const { initSocket } = require('./socket/socketManager');
const matchRoutes = require('./routes/matchRoutes');
const authRoutes = require('./routes/authRoutes');
const { seedInitialMatch } = require('./data/seed');
const { resumePendingTosses } = require('./controllers/matchController');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// ---- CORS -------------------------------------------------------------
// CLIENT_URL can be one URL or a comma separated list. Leave it empty (or '*')
// to allow any origin. When the frontend is served by this same server
// (single deployment) CORS is not needed at all.
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, ''))
  .filter((s) => s && s !== '*');

const corsOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
    return callback(null, true);
  }
  return callback(null, false);
};

const io = new Server(server, {
  cors: { origin: corsOrigin, methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});
initSocket(io);

app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ---- API routes -------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date(),
    service: 'CREX Score API & Live Engine'
  });
});

app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// ---- Serve the built React app (single-service deployment) ------------
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(path.join(distPath, 'index.html'))) {
  app.use(express.static(distPath));
  // SPA fallback so refreshing /match/:id or /admin/... never 404s
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log('[Static] Serving frontend from frontend/dist');
} else {
  app.get('/', (req, res) => {
    res.json({ status: 'online', message: 'CREX Score API is running. Frontend build not found.' });
  });
}

// Never let a stray error kill the process
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[Error]', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});
process.on('unhandledRejection', (reason) => console.error('[UnhandledRejection]', reason));

// ---- Start ------------------------------------------------------------
const startServer = async () => {
  await connectDB();
  await seedInitialMatch();
  await resumePendingTosses();

  if (isProd) {
    if (!process.env.JWT_SECRET) console.warn('[Security] JWT_SECRET is not set - using an insecure default. Set it in your host environment settings!');
    if (!process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD_HASH) console.warn('[Security] ADMIN_PASSWORD is not set - using the default "admin123". Change it now!');
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`===============================================`);
    console.log(`🚀 CREX Live Score Server running on port ${PORT}`);
    console.log(`📡 WebSocket Engine active`);
    console.log(`🔑 Admin Auth configured`);
    console.log(`🌐 Ready for frontend connections`);
    console.log(`===============================================`);
  });
};

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
