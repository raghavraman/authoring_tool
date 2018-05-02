var shell = require('shelljs');
var fs = require('fs');

function indentCode(req, cb) {
    let language = req.body.language
    if (language.toUpperCase() === "PYTHON") {
        indentPython(req, cb);
    } else {
        indentJava(req, cb)
    }
}

function indentPython(req, cb) {
    let {code, activityId} = req.body
    fs.writeFile(activityId + ".py", code, "utf-8", (err, res) => {
        if (err) {
            cb({
                code: 400,
                message: "Error in indenting"
            })
        } else {
            let final = shell.exec("autopep8 --in-place --aggressive --aggressive " + activityId + ".py");
            fs.readFile(activityId + ".py", "utf-8", (err, res) => {
                    if (err) {
                        fs.unlinkSync(activityId + ".py")
                        cb({
                            code: 400,
                            message: "Error in indenting"
                        })
                    } else {
                        fs.unlinkSync(activityId + ".py")
                        cb({
                            code: 200,
                            data: res
                        })
                    }
                }
            )
        }
    })
}

function indentJava(req, cb) {
    let {code, activityId} = req.body
    fs.writeFile(activityId + ".java", code, 'utf-8', (err, res) => {
        if (err) {
            cb({
                code: 400,
                message: "Error in indenting"
            })
        }
        else {
            let final = shell.exec("java -jar modules/beautify-java.jar " + activityId + ".java", {silent: true})
            fs.unlinkSync(activityId + ".java")
            cb({
                code: 200,
                data: final
            })
        }
    })
}


module.exports.indentCode = indentCode