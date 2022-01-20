const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true}))
app.use(cors());
app.options('*', cors());

const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 80;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, function () {
    console.log(`Listening on port: ${port}`);
});