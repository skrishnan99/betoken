import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import { init } from "./body";

// TODO: Add error handling. If errored nothing will render on screen.

ReactDOM.render(<h1>LOADING!!</h1>, document.getElementById("root"));

init(start);

function start(flag, errMessage) {
  if (flag == 0) {
    //Normal
    ReactDOM.render(<App />, document.getElementById("root"));
  } else {
    //Errored
    ReactDOM.render(
      <div>
        <h1>Errored, Please make sure to unlock your metamask account</h1>
        <p>Error:{errMessage}</p>
        <App />
      </div>,
      document.getElementById("root")
    );
  }
}
