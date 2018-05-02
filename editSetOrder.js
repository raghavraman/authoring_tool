function editSetOrder(req, connection, cb) {
    var activityId = req.body.activityId
    let sql = "select id,title,activityId from challenge_authoring where activityId = ? order by position";
    connection.query(sql, [activityId], function (err, res) {
        if (err) {
            cb({
                code: 400,
                message: "Error in getting order of activities"
            })
        } else {
            cb({
                code: 200,
                data: res
            })
            console.log(res);
        }
    })
}

module.exports.editSetOrder = editSetOrder