import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { today } from "../utils/date-time";

import NotFound from "./NotFound";
import Dashboard from "../components/Dashboard";
import NewReservation from "../components/NewReservation";
import NewTable from "../components/NewTable";
import Seat from "../components/Seat";
import Search from "../components/Search";
import EditReservation from "../components/EditReservation";


/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
    return (
        <Switch>
            <Route exact={true} path="/">
                <Redirect to={"/dashboard"} />
            </Route>
            <Route exact={true} path="/reservations">
                <Redirect to={"/dashboard"} />
            </Route>
            <Route exact={true} path="/reservations/new">
                <NewReservation />
            </Route>
            <Route path="/dashboard">
                <Dashboard today={today()} />
            </Route>
            <Route path="/dashboard/:date">
                <Dashboard />
            </Route>
            <Route path="/tables/new">
                <NewTable />
            </Route>
            <Route exact={true} path="/reservations/:reservation_id/seat">
                <Seat />
            </Route>
            <Route exact={true} path="/search">
                <Search />
            </Route>
            <Route exact={true} path="/reservations/:reservation_id/edit">
                <EditReservation />
            </Route>
            <Route>
                <NotFound />
            </Route>
        </Switch>
    );
}

export default Routes;