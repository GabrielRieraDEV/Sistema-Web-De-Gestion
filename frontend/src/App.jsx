/**
 * Componente Principal App
 * COOPERATIVA CECOALIMENTOS
 */

import { useState } from 'react';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import ComboSection from './components/ComboSection/ComboSection';
import LoginModal from './components/LoginModal/LoginModal';
import Footer from './components/Footer/Footer';
import './App.css';

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleLoginClose = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <div className="app">
      {/* Header con navegación */}
      <Header onLoginClick={handleLoginClick} />

      {/* Contenido Principal */}
      <main>
        {/* Sección Hero */}
        <Hero />

        {/* Sección de Combos */}
        <ComboSection />

        {/* Sección Nosotros */}
        <section id="nosotros" className="about-section">
          <div className="container">
            <div className="about-content">
              <div className="about-text">
                <span className="about-subtitle">Sobre Nosotros</span>
                <h2 className="about-title">
                  Más de 38 años llevando <span className="text-gradient">calidad a tu mesa</span>
                </h2>
                <p className="about-description">
                  COOPERATIVA CECOALIMENTOS nació en 1985 con la misión de conectar
                  a los productores locales con las familias de nuestra comunidad.
                  Creemos en el comercio justo, la sostenibilidad y la calidad
                  como pilares fundamentales de nuestra organización.
                </p>
                <div className="about-features">
                  <div className="about-feature">
                    <span className="about-feature-icon">🌱</span>
                    <div>
                      <h4>Productos Locales</h4>
                      <p>Apoyamos a más de 50 productores de la región</p>
                    </div>
                  </div>
                  <div className="about-feature">
                    <span className="about-feature-icon">🤝</span>
                    <div>
                      <h4>Comercio Justo</h4>
                      <p>Precios justos para productores y consumidores</p>
                    </div>
                  </div>
                  <div className="about-feature">
                    <span className="about-feature-icon">♻️</span>
                    <div>
                      <h4>Sostenibilidad</h4>
                      <p>Empaques ecológicos y prácticas responsables</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="about-image">
                <div className="about-image-placeholder">
                  <span>👨‍🌾</span>
                  <span>🥬</span>
                  <span>🍅</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modal de Login */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleLoginClose}
      />
    </div>
  );
}

export default App;
