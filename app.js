const express = require("express");
const path = require("path");
const { Pool } = require("pg");
require("dotenv").config();
const app = express();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use("/node_modules", express.static("node_modules"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const indexRouter = require("./routes/index");
app.use("/", indexRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`* Server running on http://localhost:${port}`);
});
