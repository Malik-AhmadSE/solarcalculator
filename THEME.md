# ProMount brand theme

The app uses ProMount marketing design and colors from:

- **Style Guide Promount.pdf** (in project root `solar_final/`)
- **Feedback marketing calculator (1).pdf** (in project root `solar_final/`)

## Feedback PDF – implemented

From **Feedback marketing calculator (1).pdf**:

- **Logo** – Placed in front of the title; title is **“ProMount BOM calculator”**. Logo uses the regular **black** style (`#272727`).
- **#272727** – Main dark colour (headings, logo background, body text).
- **#7E4AF6** – Purple: accent colour; **selected roof-type button** is the **whole button** in this purple (not just border).
- **#F8F7F8** – Replaces light grey (page background and muted areas).

## Where colors are defined

- **`app/globals.css`** – `:root` variables:
  - `--promount-primary`: `#272727` (black/dark)
  - `--promount-accent`: `#7e4af6` (purple)
  - `--promount-background` / `--promount-muted`: `#f8f7f8` (light grey from Feedback)
  - `--promount-foreground`: `#272727`
  - Plus accent-foreground, accent-muted, border, card, ring.

## Updating from the PDFs

To change colours:

1. Edit the ProMount `:root` block in **`app/globals.css`**.
2. Replace hex values with those from the Style Guide or Feedback PDF.
3. Save; the app will use the updated theme.
