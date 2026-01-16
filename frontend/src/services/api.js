/**
 * Configuración base para consumo de API
 * COOPERATIVA CECOALIMENTOS
 */

// URL base del backend - configurar en variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Cliente HTTP base con configuración de autenticación
 */
const apiClient = {
  /**
   * Obtiene los headers por defecto incluyendo token de autenticación si existe
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  },

  /**
   * Realiza una petición GET
   * @param {string} endpoint - Endpoint de la API
   * @returns {Promise<any>} - Datos de respuesta
   */
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Realiza una petición POST
   * @param {string} endpoint - Endpoint de la API
   * @param {object} data - Datos a enviar
   * @returns {Promise<any>} - Datos de respuesta
   */
  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Realiza una petición PUT
   * @param {string} endpoint - Endpoint de la API
   * @param {object} data - Datos a enviar
   * @returns {Promise<any>} - Datos de respuesta
   */
  async put(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Realiza una petición DELETE
   * @param {string} endpoint - Endpoint de la API
   * @returns {Promise<any>} - Datos de respuesta
   */
  async delete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },
};

export default apiClient;
