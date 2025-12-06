import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: "https://7c09a3f32ab62c0db78edf8e44cdac40@o4510490092503040.ingest.us.sentry.io/4510490092765184",
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
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});