const express = require('express');
const cookieParser = require("cookie-parser");
const app = express();
const port = 3001;

const registerRoute = require('./routes/registration.route');
const authRoute = require('./routes/authentication/authentication.route');
const authorizationRoute = require('./routes/authorization/authorization.route');
const homepageRoute = require('./routes/homepage_routes/homepage.route');

app.use(express.json());
app.use(cookieParser());

// sau này sửa đường dẫn tổng thì sẽ là http://localhost:3001/api/...
// dùng route, trong route sẽ xử lý authorization (done)
// server chỉ việc gọi route qua app.use("/api", sth here)
app.use("/api", registerRoute);
app.use("/api", authRoute);
app.use("/api", authorizationRoute);
app.use("/api", homepageRoute);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
