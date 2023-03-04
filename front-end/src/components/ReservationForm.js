import React from "react";
import { useHistory } from "react-router-dom";

export const ReservationForm = ({
  reservation,
  changeHandler,
  submitHandler,
}) => {
  const history = useHistory();

  return (
    <div className="container">
         <div className="container"></div>
      <form onSubmit={submitHandler}>
        <fieldset>
        <div className="form-group">
            <label htmlFor="first_name">First Name:</label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              className="form-control"
              required={true}
              value={reservation.first_name}
              maxLength="100"
              onChange={changeHandler}
            />
          </div>
          <div className="form-group">
            <label htmlFor="last_name">Last Name:</label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              className="form-control"
              required={true}
              value={reservation.last_name}
              maxLength="100"
              onChange={changeHandler}
              
            />
          </div>
          <div className="form-group">
            <label htmlFor="mobile_number">Mobile Number:</label>
            <input
              id="mobile_number"
              name="mobile_number"
              className="form-control"
              type="text"
              maxLength="14"
              size="14"
              required={true}
              value={reservation.mobile_number}
              onChange={changeHandler}
            />
          </div>
          <div className="form-group">
            <label htmlFor="reservation_date">Date of Reservation:</label>
            <input
              id="reservation_date"
              name="reservation_date"
              type="date"
              className="form-control"
              placeholder="YYYY-MM-DD"
              pattern="\d{4}-\d{2}-\d{2}"
              required={true}
              value={reservation.reservation_date}
              maxLength="8"
              size="8"
              onChange={changeHandler}
            />
          </div>
          <div className="form-group">
            <label htmlFor="reservation_time">Time of Reservation:</label>
            <input
              id="reservation_time"
              name="reservation_time"
              className="form-control"
              type="time"
              placeholder="HH:MM"
              pattern="[0-9]{2}:[0-9]{2}"
              required={true}
              value={reservation.reservation_time}
              step="300"
              onChange={changeHandler}
            />
          </div>
          <div className="form-group">
            <label htmlFor="people">People:</label>
            <input
              id="people"
              name="people"
              className="form-control"
              type="number"
              required={true}
              value={reservation.people}
              min={1}
              onChange={changeHandler}
            />
          </div>
          <div className="group-row">
          <button className="btn1 btn-primary" type="submit">
                    Submit
                </button>
            <button
              className="btn1 btn-secondary"
              type="button"
              onClick={() => history.goBack()}
            >
              Cancel
            </button>
           
          </div>
        </fieldset>
      </form>
    </div>
  )
};

export default ReservationForm;
