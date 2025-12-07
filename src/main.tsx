import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";

// Initialize Sentry as early as possible
Sentry.init({
  dsn: "https://<SENTRY_DSN>@<ORG>.ingest.sentry.io/<PROJECT>",
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  // Capture 100% of transactions in development, reduce in production
  tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
  // Control which URLs get distributed tracing
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/dashboard\.your-domain\.example/,
    /^https:\/\/YOUR_PROJECT_REF\.supabase\.co/,
  ],
  // Only enable in production
  enabled: import.meta.env.PROD,
});

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary
    fallback={({ error, resetError }) => (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">
            We've been notified and are working on a fix. Please try refreshing the page.
          </p>
          <button
            onClick={resetError}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )}
    showDialog
  >
    <App />
  </Sentry.ErrorBoundary>
);
