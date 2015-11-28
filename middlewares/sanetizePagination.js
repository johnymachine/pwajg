'use strict'
module.exports = {
    sanetizePagination: function(req, res, next) { //order=desc; page=1; size=10
        var validOrders = {
            desc: "desc",
            asc: "asc"
        };
        res.locals.order = validOrders[req.query.order] || "desc";
        res.locals.page = Number(req.query.page) || 1;
        res.locals.size = Number(req.query.size) || 10;
        return next();
    }
}
