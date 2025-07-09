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
import AssignBloodUnits from "./components/BloodStorage/AssignBloodUnits";
import FindNear from "./components/Search/FindNear";
import BlogList from "./components/Blog/BlogList";
import BlogDetail from "./components/Blog/BlogDetail";
import BlogCreate from "./components/Blog/BlogCreate";
import BlogMine from "./components/Blog/BlogMine";
import BlogPending from "./components/Blog/BlogPending";
import BlogEdit from "./components/Blog/BlogEdit";
import PermissionDenied from "./components/PermissionDenied/PermissionDenied";
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

function NonAdminOnly({ children }) {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  return user.role !== "Admin" ? (
    children
  ) : (
    <Navigate to="/permission-denied" replace />
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
          <Route path="/permission-denied" element={<PermissionDenied />} />
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
                <NonAdminOnly>
                  <DonateRequestPage
                    user={JSON.parse(localStorage.getItem("user")) || {}}
                  />
                </NonAdminOnly>
              </RequireAuth>
            }
          />
          <Route
            path="/donation-history"
            element={
              <RequireAuth>
                <NonAdminOnly>
                  <DonateRequestHistory
                    user={JSON.parse(localStorage.getItem("user")) || {}}
                  />
                </NonAdminOnly>
              </RequireAuth>
            }
          />
          <Route
            path="/blood-requests"
            element={
              <RequireAuth>
                <NonAdminOnly>
                  <NeedRequestPage
                    user={JSON.parse(localStorage.getItem("user")) || {}}
                  />
                </NonAdminOnly>
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
          />
          <Route
            path="/staff/need-requests"
            element={
              <RequireAuth>
                <StaffOnly>
                  <NeedRequestPage
                    user={JSON.parse(localStorage.getItem("user")) || {}}
                  />
                </StaffOnly>
              </RequireAuth>
            }
          />
          <Route
            path="/staff/assign-blood-units/:requestId"
            element={
              <RequireAuth>
                <StaffOnly>
                  <AssignBloodUnits />
                </StaffOnly>
              </RequireAuth>
            }
          />
          <Route
            path="/address"
            element={
              <RequireAuth>
                <AddressFormPage />
              </RequireAuth>
            }
          />
          <Route path="/blogs" element={<BlogList />} />
          <Route
            path="/blogs/create"
            element={
              <RequireAuth>
                <BlogCreate />
              </RequireAuth>
            }
          />
          <Route path="/blogs/:id" element={<BlogDetail />} />
          <Route
            path="/blogs/mine"
            element={
              <RequireAuth>
                <BlogMine />
              </RequireAuth>
            }
          />
          <Route
            path="/blogs/pending"
            element={
              <RequireAuth>
                <AdminOnly>
                  <BlogPending />
                </AdminOnly>
              </RequireAuth>
            }
          />
          <Route path="/blogs/:id/edit" element={<BlogEdit />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
