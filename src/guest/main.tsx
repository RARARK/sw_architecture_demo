import React from "react";
import { createRoot } from "react-dom/client";
import { GuestAccessApp } from "./GuestAccessApp";
import "./guest.css";

createRoot(document.getElementById("guest-root")!).render(
  <React.StrictMode>
    <GuestAccessApp />
  </React.StrictMode>
);
