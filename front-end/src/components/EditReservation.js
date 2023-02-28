import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { editReservation, findReservation } from "../utils/api";

function EditReservation() {
    const history = useHistory();
    const { reservation_id } = useParams();
    const [formData, setFormData] = useState();
    const [error, setError] = useState(null);

    useEffect(() => {
        const abortController = new AbortController();
        async function loadEditReservation() {
            try {
                setError(null);
                const response = await findReservation(
                    reservation_id,
                    abortController.signal
                );
                const thisDate = response.reservation_date.split("T")[0];
                setFormData({
                    ...response,
                    reservation_date: thisDate,
                });
            } catch (error) {
                setError(error);
                console.error(error);
            }
        }
        loadEditReservation();
        return () => {
            abortController.abort();
        };
    }, [reservation_id]);

    function handleChange(e) {
        let value = e.target.value;
        if (e.target.name === "mobile_number") {
            const formatted = formatPhoneNumber(value);
            return setFormData({
                ...formData,
                [e.target.name]: formatted,
            });
        } else if (e.target.name === "people") {
            value = Number(value);
            return setFormData({
                ...formData,
                [e.target.name]: value,
            });
        } else {
            return setFormData({
                ...formData,
                [e.target.name]: value,
            });
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const abortController = new AbortController();
            const response = await editReservation(
                { ...formData },
                abortController.signal
            );
            history.push(`/dashboard?date=${formData.reservation_date}`);
            return response;
        } catch (error) {
            setError(error);
            console.error(error);
        }
    }

    function formatPhoneNumber(value) {
        if (!value) return value;
        const phoneNumber = value.replace(/[^\d]/g, "");
        const phoneNumberLength = phoneNumber.length;
        if (phoneNumberLength < 4) return phoneNumber;
        if (phoneNumberLength < 7) {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        }
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
            3,
            6
        )}-${phoneNumber.slice(6, 10)}`;
    }

    function handleCancel(e) {
        e.preventDefault();
        history.goBack();
    }

    if (formData) {
        if (formData.reservation_date) {
            return (
                <div className="container">
                    <form
                        className="d-grid gap-2 mb-2"
                        onSubmit={(e) => handleSubmit(e)}
                    >
                        <h1>Edit Reservation</h1>
                        <ErrorAlert error={error} />
                        <div className="form-group">
                            <label>First Name:</label>
                            <input
                                id="first_name"
                                name="first_name"
                                className="form-control"
                                onChange={(e) => handleChange(e)}
                                type="text"
                                value={formData.first_name}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name:</label>
                            <input
                                id="last_name"
                                name="last_name"
                                className="form-control"
                                onChange={(e) => handleChange(e)}
                                type="text"
                                value={formData.last_name}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Mobile Number:</label>
                            <input
                                id="mobile_number"
                                name="mobile_number"
                                className="form-control"
                                onChange={(e) => handleChange(e)}
                                type="text"
                                maxLength="14"
                                size="14"
                                value={formData.mobile_number}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Date of Reservation:</label>
                            <input
                                id="reservation_date"
                                name="reservation_date"
                                className="form-control"
                                onChange={(e) => handleChange(e)}
                                type="date"
                                value={formData.reservation_date}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Time of Reservation:</label>
                            <input
                                id="reservation_time"
                                name="reservation_time"
                                className="form-control"
                                onChange={(e) => handleChange(e)}
                                type="time"
                                value={formData.reservation_time}
                                step="300"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>People:</label>
                            <input
                                id="people"
                                name="people"
                                className="form-control"
                                onChange={(e) => handleChange(e)}
                                type="number"
                                value={formData.people}
                                required
                            />
                        </div>
                        <button className="btn btn-primary" type="submit">
                            Submit
                        </button>
                        <button
                            data-reservation-id-cancel={formData.reservation_id}
                            className="btn btn-secondary"
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
    } else {
        return null;
    }
}

export default EditReservation;