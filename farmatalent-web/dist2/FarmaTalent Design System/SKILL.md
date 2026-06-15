---
name: farmatalent-design
description: Use this skill to generate well-branded interfaces and assets for FarmaTalent (plataforma de talento farmacéutico y marketplace de turnos), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files (`colors_and_type.css`, `assets/`, `preview/`, `ui_kits/`).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. Always import `colors_and_type.css` so tokens are available, and use the brand’s plum/cream/gold palette + Newsreader/Hanken pairing rather than generic alternatives.

If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Key rules to enforce:
- Spanish copy, formal "usted", no emoji
- Sentence case for titles, UPPERCASE only for tracked eyebrows
- Photography over illustration; no purple/blue gradients
- Cards: 1px hairline border + radius 6px, shadow-xs default
- Primary action is plum-700; gold is reserved for verification/premium
