// frontend/src/context/UserContext.jsx

import React, { createContext, useState, useEffect, useContext } from "react";
import { getCurrentUser } from "../api";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await getCurrentUser();
          setUser(res.data);
        } catch (error) {
          console.error("Failed to fetch user", error);
          // Handle token expiration if necessary
          if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
          }
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
