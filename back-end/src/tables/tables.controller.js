const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res, next) {
    const response = await service.list();
    return res.json({
        data: response,
    });
}

async function create(req, res, next) {
    const data = req.body.data;
    const response = await service.create(data);
    console.log(response[0]);
    return res.status(201).json({
        data: response[0],
    });
}

async function update(req, res, next) {
    const table = res.locals.table;
    const data = req.body.data;
    Object.keys(data).forEach((key, i) => {
        table[key] = Object.values(data)[i];
    });
    const response = await service.update(data, table);
    if (res.locals.reservation.status === "booked") {
        await service.updateReservationStatus(response[0], "seated");
    }
    if (res.locals.reservation.status === "seated") {
        next({
            status: 400,
            message: "status cannot be updated from seated",
        });
    }
    return res.json({
        data: response[0],
    });
}

async function remove(req, res, next) {
    const tableId = req.params.table_id;
    const response = await service.remove(tableId);
    await service.updateReservationStatus(res.locals.table, "finished");
    res.status(200).json({
        data: response[0],
    });
}

function hasData(req, res, next) {
    if (req.body.data) {
        return next();
    }
    next({
        status: 400,
        message: "body must have data property",
    });
}

async function tableIdExists(req, res, next) {
    const table = await service.find(req.params.table_id);
    if (table) {
        res.locals.table = table;
        return next();
    }
    next({
        status: 404,
        message: `${req.params.table_id} not found`,
    });
}

function hasReservationId(req, res, next) {
    const reservationId = req.body.data.reservation_id;
    if (reservationId) {
        res.locals.reservationId = reservationId;
        return next();
    }
    next({
        status: 400,
        message: "body must have reservation_id property",
    });
}

function hasTableName(req, res, next) {
    const tableName = req.body.data.table_name;
    if (tableName) {
        if (validateTableName(tableName)) {
            return next();
        }
        next({
            status: 400,
            message: `${tableName} is not a valid table_name`,
        });
    }
    next({
        status: 400,
        message: "data must have table_name property",
    });
}

function hasCapacity(req, res, next) {
    const capacity = req.body.data.capacity;
    if (capacity) {
        if (validateCapacity(capacity)) {
            return next();
        }
        next({
            status: 400,
            message: `${capacity} is not a valid capacity`,
        });
    }
    next({
        status: 400,
        message: "data must have capacity property",
    });
}

async function tableIsOccupied(req, res, next) {
    if (!res.locals.table.reservation_id) {
        return next();
    }
    next({
        status: 400,
        message: `table is occupied`,
    });
}

function tableIsNotOccupied(req, res, next) {
    if (res.locals.table.reservation_id) {
        return next();
    }
    next({
        status: 400,
        message: `table is not occupied`,
    });
}

async function hasSufficientCapacity(req, res, next) {
    const table = await service.find(req.params.table_id);
    if (table) {
        res.locals.table = table;
        if (Number(table.capacity) >= Number(res.locals.reservation.people)) {
            return next();
        }
        next({
            status: 400,
            message: `table does not have sufficient capacity for reservation ${res.locals.reservationId}`,
        });
    }
    next({
        status: 400,
        message: `table does not have sufficient data`,
    });
}

async function reservationExists(req, res, next) {
    const reservation = await service.read(res.locals.reservationId);
    if (reservation) {
        res.locals.reservation = reservation;
        return next();
    }
    next({
        status: 404,
        message: `reservation ${res.locals.reservationId} does not exist`,
    });
}

function validateTableName(tableName) {
    return tableName.length !== 1;
}

function validateCapacity(capacity) {
    return capacity > 0;
}

module.exports = {
    create: [hasData, hasTableName, hasCapacity, asyncErrorBoundary(create)],
    update: [
        hasData,
        hasReservationId,
        asyncErrorBoundary(reservationExists),
        asyncErrorBoundary(hasSufficientCapacity),
        tableIsOccupied,
        asyncErrorBoundary(update),
    ],
    list: [asyncErrorBoundary(list)],
    remove: [
        asyncErrorBoundary(tableIdExists),
        tableIsNotOccupied,
        asyncErrorBoundary(remove),
    ],
};