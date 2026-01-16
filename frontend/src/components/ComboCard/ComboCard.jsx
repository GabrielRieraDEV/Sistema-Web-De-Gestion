/**
 * Componente ComboCard
 * COOPERATIVA CECOALIMENTOS
 */

import './ComboCard.css';

function ComboCard({ id, nombre, descripcion, precio, imagen, disponible = true }) {
    // Determinar el emoji según el nombre del combo
    const getComboEmoji = () => {
        if (nombre?.toLowerCase().includes('familiar')) return '🥗';
        if (nombre?.toLowerCase().includes('ejecutivo')) return '🍖';
        if (nombre?.toLowerCase().includes('saludable')) return '🥙';
        return '🍽️';
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-VE', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(price);
    };

    return (
        <article className="combo-card">
            {/* Imagen */}
            <div className="combo-card-image">
                {imagen && imagen !== '/combo-familiar.jpg' && imagen !== '/combo-ejecutivo.jpg' && imagen !== '/combo-saludable.jpg' ? (
                    <img src={imagen} alt={nombre} loading="lazy" />
                ) : (
                    <span className="combo-card-image-placeholder">{getComboEmoji()}</span>
                )}
                {disponible && (
                    <span className="combo-card-badge">Disponible</span>
                )}
            </div>

            {/* Contenido */}
            <div className="combo-card-content">
                <h3 className="combo-card-title">{nombre}</h3>
                <p className="combo-card-description">{descripcion}</p>

                <div className="combo-card-footer">
                    <div className="combo-card-price">
                        <span className="combo-card-price-label">Precio</span>
                        <span className="combo-card-price-value">{formatPrice(precio)}</span>
                    </div>

                    <button
                        className="combo-card-btn"
                        disabled={!disponible}
                        aria-label={`Ordenar ${nombre}`}
                    >
                        Ordenar
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </article>
    );
}

// Componente Skeleton para estado de carga
export function ComboCardSkeleton() {
    return (
        <article className="combo-card combo-card-skeleton">
            <div className="combo-card-image skeleton"></div>
            <div className="combo-card-content">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="combo-card-footer">
                    <div className="skeleton skeleton-price"></div>
                    <div className="skeleton skeleton-btn"></div>
                </div>
            </div>
        </article>
    );
}

export default ComboCard;
