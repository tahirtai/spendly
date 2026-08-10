---
name: Lumina Glass
colors:
  surface: '#fcf8fb'
  surface-dim: '#dcd9dc'
  surface-bright: '#fcf8fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7ea'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#464554'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#777586'
  outline-variant: '#c7c4d7'
  surface-tint: '#4d4ad5'
  primary: '#4441cc'
  on-primary: '#ffffff'
  primary-container: '#5e5ce6'
  on-primary-container: '#f4f1ff'
  inverse-primary: '#c2c1ff'
  secondary: '#8d2ebc'
  on-secondary: '#ffffff'
  secondary-container: '#d072ff'
  on-secondary-container: '#540079'
  tertiary: '#54565a'
  on-tertiary: '#ffffff'
  tertiary-container: '#6d6e73'
  on-tertiary-container: '#f2f2f7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c2c1ff'
  on-primary-fixed: '#0c006b'
  on-primary-fixed-variant: '#332dbc'
  secondary-fixed: '#f6d9ff'
  secondary-fixed-dim: '#e8b3ff'
  on-secondary-fixed: '#310048'
  on-secondary-fixed-variant: '#7201a2'
  tertiary-fixed: '#e2e2e7'
  tertiary-fixed-dim: '#c6c6cb'
  on-tertiary-fixed: '#1a1c1f'
  on-tertiary-fixed-variant: '#45474b'
  background: '#fcf8fb'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 41px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 25px
  body-lg:
    fontFamily: Manrope
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Manrope
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Manrope
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 13px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  safe-area-top: 44px
  safe-area-bottom: 34px
  margin-mobile: 20px
  gutter-mobile: 12px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

The design system is centered on a **Premium Glassmorphic** aesthetic, tailored specifically for high-end mobile experiences. It targets professionals and students who value efficiency wrapped in an elegant, modern interface. 

The emotional goal is to evoke **trust, clarity, and sophistication**. By utilizing translucent layers, "frosted glass" containers, and organic, large-radius curves, the interface feels light and breathable. The depth is not achieved through heavy shadows, but through the stacking of semi-transparent surfaces and subtle backdrop blurs, mimicking the physical properties of luxury hardware.

- **Style:** Glassmorphism mixed with Minimalism.
- **Visual Cues:** High backdrop-blur (20px+), thin white inner borders (0.5px - 1px) to catch the light, and vibrant accent colors that "glow" through the glass.

## Colors

The palette evolves the existing brand colors into a more "luminous" range. The primary blue and purple are shifted toward a more vibrant, high-contrast spectrum to ensure they remain legible when used as accents against blurred backgrounds.

- **Primary & Secondary:** A vibrant gradient of Electric Indigo (#5E5CE6) to Soft Violet (#AF52DE) is used for active states and critical actions.
- **Glass Base:** White at 70% - 80% opacity with a `backdrop-filter: blur(24px)`.
- **Borders:** A semi-transparent white (#FFFFFF4D) is used for "rim lighting" on cards, while a soft grey (#E5E5EA) is used for functional separation.
- **Status:** Standardized semantic colors for Success (Green), Warning (Amber), and Error (Red), but with softened, "candy" tones to match the modern aesthetic.

## Typography

**Manrope** is selected for its geometric balance and excellent legibility at small sizes. The scale is optimized for mobile-first consumption:

- **Display & Headlines:** Use tight letter spacing (-0.02em) to maintain a premium, editorial feel. 
- **Readability:** Body text utilizes a slightly increased line-height (1.4x+) to prevent fatigue during expense logging or data review.
- **Hierarchy:** High contrast between weights (Bold for headers vs. Regular for body) ensures clear information architecture even on small screens.

## Layout & Spacing

This design system utilizes a **Fluid Mobile Grid** with fixed side margins.

- **Margins:** 20px horizontal padding on mobile devices to ensure content clears modern rounded screen corners.
- **Vertical Rhythm:** An 8px base grid drives all spacing. Elements are grouped in stacks of 8px, 16px, or 24px.
- **Device Support:** 
    - **iOS:** Strict adherence to the `safe-area-inset-top` for notches and `safe-area-inset-bottom` for the home indicator.
    - **Android:** Navigation bar height adjustments to ensure the Bottom Navigation sits above system controls.
- **Glass Stacking:** Background elements should have 40px of "air" (padding) to allow the blur effect to feel meaningful.

## Elevation & Depth

Depth is established through **Surface Tiers** rather than traditional black shadows:

1.  **Level 0 (Background):** A very subtle, colorful mesh gradient (Brand Blue/Purple) that sits behind all content, providing the "source" for glass blurs.
2.  **Level 1 (Base Layer):** Standard surface for list items. No blur, simple solid background.
3.  **Level 2 (Glass Cards):** White at 70% opacity, 24px Backdrop Blur, and a 1px solid white border at 30% opacity.
4.  **Level 3 (Modals/Bottom Sheets):** Higher opacity (85%) and a very soft, diffused shadow (0px 20px 40px rgba(0,0,0,0.05)) to suggest it is floating closest to the user.

## Shapes

The shape language is "Organic Geometric." 

- **Cards & Sheets:** Use a consistent 24px radius (`rounded-xl` equivalent) to match the hardware curvature of modern iPhones and high-end Android devices.
- **Buttons:** Fully pill-shaped (100px radius) for primary actions to make them distinct from the rectangular card language.
- **Inputs:** A 12px radius provides a professional yet approachable feel.

## Components

### Navigation
- **Bottom Navigation:** A glass bar with 5 tabs. Active icons use a gradient fill; inactive icons use a medium-grey outline.
- **Floating Action Button (FAB):** A pill-shaped button for "Add Expense," centered or right-aligned, using the primary gradient.

### Mobile Cards
- **Expense Card:** Glassmorphic background, 24px radius, 1px white border. High-contrast typography for the amount.
- **Tiffin Summary:** Uses a soft-tinted background (e.g., light blue glass) to differentiate from general expenses.

### Native Patterns
- **Bottom Sheets:** All forms (Log Expense, Payment Proof) should slide up from the bottom, occupying 75% to 90% of screen height.
- **Swipe Actions:** Swipe left on an expense card to reveal a "Delete" action; swipe right for "Duplicate."
- **Checkboxes & Radios:** Large tap targets (44x44px minimum) with haptic feedback on interaction.

### Inputs
- **Glass Fields:** Input fields should be semi-transparent with a 1px border that "glows" (primary color) when focused.