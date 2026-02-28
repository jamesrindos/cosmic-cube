# Cosmic Cube - Comprehensive Fix Checklist

**Created:** 2026-02-28 06:20 UTC
**Target:** Complete overhaul for production-ready experience
**Status:** In Progress

---

## 🚨 CRITICAL - Must Fix

### Layout Issues
- [ ] **Bathroom floating outside map** - Position at [0.5, 0, -14] but appears outside walls. Need to add enclosing bathroom walls or reposition.
- [ ] **Front door not visible** - At [2, 0, 0] but living room wall blocks it. Need opening in wall.
- [ ] **Gaming desk orientation** - Currently facing wrong direction. Desk should face wall/windows, chair facing into room.
- [ ] **Posters glitching** - Z-fighting or positioning issues on wall art.

### Camera System (COMPLETE OVERHAUL NEEDED)
- [ ] **Remove free OrbitControls** - Current system too free, disorienting
- [ ] **Implement fixed camera angles per room:**
  - [ ] Living Room view (isometric, shows TV/couch area)
  - [ ] Kitchen view (shows island/fridge)
  - [ ] Hallway view (shows bathroom/corridor)
  - [ ] Bedroom view (shows desk/bed/guitar)
  - [ ] Full apartment overview (default)
- [ ] **Room detection** - Track which room user is focused on
- [ ] **Camera transitions** - Smooth animated transitions between angles
- [ ] **Click-to-navigate** - Click on room to transition camera there
- [ ] **Keyboard navigation** - Arrow keys or 1-5 for room presets

### UI/UX Issues
- [ ] **Interactive legend too small at zoom** - Make it scale-independent or reposition
- [ ] **Help overlay not useful** - Redesign with clear room navigation
- [ ] **No visual cues for clickable objects** - Add hover glow/outline
- [ ] **Loading state never completes** - Spinner visible in hallway?

---

## 🔧 HIGH PRIORITY

### Interactive Elements
- [ ] **VHS tapes → TV playback** - Click tape, see content on TV screen
- [ ] **Rubik's cube click feedback** - Visual spin + solve animation
- [ ] **Guitar strum animation** - Wobble + sound cue
- [ ] **VM Desktop functionality** - Windows open, draggable, closeable
- [ ] **Letterboxd notebook** - Click to see reviews
- [ ] **Invincible book** - Hover info working?
- [ ] **Fridge interior** - Click to open, see Cokes inside

### Room-Specific Fixes
- [ ] **Living Room:**
  - [ ] Couch position (should face TV on right)
  - [ ] Coffee table centered between couch/TV
  - [ ] TV as chunky CRT with VCR, not flat
- [ ] **Kitchen:**
  - [ ] Open to living room (no separating wall, island only)
  - [ ] Fridge on correct wall
- [ ] **Bedroom:**
  - [ ] Windows on RIGHT wall (per Sims reference)
  - [ ] Purple RGB glow from monitors
  - [ ] Bed position/size correct
  - [ ] Curtains on windows
- [ ] **Bathroom:**
  - [ ] Properly enclosed
  - [ ] Mirror "About" section functional
  - [ ] Post-it visible
- [ ] **Hallway:**
  - [ ] Connect living to bedroom properly
  - [ ] Front door visible and positioned correctly

---

## ✨ POLISH

### Visual Quality
- [ ] **Sims-like lighting** - Bright, warm, not dark/moody (except bedroom)
- [ ] **Consistent wall color** - Cream throughout
- [ ] **Wood floor texture** - More realistic grain
- [ ] **Shadow quality** - Soft shadows on objects
- [ ] **Anti-aliasing** - Reduce jagged edges

### Details (per BRIEF)
- [ ] **10 Wall Posters:**
  - [ ] Scott Pilgrim vs the World
  - [ ] Into the Spider-Verse
  - [ ] Whiplash
  - [ ] Babylon
  - [ ] Marty Supreme
  - [ ] Tyler the Creator
  - [ ] Elliott Smith
  - [ ] Djo
  - [ ] Geese
  - [ ] Critical Role
- [ ] **Desk clutter:**
  - [ ] Rubik's cube prominent
  - [ ] McDonald's Happy Meal toys
  - [ ] Pez dispensers
  - [ ] Energy drinks
  - [ ] Headphone cable
- [ ] **14 VHS tapes** with brand logos
- [ ] **Easter eggs:**
  - [ ] Rubik's cube solves when clicked
  - [ ] Guitar strums out of tune
  - [ ] Fridge full of Coke

### Performance
- [ ] **Lazy load heavy assets**
- [ ] **Optimize geometry** - Reduce polygon count
- [ ] **Texture compression**
- [ ] **Mobile fallback** - Simpler version for phones

---

## 📱 Responsive

- [ ] **Desktop optimal** - Full experience
- [ ] **Tablet supported** - Touch navigation
- [ ] **Mobile simplified** - "Best on desktop" message + basic view

---

## 🧪 Testing Checklist (Run after each major fix)

1. [ ] Page loads without errors
2. [ ] All rooms visible and accessible
3. [ ] Camera transitions smooth
4. [ ] Interactive elements respond to clicks
5. [ ] UI readable at all zoom levels
6. [ ] No z-fighting/glitching on surfaces
7. [ ] Performance acceptable (60fps target)
8. [ ] Console has no errors
9. [ ] Works in Chrome, Safari, Firefox

---

## Progress Log

### Session 1: 2026-02-28 06:20 UTC
- Starting comprehensive audit
- Identified all major issues from James's feedback
- Beginning with camera system overhaul

### Session 1 Progress: 06:20-06:35 UTC
- [x] Created CameraController.tsx with fixed presets
- [x] Implemented CameraNavigation UI with keyboard shortcuts (1-5)
- [x] Removed OrbitControls, using fixed camera angles now
- [x] Added door opening in front wall for FrontDoor visibility
- [x] Fixed bathroom positioning - moved to proper enclosure off hallway
- [x] Added bathroom walls for proper enclosure
- [x] Fixed gaming desk orientation - now facing left wall
- [x] Fixed gaming chair position - in front of desk
- [x] Fixed poster z-fighting - increased depth offsets
- [x] Increased lighting for Sims-style brightness
- [x] Added hemisphere light for softer shadows

