# TrustPass — Complete Project-Wide UI/UX Modernization Context

## 1. Project Objective

I want to modernize the entire TrustPass project into a polished, premium, modern, and exceptionally smooth user interface inspired by Instagram's fluid user experience and HeroUI v3's clean design philosophy.

This is a **full-project UI/UX consistency and responsiveness task**, not an isolated component redesign.

Every existing page, section, layout, component, modal, dialog, CTA, button, form, input, dropdown, navigation item, card, table, badge, notification, heading, paragraph, icon, and interactive element must follow a unified design system.

The final product should feel professional, trustworthy, lightweight, visually consistent, mobile-friendly, and smooth on every supported screen size.

Use Instagram as inspiration for interaction smoothness and responsive behavior, not as a request to copy its branding or exact interface. TrustPass must retain its own identity as a digital trust platform.

## 2. Mandatory Technical Constraints

- Use the project's existing `tailwindcss@4` setup.
- Reuse the existing `@shadcn/react` primitives and current UI component architecture.
- Use Tailwind CSS utilities and shared CSS design tokens wherever appropriate.
- Do NOT install the HeroUI package.
- Do NOT replace the existing framework, styling architecture, or component library without permission.
- Do NOT introduce unnecessary dependencies.
- Preserve existing API integrations, authentication, business logic, routes, permissions, form validation, and functional behavior.
- Do NOT modify backend/server code as part of this UI-only task.
- Keep the code readable, maintainable, reusable, and easy for a junior developer to understand.
- Reuse existing shared components instead of creating duplicate implementations.
- Preserve existing project conventions and established functionality.

## 3. Unified Design System

First, audit the existing project and establish a single source of truth for visual styling.

Define and consistently use design tokens for:

- Primary brand color and accent colors.
- Backgrounds, foregrounds, surfaces, and nested surfaces.
- Text colors and muted text.
- Borders, separators, and focus rings.
- Success, warning, danger, and informational states.
- Border radius and control shapes.
- Spacing, padding, margins, and component gaps.
- Typography, font sizes, line heights, and font weights.
- Shadows and elevation.
- Transition durations and easing functions.
- Disabled, loading, hover, focus, pressed, and selected states.

Use the existing design blueprint and CSS variables where appropriate. Map the brand blue consistently to the project's existing primary-color conventions. Avoid introducing conflicting token names or duplicating existing variables.

Use a restrained, premium visual language: clean neutral surfaces, readable typography, subtle borders, carefully applied brand colors, balanced whitespace, and consistent component shapes.

Every color must have a clear semantic purpose. Avoid random colors, excessive gradients, unnecessary shadows, and inconsistent styling between pages.

Support both light and dark themes if they already exist in the project.

## 4. Complete Color and Visual Consistency

Review every color throughout the entire application.

This includes:

- Page backgrounds and section backgrounds.
- Cards, dashboards, sidebars, navigation bars, and dropdowns.
- Primary, secondary, outline, ghost, and destructive buttons.
- CTA banners and highlighted sections.
- Modal backdrops and dialog surfaces.
- Input backgrounds, placeholders, borders, and focus states.
- Text, headings, links, and helper descriptions.
- Status badges, verification states, and notifications.
- Tables, charts, empty states, loading skeletons, and error messages.
- Icons, dividers, hover backgrounds, and selected states.

Replace arbitrary one-off styling with reusable semantic tokens wherever possible.

Maintain appropriate text/background contrast. Use a consistent brand accent and keep primary actions visually distinct from secondary actions.

## 5. Smooth Interaction and Motion

All interactive components should feel fluid and predictable, similar to the responsiveness of a well-crafted modern social application.

Use consistent, subtle transitions:

- Micro-interactions: approximately 150ms.
- Standard hover and state changes: approximately 150–200ms.
- Modal and popover transitions: approximately 200ms.
- Larger transitions: up to 300ms only when justified.

Use an appropriate easing curve such as `cubic-bezier(0.4, 0, 0.2, 1)`.

Apply smooth transitions to relevant properties such as:

- Background and text colors.
- Border colors and shadows.
- Opacity and transforms.
- Button press states.
- Dropdown and popover visibility.
- Modal and dialog entry/exit.
- Card hover states.
- Navigation and tab selection.
- Focus and validation states.

Use subtle pressed feedback such as `active:scale-[0.97]` when appropriate. Interactive cards may use a slight lift on hover, but avoid excessive movement.

Important rules:

- Do not animate every element unnecessarily.
- Avoid distracting bouncing, exaggerated zooming, and heavy animations.
- Do not animate layout properties when a transform or opacity transition is sufficient.
- Respect `prefers-reduced-motion`.
- Preserve keyboard interaction and visible keyboard focus.
- Avoid adding transitions that interfere with existing component behavior.

Every interaction should feel intentional, lightweight, and consistent.

## 6. Responsive Design — Every Element

The entire application must be mobile-first and responsive, including individual component dimensions.

Responsiveness applies to all of the following:

- Width and maximum width.
- Height and minimum height.
- Margins and padding.
- Gaps and spacing.
- Font size and line height.
- Border radius and border width.
- Button and input dimensions.
- Card and modal layouts.
- Grid and flex arrangements.
- Icon sizes and alignment.
- Navigation and sidebar behavior.
- Tables, charts, forms, and long text.
- Image aspect ratios and cropping.

Use responsive Tailwind utilities such as `sm:`, `md:`, `lg:`, `xl:`, and `2xl:` when appropriate.

Prefer fluid typography using `clamp()` and the existing fluid typography tokens. Use flexible widths, `min-w-0`, `max-w-full`, wrapping, responsive grids, and content-aware sizing.

Avoid unnecessary fixed pixel dimensions. Use fixed dimensions only when there is a clear design or functional reason.

Test narrow screens, including widths around 320px and 360px, as well as tablet, laptop, and large desktop layouts.

Acceptance requirements:

- No unintended horizontal page overflow.
- No clipped text, overlapping elements, or broken layouts.
- No buttons or form controls extending beyond their containers.
- No unreadable typography on small screens.
- No modal content that becomes inaccessible on mobile.
- No dashboard cards that force desktop-width layouts on phones.
- No navigation elements that become unusable on touch devices.

For data tables, use a suitable responsive strategy such as horizontal scrolling or an appropriate mobile-specific presentation. Never silently remove important information just to make a layout fit.

Use touch-friendly interactive targets, preferably around 40–44px or larger where practical.

## 7. Typography and Text Responsiveness

Review every text element across the project.

This includes page titles, section headings, card titles, body text, helper text, labels, descriptions, table cells, badges, button labels, error messages, empty states, and notifications.

Requirements:

- Use a consistent typographic hierarchy.
- Apply fluid heading sizes where appropriate.
- Maintain comfortable body-text readability.
- Use suitable line heights and letter spacing.
- Prevent long words, URLs, and user-generated content from breaking layouts.
- Use balanced heading wrapping where supported.
- Keep text aligned and spaced consistently.
- Ensure sufficient contrast between primary and muted text.
- Use tabular numerals for appropriate financial figures, counts, and trust scores.
- Maintain clear visual distinction between headings, descriptions, labels, and actions.

Do not make all text the same size. Establish a deliberate hierarchy that remains readable at every breakpoint.

Do not rewrite business content, change product meaning, or alter user-facing copy unnecessarily during visual refactoring.

## 8. Buttons, CTA, and Interactive Controls

Create a consistent appearance and interaction model for all buttons and calls to action.

Use semantic variants:

- Primary: the main action on a screen.
- Secondary: an alternative action.
- Tertiary/outline: a lower-emphasis action.
- Ghost: subtle navigation or contextual action.
- Danger: destructive actions.

Ensure consistent padding, height, typography, radius, icon spacing, disabled states, and loading states.

Primary CTA buttons should be prominent without overpowering the surrounding content. Avoid multiple competing primary actions within the same visual region.

All buttons must have clear hover, focus-visible, pressed, disabled, and loading behavior where relevant.

Preserve their actual functionality. Do not replace working handlers with decorative buttons or introduce placeholder actions.

## 9. Modal, Dialog, Dropdown, and Popover Design

Modernize every existing modal and overlay to follow the same design language.

Requirements:

- Consistent surface colors and border radius.
- Clear title, description, content, and footer hierarchy.
- Responsive width and height.
- Proper internal spacing.
- Scrollable content when necessary.
- A subtle backdrop with restrained blur when appropriate.
- Smooth opacity and transform transitions.
- Accessible close controls.
- Correct keyboard and focus behavior.
- Proper stacking and overlay handling.
- Mobile-safe positioning and viewport constraints.

Avoid dialogs that overflow the viewport or hide their primary actions below inaccessible content.

Reuse the existing dialog and modal primitives instead of implementing a new modal system unnecessarily.

## 10. Forms, Inputs, and Validation

Apply consistent styling to every form, including authentication, profile management, business creation, document upload, product management, and reporting forms.

Ensure:

- Consistent labels and field spacing.
- Responsive input widths.
- Clear placeholder and helper text.
- Visible keyboard focus.
- Consistent border and radius.
- Clear validation and error states.
- Loading and submission feedback.
- Disabled-state styling.
- Proper spacing between fields and actions.
- Accessible labels and error descriptions.

Preserve all existing validation, API calls, authentication behavior, form state, and submission logic.

Do not make forms visually polished at the cost of usability or accessibility.

## 11. Cards, Dashboards, Tables, and Charts

Standardize the styling of cards and data-heavy interfaces.

Cards should use consistent surface colors, padding, borders, radii, and restrained shadows.

Dashboard layouts should adapt to available space rather than forcing fixed desktop dimensions onto smaller screens.

Ensure:

- Stat cards form responsive grids.
- Charts resize appropriately and remain readable.
- Legends and labels do not overlap.
- Tables remain usable on smaller screens.
- Status badges use consistent semantic colors.
- Empty, error, and loading states follow the same design system.
- Interactive cards provide subtle, consistent feedback.
- Long values and product names wrap or truncate appropriately without breaking layouts.

Preserve real API data, sorting behavior, calculations, pagination, permissions, and existing dashboard functionality.

## 12. Navigation and Responsive Layout

Standardize the application's navigation, top bars, sidebars, tabs, breadcrumbs, menus, and dashboard content containers.

Desktop layouts should feel spacious and organized. Mobile layouts should prioritize clarity, touch accessibility, and logical content order.

Reuse the existing sidebar provider and navigation architecture. Make sure mobile navigation opens, closes, and behaves correctly without disrupting routes or permissions.

Avoid duplicating navigation components or introducing inconsistent sidebar implementations across user roles.

## 13. Accessibility and Performance

A premium UI must also remain accessible and performant.

- Maintain WCAG AA contrast wherever applicable.
- Use semantic HTML and accessible names.
- Preserve keyboard navigation.
- Use `focus-visible` rather than adding distracting focus decoration to every pointer interaction.
- Respect reduced-motion preferences.
- Avoid unnecessary re-renders and expensive animation effects.
- Prefer CSS transitions for simple interactions.
- Avoid layout shifts during loading.
- Preserve image aspect ratios and use appropriate responsive sizing.
- Do not add heavy dependencies for effects that can be achieved with existing tools.

Smoothness must not come at the expense of performance, accessibility, or functional reliability.

## 14. Implementation Strategy

Do not attempt a blind, massive rewrite of the entire project.

Follow a controlled, incremental workflow.

### Phase 1 — Audit

Inspect the project structure, `app/globals.css`, Tailwind v4 configuration, existing UI primitives, shared layouts, buttons, forms, dialogs, navigation, and representative pages.

Identify inconsistent colors, spacing, typography, radii, transitions, fixed dimensions, duplicated styles, and responsive issues.

Read the existing project context and design blueprint before making changes.

### Phase 2 — Design Tokens

Establish or refine the shared design tokens and theme mappings.

Avoid conflicting variables and preserve the current primary/accent conventions.

### Phase 3 — Shared UI Primitives

Update reusable components first, including buttons, inputs, cards, badges, dialogs, tables, and dropdowns.

Ensure existing variants and component APIs continue to work.

### Phase 4 — Application-Wide Rollout

Apply the shared system incrementally to existing pages and features.

Cover public pages, authentication, dashboards, profiles, business management, products, reports, notifications, and settings wherever these features exist in the current project.

Do not invent new product features or routes just to complete the visual redesign.

### Phase 5 — Responsive and Interaction Pass

Test each changed page across mobile, tablet, laptop, and desktop breakpoints.

Check modal behavior, navigation, hover states, button feedback, forms, tables, charts, overflow, and keyboard focus.

### Phase 6 — Verification

Run the available linting and build checks after each meaningful phase.

Resolve errors introduced by the changes. Check existing imports, component variants, CSS variables, TypeScript types, and route behavior.

Provide a concise summary of completed work, modified files, tests run, and any remaining issues.

## 15. Strict Git and Code Safety Rules

This project has existing development work on the `shakibul` branch.

- Work only within the authorized branch and scope.
- Never overwrite or discard existing user changes.
- Never reset, rebase, force-push, or rewrite branch history without explicit permission.
- Never modify another developer's unrelated files.
- Never change backend/server code for this UI-only task.
- Inspect Git status before editing.
- Keep changes focused and reviewable.
- Implement one logical phase at a time.
- Do not claim a page is complete unless it has actually been reviewed and tested.

If a shared component change could break existing consumers, inspect its usage before changing the component API.

## 16. Definition of Done

The task is complete only when:

1. The application uses a consistent visual design system.
2. Colors and typography are coherent across the existing project.
3. Buttons and CTAs share consistent sizing, variants, and interaction states.
4. Modals, dialogs, forms, cards, tables, and navigation have consistent styling.
5. Hover, focus, pressed, loading, and overlay interactions feel smooth and predictable.
6. Width, height, spacing, typography, and layout adapt appropriately across breakpoints.
7. Narrow mobile screens do not have unintended horizontal overflow.
8. Existing functionality, API integrations, authentication, and permissions remain intact.
9. Accessibility and reduced-motion behavior are respected.
10. The project builds successfully, or any pre-existing unrelated build failures are clearly identified.
11. Changes remain maintainable, incremental, and easy for a junior developer to understand.
12. A final report lists what was completed, what was tested, and what still needs attention.

## Final Instruction

Before editing, inspect the actual codebase and compare it against this context. Use existing components, CSS variables, and the current project architecture wherever possible.

Prioritize a consistent, premium, responsive, and fluid user experience over unnecessary visual complexity.

**The goal is not to make every component flashy. The goal is to make every component feel like it belongs to the same polished, modern, smooth, and trustworthy product — across the entire TrustPass application.**