import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import AuthLoader from "./components/AuthLoader";
import { UserProvider } from "./context/UserContext.jsx";
import { CurrencyProvider } from "./context/CurrencyContext.jsx";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <CurrencyProvider>
        <AuthLoader>
          <App />
        </AuthLoader>
      </CurrencyProvider>
    </UserProvider>
  </React.StrictMode>
);
