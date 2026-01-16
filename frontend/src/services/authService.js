/**
 * Servicio de Autenticación
 * COOPERATIVA CECOALIMENTOS
 */

import apiClient from './api';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

const authService = {
    /**
     * Iniciar sesión con credenciales
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Promise<object>} - Datos del usuario y token
     */
    async login(email, password) {
        try {
            const response = await apiClient.post('/auth/login', {
                email,
                password,
            });

            // Guardar token y datos del usuario
            if (response.token) {
                localStorage.setItem(AUTH_TOKEN_KEY, response.token);
            }
            if (response.user) {
                localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
            }

            return response;
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            throw error;
        }
    },

    /**
     * Cerrar sesión
     */
    logout() {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(USER_DATA_KEY);
    },

    /**
     * Obtener token de autenticación almacenado
     * @returns {string|null} - Token o null si no existe
     */
    getToken() {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    },

    /**
     * Obtener datos del usuario almacenados
     * @returns {object|null} - Datos del usuario o null
     */
    getUser() {
        const userData = localStorage.getItem(USER_DATA_KEY);
        return userData ? JSON.parse(userData) : null;
    },

    /**
     * Verificar si el usuario está autenticado
     * @returns {boolean} - True si está autenticado
     */
    isAuthenticated() {
        return !!this.getToken();
    },

    /**
     * Registrar nuevo usuario
     * @param {object} userData - Datos del nuevo usuario
     * @returns {Promise<object>} - Respuesta del servidor
     */
    async register(userData) {
        try {
            const response = await apiClient.post('/auth/register', userData);
            return response;
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            throw error;
        }
    },
};

export default authService;
