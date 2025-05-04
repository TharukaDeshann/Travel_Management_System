import React, { useEffect } from "react";
import { useUser } from "../context/UserContext.jsx";

import { fetchLoggedInUser } from "../services/authService";

const AuthLoader = ({ children }) => {
  const { setUser } = useUser();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await fetchLoggedInUser();
        setUser(user);
      } catch (error) {
        setUser(null); // Not logged in
      }
    };

    loadUser();
  }, [setUser]);

  return children;
};

export default AuthLoader;
