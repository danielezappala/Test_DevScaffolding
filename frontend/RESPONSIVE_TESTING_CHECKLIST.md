# Responsive Layout Testing Checklist

This document provides a checklist for manual testing of the responsive layouts implemented in the Quick Scan page.

## Testing Requirements (Requirements 6.1, 6.2, 6.3)

### Desktop Testing (Requirement 6.1)
**Screen Size:** >= 1024px

- [ ] **Chrome Desktop**
  - [ ] Full dashboard with sidebar visible
  - [ ] Manual input optimized for hardware scanner
  - [ ] Horizontal layout: Scanner on left, results on right (2-column grid)
  - [ ] Hardware scanner hint displayed
  - [ ] No horizontal scrolling
  - [ ] Wine details and action buttons displayed side-by-side

- [ ] **Firefox Desktop**
  - [ ] Same checks as Chrome

- [ ] **Safari Desktop (macOS)**
  - [ ] Same checks as Chrome

**Expected Layout:**
- Two-column grid layout (lg:grid-cols-2)
- Scanner component in left column
- Results/wine details in right column
- Manual input mode by default
- Hardware scanner tip visible

---

### Tablet Testing (Requirement 6.2)
**Screen Size:** 768px - 1023px

- [ ] **iPad (Safari)**
  - [ ] Compact layout with responsive padding
  - [ ] Toggle between camera and manual modes visible
  - [ ] Two-column layout for action buttons (sm:grid-cols-2)
  - [ ] No horizontal scrolling
  - [ ] Touch targets appropriately sized

- [ ] **Android Tablet (Chrome)**
  - [ ] Same checks as iPad

**Expected Layout:**
- Single column for scanner and results
- Camera/Manual toggle buttons visible
- Two-column grid for action buttons
- Responsive padding (sm: breakpoints)
- Camera mode available by default

---

### Mobile Testing (Requirement 6.3)
**Screen Size:** < 768px

- [ ] **iPhone (Safari)**
  - [ ] Fullscreen camera scanner (when camera mode active)
  - [ ] Minimal UI with large touch targets
  - [ ] Vertical stacked layout (single column)
  - [ ] No horizontal scrolling
  - [ ] Touch-optimized buttons (py-5, touch-manipulation)
  - [ ] Camera/Manual toggle visible

- [ ] **Android Phone (Chrome)**
  - [ ] Same checks as iPhone

**Expected Layout:**
- Single column layout (grid-cols-1)
- Camera mode by default
- Large touch targets for buttons
- Vertical stacking of all elements
- Minimal padding for maximum screen usage

---

## Verification Steps

### 1. No Horizontal Scrolling
For each device/browser combination:
1. Open the Quick Scan page
2. Scroll horizontally (or try to)
3. Verify no content extends beyond viewport width
4. Check at different zoom levels (100%, 125%, 150%)

### 2. Responsive Breakpoints
Test at specific widths:
- 320px (minimum mobile)
- 375px (iPhone)
- 768px (tablet breakpoint)
- 1024px (desktop breakpoint)
- 1920px (large desktop)

### 3. Device-Specific Features
- **Desktop:** Hardware scanner auto-submit works
- **Tablet:** Camera/Manual toggle works correctly
- **Mobile:** Camera permission handling works, haptic feedback on scan

### 4. Layout Adaptation
Resize browser window and verify:
- Layout smoothly adapts at breakpoints
- No content jumps or layout shifts
- All interactive elements remain accessible
- Text remains readable at all sizes

---

## Property-Based Test Coverage

The following property tests verify responsive behavior:
- ✅ Layout adapts correctly for any screen width (320px - 2560px)
- ✅ Device type detection triggers appropriate layout
- ✅ Touch targets are appropriately sized on mobile
- ✅ Desktop uses horizontal layout efficiently

**Test File:** `frontend/tests/unit/responsive-layout.property.test.tsx`
**Status:** All tests passing (100 iterations per property)

---

## Known Issues / Notes

- Camera scanner requires HTTPS or localhost for camera access
- PWA installation may affect layout (standalone mode)
- Some older browsers may not support all CSS features (grid, flexbox)

---

## Sign-off

Once all manual tests are completed, sign off below:

- [ ] Desktop testing complete (Chrome, Firefox, Safari)
- [ ] Tablet testing complete (iPad, Android)
- [ ] Mobile testing complete (iPhone, Android)
- [ ] No horizontal scrolling verified on all devices
- [ ] All responsive breakpoints working correctly

**Tested by:** _________________
**Date:** _________________
**Notes:** _________________
