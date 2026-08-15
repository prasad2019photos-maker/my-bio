// Centralized runtime configuration for small site-level constants.
// Use VITE_ prefix for variables exposed to client code via import.meta.env.
export const SERVICE_WEBSITE_URL = (import.meta.env.VITE_SERVICE_WEBSITE_URL as string) || "https://example.com/services";
