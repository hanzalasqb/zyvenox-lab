# Project TODO

- [x] Initialize full-stack template and review project structure
- [x] Define database schema and seed data for Zyvenox Lab (services, projects, portfolio items, stats, team members, contact info, settings)
- [x] Create backend tRPC routers for public data retrieval and admin CRUD operations
- [x] Implement robust frontend routing and breadcrumb navigation (Home, Services, Projects, Success Rate, About, Contact)
- [x] Build theme-aware 3D animated canvas background and GPU-accelerated keyframe animations
- [x] Build public UI components with professional typography, Lucide icons, and light/dark theme support
- [x] Implement secure hardcoded admin panel at `/admin12-45` with credentials `hanzala` / `hanzala-zyvenox`
- [x] Implement local media upload and portfolio visibility toggle in admin panel
- [x] Add comprehensive SEO metadata, JSON-LD schemas, sitemap.xml, and robots.txt
- [x] Run tests and verify responsiveness, accessibility, and functionality

- [x] Add interactive project cost estimator and timeline calculator to the contact page
- [x] Implement secure client portal for submitting and tracking project briefs
- [x] Implement downloadable PDF case study generation for projects
- [x] Repair admin authentication and session persistence bugs at `/admin12-45`
- [x] Optimize technical SEO with B2B tech-client schema markup and targeted metadata
- [x] Run comprehensive test suite and verify UI/UX across breakpoints
- [x] Secure project brief ownership by linking briefs to authenticated client accounts or verified email ownership
- [x] Add browser-verified checks for client registration/login, brief submission and tracking, and PDF download behavior
- [x] Run and document accessibility validation including keyboard flow, focus visibility, form labels, and contrast
- [x] Run broader breakpoint checks for portal, estimator, admin brief management, and project downloads
- [x] Browser-verify the rendered Projects download button produces a completed PDF file without console-injected download logic
- [x] Run and document keyboard navigation, visible focus, and contrast checks across Contact, portal, and admin flows
- [x] Capture authenticated admin brief-management layouts on mobile and tablet and test project download controls at those breakpoints
- [x] Run and document keyboard navigation, visible focus-state, and contrast checks for the client portal and authenticated admin flows
- [x] Capture authenticated admin brief-management UI at mobile and tablet breakpoints, not just the login boundary
- [x] Test rendered project PDF download controls at mobile and tablet breakpoints and document successful behavior
- [x] Run a concrete authenticated portal accessibility check with active-element inspection and theme contrast measurement
- [x] Capture authenticated Client briefs UI at mobile and tablet widths using a session-preserving verification method
- [x] Activate rendered Projects download controls at mobile and tablet widths and verify created PDF files
- [x] Run authenticated portal keyboard navigation until a real interactive control is focused, then record active-element styling and contrast
- [x] Re-run mobile and tablet PDF download checks with isolated directories or distinct filenames for independent artifacts

- [x] Add visual milestone progress bar and recent activity log to the client portal dashboard
- [x] Add AI-powered chat assistant widget to the home page for instant service navigation and answers

- [x] Upgrade AI chatbot to collect user requirements and automatically pre-fill contact estimator
- [x] Add secure file upload section within the client portal for project assets and documents
- [x] Enable admin panel controls to customize chatbot initial greetings and suggested quick replies

- [x] Remove all image URL entry inputs from admin panels and replace with laptop file uploads
- [x] Route all public (projects, portfolio, team) and private (client portal) media uploads through managed S3 storage with strict server-side size and MIME validation

- [x] Audit and ensure 100% link workability across all public pages, subsections, breadcrumbs, footer links, and CTAs
- [x] Ensure all admin panel sections (Services, Projects, Portfolio, Stats, Team, Contacts, Settings, Briefs) are fully editable, maintainable, and operational
- [x] Confirm zero external URL inputs remain for photos/media, ensuring all media is uploaded from local disk / laptop into managed storage

- [x] Make portfolio section permanently visible on main website and remove admin toggle

- [x] Enhance admin dashboard with recent website activity and visitor statistics
- [x] Confirm portfolio section is permanently visible on public website without radio/toggle dependency

- [x] Add 30-day visitor trend visual chart to the admin dashboard
- [x] Add Portfolio link to the public navigation header

- [x] Implement click-to-open portfolio detail modals with extended information and additional uploaded images
- [x] Implement a clear dark-mode toggle switch in the public navigation header

- [ ] Integrate Stripe payment processing for client milestones via feature or custom backend handlers
- [ ] Implement transactional email notifications for project milestones, passkeys, and account actions
- [ ] Implement WebAuthn passkey registration and authentication with email notification
- [ ] Implement secure email-based password recovery flow with expiring signed tokens
- [ ] Implement admin user search by email with privacy controls and audit logging
- [ ] Remove Manus branding, runtime files, and dependencies completely
- [ ] Enhance AI-readable semantic markup, accessibility, and user clarity across all pages

- [x] Implement password reset form with strength validation, clear errors, and success confirmation
- [x] Implement debounced real-time autocomplete dropdown for admin user email search

- [x] Implement secure admin client directory showing client usernames/names, emails, and password-reset request tracking (excluding raw plaintext/hashes)
- [x] Implement privacy-safe "check your email" success message for forgot-password requests

- [x] Implement admin button to manually trigger password reset email for a selected client
- [x] Implement admin account status toggle to suspend or activate client accounts
- [x] Display client name/username and email in admin client directory without exposing plaintext passwords

- [x] Implement secure client account deletion procedure and UI control in admin panel
- [x] Implement client conversation and admin reply view inside brief/client management
