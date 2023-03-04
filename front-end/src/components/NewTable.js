import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function NewTable() {
    const history = useHistory();
    const [error, setError] = useState(null);

    const initialFormData = {
        table_name: "",
        capacity: "",
    };

    const [formData, setFormData] = useState(initialFormData);

    const handleInput = (e) => {
        const value = e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value,
        });
    };

    async function handleSubmit(e) {
        e.preventDefault();
        const newFormData = {...formData, capacity:Number(formData.capacity)}
        try {
            const abortController = new AbortController();
            const response = await createTable(
                newFormData,
                abortController.signal
            );
            history.push(`/`);
            return response;
        } catch (error) {
            setError(error);
            console.error(error);
        }
    }

    const handleCancel = () => {
        history.goBack();
    };

    return (
        <div className="container">
            <form
                className="d-grid gap-2 mb-2"
                onSubmit={(e) => handleSubmit(e)}
            >
                <h1>New Table</h1>
                <ErrorAlert error={error} />
                <div className="form-group">
                    <label>Table Name:</label>
                    <input
                        id="table_name"
                        name="table_name"
                        className="form-control"
                        onChange={(e) => handleInput(e)}
                        type="text"
                        value={formData.table_name}
                        min="2"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Capacity:</label>
                    <input
                        id="capacity"
                        name="capacity"
                        className="form-control"
                        onChange={(e) => handleInput(e)}
                        type="number"
                        value={formData.capacity}
                        min="1"
                        required
                    />
                </div>
                <button className="btn1 btn-primary" type="submit">
                    Submit
                </button>
                <button
                    className="btn1 btn-secondary"
                    onClick={() => handleCancel()}
                >
                    Cancel
                </button>
            </form>
            </div>
        
    );
}

export default NewTable;