'use strict'
module.exports = {
    sanetizePagination: function(req, res, next) { //order=asc; page=1; size=20
        var validOrders = {
            desc: "desc",
            asc: "asc"
        };
        res.locals.order = validOrders[req.query.order] || "asc";
        res.locals.page = Number(req.query.page) || 1;
        res.locals.size = Number(req.query.size) || 20;
        return next();
    }
}
