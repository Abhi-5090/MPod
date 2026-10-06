import React, { useEffect } from "react";

const Logout = () => {
  console.log('logout')
  useEffect(() => {
    console.log('Logging out user...');
    localStorage.removeItem('authUser');
    window.location.href = 'login';
  }, []);

  return null;
};

export default Logout;
