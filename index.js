import express, { json } from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';
import initializeSocket from './socket/index.js';

const port = 3001; // Frontend port
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: `http://localhost:${port}`,
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    },
});

//socket.io event handlers
initializeSocket(io);

import registerRoute from './routes/registration.route.js';
import authRoute from './routes/authentication/authentication.route.js';
import authorizationRoute from './routes/authorization/authorization.route.js';
import homepageRoute from './routes/homepage_routes/homepage.route.js';
import profileRoute from './routes/user_routes/profile.route.js';
import followsRoute from './routes/user_routes/follows.route';


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: `http://localhost:${port}`,
    credentials: true,
}));


// sau này sửa đường dẫn tổng thì sẽ là http://localhost:3001/api/...
// dùng route, trong route sẽ xử lý authorization (done)
// server chỉ việc gọi route qua app.use("/api", sth here)
app.use("/api", registerRoute);
app.use("/api", authRoute);
app.use("/api", authorizationRoute);
app.use("/api", homepageRoute);
app.use("/api", profileRoute);
app.use("/api", followsRoute);

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
