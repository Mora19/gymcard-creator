<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history - force pushing, or rebasing/amending/squashing commits
> that are already pushed - as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

# AGENTS.md

## Project Goal

This project is a mobile-first landing page and live configurator for a
personalized 3D-printed gym membership card holder.

## Product Layout Rules

The card preview must always follow this fixed layout:

1. Top: customer name
2. Middle: studio logo line / Fitness First logo line
3. Bottom: phone number

Name, logo line, and phone number must be left-aligned and start at the same
x-position, matching the real product photos.

## Design Rules

- Mobile-first.
- Sporty premium style using black, red, and white.
- No horizontal scrolling.
- No cropped product images.
- No visible checkerboard transparency backgrounds.
- CTA buttons must be clear, visible, and easy to tap.
- Product preview must look close to the real 3D-printed card holder.

## Business Rules

- Holder color and text color must never be identical.
- Name input should allow names like "Moritz Klosters" and "Moritz Klösters".
- Long names should dynamically reduce font size within reasonable limits
  instead of being cut off too early.
- There still needs to be a sensible max length.
- Phone number adds +1 €.
- Bottle band adds +1 €.
- Base price is 9,90 €.
- Studio logo use requires official approval; show the note:
  "Studio-Logo nur mit offizieller Freigabe möglich."

## Review Guidelines

- Do not log personal data.
- Do not expose secrets or API keys.
- Keep the ordering and alignment of name, logo, and phone number stable.
- Check mobile layout carefully.
- Run build/test/lint if available.
