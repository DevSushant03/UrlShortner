import express from "express";
import { ShortnerLink } from "./routes/routerShortner.js";
import { Authentication } from "./routes/Authentication.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT|| 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(ShortnerLink);
app.use(Authentication);
app.use(cookieParser())


app.set("view engine","ejs")
// app.set('views', import.meta.dirname + '/views');
// app.set("views","folder_name?")//if you are using diffrent folder name instant of "views" then you have to specific it.

app.listen(PORT, () => {
  console.log(`Server is running on  http://localhost:${PORT}`);
});
