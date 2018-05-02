function getActivityNames(userId, connection, cb) {
    let sql = "select id,name from activity where userId = ?"
    connection.query(sql, [userId], function (err, res) {
        if (err) {
            console.log(err)
        } else {
            let response = {
                code: (res.length === 0) ? 204 : 200,
                data: res
            }
            cb(response)
        }
    })
}

module.exports.getActivityNames = getActivityNames;