import React, { useState, useEffect } from "react";
import "./BenefitsCarousel.css";

const BenefitsCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const benefits = [
    {
      id: 1,
      icon: "❤️",
      title: "Save Up to 3 Lives",
      description:
        "A single blood donation can help save up to three lives. Your donation is separated into red blood cells, plasma, and platelets, each helping different patients.",
      gradient: "linear-gradient(135deg, #ff6b6b, #ee5a6f)",
    },
    {
      id: 2,
      icon: "🔬",
      title: "Free Health Screening",
      description:
        "Every donation includes a mini-physical with blood pressure, temperature, pulse, and hemoglobin level checks - completely free of charge.",
      gradient: "linear-gradient(135deg, #4ecdc4, #44a08d)",
    },
    {
      id: 3,
      icon: "🩸",
      title: "Reduce Health Risks",
      description:
        "Regular blood donation may help maintain healthy iron levels and reduce oxidative stress in your body, promoting better overall health.",
      gradient: "linear-gradient(135deg, #a8edea, #fed6e3)",
    },
    {
      id: 4,
      icon: "💪",
      title: "Boost Cardiovascular Health",
      description:
        "Donating blood can help improve blood flow and reduce the risk of heart disease by maintaining healthy iron levels.",
      gradient: "linear-gradient(135deg, #ffecd2, #fcb69f)",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % benefits.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % benefits.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + benefits.length) % benefits.length);
  };

  return (
    <section className="benefits-carousel">
      <div className="carousel-container">
        <div className="carousel-header">
          <h2>Benefits of Donating Blood</h2>
          <p>Discover how your donation can make a difference</p>
        </div>

        <div className="carousel-content">
          <button className="carousel-arrow prev" onClick={handlePrevSlide}>
            ‹
          </button>

          <div className="carousel-slides">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.id}
                className={`carousel-slide ${
                  index === currentSlide ? "active" : ""
                }`}
                style={{
                  transform: `translateX(${(index - currentSlide) * 100}%)`,
                  background: benefit.gradient,
                }}
              >
                <div className="benefit-icon">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>

          <button className="carousel-arrow next" onClick={handleNextSlide}>
            ›
          </button>
        </div>

        <div className="carousel-dots">
          {benefits.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${
                index === currentSlide ? "active" : ""
              }`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsCarousel;
