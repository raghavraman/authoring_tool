function editSetOrder(req,activityId, connection, cb) {
    let sql = "select id,title,type,activityId,language,position from challenge_authoring where activityId = ? order by position";
    connection.query(sql, [activityId], function (err, res) {
        if (err) {
            cb({
                code: 400,
                message: "Error in getting order of activities"
            })
        } else {
            if (res.length === 0) {
                let response = {
                    code: 204,
                    message: "No examples created by the user yet",
                    data: res
                }
                return cb(response)
            }
            let obj = {}
            for(let i in res) {
                if(!obj[res[i].type]){
                    obj[res[i].type] = []
                }
                obj[res[i].type].push(res[i])
            }
            let response = {
                code: 200,
                data: obj
            }
            return cb(response)
        }
    })
}

module.exports.editSetOrder = editSetOrder
