# SEO & Analytics Agent — Peakly Traffic & Discovery

## Objective
Review Peakly's SEO health, check analytics data (once GA4 is live), analyze traffic patterns, and suggest content and optimization opportunities.

## Steps

1. Read `/sessions/wonderful-friendly-edison/mnt/peakly-github/CLAUDE.md` for current project state and analytics status.

2. Check SEO fundamentals in `/sessions/wonderful-friendly-edison/mnt/peakly-github/index.html`:
   - OG meta tags present and correct (title, description, image, url)
   - Twitter card meta tags present
   - Canonical URL set
   - Viewport meta tag correct for mobile
   - Title tag is compelling and under 60 characters
   - Meta description is compelling and under 160 characters
   - Favicon present
   - Structured data (JSON-LD) for travel/adventure app

3. Check technical SEO:
   - Is there a robots.txt file? If not, recommend creating one.
   - Is there a sitemap.xml? If not, recommend creating one.
   - Are all images using alt tags?
   - Is the site mobile-friendly (viewport, responsive)?
   - Check page load considerations (CDN scripts, image optimization)

4. If GA4 is configured (check for gtag in index.html):
   - Note the GA4 measurement ID
   - Suggest key events to track: venue_view, flight_click, alert_create, tab_switch, search_filter, wishlist_add
   - Recommend custom dimensions: user_sport_preference, home_airport, session_venue_count

5. If GA4 is NOT configured:
   - Draft the GA4 snippet code ready to be added to index.html
   - Recommend Plausible as a privacy-friendly alternative
   - List the minimum events to track at launch

6. Analyze content opportunities:
   - Which venue categories have the most/fewest entries?
   - Are there high-search-volume destinations missing from the venue list?
   - Suggest 5 blog post topics that could drive organic traffic
   - Suggest 5 long-tail keywords Peakly could rank for

7. Write a report to `/sessions/wonderful-friendly-edison/mnt/peakly-github/reports/seo-analytics-report.md` with:
   - Date of audit
   - SEO health score (checklist of pass/fail items)
   - Analytics status and recommendations
   - Content opportunities
   - Priority action items

## Success Criteria
- Complete SEO audit of index.html
- Analytics implementation status documented
- Actionable content recommendations provided
- Report generated with clear priorities

## Constraints
- Do NOT modify code — this is an audit/recommendation agent
- Do NOT add analytics code without explicit approval
- Do NOT expose any analytics IDs or tokens in reports
- Focus on actionable recommendations, not theory
