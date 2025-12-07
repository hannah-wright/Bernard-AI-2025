/**
 * Shared CORS Headers
 * 
 * Centralized CORS configuration for all Edge Functions.
 * Uses environment variable for production domain, with fallback for development.
 */

// Production domain
const PRODUCTION_ORIGIN = "https://your-domain.example";

// All allowed origins (production + development)
const ALLOWED_ORIGINS = [
  PRODUCTION_ORIGIN,
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:5173",
];

// Default origin for non-browser requests
const ALLOWED_ORIGIN = PRODUCTION_ORIGIN;

export function getCorsHeaders(requestOrigin?: string | null): Record<string, string> {
  // Check if request origin is in allowed list
  const origin = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin) 
    ? requestOrigin 
    : ALLOWED_ORIGIN;

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Max-Age": "86400", // Cache preflight for 24 hours
  };
}

// Simple version for most cases (uses first allowed origin)
export const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Handle OPTIONS preflight request
export function handleCorsPrelight(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("Origin");
    return new Response(null, { 
      headers: getCorsHeaders(origin),
      status: 204,
    });
  }
  return null;
}

