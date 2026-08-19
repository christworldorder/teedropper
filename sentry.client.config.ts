import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  integrations: [Sentry.replayIntegration()],
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.0,
  ignoreErrors: [
    /window\.webkit\.messageHandlers/,
    /undefined is not an object \(evaluating 'window\.webkit/,
  ],
});
