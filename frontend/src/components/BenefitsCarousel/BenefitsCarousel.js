import React, { useState, useEffect } from 'react';
import './BenefitsCarousel.css';

const BenefitsCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const benefits = [
    {
      id: 1,
      icon: '❤️',
      title: 'Save Up to 3 Lives',
      description: 'A single blood donation can help save up to three lives. Your donation is separated into red blood cells, plasma, and platelets, each helping different patients.',
      gradient: 'linear-gradient(135deg, #ff6b6b, #ee5a6f)',
      stats: '3 Lives Saved'
    },
    {
      id: 2,
      icon: '🔬',
      title: 'Free Health Screening',
      description: 'Every donation includes a mini-physical with blood pressure, temperature, pulse, and hemoglobin level checks - completely free of charge.',
      gradient: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
      stats: 'Free Check-up'
    },
    {
      id: 3,
      icon: '🩸',
      title: 'Reduce Cancer Risk',
      description: 'Regular blood donation may reduce the risk of certain cancers by lowering iron levels in the body, which can reduce oxidative stress.',
      gradient: 'linear-gradient(135deg, #a8edea, #fed6e3)',
      stats: 'Health Benefits'
    },
    {
      id: 4,
      icon: '💪',
      title: 'Boost Cardiovascular Health',
      description: 'Donating blood helps reduce blood viscosity and iron levels, which can improve cardiovascular health and reduce heart disease risk.',
      gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
      stats: 'Heart Healthy'
    },
    {
      id: 5,
      icon: '🧬',
      title: 'Stimulate Blood Cell Production',
      description: 'After donation, your body works to replenish the donated blood, stimulating the production of new, healthy blood cells.',
      gradient: 'linear-gradient(135deg, #a8caba, #5d4e75)',
      stats: 'Cell Renewal'
    },
    {
      id: 6,
      icon: '🌟',
      title: 'Feel Great About Helping',
      description: 'The psychological benefits of helping others can boost your mood, reduce stress, and provide a sense of purpose and accomplishment.',
      gradient: 'linear-gradient(135deg, #ffeaa7, #fab1a0)',
      stats: 'Mental Wellness'
    },
    {
      id: 7,
      icon: '⚡',
      title: 'Burn Calories',
      description: 'Donating blood burns approximately 650 calories as your body works to replace the donated blood volume and cells.',
      gradient: 'linear-gradient(135deg, #fd79a8, #fdcb6e)',
      stats: '650 Calories'
    },
    {
      id: 8,
      icon: '🔄',
      title: 'Regular Health Monitoring',
      description: 'Regular donations provide ongoing health monitoring, helping detect potential health issues early through routine screening.',
      gradient: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
      stats: 'Health Tracking'
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % benefits.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, benefits.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % benefits.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + benefits.length) % benefits.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <section className="benefits-carousel">
      <div className="container">
        <div className="carousel-header">
          <h2>Benefits of Blood Donation</h2>
          <p>Discover how donating blood benefits both you and those in need</p>
        </div>

        <div className="carousel-container">
          <div className="carousel-wrapper">
            <div 
              className="carousel-track" 
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {benefits.map((benefit, index) => (
                <div 
                  key={benefit.id} 
                  className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                  style={{ background: benefit.gradient }}
                >
                  <div className="slide-content">
                    <div className="slide-icon">{benefit.icon}</div>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.description}</p>
                    <div className="slide-stats">{benefit.stats}</div>
                  </div>
                  <div className="slide-decoration">
                    <div className="decoration-circle"></div>
                    <div className="decoration-dots"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="carousel-controls">
            <button className="carousel-btn prev-btn" onClick={prevSlide}>
              <span>‹</span>
            </button>
            <button className="carousel-btn next-btn" onClick={nextSlide}>
              <span>›</span>
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="carousel-dots">
            {benefits.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>

          {/* Play/Pause Button */}
          <button className="play-pause-btn" onClick={togglePlayPause}>
            {isPlaying ? '⏸️' : '▶️'}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="carousel-progress">
          <div 
            className="progress-bar" 
            style={{ 
              width: `${((currentSlide + 1) / benefits.length) * 100}%` 
            }}
          />
        </div>

        {/* Current Slide Counter */}
        <div className="slide-counter">
          <span>{currentSlide + 1}</span> / <span>{benefits.length}</span>
        </div>
      </div>
    </section>
  );
};

export default BenefitsCarousel;
