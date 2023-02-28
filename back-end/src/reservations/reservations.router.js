const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./reservations.controller");

router
    .route("/")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

router.route("/new").post(controller.create).all(methodNotAllowed);

router
    .route("/:reservation_id")
    .get(controller.find)
    .put(controller.edit)
    .all(methodNotAllowed);

router
    .route("/:reservation_id/status")
    .put(controller.update)
    .all(methodNotAllowed);

router
    .route("/:reservation_id/edit")
    .put(controller.edit)
    .all(methodNotAllowed);

module.exports = router;