import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./App.css";
import "./i18n/i18n";
import HomePage from "./components/HomePage/HomePage";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Login from "./components/Login/Login";
import OAuth2RedirectHandler from "./components/OAuth2RedirectHandler/OAuth2RedirectHandler";
import Contact from "./components/Contact/Contact";
import RequireAuth from "./components/RequireAuth/RequireAuth";
import TermsOfService from "./components/Legal/TermsOfService";
import PrivacyPolicy from "./components/Legal/PrivacyPolicy";
import Profile from "./components/Profile/Profile";
import AdminPanel from "./components/AdminPanel/AdminPanel";
import NeedRequestPage from "./components/NeedRequest/NeedRequestPage";

function AdminOnly({ children }) {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  return user.role === "Admin" ? children : <Navigate to="/" replace />;
}

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
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminOnly>
                  <AdminPanel />
                </AdminOnly>
              </RequireAuth>
            }
          />          <Route
            path="/donate"
            element={
              <RequireAuth>
                <div style={{ minHeight: "100vh", padding: "20px" }}>
                  <h1>{t("donate.title")}</h1>
                  <p>{t("donate.description")}</p>
                </div>
              </RequireAuth>
            }
          />
          <Route
            path="/blood-requests"
            element={
              <RequireAuth>
                <NeedRequestPage user={JSON.parse(localStorage.getItem("user")) || {}} />
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
