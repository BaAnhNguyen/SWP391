import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import "./styles/colors.css";
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
import DonateRequestPage from "./components/DonateRequest/DonateRequestPage";
import DonateRequestHistory from "./components/DonateRequest/DonateRequestHistory";
import BloodStorage from "./components/BloodStorage/BloodStorage";
import FindNear from "./components/Search/FindNear";
// import AddressForm from "./components/AddressForm/AddressForm"; // Unused import removed
import AddressFormPage from "./components/AddressForm/AddressFormPage";

function AdminOnly({ children }) {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  return user.role === "Admin" ? children : <Navigate to="/" replace />;
}

function StaffOnly({ children }) {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  return user.role === "Admin" || user.role === "Staff" ? (
    children
  ) : (
    <Navigate to="/" replace />
  );
}

function App() {
  // Removed unused translation variable
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
          />{" "}
          <Route
            path="/donate"
            element={
              <RequireAuth>
                <DonateRequestPage
                  user={JSON.parse(localStorage.getItem("user")) || {}}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/donation-history"
            element={
              <RequireAuth>
                <DonateRequestHistory
                  user={JSON.parse(localStorage.getItem("user")) || {}}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/blood-requests"
            element={
              <RequireAuth>
                <NeedRequestPage
                  user={JSON.parse(localStorage.getItem("user")) || {}}
                />
              </RequireAuth>
            }
          />
          <Route
            path="/blood-storage"
            element={
              <RequireAuth>
                <StaffOnly>
                  <BloodStorage />
                </StaffOnly>
              </RequireAuth>
            }
          />{" "}
          <Route
            path="/address"
            element={
              <RequireAuth>
                <AddressFormPage />
              </RequireAuth>
            }
          />
        </Routes>
        <Footer />
      </div>
      <div>
        <h2>Test Tìm quanh tôi (1000km)</h2>
        <FindNear />
      </div>
    </Router>
  );
}

export default App;
