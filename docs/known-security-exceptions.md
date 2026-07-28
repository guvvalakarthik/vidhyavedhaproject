# Known security exception

## React Router RSC advisory

`npm audit --omit=dev` currently reports GHSA-qwww-vcr4-c8h2 against the latest stable `react-router-dom` release. The advisory is specific to React Server Components action handling.

Vidhya Vedha is currently a browser-only single-page application. It uses `BrowserRouter`, declarative routes, and client-side navigation; it does not enable React Server Components, framework actions, server actions, or React Router's RSC request handlers. The affected execution path is therefore not present in this application.

The dependency remains on the latest stable release so it includes fixes for earlier router advisories. Remove this exception as soon as React Router publishes a stable version outside the affected range. Re-run `npm audit --omit=dev` during every dependency update.