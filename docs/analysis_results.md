# Color Styling Analysis & Resolution Report

An analysis has been conducted on the design tokens in `/src/styles/globals.css` and the styling of UI components in `/src/components/ui/*` to determine why colors were not rendering correctly.

## The Root Cause Analysis

### 1. Typo in the Outermost Page Wrapper
The primary reason colors were "not showing" (or showing with extremely poor, illegible contrast) was due to a class configuration typo in the page wrapper inside [page.tsx](file:///D:/Projects/personal/kalya/src/app/page.tsx#L10):

```tsx
<div className="min-h-screen bg-primary text-text-primary ...">
```

By applying `bg-primary` instead of `bg-bg` to the outermost container:
* **Light Mode:** The page background was set to a deep emerald green (`#0D3E26`), while the text was styled with `text-text-primary` (`#16241D` - near-black). This resulted in near-black text on a dark green background, making the content practically invisible and illegible.
* **Dark Mode:** The page background became a bright emerald green (`#3FA873`) with off-white text (`#F4F2EC`), which is blindingly bright and completely broke the dark theme aesthetic (which requires a deep green-black background `#0B1410`).

### 2. Design Token Integrity
A review of [globals.css](file:///D:/Projects/personal/kalya/src/styles/globals.css) and the reference tokens in [kalya.css](file:///D:/Projects/personal/kalya/src/styles/kalya.css) shows that:
* The mapping of Tailwind CSS v4 `@theme` variables to CSS custom properties is fully correct.
* The raw values defined in `:root` (light mode) and `[data-theme="dark"]` (dark mode) are complete and match each other.
* Overriding the dark mode variant selector via `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));` is correct and standard for Tailwind CSS v4 and `next-themes`.

---

## The Solution

We corrected the class name in [page.tsx](file:///D:/Projects/personal/kalya/src/app/page.tsx) to use `bg-bg` instead of `bg-primary` on the main wrapper:

```diff
-    <div className="min-h-screen bg-primary text-text-primary transition-colors duration-200 selection:bg-primary-subtle selection:text-primary">
+    <div className="min-h-screen bg-bg text-text-primary transition-colors duration-200 selection:bg-primary-subtle selection:text-primary">
```

### Resulting Behaviors
With this fix:
* **Light Mode:** The background renders in Alabaster (`#F9F8F6`), with text in near-black (`#16241D`).
* **Dark Mode:** The background renders in a deep green-black (`#0B1410`), with text in warm off-white (`#F4F2EC`).
* **UI Components:** Components like `Button`, `Card`, `Badge`, etc., now render with correct contrast against the page background. The primary color highlights (`text-primary`, `bg-primary`) now stand out correctly as accents rather than drowning the entire viewport.
