import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
    updateReservationStatus,
    findReservation,
    updateTable,
    listTables,
} from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function Seat() {
    const history = useHistory();
    const { reservation_id } = useParams();
    const [tables, setTables] = useState([]);
    const [table, setTable] = useState();
    const [error, setError] = useState(null);

    useEffect(() => {
        const abortController = new AbortController();
        async function loadSeat() {
            try {
                setError(null);
                const response = await listTables(abortController.signal);
                setTables(response);
            } catch (error) {
                setError(error);
                console.error(error);
            }
        }
        loadSeat();
        return () => {
            abortController.abort();
        };
    }, []);

    const tableOptions = tables.map((table) => {
        if (!table.reservation_id) {
            return (
                <option key={table.table_id} value={table.table_name}>
                    {table.table_name} - {table.capacity}
                </option>
            );
        } else {
            return (
                <option key={table.table_id} value={table.table_name} disabled>
                    {table.table_name} - {table.capacity} - Occupied
                </option>
            );
        }
    });

    function handleChange(e) {
        const value = e.target.value;
        if (value !== "select a table") {
            const result = tables.find((table) => table.table_name === value);
            setTable(result);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (table) {
            try {
                const abortController = new AbortController();
                const response = await updateTable(
                    { ...table, reservation_id: reservation_id },
                    abortController.signal
                );
                history.push(`/`);
                const reservation = await findReservation(
                    reservation_id,
                    abortController.signal
                );
                await updateReservationStatus(
                    reservation,
                    "seated",
                    abortController.signal
                );
                return response;
            } catch (error) {
                setError(error);
                console.error(error);
            }
        }
    }

    async function handleCancel(e) {
        e.preventDefault();
        history.goBack();
    }

    if (tables) {
        return (
            <div className="container d-grid gap-2">
                <h4>Seating for Reservation</h4>
                <ErrorAlert error={error} />
                <form
                    className="d-grid gap-2"
                    onSubmit={(e) => handleSubmit(e)}
                >
                    <select
                        id="table_id"
                        name="table_id"
                        className="form-control"
                        value={table ? table.table_name : "tables"}
                        onChange={(e) => handleChange(e)}
                    >
                        <option value="select a table">Select a Table</option>
                        {tableOptions}
                    </select>
                    <button type="submit" className="btn btn-light">
                        Submit
                    </button>
                    <button
                        type="cancel"
                        className="btn btn-light mb-2"
                        onClick={(e) => handleCancel(e)}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        );
    } else {
        return null;
    }
}

export default Seat;