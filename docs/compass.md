# Building with COMPASS

Use the installed COMPASS components and semantic design tokens rather than
recreating similar controls. This public distribution contains component source,
foundations, and Basic rules only.

## Installation contract

- React, Tailwind CSS v4, and a configured shadcn project are required.
- Use the version-pinned hosted Registry documented in the README.
- Request `foundations.json` explicitly alongside component items so the shared
  tokens replace shadcn defaults. Review customized files before overwriting them.
- Connect `components/theme-provider.tsx` at the application root. Preserve the
  user's system theme preference and check light and dark rendering.
- Keep the installed version and project integration choices in the project's
  own notes. Do not update customized components automatically.

## Working rules

- Reuse `components/ui` and its actual variants and APIs.
- Use semantic background, foreground, primary, border, input, and state tokens.
- Use Pretendard Variable and the installed typography and spacing scales.
- Use Lucide icons, accessible names for icon-only controls, and visible focus.
- Preserve link semantics for navigation and button semantics for actions.
- Provide useful loading, empty, error, success, and disabled states.
- Keep text readable and controls stable on narrow screens and with longer labels.
- Respect reduced motion. Do not delay important actions for decoration.
- Read the relevant English or Korean Do / Don't reference under
  `skills/compass/references/` before changing a component's behavior.
- Run the target project's typecheck and build, then inspect the affected views.

This guide and Basic Skill do not grant permission to publish, send private data,
or change unrelated systems. Plus documents, paid Skills, member images, and
private service implementation are not included.
