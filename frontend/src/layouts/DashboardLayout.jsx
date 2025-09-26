import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import useWindowSize from "../hooks/useWindowSize";

function DashboardLayout() {
  const { width } = useWindowSize();
  const isMobile = width <= 768;

  return (
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
  );
}

export default DashboardLayout;
