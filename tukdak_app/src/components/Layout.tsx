// import { useState, useEffect } from "react";
import { Outlet, NavLink } from "react-router-dom";
// import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { Toast } from "./Toast";
// import weddingBg from "../assets/wedding_bg.jpg";
// import appIcon from "../assets/icon.png";

export const Layout = () => {
  // const [darkMode, setDarkMode] = useState(() => {
  //   // Check localStorage or system preference
  //   const saved = localStorage.getItem("darkMode");
  //   if (saved !== null) {
  //     return saved === "true";
  //   }
  //   return window.matchMedia("(prefers-color-scheme: dark)").matches;
  // });

  // useEffect(() => {
  //   // Apply dark mode class to document
  //   if (darkMode) {
  //     document.documentElement.classList.add("dark");
  //   } else {
  //     document.documentElement.classList.remove("dark");
  //   }
  //   // Save to localStorage
  //   localStorage.setItem("darkMode", darkMode.toString());
  // }, [darkMode]);

  // const toggleDarkMode = () => {
  //   setDarkMode((prev) => !prev);
  // };

  return (
    <div className="min-h-screen relative bg-red-100">
      {/* Content wrapper */}
      <div className="relative z-10">
        <Toast />

        {/* Navigation */}
        <nav className="bg-gradient-to-r from-rose-50/80 via-pink-50/80 to-rose-50/80 dark:from-rose-950/80 dark:via-pink-950/80 dark:to-rose-950/80 backdrop-blur-md shadow-lg border-b-2 border-rose-200 dark:border-rose-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
                {/* Logo */}
                <div className="flex-shrink-0 flex items-center gap-3">
                  {/* <img
                    src={appIcon}
                    alt="TukDak"
                    className="h-10 w-10 rounded-lg shadow-md"
                  /> */}
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    S&R
                  </h1>
                </div>

                {/* Navigation Links */}
                <div className="hidden sm:flex sm:space-x-8">
                  <NavLink
                    to="/guests"
                    className={({ isActive }) =>
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "border-rose-500 text-rose-900 dark:text-rose-100"
                          : "border-transparent text-rose-700 dark:text-rose-300 hover:border-rose-300 hover:text-rose-900 dark:hover:text-rose-100"
                      }`
                    }
                  >
                    Guests
                  </NavLink>
                </div>
              </div>

              {/* Dark Mode Toggle */}
              {/* <div className="flex items-center">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/50 hover:bg-rose-200 dark:hover:bg-rose-800/50 transition-colors shadow-sm"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? (
                    <SunIcon className="h-5 w-5 text-amber-500" />
                  ) : (
                    <MoonIcon className="h-5 w-5 text-rose-700" />
                  )}
                </button>
              </div> */}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
