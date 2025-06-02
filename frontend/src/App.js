import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./App.css";
import "./i18n/i18n"; // Import i18n configuration
import HomePage from "./components/HomePage/HomePage";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Login from "./components/Login/Login";
import OAuth2RedirectHandler from "./components/OAuth2RedirectHandler/OAuth2RedirectHandler";
import Contact from "./components/Contact/Contact";
import RequireAuth from "./components/RequireAuth/RequireAuth";
import TermsOfService from "./components/Legal/TermsOfService";
import PrivacyPolicy from "./components/Legal/PrivacyPolicy";

function App() {
  const { t } = useTranslation();

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route
            path="/donate"
            element={
              <RequireAuth>
                {/* Replace this with your Donate component when you create it */}
                <div style={{ minHeight: "100vh", padding: "20px" }}>
                  <h1>{t('donate.title')}</h1>
                  <p>{t('donate.description')}</p>
                  {/* Add your donation form/content here */}
                </div>
              </RequireAuth>
            }
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
