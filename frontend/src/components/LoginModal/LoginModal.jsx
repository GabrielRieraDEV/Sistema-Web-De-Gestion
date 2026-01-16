/**
 * Componente LoginModal
 * COOPERATIVA CECOALIMENTOS
 */

import { useState } from 'react';
import authService from '../../services/authService';
import './LoginModal.css';

function LoginModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');
    const [isMouseDownOnOverlay, setIsMouseDownOnOverlay] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Limpiar errores al escribir
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
        setApiError('');
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mínimo 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setLoading(true);
            setApiError('');

            await authService.login(formData.email, formData.password);

            // Éxito: cerrar modal y limpiar formulario
            setFormData({ email: '', password: '' });
            onClose();

            // Recargar la página o actualizar estado global según necesites
            window.location.reload();
        } catch (error) {
            setApiError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className={`modal-overlay ${isOpen ? 'open' : ''}`}
            onMouseDown={(e) => { if (e.target === e.currentTarget) setIsMouseDownOnOverlay(true); }}
            onClick={() => { if (isMouseDownOnOverlay) onClose(); setIsMouseDownOnOverlay(false); }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="modal">
                {/* Botón cerrar */}
                <button
                    className="modal-close"
                    onClick={onClose}
                    aria-label="Cerrar"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="modal-header">
                    <div className="modal-icon">🔐</div>
                    <h2 id="modal-title" className="modal-title">Bienvenido</h2>
                    <p className="modal-subtitle">Inicia sesión en tu cuenta</p>
                </div>

                {/* Body */}
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        {/* Email */}
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className="form-input"
                                placeholder="tu@email.com"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                                autoComplete="email"
                            />
                            {errors.email && (
                                <span className="form-error">{errors.email}</span>
                            )}
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                                autoComplete="current-password"
                            />
                            {errors.password && (
                                <span className="form-error">{errors.password}</span>
                            )}
                        </div>

                        {/* Error de API */}
                        {apiError && (
                            <div className="form-error" style={{ textAlign: 'center', marginBottom: 'var(--spacing-4)' }}>
                                {apiError}
                            </div>
                        )}

                        {/* Acciones */}
                        <div className="modal-actions">
                            <button
                                type="submit"
                                className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <p className="modal-footer-text">
                        ¿No tienes cuenta?{' '}
                        <span className="modal-footer-link">Contáctanos</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginModal;
