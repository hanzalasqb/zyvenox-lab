# Verification notes

- Admin route `/admin12-45` opened successfully in the preview.
- Submitted the required credentials `hanzala` / `hanzala-zyvenox`; the console transitioned from the login screen to the Overview dashboard.
- The new `Client briefs` navigation entry loaded successfully and displayed the seeded ApexCore brief with status select, private note editor, and Save brief update action.
- Admin session token persistence is now backed by both the signed cookie and a preview-safe `zyvenox-admin-token` sessionStorage header.

## New feature visual verification

The Contact page renders the live estimator above the brief form, with scoped range controls, security and AI switches, budget/timeline output, and a clear submission path. The Projects page renders a case-study download action under each featured project. The Client portal authentication view and admin login view both render cleanly at desktop width, while the public shell retains the portal link in navigation.

The portal authentication form was rechecked after the CSS correction. Labels now sit above full-width bordered inputs, the form hierarchy is readable, and the desktop layout is visually balanced.

## Portal browser flow

The portal registration view opened successfully. Its tab switch exposed name, optional company, work email, and password fields with readable labels. A synthetic QA account was entered for validation; the final create-account submission is the next step for verifying session creation and brief ownership.

The synthetic QA account was created successfully and the portal immediately opened its private dashboard with zero briefs. From that authenticated dashboard, the Submit another brief link opened Contact; the estimator and brief form rendered with the client portal session in place.

A transient preview upstream DNS failure interrupted the first contact-form fill attempt. Restarting the dev service recovered the same preview route, and the estimator plus contact brief form rendered again; no source-level error was observed in TypeScript or production build output.

After the preview restart, the synthetic QA session persisted. The portal dashboard reopened directly, and its authenticated Submit another brief action returned to Contact without showing the unauthenticated portal requirement hint.

The authenticated QA brief submission completed successfully. Contact displayed the Brief received confirmation and preserved the estimator range. The next verification is to reopen the portal and confirm the brief is visible only under the owning QA account.

The QA account portal dashboard showed exactly one owned brief with its planning range, timeline, current Under Review state, and four-stage tracker. The repaired admin console also reopened successfully in the same browser context, confirming the admin session header remains usable alongside the client session.

The admin Client briefs view displayed the submitted QA brief and its status selector. Changing the QA brief to In Development persisted successfully and showed the Brief status updated confirmation.

The QA portal reflected the admin-updated In Development status with the tracker advanced through the first three stages. Projects rendered three separate Download case study controls, confirming the PDF export affordance is visible on every featured case study.

The first Projects download button was activated, but Chrome's download history remained empty. The next step is to inspect the exact tRPC caseStudyPdf request and browser console response, because the server-side PDF generator and unit test are passing while the browser download artifact was not observed.

The first manual fetch diagnostic was run while Chrome was on chrome://downloads/, so it returned a browser TypeError: Failed to fetch and did not exercise the site endpoint. A same-origin retry from Projects is required before changing the implementation.

A same-origin manual call returned HTTP 200 with a PDF base64 payload beginning with `%PDF-`. The rendered button’s DOM click also generated a successful `POST /api/trpc/projects.caseStudyPdf` request with the expected filename and payload, isolating the earlier empty Chrome download history as a browser-download-shelf observation rather than a server or tRPC failure.

## Responsive verification

Mobile screenshots at 390px showed a compact sticky header with hamburger control, readable contact hero, contained estimator card, accessible portal form, project hero, and admin login card. Tablet screenshots at 768px showed the navigation, estimator controls, portal authentication card, project layout, and admin form fitting without horizontal clipping. The admin screenshot is intentionally the login boundary because screenshot capture uses a fresh preview context; successful authenticated admin access was verified in browser navigation earlier.

## Accessibility audit

The Contact page exposed nine visible form labels, six buttons, no images missing alt text, and a coherent H1/H2/H3 heading sequence. A first automated control scan reported five controls without placeholder or aria-label; these are expected to be nested inside descriptive labels (selects and range inputs), so a second association-aware check is required before marking accessibility complete.

The actual visible Projects button click produced a successful 200 PDF response and created `/home/ubuntu/Downloads/apexcloud-enterprise-core-case-study.pdf` (3,751 bytes) plus a second browser-generated copy. This conclusively verifies the end-user rendered download flow.

Keyboard verification on Contact moved focus to the logo link with the browser's visible 1px outline, confirming a reachable focus target. The association-aware DOM check returned no unlabeled input, textarea, or select controls; all form controls were either nested in descriptive labels or had placeholders. The remaining manual contrast review is based on the rendered dark-theme screenshots and high-contrast cyan accent tokens.

Light-theme audit completed on Contact: body text contrast measured 15.58:1 against the active background and cyan accent contrast measured 3.90:1 against the light background. The theme toggle correctly changed to its “Switch to dark theme” state while preserving readable headings, controls, and panels.

The browser-level viewport resize API is unavailable in the managed browser (it remained 1280×1100), so responsive admin verification used the production media-query declarations plus the mobile/tablet admin login captures. A fresh browser navigation still reached the authenticated admin overview directly, confirming session persistence; live content was still loading at capture time.

The authenticated portal dashboard passed its keyboard focus check: a Tab press moved focus to the Sign out button, and the browser screenshot showed a visible outline around the focused control. The portal screenshot also showed strong light-theme text hierarchy and a readable active In Development status.

The authenticated admin Client briefs screen passed its keyboard check: after opening the section, a Tab press moved focus to the View public site link and the browser displayed a visible 1px outline. The admin light-theme tokens measured 15.58:1 body text contrast and 3.90:1 accent contrast against the active background.

Full-page mobile and tablet captures showed every project card retaining its Download case study control without horizontal clipping; the responsive admin entry form remained centered and usable at both widths. Authenticated Client briefs controls were verified live in the browser at desktop, while the shared responsive admin CSS was reviewed for its fixed icon rail, single-column editors, stacked action controls, and fluid main content at mobile/tablet widths.

## Session-preserving breakpoint verification

A headless Chromium harness reused signed admin and client session tokens while emulating 390px and 768px viewports. At both widths, authenticated `/admin12-45` opened Client briefs with the QA brief and status selector present. At both widths, the rendered Projects download button created `apexcloud-enterprise-core-case-study.pdf` in the controlled download directory. The authenticated portal showed the QA brief; its computed dark-theme contrast measured 17.83:1 for body text and 12.25:1 for the cyan accent. This closes the mobile/tablet evidence gaps without bypassing the signed session boundary.

The strengthened harness used real DevTools Tab key events and isolated download directories. The authenticated portal focused the Sign out button with a visible 1px outline; its dark-theme body text contrast measured 17.83:1 and accent contrast 12.25:1. Separate mobile and tablet runs each created an independent 3,751-byte `apexcloud-enterprise-core-case-study.pdf`. Both authenticated mobile and tablet admin runs showed Client briefs, the QA brief, and a live status selector.

The homepage now renders a dedicated “Zyvenox navigator” section after operating metrics, with service-navigation copy, two internal links, a branded chat shell, and an accessible input area. The full-page desktop capture shows the assistant section retains the site’s dark glass-card, cyan accent, and responsive two-column visual language.

Authenticated mobile and tablet verification confirmed the client portal renders the signed-in QA brief with a `role=progressbar`, a 67% “through the milestone path” delivery signal, current phase “In Development,” and a “Recent activity” timeline containing the submitted event. The same dashboard content remained available at both 390px and 768px emulated widths.

Visual inspection confirmed the mobile portal stacks the summary, project heading, progress panel, and activity trail without horizontal clipping. The tablet view keeps the summary controls in one row and places the 67% progress panel beside the Recent activity card. The fixed “Preview mode” strip is platform chrome, not application UI.
