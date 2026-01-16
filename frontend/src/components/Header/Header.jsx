/**
 * Componente Header
 * COOPERATIVA CECOALIMENTOS
 */

import { useState, useEffect } from 'react';
import './Header.css';

function Header({ onLoginClick }) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="container header-content">
                {/* Logo */}
                <a href="/" className="logo">
                    <div className="logo-icon">🥗</div>
                    <div className="logo-text">
                        CECO<span>ALIMENTOS</span>
                    </div>
                </a>

                {/* Navegación */}
                <nav className="nav">
                    <a href="#inicio" className="nav-link">Inicio</a>
                    <a href="#combos" className="nav-link">Combos</a>
                    <a href="#nosotros" className="nav-link">Nosotros</a>
                    <a href="#contacto" className="nav-link">Contacto</a>
                </nav>

                {/* Acciones */}
                <div className="header-actions">
                    <button
                        className="btn btn-primary"
                        onClick={onLoginClick}
                    >
                        Iniciar Sesión
                    </button>

                    {/* Botón menú móvil */}
                    <button className="mobile-menu-btn" aria-label="Menú">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;
