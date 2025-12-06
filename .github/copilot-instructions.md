Overall Architecture

Always refer to external documentations when uncertain about how to handle certain things, especially when working with external libraries, tools, and frameworks.

Use a feature-based folder structure.
Each feature lives inside src/features/<featureName>/ and should contain:

components/ → UI components for this feature only

lib/ → server actions, data-fetching logic, validation, helpers

types.ts or schema.ts when needed

Keep features isolated. Shared components should go in src/components/ and shared utilities in src/lib/.

Data Fetching

Always use TanStack Query for client-side data fetching and mutations.

Queries and mutations should be defined inside the feature’s lib/ folder.

Every API call must target the Express backend server.

Example structure Copilot should follow:

src/features/courses/
  components/
  lib/
    queries.ts
    mutations.ts
    api.ts

UI & Styling

Prefer shadcn/ui components for forms, dialogs, dropdowns, inputs, buttons, sheets, toasts, etc.

Extend or wrap shadcn components inside the feature’s own components/ folder when custom behavior is needed.

Use lucide-react for all icons. No other icon set should appear.

Responsiveness & Accessibility

All UI must be responsive. Copilot should follow:

Mobile-first layout thinking

Flex and grid patterns that collapse gracefully

Follow WCAG accessibility expectations:

Proper aria attributes

Keyboard navigation support

Semantic HTML whenever possible

When generating components, Copilot should think about small details like focus states, labels, and screen reader text.

Date Handling

Any time formatting or parsing must use date-fns.

General Expectations

Keep the code clean and typesafe.

Organize imports consistently following feature boundaries.

Avoid creating global utility mess — every feature keeps its own logic unless it’s truly shared.

Don't create uneccessary .md summary files, unless asked for.


These examples should be used as guidance when configuring Sentry functionality within a project.

# Exception Catching

Use `Sentry.captureException(error)` to capture an exception and log the error in Sentry.
Use this in try catch blocks or areas where exceptions are expected

# Tracing Examples

Spans should be created for meaningful actions within an applications like button clicks, API calls, and function calls
Use the `Sentry.startSpan` function to create a span
Child spans can exist within a parent span

## Custom Span instrumentation in component actions

The `name` and `op` properties should be meaninful for the activities in the call.
Attach attributes based on relevant information and metrics from the request

```javascript
function TestComponent() {
  const handleTestButtonClick = () => {
    // Create a transaction/span to measure performance
    Sentry.startSpan(
      {
        op: "ui.click",
        name: "Test Button Click",
      },
      (span) => {
        const value = "some config";
        const metric = "some metric";

        // Metrics can be added to the span
        span.setAttribute("config", value);
        span.setAttribute("metric", metric);

        doSomething();
      },
    );
  };

  return (
    <button type="button" onClick={handleTestButtonClick}>
      Test Sentry
    </button>
  );
}
```

## Custom span instrumentation in API calls

The `name` and `op` properties should be meaninful for the activities in the call.
Attach attributes based on relevant information and metrics from the request

```javascript
async function fetchUserData(userId) {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: `GET /api/users/${userId}`,
    },
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      return data;
    },
  );
}
```

# Logs

Where logs are used, ensure Sentry is imported using `import * as Sentry from "@sentry/nextjs"`
Enable logging in Sentry using `Sentry.init({  enableLogs: true })`
Reference the logger using `const { logger } = Sentry`
Sentry offers a consoleLoggingIntegration that can be used to log specific console error types automatically without instrumenting the individual logger calls

## Configuration

In NextJS the client side Sentry initialization is in `instrumentation-client.(js|ts)`, the server initialization is in `sentry.server.config.ts` and the edge initialization is in `sentry.edge.config.ts`
Initialization does not need to be repeated in other files, it only needs to happen the files mentioned above. You should use `import * as Sentry from "@sentry/nextjs"` to reference Sentry functionality

### Baseline

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://1b4792218af5c7620f4d468817e830a5@o4510484265828352.ingest.de.sentry.io/4510484313669712",

  enableLogs: true,
});
```

### Logger Integration

```javascript
Sentry.init({
  dsn: "https://1b4792218af5c7620f4d468817e830a5@o4510484265828352.ingest.de.sentry.io/4510484313669712",
  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
});
```

## Logger Examples

`logger.fmt` is a template literal function that should be used to bring variables into the structured logs.

```javascript
logger.trace("Starting database connection", { database: "users" });
logger.debug(logger.fmt`Cache miss for user: ${userId}`);
logger.info("Updated profile", { profileId: 345 });
logger.warn("Rate limit reached for endpoint", {
  endpoint: "/api/results/",
  isEnterprise: false,
});
logger.error("Failed to process payment", {
  orderId: "order_123",
  amount: 99.99,
});
logger.fatal("Database connection pool exhausted", {
  database: "users",
  activeConnections: 100,
});
```