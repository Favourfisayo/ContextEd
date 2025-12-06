// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://e22500ebd58e2b88676aeac6eb642fcc@o4510484265828352.ingest.de.sentry.io/4510484334379088",

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampler: (samplingContext) => {
  const { inheritOrSampleWith } = samplingContext;
  // Sample all transactions in development
  if (process.env.NODE_ENV === "development") {
    return 1.0;
  }
  // Sample 25% in production
  if (process.env.NODE_ENV === "production") {
    return 0.25;
  }
  // Sample 20% in staging
  return inheritOrSampleWith(0.2);
},

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});
