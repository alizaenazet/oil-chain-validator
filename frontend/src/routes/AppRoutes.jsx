import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Verify from "../pages/Verify";

import Variants from "../pages/Variants";
import BatchRegistration from "../pages/BatchRegistration";
import Settings from "../pages/Settings";
import NotFound from "../pages/NotFound";
import QRScanner from "../pages/QRScanner";
import QRGenerator from "../pages/QRGenerator";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect ke Login */}
        <Route
          path="/"
          element={<Navigate to="/login" />}
        />

        {/* Public Routes */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/verify/:serialNumber"
          element={<Verify />}
        />
        <Route
  path="/scanner"
  element={<QRScanner />}
/>

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/variants"
          element={
            <ProtectedRoute>
              <Variants />
            </ProtectedRoute>
          }
        />

        <Route
          path="/batches"
          element={
            <ProtectedRoute>
              <BatchRegistration />
            </ProtectedRoute>
          }
        />
        <Route
  path="/qr-generator"
  element={
    <ProtectedRoute>
      <QRGenerator />
    </ProtectedRoute>
  }
/>

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
  path="*"
  element={<NotFound />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;