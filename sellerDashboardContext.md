# Seller Dashboard — Full SaaS Development Context

## 1. Project Objective

Build a complete, modern, responsive, production-ready Seller Dashboard for a SaaS marketplace platform. The dashboard must allow sellers to manage their business, products, orders, analytics, reports, notifications, profile, and security settings from one centralized interface.

The implementation must follow the existing project's architecture, coding conventions, API structure, authentication system, and design system.

**Important:** Before writing code, inspect the existing project and identify reusable components, existing API endpoints, authentication logic, data models, and current branch changes. Do not replace existing working logic unnecessarily.

## 2. Dashboard Layout

Create a consistent dashboard layout with:

- Responsive sidebar navigation.
- Top navigation bar with page title, notifications, and seller profile menu.
- Main content area.
- Breadcrumbs where appropriate.
- Responsive mobile navigation.
- Loading, empty, error, and success states.
- Consistent spacing, typography, colors, cards, forms, and buttons.
- Accessible interactions and keyboard navigation.

### Sidebar Navigation

1. Overview
2. Analytics
3. Orders
4. My Products
5. Reports
6. Notifications
7. Settings

The active navigation item must be clearly distinguishable. Navigation must work correctly with the project's existing routing system.

## 3. Overview Page

Create a comprehensive dashboard overview with the following components.

### A. Statistics Cards

Display key business metrics using reusable stat cards:

- Total Revenue
- Total Orders
- Total Products
- Pending Orders

Where supported by the backend, also include completed orders, average order value, and revenue growth.

Each card should display its metric, an appropriate icon, and a comparison with the previous period when valid data is available.

### B. Revenue Line Chart

Create a responsive line chart for revenue trends over time.

Requirements:
- Daily, weekly, monthly, and yearly date-range options where supported.
- Clear X and Y axes.
- Tooltips displaying exact values.
- Loading and empty states.
- Consistent formatting for currency and dates.
- Data must come from actual seller-specific analytics.

### C. Analytics Pie Chart

Display a pie or doughnut chart representing a meaningful business breakdown, such as order status distribution or product category distribution.

Requirements:
- Clear chart labels and legend.
- Percentage and actual-value tooltips.
- Responsive layout.
- No fabricated analytics data.

### D. Recent Orders Component

Display a compact table or list of recent seller orders.

Each order should show:
- Order ID.
- Customer information permitted by the existing data-access rules.
- Product name or product summary.
- Quantity.
- Order date.
- Total order price.
- Order status.

Provide sorting options for:

- Total order price: low to high and high to low.
- Product name: A–Z and Z–A.

Include a link or action to view the complete order details.

Handle orders containing multiple products correctly. Do not assume that every order contains only one product.

### E. Top-Selling Products Component

Display the seller's best-performing products based on a clearly defined sales metric.

Each item should include:
- Product image.
- Product name.
- Units sold.
- Revenue generated.
- Current stock status, where available.

Support navigation to the relevant product details. Calculate rankings using actual order data and avoid counting cancelled or refunded orders as successful sales when the existing business rules exclude them.

## 4. Analytics Page

Create a dedicated analytics page with detailed seller-specific business insights.

### Analytics Layout

Display charts alongside supporting analytics data.

Required elements:
- Revenue trend line chart.
- Order status pie/doughnut chart.
- Sales by product chart.
- Top-selling products.
- Total revenue.
- Total orders.
- Average order value.
- Units sold.
- Product performance summary.

### Filters

Provide appropriate filters:
- Date range.
- Product, where applicable.
- Order status, where applicable.

All charts, summaries, and supporting data must update consistently when filters change.

Use real backend analytics when available. If a required analytics endpoint does not exist, identify the missing API contract instead of silently inventing production data.

## 5. Orders Page

Create a complete order management page for the authenticated seller.

### Orders Table

Display:
- Order ID.
- Order date.
- Customer details permitted by the application.
- Product summary.
- Quantity.
- Order total.
- Payment status.
- Fulfillment/order status.
- Available actions.

### Features

- Search by order ID or product name.
- Filter by date, payment status, and order status.
- Sort by date, price, and other meaningful fields.
- Pagination using the existing API pattern.
- View order details.
- Update order status only when permitted by the existing business rules.
- Clear loading, empty, error, and retry states.

Ensure the seller can access only orders they are authorized to manage. Preserve the distinction between payment status and fulfillment status.

## 6. My Products Page

Display all products belonging to the authenticated seller.

### Page Header

Include:
- Page title and short description.
- Total product count, if available.
- Prominent **Add Product** CTA.

### Add Product Modal

When the seller clicks Add Product, open a modal containing the product creation form.

The form should support the fields required by the existing product model, such as:

- Product name.
- Description.
- Price.
- Product images.
- Category.
- SKU, if supported.
- Stock quantity.
- Product status.
- Variants, if supported by the existing application.

Requirements:
- Client-side validation for usability.
- Server-side validation remains authoritative.
- Image upload must follow the project's existing upload service.
- Clear validation errors.
- Submit loading state.
- Prevent duplicate submissions.
- Close the modal and refresh the product list after successful creation.
- Preserve entered values when appropriate after validation failures.

### Product Management

Display:
- Product image.
- Product name.
- Price.
- Stock quantity.
- Product status.
- Created date.
- Available actions.

Support search, filtering, sorting, pagination, and product editing/deletion only where the backend supports these operations.

Include empty states and a CTA for sellers who have not added any products.

## 7. Reports Page

Create a centralized reporting page showing available business reports.

Potential reports include:
- Sales report.
- Revenue report.
- Orders report.
- Product performance report.
- Inventory/stock report.

Provide:
- Date-range filters.
- Relevant summary metrics.
- Tables and charts where useful.
- CSV or other export options only when supported by the application.
- Clear reporting periods and currency formatting.

Reports must be based on actual authorized seller data. Do not present sample figures as real business results.

## 8. Notifications Page

Display notifications relevant to the authenticated seller.

Each notification should support, where applicable:
- Notification title.
- Message.
- Notification type.
- Created date and time.
- Read/unread status.
- Related order or product.
- Navigation to the related resource.

Implement the following actions when supported by the backend:
- Mark as read.
- Mark all as read.
- Filter unread notifications.
- Navigate to the relevant order or product.

Display an unread notification count in the dashboard navigation. Keep notification state consistent across the application.

## 9. Settings Page

Create a settings page with a clear section-based layout or tabs.

### A. Seller Profile

Allow sellers to update:
- Full name.
- Profile image.
- Email and phone fields according to existing verification rules.
- Other supported profile fields.

Use the existing authentication and profile APIs. Sensitive account fields must not be changed through an ordinary profile update if the application requires a separate verification flow.

### B. Business Settings and Business Creation

Allow a seller who does not yet have a business to create one through a dedicated business creation form.

The form should include fields appropriate to the existing business model, such as:
- Business name.
- Business description.
- Business logo.
- Business category.
- Contact email.
- Contact phone.
- Business address.
- Website or social links, if supported.

Requirements:
- Validate required fields.
- Follow existing file-upload rules for logos.
- Submit to the actual business creation endpoint.
- Show field-specific server errors.
- Display a success state after successful creation.
- Update the seller's business state and dashboard data.
- Handle users who already have a business.
- Support editing business information when authorized.
- Follow existing business ownership and multi-business rules.

Do not assume every seller can own multiple businesses unless the existing backend supports it.

### C. Account & Security

Create an Account & Security section containing the security features supported by the existing authentication system.

Potential options:
- Change password.
- Email verification status.
- Active sessions.
- Sign out.
- Two-factor authentication or OTP configuration, if supported.

Do not implement fake security controls. OTP, password changes, session management, and two-factor authentication must use the appropriate backend and verification flows.

### D. Appearance

Provide appearance settings such as:
- Light theme.
- Dark theme.
- System theme.
- Sidebar preferences, if supported.

Use the project's existing theme system. Persist preferences through an existing settings API or an appropriate existing client-side persistence mechanism. Theme changes must apply consistently across all dashboard pages.

## 10. SaaS-Level Requirements

The dashboard should be built with production-quality SaaS conventions.

### Authentication and Authorization

- Require authentication for seller routes.
- Enforce seller-specific access control on the backend.
- Prevent sellers from accessing other sellers' products, orders, reports, analytics, and settings.
- Follow the existing authentication/session mechanism.
- Handle expired sessions and unauthorized requests correctly.

### Data Integrity

- Use real API responses and database-backed data.
- Keep revenue, order counts, and product sales calculations consistent.
- Respect the application's currency, timezone, pagination, and order-status conventions.
- Avoid double-counting products or orders.
- Exclude cancelled, refunded, or otherwise ineligible transactions according to the existing business rules.
- Never use hardcoded production metrics.

### User Experience

- Responsive desktop, tablet, and mobile layouts.
- Consistent design system.
- Reusable components.
- Accessible forms, tables, dialogs, and charts.
- Useful feedback for every mutation.
- Skeletons or loading indicators.
- Empty states with actionable guidance.
- Error messages with retry options.
- Confirmation dialogs for destructive operations.
- No unnecessary full-page reloads.

### Performance

- Use pagination for large datasets.
- Avoid unnecessary API requests.
- Prevent redundant component re-renders.
- Lazy-load heavy components when beneficial.
- Use efficient chart rendering and derived calculations.
- Follow the framework's established data-fetching and caching conventions.

## 11. Suggested Component Structure

Adapt these names and folders to the existing project instead of restructuring the application unnecessarily.

- `SellerDashboardLayout`
- `SellerSidebar`
- `SellerHeader`
- `StatCard`
- `RevenueLineChart`
- `AnalyticsPieChart`
- `RecentOrders`
- `RecentOrdersTable`
- `TopSellingProducts`
- `OrdersTable`
- `OrderFilters`
- `ProductList`
- `ProductCard` or `ProductTable`
- `AddProductModal`
- `ProductForm`
- `AnalyticsFilters`
- `SalesReport`
- `NotificationList`
- `SellerProfileForm`
- `BusinessCreationForm`
- `AccountSecuritySettings`
- `AppearanceSettings`

Keep components focused on a single responsibility. Extract reusable UI and business logic where doing so improves clarity.

## 12. API and Data Integration Rules

Before implementation:

1. Inspect the existing API client and service modules.
2. Identify existing endpoints for seller profile, business creation, products, orders, notifications, and analytics.
3. Reuse existing endpoints and data models whenever possible.
4. Follow the established request/response and error-handling patterns.
5. Keep API communication out of presentational components when the project already uses a service layer.
6. Add or propose missing backend endpoints only when necessary and consistent with the project's architecture.
7. Do not bypass the existing authentication system.
8. Do not introduce duplicate API clients or conflicting state-management solutions.
9. Keep frontend and backend validation consistent.
10. Never claim a feature is fully functional until its required backend integration has been verified.

## 13. Implementation Workflow

Follow this order:

1. Inspect the repository, active branch, dependencies, routes, components, and API architecture.
2. Identify the existing seller/business/product/order models and authentication rules.
3. Prepare a short implementation plan and identify any missing backend capabilities.
4. Build or refine the dashboard layout and sidebar navigation.
5. Implement the Overview page.
6. Implement Analytics and Orders.
7. Implement My Products and the Add Product modal.
8. Implement Reports and Notifications.
9. Implement Profile, Business Creation, Account & Security, and Appearance settings.
10. Integrate actual API data and mutation flows.
11. Test responsive layouts and all loading, empty, success, and error states.
12. Run the available lint, type-check, build, and relevant tests.
13. Fix regressions and report any remaining backend dependencies.

## 14. Strict Development Rules

- Preserve the existing project's architecture and working business logic.
- Do not rewrite unrelated modules.
- Do not create duplicate components or services when suitable implementations already exist.
- Do not change backend contracts without checking their existing usage and compatibility.
- Do not invent API endpoints, database fields, response formats, or permissions.
- Do not use fake production data.
- Do not introduce unnecessary dependencies.
- Keep the code readable, maintainable, and easy for a junior developer to debug.
- Use TypeScript types consistent with actual API schemas.
- Handle errors explicitly.
- Keep changes scoped to the seller dashboard unless another change is necessary and justified.
- Document any required backend changes and explain why they are necessary.

## 15. Definition of Done

The Seller Dashboard is complete when:

- All sidebar routes work.
- Overview charts and stat cards use correct seller-specific data.
- Recent orders can be sorted by order price and product name.
- Top-selling products use a consistent sales metric.
- Analytics filters update the corresponding data.
- Orders can be searched, filtered, and viewed.
- Sellers can create products through the Add Product modal.
- Reports and notifications show actual authorized data.
- Profile and business settings use real backend operations.
- Account/security options work with the existing authentication system.
- Appearance settings persist according to the project's design.
- Authorization, validation, loading, empty, and error states are handled correctly.
- The application passes available type checks, linting, tests, and production build checks.

**Final instruction:** Inspect first, plan second, implement third. Prioritize correctness, maintainability, security, and integration with the existing application over unnecessary architectural changes or visual complexity.