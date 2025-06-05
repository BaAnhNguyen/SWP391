import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./BenefitsCarousel.css";

const BenefitsCarousel = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
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
    },
    {
      id: 4,
      icon: "💪",
      title: t('benefits.emergency.title'),
      description: t('benefits.emergency.description'),
      gradient: "linear-gradient(135deg, #ffecd2, #fcb69f)",
    },    {
      id: 5,
      icon: "🔄",
      title: t('benefits.renewal.title'),
      description: t('benefits.renewal.description'),
      gradient: "linear-gradient(135deg, #c471f5, #fa71cd)",
    },
    {
      id: 6,
      icon: "🌡️",
      title: t('benefits.hemochromatosis.title'),
      description: t('benefits.hemochromatosis.description'),
      gradient: "linear-gradient(135deg, #36d1dc, #5b86e5)",
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
  
  // Handle touch events for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNextSlide();
    } else if (isRightSwipe) {
      handlePrevSlide();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <section className="benefits-carousel">
      <div className="carousel-container">        <div className="carousel-header">
          <img src={process.env.PUBLIC_URL + '/blood-drop.svg'} alt="Blood Drop Icon" className="blood-drop-icon" />
          <h2>{t('benefits.title')}</h2>
          <p>{t('benefits.subtitle')}</p>
        </div>

        <div className="carousel-content">          <button 
            className="carousel-arrow prev" 
            onClick={handlePrevSlide}
            aria-label="Previous slide"
          >
            ‹
          </button><div 
            className="carousel-slides"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {benefits.map((benefit, index) => (              <div
                key={benefit.id}
                className={`carousel-slide ${
                  index === currentSlide ? "active" : ""
                }`}
                style={{
                  transform: `translateX(${(index - currentSlide) * 100}%)`,
                  background: benefit.gradient,
                  zIndex: index === currentSlide ? 1 : 0,
                  visibility: Math.abs(index - currentSlide) > 1 ? 'hidden' : 'visible' // Only render nearby slides
                }}
              >
                <div className="slide-content">
                  <div className="benefit-icon">{benefit.icon}</div>
                  <h3 className="slide-title">{benefit.title}</h3>
                  <div className="benefit-divider"></div>
                  <p className="slide-description">{benefit.description}</p>
                </div>
                <div className="benefit-pulse"></div>
              </div>
            ))}
          </div>          <button 
            className="carousel-arrow next" 
            onClick={handleNextSlide}
            aria-label="Next slide"
          >
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
