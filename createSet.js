const fs = require('fs')
const async = require('async/times')

function createSet(req, connection, cb) {
    let ids = req.body.id;
    let activityId = req.body.activityId
    let json = {
        "id": activityId,
        "language": "",
        "activityName": "",
        "activityGoals": []
    }
    let sql = "select * from activity where id = ? limit 1"
    connection.query(sql, [activityId], function (err, res) {
        if (err) {
            cb({
                code: 400,
                message: "Error in creating set"
            })
        } else {
            json.language = res[0].language.toUpperCase();
            json.activityName = res[0].name
            let counter = 0;
            async(ids.length, (id, next) => {         
                let folderPath = "./"
                let sql = "update challenge_authoring set position = ? where id = ?"
                counter += 1;
                connection.query(sql, [counter, ids[id]], function (err, res) {
                    if (err) {
                        console.log(err);
                        next();
                    } else {
                        fs.readFile(`${folderPath}/${json.language}_${[ids[id]]}.json`, 'utf-8', function (err, fileData) {
                            if (err) {
                                console.log(err)
                                next();
                            } else {
                                json.activityGoals.push(JSON.parse(fileData))
                                next();
                            }
                        })
                    }
                })                    
            }, function () {
                fs.writeFile(`${json.language}_${json.activityName}.json`, JSON.stringify(json), 'utf-8', function (err, res) {
                    if (err) {
                        cb({
                            code: 400,
                            message: "Error in creating set"
                        })
                    } else {
                        cb({
                            code: 200,
                            message: "Set successfully created"
                        })
                    }
                })
            })
        }
    })
}

module.exports.createSet = createSet;