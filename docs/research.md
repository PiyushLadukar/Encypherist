# Research Report — Encypherist (JIT Nagpur CSE Forum)

This document records the research pipeline behind the website's content: what was found,
where it came from, how confident we are in it, and what was deliberately left as a
placeholder rather than invented. Every fact rendered as "verified" on the live site
traces back to a source listed here.

## 1. Organization Overview

**Encypherist** is the official student forum of the Department of Computer Science &
Engineering at **Jhulelal Institute of Technology (JIT)**, an autonomous institute
(Samridhi Sarwajanik Charitable Trust) affiliated to Rashtrasant Tukadoji Maharaj (RTM)
Nagpur University.

- Address: Off Koradi Road, Lonara, Nagpur, Maharashtra — 441111, India
- Accreditation: NAAC A+
- DTE Code: EN4139
- Department email: admin@jitnagpur.edu.in
- Department vision (as published): *"To emerge as the best Computer Science & Engineering
  Department through Quality Education, Industry alliances & Collaborative Research."*
- Current tenure branding: **ENCYPHERIST 2K26-27**

**Confidence:** VERIFIED — sourced directly from the official department letterhead
reproduced on two PDFs hosted on jitnagpur.edu.in (see §9), and from the department's live
webpage.

## 2. Brand Observations

No standalone Encypherist logo file, brand guideline, or color spec could be located
through available research tools (text-based fetching only — no image extraction/OCR, no
browser or Instagram scraping). The JIT institutional logo (used on official department
letterhead) is blue-and-white and institutional in tone; it belongs to the college, not
specifically to the student forum, so it was not adopted as the forum's own mark.

**Confidence:** UNVERIFIED (no forum-specific logo/colors found). **Decision:** an original
visual identity was designed for this build (see "Design Direction" below), rather than
guessing at or fabricating a logo.

## 3. Color Observations

No forum-specific palette found (see §2). The JIT institutional site uses conventional
blue/white academic branding, which was intentionally *not* copied — the brief calls for
an original identity that avoids generic-college-website aesthetics.

**Confidence:** UNVERIFIED / not applicable — original palette used instead.

## 4. Typography Observations

No forum-specific typography found. An original type system was chosen for the build
(see design system docs in the codebase).

## 5. Logo Findings

Not found. See §2. Placeholder wordmark used; a slot exists in `public/brand/` for a real
logo file to be dropped in later without code changes (see README).

## 6. Member Findings — VERIFIED

**Source:** PDF supplied directly by the requester, cross-confirmed as the exact file
officially hosted at
`https://www.jitnagpur.edu.in/wp-content/uploads/2025/10/Ency-Forum-Members.pdf`
(fetched independently and found to match).

**Current tenure (Session 2026-27) — "ENCYPHERIST 2K26-27", 41 members:**

*Final Year (8):* Muskan Mistry — President; Piyush Ladukar — Secretary; Aditya Kanojiya —
Sponsorship & Financial Advisor; Lucky Ghangare — Technical Head; Payal Karode — Publicity
& Promotion Head; Abhinay Sayare — Community Relation Officer; Samruddhi Sable — Visual
Media Head; Sampada Khond — Alumni Network Head.

*Third Year (8):* Himanshu Borkar — Vice President; Devkumar Sarkar — Joint Secretary;
Sejal Chopade — Documentation Head; Arshita Rambhade — Strategic Head; Siya Dhawale —
Content & Creative Head; Karishma Andraskar — Editor; Samruddhi Gore — Visual Designer;
Shreya Choudhari — Photography & Videography Head.

*Second Year (25):* Atharva Ramteke — Joint General Secretary; Parth Boldhane — Treasurer;
Garima Nagdewe — Event Manager; Aryan Thaware — Technical Incharge; Armaan Khan — Technical
Co-incharge; Durgesh Kubde — Technical Associate; Pratyush Bawane — Documentation Incharge;
Aarsh Kolhe — Documentation Incharge; Priyanka Gahane — Documentation Associate; Ganesh
Mishra — Resource Manager; Nikhaar Gangwani — Publicity Incharge; Lokesh Mahore — Publicity
Incharge; Pallavi Methwani — Promotion Incharge; Prerna Sodeja — Promotion Co-Incharge;
Pravin Rangire — Strategic Officer; Reeha Rajput — Strategic Incharge; Sakshi Totlani —
Strategic Associate; Yogini Shende — Content & Creative Incharge; Kshitij Khobragade —
Social Media Incharge; Kunal Barmase — Co-editor; Nayan There — Co-editor; Laxmi Khadakkar —
Photography Incharge; Kavya Nandeshwar — Photography Incharge; Lavina Pakhrani —
Videography Incharge; Gaurav Khedkar — Videography Incharge.

**Historical tenure (Session 2024-25), 25 members** — used only as forum-history content,
never merged with the current roster:

*Final Year:* Bhavesh Khushal Sukare — President; Dipesh Nimje — Secretary; Sweta Ganesh
Karluke — Documentation Head; Swarnjeet Singh Rooprha — Technical Incharge; Abhijeet Vishal
Verma — Financial Advisor; Ujwal Chandrakapure — Alumni Network Head; Kadambari Arun Raut —
Student Relation Officer; Palak Anandani — Public Relation Officer.

*Third Year:* Gitu Thakre — Documentation Incharge; Khushboo Bhagat — Promotional Head;
Shrawani Petle — Publicity Incharge.

*Second Year (CSE):* Sayali Pardhi — Vice President; Muskan Dilip Mistry — Joint Secretary;
Ayush Mishra — Technical Co-head; Dwip Anil Rebhe — Event Manager; Sharwari Udgirwar —
Creative Incharge; Sankalp Raju Khandalkar — Editor; Reet Kodwani — Treasurer; Heer
Mulchandani — Social Media Incharge; Dimple Raisinghani — Joint General Secretary; Gautam
Makhijani — Event Co-manager; Om Dhage — Co-editor; Pragati Manohar Hage — Creative and
Documentation Co-incharge; Sampada Satishrao Khond — Photography Co-ordinator; Aachal
Nagesh Bhudke — Student Welfare Executive.

Notably, Sampada Khond appears in both tenures (Photography Co-ordinator in 2024-25 →
Alumni Network Head, Final Year, in 2026-27), and Muskan Mistry appears in both (Joint
Secretary in 2024-25 as a 2nd-year → President in 2026-27), which is internally consistent
with a real year-over-year progression and increases confidence in both documents.

No member photos, department/branch details, or "skills" were included in the source
document, so those fields are intentionally left empty/omitted on the site rather than
invented.

## 7. Event Findings

### 7a. VERIFIED — Session 2024-25 Forum Activity Plan

**Source:** PDF hosted at
`https://www.jitnagpur.edu.in/wp-content/uploads/2025/10/Ency-Forum-plan-1.pdf`
(official department letterhead, "Forum Activities Conducted Session 2024-25" table).

| # | Activity | Skill/Type | Year(s) | Expected Participants | Date |
|---|---|---|---|---|---|
| 1 | Healing Horizons | Life Skill | 3rd/5th/7th Sem | 100 | 1 Aug 2024 |
| 2 | Meeting the Expectations of Software Engineering | Seminar | 3rd/5th/7th Sem | 150 | 7 Aug 2024 |
| 3 | Magic of MBA | Technical Activity | 3rd/5th/7th Sem | 100 | 20 Aug 2024 |
| 4 | Forum Installation | — | 3rd/5th/7th Sem | 100 | 30 Aug 2024 |
| 5 | Code Craft | Technical Activity | 3rd/5th/7th Sem | 200 | 18–21 Sep 2024 |
| 6 | Threads of Future | Donation Drive | 4th/6th/8th Sem | 50 | 28 Dec 2024 |
| 7 | QuizGen AI | Technical Activity | 4th/6th/8th Sem | 500 | 7 Feb 2025 |
| 8 | Sense & Simplicity — UI/UX Redefine | Technical Activity | 4th/6th/8th Sem | 150 | 7 Mar 2025 |
| 9 | Hackroot — Linux Cybersecurity Meet up | Technical Activity | 4th/6th/8th Sem | 200 | 22 Mar 2025 |
| 10 | Algorithm Arena | Technical Activity | 4th/6th/8th Sem | 150 | 4 Apr 2025 |
| 11 | Byte Design Pitch | Technical Activity | 4th/6th/8th Sem | 100 | 4 Apr 2025 |

These 11 events are seeded as **past events** with `confidence: verified`.

### 7b. LIKELY — named but undated/undescribed

From the public Instagram bio's story highlights (`@encypherist_`): **"Shikhar 2K26"**
(name suggests a flagship annual event/fest for the new tenure), **"DISHA"** (a rural/
community outreach programme — also referenced independently on the department's website
summary), and a **"days"** / **"events"** highlight referencing general activity.

From a summarized department webpage pass (title/type only, no dates or descriptions
confirmed): Flutter app-development workshop, Advanced SQL workshop, GitHub/open-source
session, Docker session, QuizTopia, poster design competition, T-shirt design competition,
technical poster competition, "Hack Blitz" hackathon series, 30DaysDevChallenge, Code Rush,
Tech Trail, "Share the Warmth" donation drive, "Believe in Yourself", "Happiness
Unlimited", Teacher's Day celebration.

**Confidence:** LIKELY (names corroborated across independent sources) but **dates,
descriptions, results, and attendance are UNVERIFIED**. Seeded with `confidence: likely`
and rendered with "Details coming soon" rather than fabricated specifics, per the
no-hallucination rule.

### 7c. Not found

No event posters, event photography, sponsor names, prize amounts, speaker names, or
attendance results were retrievable through available tools. None of these are invented;
they are simply absent from the seeded data until supplied.

## 8. Image/Asset Findings

| Asset | Status | Notes |
|---|---|---|
| Forum logo | UNVERIFIED / not found | Original wordmark designed instead |
| Event posters | UNVERIFIED / not found | Placeholder poster slots, clearly labeled |
| Event photography | UNVERIFIED / not found | Placeholder gallery slots |
| Member photos | UNVERIFIED / not found | Initials-based avatar placeholders |
| College imagery | Not sourced | Out of scope — this is a forum site, not a college site |

Research tools available in this environment can only fetch and summarize text content —
there is no image-extraction, OCR, or Instagram-scraping capability, and private/
authenticated content was never attempted. This is a tooling limitation, not a judgment
that the assets don't exist; the college and Instagram account likely do have real photos
that simply couldn't be retrieved here.

## 9. Social Links

| Platform | URL | Status |
|---|---|---|
| Instagram | https://www.instagram.com/encypherist_/ | VERIFIED, public, 597 followers at time of research |
| LinkedIn | — | Not found |
| GitHub | — | Not found |
| YouTube | — | Not found |
| Dedicated website | — | Not found (this build is intended to become it) |
| Contact email | admin@jitnagpur.edu.in (department-level, not forum-specific) | VERIFIED (department contact only) |

## 10. Source References

1. https://www.jitnagpur.edu.in/computer-science-and-engineering-2/ — CSE department page (forum description, activity name list)
2. https://www.jitnagpur.edu.in/wp-content/uploads/2025/10/Ency-Forum-Members.pdf — official 2026-27 member roster (matches user-supplied PDF)
3. https://www.jitnagpur.edu.in/wp-content/uploads/2025/10/Ency-Forum-plan-1.pdf — official session 2024-25 dated activity plan
4. https://www.instagram.com/encypherist_/ — public Instagram profile (bio, tagline, highlight titles)
5. https://www.jitnagpur.edu.in/home/ — institutional site (accreditation, general branding context, explicitly not copied)
6. https://en.wikipedia.org/wiki/Jhulelal_Institute_of_Technology — general institute background

## 11. Information That Could Not Be Verified

- Forum logo, brand colors, typography
- Event posters, event photography, member photography
- "Shikhar 2K26" and "DISHA" event dates/descriptions/outcomes
- Member departments/branches, years of study (beyond Final/Third/Second Year grouping), skills, bios, social handles
- Any attendance numbers, competition results, prize details, sponsor names
- LinkedIn, GitHub, YouTube presence
- Real software/hardware projects built by Encypherist — searched specifically
  (2026-08-12) for a GitHub presence or shipped project tied to the forum; found
  none. (A GitHub org named "enCypher Technologies" exists but is an unrelated
  company — not this forum — and is not used anywhere in this build.) The `/projects`
  feature therefore launches with zero seeded entries and an honest empty state,
  ready for the forum to add real projects via the admin CMS.

## 12. Missing Information Requiring Placeholders

All items in §11 are represented on the site as empty fields, "Details coming soon" /
"Information not publicly available" copy, or original placeholder graphics — never as
invented facts. The data layer (`seed/`, DB `confidence` column) keeps this distinction
explicit and queryable rather than silently blending verified and speculative content.
