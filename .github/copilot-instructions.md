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