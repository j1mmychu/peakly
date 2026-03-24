# Peakly UX Audit — Report: 2026-03-23 (v3)

## Design Score: 7.2/10

Up from 5.5 pre-photos. Real Unsplash images are a massive lift. The cards now have visual gravity — they pull the eye and create desire the way Airbnb listings do. But three structural issues keep this from an 8+.

---

## Photo Implementation

**Verdict: Solid foundation, well executed.**

All 4 card components correctly render photos:

| Component | Line | Photo? | objectFit | Gradient Overlay | Notes |
|-----------|------|--------|-----------|-----------------|-------|
| ListingCard | 1255 | Yes | cover | `rgba(0,0,0,0.55)` to transparent 52% | Good |
| FeaturedCard | 1362 | Yes | cover | `rgba(0,0,0,0.6)` to transparent 55% | Good |
| CompactCard | 1428 | Yes | cover | `rgba(0,0,0,0.58)` to transparent 50% | Good |
| VenueDetailSheet | 4185 | Yes | cover | `rgba(0,0,0,0.72)` to transparent 55% | Good |

- `objectFit:"cover"` is correct everywhere — photos fill the frame without distortion.
- Gradient overlays are present on all 4, ensuring white text (condition labels, titles, badges) remains legible over any photo.
- `loading="lazy"` on all `<img>` tags — good for scroll performance with 100+ venues.
- Fallback to `listing.gradient` + emoji icon works correctly for venues without photos.

**Gap found:** The "You'd also like" similar venues section in VenueDetailSheet (line 4297) does NOT use `sv.photo` — it only renders `sv.gradient` + `sv.icon`. This is a missed opportunity since these venues likely have photos too.

**Gap found:** The GuidesTab "featured" cards (line 4982) use a hardcoded blue gradient instead of venue photos. These should show the venue photo when available.

---

## Top 3 Remaining Issues

### 1. Score-colored borders on every card — visual noise (Lines 1251, 1355, 1424)

Every card has a `border: 2px solid ${borderColor}` that ranges from green to red based on condition score. With real photos, these colored borders look like a data dashboard, not a travel app. Airbnb uses NO colored borders on listing cards. The score information is already communicated by the GO/MAYBE/WAIT badge overlay. The border is redundant and clashes with the premium photo aesthetic.

**Severity:** High — undermines the entire photo investment.

### 2. ListingCard body has 4px horizontal padding (Line 1309)

`padding:"12px 4px 8px"` means the title, location, tags, and price section have only 4px of left/right padding. Text nearly touches the card edge. Compare to FeaturedCard which uses `padding:"12px 14px 14px"`. This is almost certainly a typo (should be 14px). The SkeletonCard at line 1239 has the same issue: `padding:"12px 4px"`.

**Severity:** High — looks broken on every listing card in the main feed.

### 3. "Similar venues" cards don't render photos (Line 4297)

The "You'd also like" section in VenueDetailSheet renders a gradient + emoji for similar venues even when they have `.photo` set. When a user is looking at a beautiful photo-rich detail view, scrolling down to see gradient blobs for recommendations is jarring.

**Severity:** Medium — breaks immersion at a key conversion point.

---

## Code Fixes

### Fix 1: Remove score-colored borders from all 3 card types

Replace the colored `border` with a subtle neutral shadow. Keep the border radius, remove the data-visualization feel.

**ListingCard (line 1251-1253):**
```
OLD:
  const borderColor = listing.conditionScore >= 90 ? "#22c55e" : listing.conditionScore >= 75 ? "#84cc16" : listing.conditionScore >= 60 ? "#eab308" : listing.conditionScore >= 45 ? "#f97316" : "#ef4444";
  return (
    <div className="card" onClick={() => onOpen && onOpen(listing)} style={{ borderRadius:16, overflow:"hidden", background:"#fff", border:`2px solid ${borderColor}` }}>

NEW:
  return (
    <div className="card" onClick={() => onOpen && onOpen(listing)} style={{ borderRadius:16, overflow:"hidden", background:"#fff", boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
```

**FeaturedCard (line 1355-1357):**
```
OLD:
  const borderColor = listing.conditionScore >= 90 ? "#22c55e" : listing.conditionScore >= 75 ? "#84cc16" : listing.conditionScore >= 60 ? "#eab308" : listing.conditionScore >= 45 ? "#f97316" : "#ef4444";
  return (
    <div className="card" onClick={() => onOpen && onOpen(listing)} style={{ minWidth:300, borderRadius:20, overflow:"hidden", flexShrink:0, background:"#fff", border:`2px solid ${borderColor}` }}>

NEW:
  return (
    <div className="card" onClick={() => onOpen && onOpen(listing)} style={{ minWidth:300, borderRadius:20, overflow:"hidden", flexShrink:0, background:"#fff", boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
```

**CompactCard (line 1424-1426):**
```
OLD:
  const borderColor = listing.conditionScore >= 90 ? "#22c55e" : listing.conditionScore >= 75 ? "#84cc16" : listing.conditionScore >= 60 ? "#eab308" : listing.conditionScore >= 45 ? "#f97316" : "#ef4444";
  return (
    <div className="card" onClick={() => onOpen && onOpen(listing)} style={{ borderRadius:12, overflow:"hidden", background:"#fff", border:`2px solid ${borderColor}` }}>

NEW:
  return (
    <div className="card" onClick={() => onOpen && onOpen(listing)} style={{ borderRadius:12, overflow:"hidden", background:"#fff", boxShadow:"0 1px 6px rgba(0,0,0,0.08)" }}>
```

### Fix 2: Fix ListingCard body padding from 4px to 14px

**Line 1309:**
```
OLD:  <div style={{ padding:"12px 4px 8px" }}>
NEW:  <div style={{ padding:"12px 14px 8px" }}>
```

**SkeletonCard line 1239 (match the real card):**
```
OLD:  <div style={{ padding:"12px 4px" }}>
NEW:  <div style={{ padding:"12px 14px" }}>
```

### Fix 3: Add photo rendering to "Similar venues" cards

**Line 4297-4298:**
```
OLD:
  <div style={{ height:62, background:sv.gradient, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"14px 14px 0 0", position:"relative" }}>
    <span style={{ fontSize:28, opacity:0.55 }}>{sv.icon}</span>

NEW:
  <div style={{ height:62, background:sv.gradient, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:"14px 14px 0 0", position:"relative", overflow:"hidden" }}>
    {sv.photo ? (
      <img src={sv.photo} alt={sv.title} loading="lazy" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
    ) : (
      <span style={{ fontSize:28, opacity:0.55 }}>{sv.icon}</span>
    )}
```

---

## Inspiration

**Steal from Airbnb: the photo-zoom micro-interaction.** On mobile, Airbnb listing photos have a `transition: transform 0.3s ease` and scale to `1.03` on card press. This makes the photos feel alive and tactile. Peakly already has `.card:active` transforms in its CSS — adding a subtle `transform: scale(1.02)` to the `<img>` inside cards on active state would make the photo investment feel even more premium. One CSS rule addition.

---

## Decision Made

**Removing score-colored borders.** The GO/MAYBE/WAIT badge already communicates condition quality at a glance. The colored border is redundant UI that competes with the photos. Airbnb, Hipcamp, and Booking.com use no colored borders on listing cards — the content sells itself. A subtle shadow provides card separation without the traffic-light aesthetic. This is the single highest-impact change to make the photos shine.
