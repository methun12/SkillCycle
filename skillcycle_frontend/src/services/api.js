`frontend/src/services/api.js`


import axios from 'axios';
// We import the store here, but we will initialize it inside the interceptors
// to avoid circular dependency issues, especially on app startup.
import { useAuthStore } from '@/store/auth';

/**
 * =================================================================
 * API Client Configuration (Axios)
 * =================================================================
 * This file creates and configures a centralized Axios instance for
 * making all HTTP requests to the backend API.
 */


// 1. Get the API Base URL from Environment Variables
// -----------------------------------------------------------------
// Vite exposes environment variables from .env files on the `import.meta.env` object.
// IMPORTANT: The variable name in your .env file MUST be prefixed with `VITE_`.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// A simple validation check to catch configuration errors early.
if (!apiBaseUrl) {
  // This error will be visible in the browser's developer console.
  console.error(
    "FATAL ERROR: VITE_API_BASE_URL is not defined in your .env file. " +
    "Please create a .env file in the root of the 'frontend' directory and add the variable."
  );
}


// 2. Create the Axios Instance
// -----------------------------------------------------------------
const apiClient = axios.create({
  // Use the environment variable for the base URL.
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});


// 3. Configure Interceptors
// -----------------------------------------------------------------
// Interceptors allow us to run code before a request is sent or after a response is received.

/**
 * Request Interceptor
 * This runs BEFORE every request is sent. It's used to automatically
 * attach the JWT Authorization header to every API call.
 */
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * This runs AFTER a response is received. It's used for global
 * error handling, especially for 401 Unauthorized errors.
 */
apiClient.interceptors.response.use(
  (response) => {
    // If the response is successful (2xx status code), just return it.
    return response;
  },
  (error) => {
    // If we get a 401 error, the user's token is invalid or expired.
    // We should log them out and redirect to the login page.
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore();
      console.error('API responded with 401 Unauthorized. Logging out.');
      authStore.logout(); // This will clear the user's state.

      // A full page reload to the login page is a simple and effective
      // way to reset the application's state completely.
      window.location.href = '/login';
    }

    // For all other errors, we pass them along.
    return Promise.reject(error);
  }
);


// 4. Export the configured instance
// -----------------------------------------------------------------
export default apiClient;