import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/Admin.css"; // Ensure this exists for styling

function AdminLayout() {
  return (
    <div className="dashboard-layout d-flex">
      <AdminSidebar />
      <main
        className="main-content flex-grow-1 p-4"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <div className="workspace container-fluid">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
