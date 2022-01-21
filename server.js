const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const webpush = require('web-push');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true}))
app.use(cors());
app.options('*', cors());

const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 80;

let factsArr = [];
fs.readFile("facts.json", function (err, data) {
  var jsonData = data;
  var facts = JSON.parse(jsonData);
  facts.data.forEach(obj => factsArr.push({fact: obj.fact}))
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/facts", function (req, res) {
    res.json(factsArr);
});

app.post("/api/facts", async function (req, res) {
    var id = req.body.id;
    var fact = req.body.fact

    console.log(id);
    console.log(fact);

    factsArr.push({fact: fact});
    console.log(factsArr);
    
    await sendPushNotifications({id: id, fact: fact});
    res.json({id: id});
});

let subscriptions = [];
var publicKey = "BPblsso_Fx85SIvFmxDHkkIUDCaGSyt_tELJJwvCnpaPUKgQabcYdrwDAqg4_1Iqp3ynpa_r1FWiJXB53gCVU08";
var privateKey = "Tn_EqbaskteUgstzbI5DeF-9UEWLJ5nwfYYUnUfD-bs";

app.post("/subscribe", function (req, res) {
    var sub = req.body.sub;
    subscriptions.push(sub);

    res.sendStatus(200);
});

async function sendPushNotifications(factObj) {
    webpush.setVapidDetails("mailto:petar@gmail.com", publicKey, privateKey);
    subscriptions.forEach(async sub => {
        try {
            console.log(`notif to ${sub}`);
            await webpush.sendNotification(sub, JSON.stringify({
                title: 'New fact added',
                body: `id: ${factObj.id}, fact: ${factObj.fact}`,
            }));    
        } catch(error) {
            console.error(error);
        }
    });
}

app.listen(port, function () {
    console.log(`listening on port: ${port}`);
});