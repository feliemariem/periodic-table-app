import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { createReservation } from "../utils/api";

function NewReservation() {
    const history = useHistory();

    const initialFormState = {
        first_name: "",
        last_name: "",
        mobile_number: "",
        reservation_date: "",
        reservation_time: "",
        people: 1,
    };

    const [formData, setFormData] = useState(initialFormState);
    const [error, setError] = useState(null);

    function handleChange(e) {
        let value = e.target.value;
        if (e.target.name === "mobile_number") {
            const formatted = formatPhoneNumber(value);
            setFormData({
                ...formData,
                [e.target.name]: formatted,
            });
        } else if (e.target.name === "people") {
            value = Number(value);
            setFormData({
                ...formData,
                [e.target.name]: value,
            });
        } else {
            setFormData({
                ...formData,
                [e.target.name]: value,
            });
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const abortController = new AbortController();
            const response = await createReservation(
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

    function handleCancel() {
        history.push("/");
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

    return (
        <div className="container">
            <form
                className="d-grid gap-2 mb-2"
                onSubmit={(e) => handleSubmit(e)}
            >
                <h1>New Reservation</h1>
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
                        maxLength="8"
                        size="8"
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
                    className="btn btn-secondary"
                    onClick={() => handleCancel()}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

export default NewReservation;