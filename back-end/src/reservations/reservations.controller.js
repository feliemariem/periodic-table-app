const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

async function list(req, res, next) {
    const query = req.query.date || req.query.mobile_number;
    const data = await service.list(query);
    res.json({ data });
}

async function create(req, res, next) {
    const newReservation = await service.create(req.body.data);
    res.status(201).json({
        data: newReservation[0],
    });
}

async function edit(req, res, next) {
    const editedReservation = await service.edit(req.body.data);
    res.json({
        data: editedReservation[0],
    });
}

async function find(req, res, next) {
    const reservationId = req.params.reservation_id;
    const reservation = await service.find(reservationId);
    if (reservation[0]) {
        return res.json({ data: reservation[0] });
    }
    next({
        status: 404,
        message: `reservation ${reservationId} does not exist`,
    });
}

async function updateStatus(req, res, next) {
    const reservationId = req.params.reservation_id;
    const status = req.body.data.status;
    const updatedReservation = await service.updateStatus(
        reservationId,
        status
    );
    res.json({
        data: updatedReservation[0],
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

function hasFirstName(req, res, next) {
    const firstName = req.body.data.first_name;
    if (firstName) {
        return next();
    }
    next({
        status: 400,
        message: "data must have first_name property",
    });
}

function hasLastName(req, res, next) {
    const lastName = req.body.data.last_name;
    if (lastName) {
        return next();
    }
    next({
        status: 400,
        message: "data must have last_name property",
    });
}

function hasMobileNumber(req, res, next) {
    const mobileNumber = req.body.data.mobile_number;
    if (mobileNumber) {
        return next();
    }
    return next({
        status: 400,
        message: "data must have mobile_number property",
    });
}

function hasReservationDate(req, res, next) {
    const reservationDate = req.body.data.reservation_date;
    if (reservationDate) {
        if (validateReservationDate(reservationDate)) {
            return next();
        }
        next({
            status: 400,
            message: `reservation_date must be today or a future date and the restaurant is closed on Tuesday, ${reservationDate} is not a valid reservation date`,
        });
    }
    return next({
        status: 400,
        message: "data must have reservation_date property",
    });
}

function hasReservationTime(req, res, next) {
    const reservationTime = req.body.data.reservation_time;
    const reservationDate = req.body.data.reservation_date;
    if (reservationTime) {
        if (validateReservationTime(reservationTime, reservationDate)) {
            return next();
        }
        next({
            status: 400,
            message: `reservation_time must be a future time after 10:30am and prior to 9:30pm, ${reservationTime} is not a valid reservation time`,
        });
    }
    return next({
        status: 400,
        message: "data must have reservation_time property",
    });
}

function hasPeople(req, res, next) {
    const people = req.body.data.people;
    if (people) {
        if (validatePeople(people)) {
            return next();
        }
        next({
            status: 400,
            message: `${people} is not a valid entry for people`,
        });
    }
    return next({
        status: 400,
        message: "data must have people property",
    });
}

function hasValidStatus(req, res, next) {
    const status = req.body.data.status;
    if (status == "booked" || !status) {
        return next();
    }
    next({
        status: 400,
        message: "status cannot be seated or finished",
    });
}

async function hasReservationId(req, res, next) {
    const reservation = await service.find(req.params.reservation_id);
    if (reservation.length > 0) {
        return next();
    }
    next({
        status: 404,
        message: `reservation_id ${req.params.reservation_id} not found`,
    });
}

function validateMobileNumber(mobileNumber) {
    const numericMobileNumber = parseNumerals(mobileNumber);
    return (
        numericMobileNumber.length === 10 &&
        numericMobileNumber.match(/^[0-9]+$/) != null
    );
}

function validateReservationDate(reservationDate) {
    const todayParsedString = parseNumerals(
        new Date().toISOString().split("T")[0]
    );
    const reservationDateParsedString = parseNumerals(reservationDate);
    const isNotTuesday =
        toDate(reservationDate).toDateString().substring(0, 3) !== "Tue";
    return (
        reservationDateParsedString.length === 8 &&
        Number(reservationDateParsedString) >= Number(todayParsedString) &&
        isNotTuesday
    );
}

function validateReservationTime(reservationTime, reservationDate) {
    const reservationTimeParsedString = parseNumerals(reservationTime);
    reservationDate = new Date(reservationDate);
    reservationDate.setHours(reservationTimeParsedString.substring(0, 2));
    reservationDate.setMinutes(reservationTimeParsedString.substring(2, 4));
    const now = new Date();
    const openTime = new Date(reservationDate);
    openTime.setHours(10);
    openTime.setMinutes(30);
    openTime.setSeconds(0);
    const closeTime = new Date(reservationDate);
    closeTime.setHours(21);
    closeTime.setMinutes(30);
    closeTime.setSeconds(0);
    return (
        reservationDate >= openTime &&
        reservationDate <= closeTime &&
        reservationDate >= now
    );
}

function validatePeople(people) {
    return people && people > 0 && Number.isInteger(people);
}

function parseNumerals(string) {
    return string.replace(/\D/g, "");
}

function toDate(dateStr) {
    const [year, month, day] = dateStr.split("-");
    return new Date(year, month - 1, day);
}

async function validateStatus(req, res, next) {
    const reservation = await service.find(req.params.reservation_id);
    if (req.body.data.status !== "unknown") {
        if (
            reservation[0].status === "booked" ||
            reservation[0].status === "seated"
        ) {
            return next();
        }
        next({
            status: 400,
            message: `status ${reservation[0].status} cannot be updated`,
        });
    }
    next({
        status: 400,
        message: `status cannot be ${req.body.data.status}`,
    });
}

module.exports = {
    list: asyncErrorBoundary(list),
    find: asyncErrorBoundary(find),
    create: [
        hasData,
        hasFirstName,
        hasLastName,
        hasMobileNumber,
        hasReservationDate,
        hasReservationTime,
        hasPeople,
        hasValidStatus,
        asyncErrorBoundary(create),
    ],
    edit: [
        asyncErrorBoundary(hasReservationId),
        hasData,
        hasFirstName,
        hasLastName,
        hasMobileNumber,
        hasReservationDate,
        hasReservationTime,
        hasPeople,
        hasValidStatus,
        asyncErrorBoundary(edit),
    ],
    update: [
        asyncErrorBoundary(hasReservationId),
        asyncErrorBoundary(validateStatus),
        asyncErrorBoundary(updateStatus),
    ],
};