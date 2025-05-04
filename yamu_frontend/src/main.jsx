import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import AuthLoader from "./components/AuthLoader";
import { UserProvider } from "./context/UserContext.jsx";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <AuthLoader>
        <App />
      </AuthLoader>
    </UserProvider>
  </React.StrictMode>
);
