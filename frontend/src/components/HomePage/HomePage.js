import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1>Give the Gift of Life</h1>
            <h2>Your Blood Can Save Lives</h2>
            <p>
              Every day, thousands of people need blood transfusions to survive. 
              Your donation can make a significant difference in someone's life.
            </p>
            <div className="hero-buttons">
              <Link to="/donate" className="btn btn-primary">Donate Now</Link>
              <Link to="/donation-process" className="btn btn-outline">Learn More</Link>
            </div>
          </div>
          <div className="hero-image">
            <img 
              src="https://img.freepik.com/free-photo/close-up-hand-holding-blood-drop_23-2148287765.jpg" 
              alt="Blood Donation" 
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container stats-container">
          <div className="stat-item">
            <h3>4.5M</h3>
            <p>Annual Blood Donations</p>
          </div>
          <div className="stat-item">
            <h3>13.5M</h3>
            <p>Lives Saved Each Year</p>
          </div>
          <div className="stat-item">
            <h3>3 Lives</h3>
            <p>Saved Per Donation</p>
          </div>
          <div className="stat-item">
            <h3>Every 2 Sec</h3>
            <p>Someone Needs Blood</p>
          </div>
        </div>
      </section>

      {/* Blood Types Section */}
      <section className="blood-types">
        <div className="container">
          <h2>Blood Types & Compatibility</h2>
          <p className="section-description">
            Understanding blood types is crucial for successful transfusions. 
            Here's a quick guide to blood type compatibility.
          </p>
          
          <div className="blood-types-grid">
            <div className="blood-type-card">
              <div className="blood-type">A+</div>
              <div className="compatibility">
                <p><strong>Can donate to:</strong> A+, AB+</p>
                <p><strong>Can receive from:</strong> A+, A-, O+, O-</p>
              </div>
            </div>
            
            <div className="blood-type-card">
              <div className="blood-type">A-</div>
              <div className="compatibility">
                <p><strong>Can donate to:</strong> A+, A-, AB+, AB-</p>
                <p><strong>Can receive from:</strong> A-, O-</p>
              </div>
            </div>
            
            <div className="blood-type-card">
              <div className="blood-type">B+</div>
              <div className="compatibility">
                <p><strong>Can donate to:</strong> B+, AB+</p>
                <p><strong>Can receive from:</strong> B+, B-, O+, O-</p>
              </div>
            </div>
            
            <div className="blood-type-card">
              <div className="blood-type">B-</div>
              <div className="compatibility">
                <p><strong>Can donate to:</strong> B+, B-, AB+, AB-</p>
                <p><strong>Can receive from:</strong> B-, O-</p>
              </div>
            </div>
            
            <div className="blood-type-card">
              <div className="blood-type">AB+</div>
              <div className="compatibility">
                <p><strong>Can donate to:</strong> AB+ only</p>
                <p><strong>Can receive from:</strong> All Blood Types</p>
              </div>
            </div>
            
            <div className="blood-type-card">
              <div className="blood-type">AB-</div>
              <div className="compatibility">
                <p><strong>Can donate to:</strong> AB+, AB-</p>
                <p><strong>Can receive from:</strong> A-, B-, AB-, O-</p>
              </div>
            </div>
            
            <div className="blood-type-card">
              <div className="blood-type">O+</div>
              <div className="compatibility">
                <p><strong>Can donate to:</strong> A+, B+, AB+, O+</p>
                <p><strong>Can receive from:</strong> O+, O-</p>
              </div>
            </div>
            
            <div className="blood-type-card">
              <div className="blood-type">O-</div>
              <div className="compatibility">
                <p><strong>Can donate to:</strong> All Blood Types</p>
                <p><strong>Can receive from:</strong> O- only</p>
                <p className="special-note">Universal Donor</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Process Section */}
      <section className="donation-process">
        <div className="container">
          <h2>The Donation Process</h2>
          <p className="section-description">
            Donating blood is a simple and straightforward process that takes about an hour from start to finish.
          </p>
          
          <div className="process-steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Registration</h3>
              <p>Present ID and answer basic health questions</p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h3>Health Screening</h3>
              <p>Quick physical (temperature, blood pressure, pulse, hemoglobin)</p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h3>Blood Donation</h3>
              <p>The actual donation takes only 8-10 minutes</p>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <h3>Refreshments</h3>
              <p>Rest and enjoy snacks to replenish fluids and energy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <h2>Donor Testimonials</h2>
          <div className="testimonials-container">
            <div className="testimonial">
              <div className="quote">"I've been donating blood for over 10 years now. It's just an hour of my time, but it means the world to someone in need."</div>
              <div className="author">- Sarah Johnson</div>
            </div>
            <div className="testimonial">
              <div className="quote">"After my son's accident, he needed multiple transfusions. Now I donate regularly to give back and help others like him."</div>
              <div className="author">- Michael Rodriguez</div>
            </div>
            <div className="testimonial">
              <div className="quote">"It's such a simple way to make a big difference. I feel great knowing my donation directly helps save lives!"</div>
              <div className="author">- Priya Patel</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container cta-container">
          <h2>Ready to Make a Difference?</h2>
          <p>Schedule your blood donation appointment today and join our community of lifesavers.</p>
          <Link to="/donate" className="btn btn-primary">Donate Now</Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
