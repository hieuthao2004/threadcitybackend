import express, { json } from 'express';
import cookieParser from "cookie-parser";
const app = express();
const port = 3001;

import registerRoute from './routes/registration.route.js';
import authRoute from './routes/authentication/authentication.route.js';
import authorizationRoute from './routes/authorization/authorization.route.js';
import homepageRoute from './routes/homepage_routes/homepage.route.js';
import profileRoute from './routes/user_routes/profile.route.js';

app.use(express.json());
app.use(cookieParser());

// sau này sửa đường dẫn tổng thì sẽ là http://localhost:3001/api/...
// dùng route, trong route sẽ xử lý authorization (done)
// server chỉ việc gọi route qua app.use("/api", sth here)
app.use("/api", registerRoute);
app.use("/api", authRoute);
app.use("/api", authorizationRoute);
app.use("/api", homepageRoute);
app.use("/api", profileRoute);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
