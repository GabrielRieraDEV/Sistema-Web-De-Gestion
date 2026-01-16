/**
 * Servicio de Combos de Comida
 * COOPERATIVA CECOALIMENTOS
 */

import apiClient from './api';

// Datos de prueba para desarrollo (simula respuesta del backend)
const MOCK_COMBOS = [
    {
        id: 1,
        nombre: 'Combo Familiar',
        descripcion: 'Arroz, pollo, ensalada fresca y jugo natural. Perfecto para compartir en familia.',
        precio: 25.99,
        imagen: '/combo-familiar.jpg',
        disponible: true,
    },
    {
        id: 2,
        nombre: 'Combo Ejecutivo',
        descripcion: 'Carne asada, puré de papas, vegetales salteados y bebida. Ideal para el almuerzo.',
        precio: 18.50,
        imagen: '/combo-ejecutivo.jpg',
        disponible: true,
    },
    {
        id: 3,
        nombre: 'Combo Saludable',
        descripcion: 'Ensalada mediterránea, pechuga a la plancha, quinoa y smoothie verde.',
        precio: 22.00,
        imagen: '/combo-saludable.jpg',
        disponible: true,
    },
];

// Bandera para usar datos mock en desarrollo
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || true;

const comboService = {
    /**
     * Obtener todos los combos disponibles
     * @returns {Promise<Array>} - Lista de combos
     */
    async getCombos() {
        if (USE_MOCK_DATA) {
            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 500));
            return MOCK_COMBOS;
        }

        try {
            const response = await apiClient.get('/combos');
            return response;
        } catch (error) {
            console.error('Error al obtener combos:', error);
            throw error;
        }
    },

    /**
     * Obtener un combo por su ID
     * @param {number} id - ID del combo
     * @returns {Promise<object>} - Datos del combo
     */
    async getComboById(id) {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const combo = MOCK_COMBOS.find(c => c.id === id);
            if (!combo) {
                throw new Error('Combo no encontrado');
            }
            return combo;
        }

        try {
            const response = await apiClient.get(`/combos/${id}`);
            return response;
        } catch (error) {
            console.error('Error al obtener combo:', error);
            throw error;
        }
    },

    /**
     * Solicitar compra de un combo
     * @param {number} comboId - ID del combo a comprar
     * @param {object} orderData - Datos adicionales del pedido
     * @returns {Promise<object>} - Confirmación del pedido
     */
    async orderCombo(comboId, orderData = {}) {
        if (USE_MOCK_DATA) {
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                success: true,
                orderId: Math.random().toString(36).substr(2, 9),
                message: 'Pedido realizado con éxito',
            };
        }

        try {
            const response = await apiClient.post('/orders', {
                comboId,
                ...orderData,
            });
            return response;
        } catch (error) {
            console.error('Error al realizar pedido:', error);
            throw error;
        }
    },
};

export default comboService;
