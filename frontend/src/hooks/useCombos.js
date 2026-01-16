/**
 * Hook personalizado para gestionar combos
 * COOPERATIVA CECOALIMENTOS
 */

import { useState, useEffect, useCallback } from 'react';
import comboService from '../services/comboService';

/**
 * Hook para obtener y gestionar los combos de comida
 * @returns {object} - Estado y funciones para gestionar combos
 */
export function useCombos() {
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCombos = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await comboService.getCombos();
            setCombos(data);
        } catch (err) {
            setError(err.message || 'Error al cargar los combos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCombos();
    }, [fetchCombos]);

    return {
        combos,
        loading,
        error,
        refetch: fetchCombos,
    };
}

/**
 * Hook para gestionar un combo individual
 * @param {number} id - ID del combo
 * @returns {object} - Estado del combo
 */
export function useCombo(id) {
    const [combo, setCombo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchCombo = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await comboService.getComboById(id);
                setCombo(data);
            } catch (err) {
                setError(err.message || 'Error al cargar el combo');
            } finally {
                setLoading(false);
            }
        };

        fetchCombo();
    }, [id]);

    return { combo, loading, error };
}

export default useCombos;
