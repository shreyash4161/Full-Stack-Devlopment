import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import { ListingsProvider } from "./context/ListingsContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ListingsProvider>
        <App />
        <Toaster
          position="bottom-center"
          toastOptions={{
            className: "toast-custom",
            duration: 3000,
            style: {
              background: "#002f34",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "14px",
            },
          }}
        />
      </ListingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
