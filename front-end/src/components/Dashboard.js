import React, { useEffect, useState } from "react";
import { Link, useLocation, useHistory } from "react-router-dom";
import {
    listReservations,
    listTables,
    finishTable,
    updateReservationStatus,
} from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function Dashboard({ today }) {
    const history = useHistory();
    const query = new URLSearchParams(useLocation().search);
    const date = query.get("date");
    const [selectedDate, setSelectedDate] = useState(date || today);
    const [reservations, setReservations] = useState([]);
    const [tables, setTables] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const abortController = new AbortController();
        async function loadDashboard() {
            try {
                setError(null);
                const response = await listReservations(
                    { selectedDate },
                    abortController.signal
                );
                setReservations(response);
            } catch (error) {
                setError(error);
                console.error(error);
            }
            try {
                setError(null);
                const response = await listTables(abortController.signal);
                setTables(response);
            } catch (error) {
                setError(error);
                console.error(error);
            }
        }
        loadDashboard();
        return () => {
            abortController.abort();
        };
    }, [selectedDate]);

    function handleChange(e) {
        let value = e.target.value;
        setSelectedDate(value);
    }

    function handlePrevious() {
        const asDate = new Date(selectedDate);
        const previousDate = new Date(asDate.setDate(asDate.getDate() - 1));
        const previousDateString = previousDate.toISOString().split("T")[0];
        setSelectedDate(previousDateString);
    }

    function handleNext() {
        const asDate = new Date(selectedDate);
        const nextDate = new Date(asDate.setDate(asDate.getDate() + 1));
        const nextDateString = nextDate.toISOString().split("T")[0];
        setSelectedDate(nextDateString);
    }

    function handleCurrent() {
        const currentDate = new Date();
        const currentDateString = currentDate.toISOString().split("T")[0];
        setSelectedDate(currentDateString);
    }

    function simpleTimeFormat(time) {
        let hour = +time.substr(0, 2);
        let newHour = hour % 12 || 12;
        let meridiem = hour < 12 || hour === 24 ? "am" : "pm";
        return `${newHour}${time.substr(2, 3)} ${meridiem}`;
    }

    function tableStatus(reservation_id) {
        return reservation_id ? "Occupied" : "Free";
    }

    async function finish(table) {
        const abortController = new AbortController();
        try {
            if (
                window.confirm(
                    `Is this table ready to seat new guests? This cannot be undone.`
                )
            ) {
                const response = await finishTable(
                    table,
                    abortController.signal
                );
                history.go(0);
                return response;
            }
        } catch (error) {
            setError(error);
            console.error(error);
        }
    }

    function showFinishButton(table, reservationId) {
        if (reservationId) {
            return (
                <button
                    className="btn btn-light btn-sm"
                    data-table-id-finish={table.table_id}
                    onClick={() => finish(table)}
                >
                    Finish
                </button>
            );
        }
        return (
            <button
                className="btn btn-light btn-sm"
                data-table-id-finish={table.table_id}
                disabled
            >
                Empty
            </button>
        );
    }

    function reservationStatus(reservation) {
        if (reservation.status === "booked") {
            return (
                <Link
                    to={{
                        pathname: `/reservations/${reservation.reservation_id}/seat`,
                        state: {
                            tables: tables,
                        },
                    }}
                    type="button"
                    className="btn btn-light btn-sm"
                >
                    Seat
                </Link>
            );
        }
        return null;
    }

    function editReservation(reservation) {
        if (reservation.status === "booked") {
            return (
                <Link
                    to={{
                        pathname: `/reservations/${reservation.reservation_id}/edit`,
                        state: {
                            date: reservation.reservation_date,
                        },
                    }}
                    type="button"
                    className="btn btn-light btn-sm"
                >
                    Edit
                </Link>
            );
        }
        return null;
    }

    function cancelButton(reservation) {
        if (reservation.status === "booked") {
            return (
                <td data-reservation-id-cancel={reservation.reservation_id}>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() => cancelReservation(reservation)}
                    >
                        Cancel
                    </button>
                </td>
            );
        }
        return <td></td>;
    }

    async function cancelReservation(reservation) {
        try {
            if (
                window.confirm(
                    `Do you want to cancel this reservation? This cannot be undone.`
                )
            ) {
                const abortController = new AbortController();
                const response = await updateReservationStatus(
                    reservation,
                    "cancelled",
                    abortController.signal
                );
                history.go(0);
                return response;
            }
        } catch (error) {
            setError(error);
            console.error(error);
        }
    }

    const reservationRows = reservations.map((reservation) => {
        return (
            <tr
                className="text-truncate"
                style={{ height: "48px" }}
                key={reservation.reservation_id}
            >
                <th className="d-none d-md-table-cell" scope="row">
                    {reservation.reservation_id}
                </th>
                <td>
                    {reservation.first_name} {reservation.last_name}
                </td>
                <td className="d-none d-md-table-cell">
                    {reservation.mobile_number}
                </td>
                <td>{simpleTimeFormat(reservation.reservation_time)}</td>
                <td className="d-none d-md-table-cell">{reservation.people}</td>
                <td
                    className="d-none d-md-table-cell"
                    data-reservation-id-status={`${reservation.reservation_id}`}
                >
                    {reservation.status}
                </td>
                <td>{reservationStatus(reservation)}</td>
                <td className="d-none d-md-table-cell">
                    {editReservation(reservation)}
                </td>
                {cancelButton(reservation)}
            </tr>
        );
    });

    const tableRows = tables.map((table) => (
        <tr
            className="text-truncate"
            style={{ height: "48px" }}
            key={table.table_id}
        >
            <th className="d-none d-md-table-cell" scope="row">
                {table.table_id}
            </th>
            <td>{table.table_name}</td>
            <td>{table.capacity}</td>
            <td className="d-none d-md-table-cell" data-table-id-status={table.table_id}>
                {tableStatus(table.reservation_id)}
            </td>
            <td>{showFinishButton(table, table.reservation_id)}</td>
        </tr>
    ));

    return (
        <main>
            <div className="container">
                <div className="d-grid gap-2 mb-2">
                    <h1>Dashboard</h1>
                    <ErrorAlert error={error} />
                    <h4>Reservations</h4>
                    <div className="form-group">
                        <label>Date:</label>
                        <input
                            id="date"
                            name="date"
                            className="form-control"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => handleChange(e)}
                            required
                        />
                    </div>
                    <div className="btn-group">
                        <button
                            type="button"
                            className="btn btn-outline-light"
                            onClick={() => handlePrevious()}
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-light"
                            onClick={() => handleCurrent()}
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-light"
                            onClick={() => handleNext()}
                        >
                            Next
                        </button>
                    </div>
                    <table className="table table-striped table-dark align-middle">
                        <thead>
                            <tr>
                                <th
                                    className="d-none d-md-table-cell"
                                    scope="col"
                                >
                                    #
                                </th>
                                <th scope="col">Name</th>
                                <th
                                    className="d-none d-md-table-cell"
                                    scope="col"
                                >
                                    Phone
                                </th>
                                <th scope="col">Time</th>
                                <th
                                    className="d-none d-md-table-cell"
                                    scope="col"
                                >
                                    Party
                                </th>
                                <th
                                    className="d-none d-md-table-cell"
                                    scope="col"
                                >
                                    Status
                                </th>
                                <th scope="col">Seat</th>
                                <th
                                    className="d-none d-md-table-cell"
                                    scope="col"
                                >
                                    Edit
                                </th>
                                <th scope="col">Cancel</th>
                            </tr>
                        </thead>
                        <tbody>{reservationRows}</tbody>
                    </table>
                    <h4>Tables</h4>
                    <table className="table table-striped table-dark align-middle">
                        <thead>
                            <tr>
                                <th
                                    className="d-none d-md-table-cell"
                                    scope="col"
                                >
                                    #
                                </th>
                                <th scope="col">Name</th>
                                <th scope="col">Capacity</th>
                                <th
                                    className="d-none d-md-table-cell"
                                    scope="col"
                                >
                                    Occupied
                                </th>
                                <th scope="col">Finish</th>
                            </tr>
                        </thead>
                        <tbody>{tableRows}</tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}

export default Dashboard;