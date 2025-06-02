import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./BenefitsCarousel.css";

const BenefitsCarousel = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const benefits = [
    {
      id: 1,
      icon: "❤️",
      title: t('benefits.health.title'),
      description: t('benefits.health.description'),
      gradient: "linear-gradient(135deg, #ff6b6b, #ee5a6f)",
    },
    {
      id: 2,
      icon: "🔬",
      title: t('benefits.screening.title'),
      description: t('benefits.screening.description'),
      gradient: "linear-gradient(135deg, #4ecdc4, #44a08d)",
    },
    {
      id: 3,
      icon: "🩸",
      title: t('benefits.community.title'),
      description: t('benefits.community.description'),
      gradient: "linear-gradient(135deg, #a8edea, #fed6e3)",
    },    {
      id: 4,
      icon: "💪",
      title: t('benefits.emergency.title'),
      description: t('benefits.emergency.description'),
      gradient: "linear-gradient(135deg, #ffecd2, #fcb69f)",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % benefits.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [benefits.length]);

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
      <div className="carousel-container">        <div className="carousel-header">
          <h2>{t('benefits.title')}</h2>
          <p>{t('benefits.subtitle')}</p>
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
