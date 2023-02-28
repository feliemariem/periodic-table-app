const knex = require("../db/connection");

const tableName = "tables";

function create(newTable) {
    return knex(tableName).insert(newTable, "*");
}

function list() {
    return knex(tableName).select("*").orderBy("table_name");
}

function update(updatedTable, table) {
    return knex(tableName)
        .where({ table_id: table.table_id })
        .update({ reservation_id: updatedTable.reservation_id }, "*");
}

function updateReservationStatus(table, status) {
    return knex("reservations")
        .where({ reservation_id: table.reservation_id })
        .update({ status: status });
}

function read(reservationId) {
    return knex("reservations")
        .select("*")
        .where({ reservation_id: reservationId })
        .first();
}

function find(tableId) {
    return knex(tableName).select("*").where({ table_id: tableId }).first();
}

function remove(tableId) {
    return knex(tableName)
        .where({ table_id: tableId })
        .update({ reservation_id: null });
}

module.exports = {
    create,
    list,
    update,
    read,
    find,
    remove,
    updateReservationStatus,
};