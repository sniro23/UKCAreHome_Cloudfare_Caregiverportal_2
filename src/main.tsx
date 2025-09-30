import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import "@/index.css";
import { Toaster } from "@/components/ui/sonner";
// Layouts and Pages
import { AppLayout } from "@/components/AppLayout";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RosterPage } from "@/pages/RosterPage";
import { PatientsPage } from "@/pages/PatientsPage";
import { PatientDetailPage } from "@/pages/PatientDetailPage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        errorElement: <RouteErrorBoundary />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/roster", element: <RosterPage /> },
          { path: "/patients", element: <PatientsPage /> },
          { path: "/patients/:patientId", element: <PatientDetailPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/notifications", element: <NotificationsPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster richColors closeButton />
    </ErrorBoundary>
  </StrictMode>
);