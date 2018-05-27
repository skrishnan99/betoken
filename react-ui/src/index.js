import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import { init } from "./body";

init();

ReactDOM.render(<App />, document.getElementById("root"));