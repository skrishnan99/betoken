import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import { init } from "./body";

// TODO: Add error handling. If errored nothing will render on screen.
init(start);

function start(){
    ReactDOM.render(<App />, document.getElementById("root"));
}