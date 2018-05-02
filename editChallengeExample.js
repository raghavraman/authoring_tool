var fs = require('fs')
var uuid = require('uuid/v1')

function editChallengeExample(req, connection, cb) {
    let {language, lines, distractorlines, blankLines, activityId} = {...req.body}
    let sql = "update challenge_authoring set code = ? where id = ?"
    fs.readFile(`${language.toUpperCase()}_${activityId}.json`, 'utf-8', function (err, res) {
        if (err) {
            cb(false)
        } else {
            res = JSON.parse(res)
            res.blankLineList = (blankLines.length > 0) ? blankLineList(blankLines, blankLineMapId) : []
            res.lineList = code(lines, blankLineMapId)
            res.distractorList = (distractorlines.length > 0) ? otherLineList(distractorlines) : []
            connection.query(sql, [JSON.stringify(res), activityId], function (err, res) {
                if (err) {
                    cb(false)
                } else {
                    fs.writeFile(`${language}_${activityId}.json`, JSON.stringify(res), 'utf-8', function (err, res) {
                        if (err)
                            cb(false)
                        else
                            cb(true)
                    })
                }
            })
        }
    })
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

module.exports.editChallengeExample = editChallengeExample;