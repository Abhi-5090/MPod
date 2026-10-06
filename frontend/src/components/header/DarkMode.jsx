import { useEffect } from "react";

// The app is dark-themed only; this applies the theme class to <body>.
const DarkMode = () => {
  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.add("is_dark");
  }, []);
  return null;
};

export default DarkMode;
