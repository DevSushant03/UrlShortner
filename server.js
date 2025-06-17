import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import requestIp from "request-ip";

import { ShortnerLink } from "./routes/routerShortner.js";
import { Authentication } from "./routes/Authentication.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: true,
    saveUninitialized: false,
  })
);
app.use(flash());

app.use(requestIp.mw());

app.use(ShortnerLink);
app.use(Authentication);

app.set("view engine", "ejs");
// app.set('views', import.meta.dirname + '/views');
// app.set("views","folder_name?")//if you are using diffrent folder name instant of "views" then you have to specific it.

// app.listen(PORT, () => {
//   console.log(`Server is running on  http://localhost:${PORT}`);
// });

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on https://0.0.0.0:${PORT}`);
});
