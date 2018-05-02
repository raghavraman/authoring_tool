const express = require('express')
var mysql = require('mysql');
var cors = require('cors')
const app = express()
var bodyParser = require('body-parser')
var parseJson = require('./parseJson')
var activityNames = require('./getActivityNames')
var createSet = require('./createSet')
var getExampleChallenge = require('./getExampleChallenge')
var indentCode = require('./indentCode')
var editChallengeExample = require('./editChallengeExample')
var editSetOrder = require('./editSetOrder')
app.use(bodyParser.json())
app.use(cors())

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'authoring_tool'
});

connection.connect();

app.post('/create', (req, res) => {
    parseJson.parseJson(req, connection, (response) => {
        res.send(response)
    })
})

app.post('/edit', (req, res) => {
    editChallengeExample.editChallengeExample(req, connection, (response) => {
        res.send(response)
    })
})

app.post('/editsetorder', (req, res) => {
    editSetOrder.editSetOrder(req, connection, (response) => {
        res.send(response)
    })
})

app.get('/getactivitynames/:userId', (req, res) => {
    let userId = req.params.userId;
    if (userId.trim().length === 0) {
        res.send({
            code: 400,
            message: "Invalid userid"
        })
    }
    else {
        activityNames.getActivityNames(userId, connection, (response) => {
            res.send(response)
        })
    }
})

app.post('/createset', (req, res) => {
    createSet.createSet(req, connection, (response) => {
        res.send(response)
    })
})

app.get('/getexamplechallengelist/:activityId', (req, res) => {
    let activityId = req.params.activityId;
    if (activityId.trim().length === 0) {
        res.send({
            code: 400,
            message: "Invalid activityId"
        })
    } else {
        getExampleChallenge.getExampleChallenge(activityId, connection, (response) => {
            res.send(response)
        })
    }
})

app.post('/indentCode', (req, res) => {
    indentCode.indentCode(req, (response) => {
        res.send(response)
    })
})

app.listen(3000, () => console.log('Listening on port 3000!'))