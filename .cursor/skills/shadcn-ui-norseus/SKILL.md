---
name: shadcn-ui-norseus
description: Norseus-specific shadcn/ui guidance for Nx monorepo. Use when adding shadcn components, building React UI with @front/cn, or working with libs/front/cn. Covers installation in Nx, import aliases, and component catalog.
---

# shadcn/ui — Norseus Project

Expert guidance for shadcn/ui in the Norseus Nx monorepo. Components live in `libs/front/cn/` and are shared via path aliases.

## When to Use

- Adding new shadcn/ui components to the React app
- Building UI with Button, Dialog, Form, Select, Table, etc.
- Troubleshooting shadcn configuration or imports
- Choosing the right component for a feature

## Installation (CRITICAL)

The standard `npx shadcn add` command does **not** work in this Nx monorepo. Always use:

```bash
TS_NODE_PROJECT=tsconfig.base.json pnpx shadcn@latest add <component-name>
```

Run from the workspace root. Examples:

```bash
TS_NODE_PROJECT=tsconfig.base.json pnpx shadcn@latest add button
TS_NODE_PROJECT=tsconfig.base.json pnpx shadcn@latest add dialog form input
TS_NODE_PROJECT=tsconfig.base.json pnpx shadcn@latest add table select alert-dialog badge
```

## Project Structure

```
libs/front/cn/
├── components/          # shadcn components (button, dialog, etc.)
├── hooks/              # use-mobile, etc.
├── utils/              # cn() utility
└── ...
```

## Imports

```tsx
import { Button } from '@front/cn/components/button';
import { Dialog, DialogContent, DialogTrigger } from '@front/cn/components/dialog';
import { cn } from '@front/cn/utils';
```

## Agent Rules

1. **Never install manually** — always use the `TS_NODE_PROJECT=tsconfig.base.json pnpx shadcn@latest add` command
2. **Check existing components first** — look in `libs/front/cn/components/` before adding
3. **Import from `@front/cn`** — use `@front/cn/components/<name>` and `@front/cn/utils`
4. **Toast notifications** — use Sileo only, not shadcn Toast/Sonner (see AGENTS.md)

## Configuration

- **components.json**: Workspace root
- **Style**: new-york
- **CSS**: libs/assets/styles/global-react.css
- **Icons**: lucide

## Component Catalog

For the full component list and docs links, see [reference.md](reference.md). Quick reference:

| Category | Components |
|----------|------------|
| Form & Input | Button, Input, Select, Checkbox, Switch, Textarea, Form, Field |
| Overlays | Dialog, Alert Dialog, Sheet, Popover, Tooltip, Dropdown Menu |
| Layout | Tabs, Card, Table, Separator, Scroll Area |
| Feedback | Alert, Badge, Skeleton, Progress |

## Additional Resources

- [shadcn/ui docs](https://ui.shadcn.com/docs)
- [llms.txt source](https://ui.shadcn.com/llms.txt)
- Project conventions: AGENTS.md (shadcn/ui section)
