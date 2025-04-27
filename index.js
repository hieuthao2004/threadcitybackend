import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import initializeSocket from './socket/index.js';

import registerRoute from './routes/registration.route.js';
import authRoute from './routes/authentication/authentication.route.js';
import authorizationRoute from './routes/authorization/authorization.route.js';
import homepageRoute from './routes/homepage_routes/homepage.route.js';
import profileRoute from './routes/user_routes/profile.route.js';
import followsRoute from './routes/user_routes/follows.route.js';
import passwordResetRoute from './routes/authentication/passwordReset.route.js';

const port = 3001;
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: `http://localhost:${port}`,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Initialize socket events
initializeSocket(io);

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: `http://localhost:5173`,
  credentials: true,
}));

// API Routes
app.use('/api', registerRoute);
app.use('/api', authRoute);
app.use('/api', authorizationRoute);
app.use('/api', homepageRoute);
app.use('/api', profileRoute);
app.use('/api', followsRoute);
app.use("/api", passwordResetRoute);

// Start server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
