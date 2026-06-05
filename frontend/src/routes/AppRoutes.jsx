import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Verify from "../pages/Verify";

import Variants from "../pages/Variants";
import BatchRegistration from "../pages/BatchRegistration";
import Settings from "../pages/Settings";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/verify/:serialNumber"
          element={<Verify />}
        />

        <Route
          path="/variants"
          element={<Variants />}
        />

        <Route
          path="/batches"
          element={<BatchRegistration />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;