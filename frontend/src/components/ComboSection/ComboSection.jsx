/**
 * Componente ComboSection
 * COOPERATIVA CECOALIMENTOS
 */

import { useCombos } from '../../hooks/useCombos';
import ComboCard, { ComboCardSkeleton } from '../ComboCard/ComboCard';
import './ComboSection.css';

function ComboSection() {
    const { combos, loading, error, refetch } = useCombos();

    return (
        <section id="combos" className="combos-section">
            <div className="container">
                {/* Encabezado */}
                <div className="combos-header">
                    <span className="combos-subtitle">Nuestros Combos</span>
                    <h2 className="combos-title">Comida deliciosa para todos</h2>
                    <p className="combos-description">
                        Elige entre nuestras opciones preparadas con los mejores ingredientes
                        frescos de productores locales.
                    </p>
                </div>

                {/* Estado de Error */}
                {error && (
                    <div className="combos-error">
                        <div className="combos-error-icon">⚠️</div>
                        <h3 className="combos-error-title">Error al cargar combos</h3>
                        <p className="combos-error-message">{error}</p>
                        <button className="btn btn-primary" onClick={refetch}>
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Estado de Carga */}
                {loading && !error && (
                    <div className="combos-grid">
                        <ComboCardSkeleton />
                        <ComboCardSkeleton />
                        <ComboCardSkeleton />
                    </div>
                )}

                {/* Lista de Combos */}
                {!loading && !error && combos.length > 0 && (
                    <div className="combos-grid">
                        {combos.map((combo) => (
                            <ComboCard
                                key={combo.id}
                                id={combo.id}
                                nombre={combo.nombre}
                                descripcion={combo.descripcion}
                                precio={combo.precio}
                                imagen={combo.imagen}
                                disponible={combo.disponible}
                            />
                        ))}
                    </div>
                )}

                {/* Estado Vacío */}
                {!loading && !error && combos.length === 0 && (
                    <div className="combos-empty">
                        <div className="combos-empty-icon">🍽️</div>
                        <h3 className="combos-empty-title">No hay combos disponibles</h3>
                        <p className="combos-empty-message">
                            Vuelve pronto para ver nuestras nuevas opciones.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default ComboSection;
