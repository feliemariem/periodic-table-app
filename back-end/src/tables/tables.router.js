const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./tables.controller");

router
    .route("/:table_id/seat")
    .get(controller.list)
    .put(controller.update)
    .delete(controller.remove)
    .all(methodNotAllowed);

router.route("/new").post(controller.create).all(methodNotAllowed);

router
    .route("/")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

module.exports = router;