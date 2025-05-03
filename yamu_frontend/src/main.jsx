import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { UserProvider } from "./context/UserContext";
import AuthLoader from "./components/AuthLoader";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <AuthLoader>
        <App />
      </AuthLoader>
    </UserProvider>
  </React.StrictMode>
);
