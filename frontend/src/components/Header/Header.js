import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import "./Header.css";

function Header() {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await fetch("http://localhost:5001/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          // Store user data in localStorage for AdminOnly component
          localStorage.setItem("user", JSON.stringify(userData));
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const renderAuthButtons = () => {
    if (loading) {
      return <div className="nav-link">{t("nav.loading")}</div>;
    }

    if (user) {
      return (
        <div className="auth-buttons">
          <div className="user-welcome">
            <Link to="/profile" className="profile-link">
              {t("nav.welcome", { name: user.name })}
            </Link>
          </div>
          {user.role === "Admin" && (
            <Link to="/admin" className="nav-link admin-link">
              {t("nav.adminPanel")}
            </Link>
          )}
          <button onClick={handleLogout} className="logout-btn">
            {t("nav.logout")}
          </button>
        </div>
      );
    }
    return (
      <div className="auth-buttons">
        <Link to="/login" className="login-btn">
          {t("nav.login")}
        </Link>
      </div>
    );
  };

  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/">
            <h1>
              <span className="logo-icon">❤</span>
              LifeSource
            </h1>
          </Link>
        </div>

        <div className="mobile-menu-icon" onClick={toggleMenu}>
          <div className={menuOpen ? "hamburger open" : "hamburger"}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <nav className={menuOpen ? "nav-menu active" : "nav-menu"}>
          <ul>
            <li>
              <Link to="/" className="nav-link">
                {t("nav.home")}
              </Link>
            </li>
            <li>
              <Link to="/about" className="nav-link">
                {t("nav.about")}
              </Link>
            </li>
            <li>
              <Link to="/contact" className="nav-link">
                {t("nav.contact")}
              </Link>
            </li>
            <li>
              <LanguageSwitcher />
            </li>
          </ul>
          <div className="auth-section">{renderAuthButtons()}</div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
