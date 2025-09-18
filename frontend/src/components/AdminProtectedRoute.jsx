import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getAdminProfile } from "../api";

function AdminProtectedRoute() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyAdminStatus = async () => {
      try {
        const response = await getAdminProfile();
        if (response.data.is_admin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          setError("Administration rights required");
        }
      } catch (err) {
        console.error("Admin verification failed:", err);
        setIsAdmin(false);
        setError(
          err.response?.data?.msg ||
            "Failed to verify admin status. Please try logging in again."
        );
      }
    };

    verifyAdminStatus();
  }, []);

  if (isAdmin === null) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/admin/login"
        state={{ error: error || "Please log in as an admin" }}
      />
    );
  }

  return <Outlet />;
}

export default AdminProtectedRoute;
