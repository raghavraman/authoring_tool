var fs = require('fs')
var uuid = require('uuid/v1')

function parseJson(req, connection, cb) {
    let {domain, type, topic, scope, title, privacy, description, lines, distractorlines, blankLines} = {...req.body}
    let jsonFileName = uuid();
    let activityName = `${topic.toLowerCase()}.${title.toLowerCase().split(' ').join('_')}`
    lines = JSON.parse(lines);
    blankLines = JSON.parse(blankLines);
    let blankLineMapId = {}
    //if it is a challenge then fullWorkedOut flag = false.
    //it will be true in case of examples
    let fullyWorkedOut = (type === "example") ? true : false;
    let activityGoals = {
        "id": jsonFileName,
        "name": title,
        "language": domain,
        "activityName": activityName,
        "privacy": privacy,
        "scope": scope,
        "fileName": "BmiCalculator1.java",
        "goalDescription": description,
        "correctOutput": "Enter the weight in pounds:\nEnter the height in inches:\nThe BMI is: 22.140337616528093\n",
        "userInputList": [
            "125",
            "63"
        ],
        "userInput": "125 63",
        blankLineList: (blankLines.length > 0) ? blankLineList(blankLines, blankLineMapId) : [],
        lineList: code(lines, blankLineMapId),
        distractorList: (distractorlines.length > 0) ? otherLineList(distractorlines) : [],
        fullyWorkedOut: fullyWorkedOut
    }

    if (!fullyWorkedOut)
        activityGoals.alternatives = []

    if (type === "example") {
        insertExampleDb(req.body, activityName, connection, jsonFileName, activityGoals, (callback) => {
            if (callback) {
                createFile(req.body, jsonFileName, activityGoals, (fileRes) => {
                    console.log(fileRes);
                    cb(fileRes)
                });
            } else {
                cb({
                    code: 400,
                    message: "Error in creating example"
                })
            }
        });
    } else {
        insertChallengeDb(req.body, connection, jsonFileName, activityGoals, (callback) => {
            if (callback) {
                createFile(req.body, jsonFileName, activityGoals, (fileRes) => {
                    console.log(fileRes);
                    cb(fileRes)
                });
            } else {
                cb({
                    code: 400,
                    message: "Error in creating challenge"
                })
            }
        })
    }
}

function createFile(data, jsonFileName, activityGoals, cb) {
    fs.writeFile(`${data.domain.toUpperCase()}_${jsonFileName}.json`, JSON.stringify(activityGoals), 'utf-8', function (err, res) {
            if (err) {
                response = {
                    code: 400,
                    message: "Error in writing json to file"
                }
                cb(response)
            } else {
                response = {
                    code: 200,
                    message: "Success"
                }
                cb(response)
            }
        }
    )
}

function code(lines, blankLineMapId) {
    let exampleArr = []
    for (let i = 0; i < lines.length; i++) {
        exampleArr.push({
            id: blankLineMapId[i + 1] || uuid(),
            number: i + 1,
            content: lines[i].code,
            commentList: lines[i].commentList || [],
            indentLevel: ((lines[i].code.match(/\t/g)) || []).length
        })
    }
    return exampleArr;
}

function otherLineList(lines) {
    let exampleArr = []
    for (let i = 0; i < lines.length; i++) {
        exampleArr[i] = {}
        exampleArr[i].id = uuid();
        exampleArr[i].line = {
            id: uuid(),
            number: lines[i].lineNumber,
            content: lines[i].code,
            commentList: lines[i].commentList || [""],
            indentLevel: ((lines[i].code.match(/\t/g)) || []).length
        }
        exampleArr[i]["helpList"] = [lines[i].helpList || ""];
    }
    return exampleArr;
}

function blankLineList(lines, blankLineMapId) {
    let exampleArr = []
    for (let i = 0; i < lines.length; i++) {
        exampleArr[i] = {}
        exampleArr[i].id = uuid();
        exampleArr[i].line = {
            number: lines[i].lineNumber,
            content: lines[i].code,
            commentList: lines[i].commentList || [""],
            indentLevel: ((lines[i].code.match(/\t/g)) || []).length
        }
        exampleArr[i].line.id = uuid()
        blankLineMapId[lines[i].lineNumber] = exampleArr[i].line.id
        exampleArr[i]["helpList"] = [lines[i].helpList || ""];
    }
    return exampleArr;
}

function insertExampleDb(data, activityName, connection, jsonFileName, activityGoals, cb) {
    let activityId = uuid();
    let sql = "insert into activity(id,name,userId,language) values(?,?,?,?)";
    connection.query(sql, [activityId, activityName, data.userId, data.domain], function (err, activityRes) {
        if (err) {
            console.log("error in inserting in activity table", err)
            return cb(false)
        } else {
            let sql = "insert into challenge_authoring(id, activityId, title,language, filename, storagePath, type, scope, topic, description, privacy, userId,code) values (?,?,?,?,?,?,?,?,?,?,?,?,?)"
            connection.query(sql, [jsonFileName, activityId, data.title, data.domain, "filename.java", __dirname + "/" + jsonFileName, data.type, data.scope, data.topic, data.description, data.privacy, data.userId, JSON.stringify(activityGoals)], function (err, res) {
                if (err) {
                    cb(false)
                    console.log("error in inserting in challeneg authority table", err)
                } else {
                    cb(true)
                }
            })
        }
    })
}

function insertChallengeDb(data, connection, jsonFileName, activityGoals, cb) {
    let activityId = data.activityId;
    let sql = "insert into challenge_authoring(id, activityId, title, language, filename, storagePath, type, scope, topic, description, privacy, userId,code) values (?,?,?,?,?,?,?,?,?,?,?,?,?)"
    connection.query(sql, [jsonFileName, activityId, data.title, data.domain, "filename.java", __dirname + "/" + jsonFileName, data.type, data.scope, data.topic, data.description, data.privacy, data.userId, JSON.stringify(activityGoals)], function (err, res) {
        if (err) {
            cb(false)
        } else {
            cb(true)
        }
    })
}

module.exports.parseJson = parseJson;