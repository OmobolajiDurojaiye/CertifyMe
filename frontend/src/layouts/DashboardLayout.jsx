// frontend/src/layouts/DashboardLayout.jsx

import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import useWindowSize from "../hooks/useWindowSize";
import { UserProvider } from "../context/UserContext";
import { THEME } from "../theme";

function DashboardLayout() {
  const { width } = useWindowSize();
  const isMobile = width <= 768;

  return (
    // --- THIS PROVIDER WRAPS EVERYTHING ---
    <UserProvider>
      <div className="dashboard-layout">
        {/* Conditionally render Sidebar for desktop */}
        {!isMobile && <Sidebar />}

        <main className="main-content">
          <div className="workspace">
            <Outlet />
          </div>
        </main>

        {/* Conditionally render BottomNav for mobile */}
        {isMobile && <BottomNav />}
      </div>
    </UserProvider>
    // --- END OF WRAPPER ---
  );
}

export default DashboardLayout;
