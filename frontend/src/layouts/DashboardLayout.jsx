import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <div className="workspace">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
export default DashboardLayout;
