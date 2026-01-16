/**
 * Componente Hero
 * COOPERATIVA CECOALIMENTOS
 */

import './Hero.css';

function Hero() {
    return (
        <section id="inicio" className="hero">
            {/* Decoraciones de fondo */}
            <span className="hero-decoration hero-decoration-1">🥗</span>
            <span className="hero-decoration hero-decoration-2">🍲</span>
            <span className="hero-decoration hero-decoration-3">🥘</span>

            <div className="container hero-content">
                {/* Badge */}
                <div className="hero-badge">
                    <span className="hero-badge-dot"></span>
                    Cooperativa Agrícola desde 1985
                </div>

                {/* Título */}
                <h1 className="hero-title">
                    Alimentos frescos{' '}
                    <span className="hero-title-highlight">directo a tu mesa</span>
                </h1>

                {/* Descripción */}
                <p className="hero-description">
                    Descubre nuestros combos de comida preparados con ingredientes frescos
                    y de alta calidad. Apoyando a productores locales con cada compra.
                </p>

                {/* Botones de acción */}
                <div className="hero-actions">
                    <a href="#combos" className="btn btn-primary">
                        Ver Combos
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </a>
                    <a href="#nosotros" className="btn btn-secondary">
                        Conocer Más
                    </a>
                </div>

                {/* Estadísticas */}
                <div className="hero-stats">
                    <div className="hero-stat">
                        <div className="hero-stat-value">500+</div>
                        <div className="hero-stat-label">Familias satisfechas</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">38</div>
                        <div className="hero-stat-label">Años de experiencia</div>
                    </div>
                    <div className="hero-stat">
                        <div className="hero-stat-value">100%</div>
                        <div className="hero-stat-label">Productos frescos</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
