# Peakly UX Audit
## Report: 2026-03-23

---

## Design Score: 5.5/10

Same as last report. The core issues flagged previously remain unfixed. Score-colored borders on every card are still the dominant visual pattern, card body padding is still cramped, and small touch targets persist on hearts and filter chip close buttons. The app has solid bones -- good type choice (Plus Jakarta Sans), decent animation system, smart use of gradient overlays -- but the card-level execution would not pass review at Airbnb or KAYAK. Fixing the three visual issues below would push this to 7/10 immediately.

---

## Top 3 Visual Issues

### 1. Score-colored borders on every card (Lines 1251-1253, 1349-1351, 1412-1414)

Every card -- ListingCard, FeaturedCard, CompactCard -- computes a `borderColor` from the condition score and applies a `2px solid` border in green/yellow/orange/red. When a grid of 6-12 cards is visible, this creates a Christmas-tree effect. No premium travel app does this. Airbnb cards have no colored borders. KAYAK uses subtle interior badges for price signals.

**Severity:** High. This is the single biggest thing making the app look "startup demo" rather than "shipping product."

**Lines:** 1251, 1253 (ListingCard), 1349, 1351 (FeaturedCard), 1412, 1414 (CompactCard)

### 2. Card body padding is too tight (Lines 1303, 1449)

ListingCard body padding is `12px 4px 8px` (line 1303) -- only 4px horizontal padding. Text nearly touches the card edge. CompactCard is `7px 6px 7px` (line 1449) which is marginally better but still tight. FeaturedCard at `12px 14px 14px` (line 1384) is the only one that breathes properly.

**Severity:** High. Cramped padding signals low quality and makes text harder to scan.

**Lines:** 1303 (ListingCard), 1449 (CompactCard)

### 3. Hero card uses score-colored border and gradient background math (Lines 2296-2298)

The hero "Best window right now" card dynamically extracts hex colors from venue gradients with regex and applies them as a tinted background, then adds a score-colored border (`border: 2px solid ${verdict.color}33`). The result is unpredictable tinting that clashes with the colored border. A simple clean white or off-white card with an accent would look far more polished.

**Severity:** Medium. Only affects the single hero card, but it's the first thing users see.

**Lines:** 2296-2298

---

## Top 3 Interaction Issues

### 1. Heart button touch targets are too small (Lines 1264-1268, 1358-1360, 1425-1428)

- **ListingCard heart:** `fontSize:20`, no explicit width/height, no padding. Effective tap area is roughly 20x20px.
- **FeaturedCard heart:** `fontSize:18`, same problem.
- **CompactCard heart:** `fontSize:13` -- approximately 13x13px tap target.
- Apple HIG minimum: 44x44px. Google Material minimum: 48x48dp.

**Component:** `ListingCard`, `FeaturedCard`, `CompactCard` (heart buttons)
**Lines:** 1264-1268, 1358-1360, 1425-1428

### 2. FilterChip close button is tiny (Line 2103)

The FilterChip `onRemove` button is `fontSize:11` with `padding:0`. The "x" character renders at roughly 11x11px. Users will struggle to dismiss active filters on mobile.

**Component:** `FilterChip`
**Line:** 2103

### 3. BottomNav tab touch targets are narrow (Lines 5061-5065)

Each BottomNav tab button has `padding:"4px 0"` with no explicit width. The tap area is only as wide as the icon+label content (~40-50px). With three tabs spread across the screen, there are large dead zones between tabs. Should use `flex:1` so each tab fills its third of the bar.

**Component:** `BottomNav`
**Lines:** 5061-5065

---

## Code Fixes

### Fix 1: Remove score-colored borders from all cards

Replace colored borders with a subtle neutral shadow. Keep the GoVerdictBadge (which already communicates score) as the sole condition indicator.

**ListingCard (line 1251-1253):**
```
OLD (line 1251):
  const borderColor = listing.conditionScore >= 90 ? "#22c55e" : listing.conditionScore >= 75 ? "#84cc16" : listing.conditionScore >= 60 ? "#eab308" : listing.conditionScore >= 45 ? "#f97316" : "#ef4444";

OLD (line 1253):
  <div className="card" onClick={() => onOpen && onOpen(listing)} style={{ borderRadius:16, overflow:"hidden", background:"#fff", border:`2px solid ${borderColor}` }}>

NEW (line 1251):
  // Score communicated via GoVerdictBadge inside the card image

NEW (line 1253):
  <div className="card" onClick={() => onOpen && onOpen(listing)} style={{ borderRadius:16, overflow:"hidden", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.06), 0 4px 14px rgba(0,0,0,0.04)" }}>
```

**FeaturedCard (line 1349-1351):**
```
OLD (line 1349):
  const borderColor = listing.conditionScore >= 90 ? "#22c55e" : listing.conditionScore >= 75 ? "#84cc16" : listing.conditionScore >= 60 ? "#eab308" : listing.conditionScore >= 45 ? "#f97316" : "#ef4444";

OLD (line 1351):
  <div className="card" onClick={() => onOpen && onOpen(listing)} style={{ minWidth:300, borderRadius:20, overflow:"hidden", flexShrink:0, background:"#fff", border:`2px solid ${borderColor}` }}>

NEW (line 1349):
  // Score communicated via discount badge + condition label

NEW (line 1351):
  <div className="card" onClick={() => onOpen && onOpen(listing)} style={{ minWidth:300, borderRadius:20, overflow:"hidden", flexShrink:0, background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.06), 0 4px 14px rgba(0,0,0,0.04)" }}>
```

**CompactCard (line 1412-1414):**
```
OLD (line 1412):
  const borderColor = listing.conditionScore >= 90 ? "#22c55e" : listing.conditionScore >= 75 ? "#84cc16" : listing.conditionScore >= 60 ? "#eab308" : listing.conditionScore >= 45 ? "#f97316" : "#ef4444";

OLD (line 1414):
  <div className="card" onClick={() => onOpen && onOpen(listing)} style={{ borderRadius:12, overflow:"hidden", background:"#fff", border:`2px solid ${borderColor}` }}>

NEW (line 1412):
  // Score communicated via GoVerdictBadge

NEW (line 1414):
  <div className="card" onClick={() => onOpen && onOpen(listing)} style={{ borderRadius:12, overflow:"hidden", background:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)" }}>
```

### Fix 2: Increase card body padding

**ListingCard (line 1303):**
```
OLD:  <div style={{ padding:"12px 4px 8px" }}>
NEW:  <div style={{ padding:"12px 14px 12px" }}>
```

**CompactCard (line 1449):**
```
OLD:  <div style={{ padding:"7px 6px 7px" }}>
NEW:  <div style={{ padding:"8px 10px 10px" }}>
```

### Fix 3: Expand heart button touch targets to 44x44px

**ListingCard heart (lines 1264-1268):**
```
OLD:
        <button className="heart" onClick={e => { e.stopPropagation(); onToggle(listing.id); haptic("medium"); }} style={{
          position:"absolute", top:12, right:12,
          background:"none", border:"none", fontSize:20,
          filter: saved ? "none" : "drop-shadow(0 1px 3px rgba(0,0,0,0.45))",
        }}>

NEW:
        <button className="heart" onClick={e => { e.stopPropagation(); onToggle(listing.id); haptic("medium"); }} style={{
          position:"absolute", top:6, right:6,
          background:"none", border:"none", fontSize:20,
          width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center",
          filter: saved ? "none" : "drop-shadow(0 1px 3px rgba(0,0,0,0.45))",
        }}>
```

**FeaturedCard heart (lines 1358-1360):**
```
OLD:
        <button className="heart" onClick={e => { e.stopPropagation(); onToggle(listing.id); }} style={{
          position:"absolute", top:10, right:10, background:"none", border:"none", fontSize:18,
        }}>

NEW:
        <button className="heart" onClick={e => { e.stopPropagation(); onToggle(listing.id); }} style={{
          position:"absolute", top:4, right:4, background:"none", border:"none", fontSize:18,
          width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center",
        }}>
```

**CompactCard heart (lines 1425-1428):**
```
OLD:
        <button className="heart" onClick={e => { e.stopPropagation(); onToggle(listing.id); haptic("medium"); }} style={{
          position:"absolute", top:5, right:5,
          background:"none", border:"none", fontSize:13,
          filter: saved ? "none" : "drop-shadow(0 1px 3px rgba(0,0,0,0.5))",
        }}>

NEW:
        <button className="heart" onClick={e => { e.stopPropagation(); onToggle(listing.id); haptic("medium"); }} style={{
          position:"absolute", top:0, right:0,
          background:"none", border:"none", fontSize:13,
          width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center",
          filter: saved ? "none" : "drop-shadow(0 1px 3px rgba(0,0,0,0.5))",
        }}>
```

**FilterChip close button (line 2103):**
```
OLD:
      <button onClick={onRemove} style={{ background:"none", border:"none", cursor:"pointer", padding:0, lineHeight:1, fontSize:11, color:"#0284c7", fontWeight:900, display:"flex", alignItems:"center" }}>

NEW:
      <button onClick={onRemove} style={{ background:"none", border:"none", cursor:"pointer", padding:"6px", margin:"-6px -6px -6px 0", lineHeight:1, fontSize:11, color:"#0284c7", fontWeight:900, display:"flex", alignItems:"center", minWidth:28, minHeight:28, justifyContent:"center" }}>
```

**BottomNav tabs (line 5061):**
```
OLD:
        <button key={t.id} onClick={() => setActive(t.id)} className="tab-btn" style={{
          background:"none", border:"none",
          display:"flex", flexDirection:"column", alignItems:"center", gap:2,
          color: active === t.id ? "#0284c7" : "#b0b0b0", position:"relative",
          padding:"4px 0",
        }}>

NEW:
        <button key={t.id} onClick={() => setActive(t.id)} className="tab-btn" style={{
          background:"none", border:"none",
          display:"flex", flexDirection:"column", alignItems:"center", gap:2,
          color: active === t.id ? "#0284c7" : "#b0b0b0", position:"relative",
          padding:"4px 0", flex:1,
        }}>
```

---

## Tanning Category Verification

**Status: Present.** `CATEGORIES` array at line 148 includes `{ id:"tanning", label:"Beach & Tan", emoji:"..." }`. The Explore tab shows it in the default visible pills (line 2201: `defaultCatIds = ["all", "skiing", "surfing", "tanning"]`).

**Note:** Line 3883 in the onboarding flow explicitly excludes tanning from sport selection: `CATEGORIES.filter(c => c.id !== "all" && c.id !== "tanning")`. This is intentional since tanning is a passive activity, not a sport to "track." No action needed.

---

## Inspiration: Steal from Airbnb

**Airbnb's card shadow system.** Airbnb cards use zero borders -- they rely entirely on a two-layer box-shadow (`0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)`) and generous white padding to create depth. On hover/press, shadow intensifies slightly. This is what makes their feed feel like a magazine layout rather than a data table. Peakly should adopt this exact pattern -- kill all card borders, use shadow-only elevation, and let the GoVerdictBadge handle the color signal.

---

## Decision Made

**Kill all score-colored card borders.** The GoVerdictBadge (green/yellow/red dot + "GO"/"MEH"/"SKIP" label) already communicates condition quality inside the card image. The colored border is redundant information that creates visual noise across the entire feed. Replacing borders with neutral shadows will immediately make the app feel more premium.

---

## Score Trajectory

| Date | Score | Key Change |
|------|-------|-----------|
| Last report | 5.5/10 | Identified core issues |
| This report | 5.5/10 | Issues confirmed, fixes specified |
| After Fix 1-3 | ~7.0/10 | Clean cards, proper touch targets, breathing room |

Next priority after these fixes: audit the hero card design and consider replacing it with a simpler "top pick" card that matches the visual language of the rest of the feed.
