const express = require("express");
const app = express();
const cors = require("cors");
const router = require("./routes/index");
const passport = require("./middlewares/passport");
const session = require("cookie-session");
const port = process.env.PORT || 5050;

app.use(
  session({
    name: "kas-E-cookie",
    keys: ["secretAja", "secretkedua"],
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", router);
app.use((error, req, res, next) => {
  console.log("This is the rejected field ->", error.field);
});
app.get("/", (req, res) => {
  res.json({
    message: "server running in",
    serverTime: new Date(),
  });
});
app.get("*", (req, res) => {
  res.status(404).send("Page Not Found");
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
