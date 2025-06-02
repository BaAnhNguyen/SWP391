import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./components/HomePage/HomePage";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Login from "./components/Login/Login";
import OAuth2RedirectHandler from "./components/OAuth2RedirectHandler/OAuth2RedirectHandler";
import Contact from "./components/Contact/Contact";
import RequireAuth from "./components/RequireAuth/RequireAuth";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/donate"
            element={
              <RequireAuth>
                {/* Replace this with your Donate component when you create it */}
                <div style={{ minHeight: "100vh", padding: "20px" }}>
                  <h1>Donate Blood</h1>
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
