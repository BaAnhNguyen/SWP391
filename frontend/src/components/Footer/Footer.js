import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Footer.css";

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-section about">
          <h3>{t("footer.about")}</h3>
          <p>{t("footer.aboutText")}</p>
        </div>

        <div className="footer-section links">
          <h3>{t("footer.quickLinks")}</h3>
          <ul>
            <li>
              <Link to="/">{t("nav.home")}</Link>
            </li>
            <li>
              <Link to="/blogs">{t("footer.blog")}</Link>
            </li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h3>{t("footer.contact")}</h3>
          <p>{t("footer.address")}</p>
          <p>{t("footer.phone")}</p>
          <p>{t("footer.email")}</p>
        </div>
      </div>

      <div className="copyright">
        <p>{t("footer.rights")}</p>
      </div>
    </footer>
  );
}

export default Footer;
