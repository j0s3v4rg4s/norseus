---
trigger: glob
globs: *html
---

# UI Components Rules for Cursor (Reduced)

## General Guidelines
- Always use the **custom UI components** defined in these rules.  
- If not available, use standard HTML with **Tailwind v4**.  
- Avoid other libraries or custom CSS unless strictly necessary.  
- Must follow accessibility (labels, `aria-*`, contrast, focus).  
- All components must be **responsive**.

---

## Input
- Mandatory base class: `input`.  
- States:
  - **Normal**: `<input class="input">`
  - **Invalid**: add `aria-invalid="true"`.
  - **Disabled**: use `disabled`.
- With label: associate `for` + `id`.  
- Helper text: use `p.text-muted-foreground.text-sm`.  
- Layouts:  
  - Vertical → `grid gap-3`.  
  - Horizontal → `flex items-center space-x-2`.  
- Inputs must be **full-width** inside their container.  

---

## Button
- Base class: `btn`.  
- Variants:  
  - `btn` / `btn-primary` → primary action.  
  - `btn-secondary` → secondary action.  
  - `btn-destructive` → critical actions.  
  - `btn-outline`, `btn-ghost`, `btn-link`.  
  - `btn-icon` → icon-only (requires `aria-label`).  
- Sizes:  
  - `btn-sm`, `btn-lg`, or default.  
- States:  
  - Loading → `disabled` + icon with `animate-spin`.  
- Accessibility: always provide visible text or `aria-label`.  

---

## Select (`ui-select`)
- Import `SelectModule` in Angular.  
- Syntax:
  ```html
  <ui-select placeholder="Choose">
    <ui-option value="x">Option</ui-option>
  </ui-select>
  ```
- Properties:  
  - `placeholder`: optional.  
  - `ui-option` requires `value`.  
- Works with **Reactive Forms** (`formControlName`) and **Template-driven Forms** (`ngModel`).  
- Accepts any value type (string, number, object).  
- Accessibility: ARIA roles, keyboard navigation, auto-generated unique IDs.  
- Styling: `w-full`, trigger button = `btn-outline`.  
- Automatically handles popover positioning, invalid states, and touch support.  
