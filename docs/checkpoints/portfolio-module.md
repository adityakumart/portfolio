# Module Checkpoint & Invariant Specification: Portfolio Module

**Module Path**: `apps/portfolio/src/app/modules/portfolio/`  
**Route**: `/` (Public Root Route)  
**Status**: Active Baseline  
**Framework**: Angular 18+ (Signals, OnPush, Spartan UI / SCSS)

---

## 1. Module Overview & Global Invariants
The **Portfolio Module** is the public-facing showcase of Aditya Kumar T's professional identity, resume, accomplishments, and engineering projects. It is a high-performance single-page application with responsive multi-column layout adaptation, dynamic SEO structured data, and seamless theme switching.

### Global Invariants
1. **Public Availability & Zero Auth Requirement**:
   - The root `/` route must load seamlessly without requiring authentication or session tokens.
2. **SEO & Accessibility**:
   - Must contain exactly one `<h1>` tag with proper heading hierarchy (`<h2>`, `<h3>`).
   - Dynamic OpenGraph and JSON-LD schema generated via `SeoService.setPortfolioSeo()`.
3. **Anchor Link Integrity**:
   - All navigation anchor targets (`#hero`, `#summary`, `#skills`, `#experience`, `#education`, `#projects`, `#certificates`, `#awards`) must remain functional and execute smooth scrolling.
4. **Data Contract Integrity (`GlobalData.resume`)**:
   - All sub-components must strictly consume the typed schema from `GlobalData.resume`.

---

## 2. Section-by-Section Specifications

### Section 2.1: Hero Section (`#hero` / `HeroComponent`)
- **Visual Elements**:
  - Profile avatar / headshot.
  - Heading: Developer name and professional designation (`Full Stack Developer & AI Engineer`).
  - Action buttons: "Download Resume" (direct PDF link), "Contact Me", and social icon links (GitHub, LinkedIn, Twitter, Email).
- **Invariants**: Social links must open in new tab (`target="_blank"`, `rel="noopener noreferrer"`).

---

### Section 2.2: Summary & Philosophy (`#summary` / `SummaryComponent`)
- **Content**:
  - In-depth professional narrative, engineering mindset, full-stack architecture focus, and problem-solving methodology.
- **Invariants**: Clean typography, responsive line-height, seamless dark/light theme contrast.

---

### Section 2.3: Technical Skills (`#skills` / `SkillsComponent`)
- **Structure & Categories**:
  - Categorized skill domains:
    - **Frontend**: Angular, React, TypeScript, Spartan UI, Tailwind CSS, Next.js, HTML5/SCSS.
    - **Backend**: Node.js, Express, NestJS, Python, REST APIs, GraphQL, SSE.
    - **Databases & Cloud**: Supabase, PostgreSQL, MongoDB, Redis, AWS, Firebase.
    - **DevOps & Tools**: Git, Docker, Nx Monorepo, Playwright, Vitest, CI/CD pipelines.
- **Invariants**: Each skill item renders an official icon badge with responsive wrapping.

---

### Section 2.4: Career Experience Timeline (`#experience` / `ExperienceComponent`)
- **Structure**:
  - Vertical chronological timeline with connected node indicators.
  - Role card contents:
    - Position title and Company name.
    - Employment duration (`startDate` to `endDate` or `Present`).
    - Bullet points describing key engineering contributions, performance optimizations, and metrics.
    - Technology stack badges used on each role.
- **Invariants**: Date order must strictly display the most recent positions first.

---

### Section 2.5: Education Credentials (`#education` / `EducationComponent`)
- **Structure**:
  - Degree name (e.g. Bachelor of Technology in Computer Science).
  - Institution / University name, graduation year, and academic distinctions.

---

### Section 2.6: Featured Projects Showcase (`#projects` / `ProjectsComponent`)
- **Structure & Features**:
  - Responsive project cards displaying:
    - Project screenshot or high-resolution banner.
    - Title, overview summary, and architecture highlights.
    - Technology tag badges (e.g. `Angular`, `Supabase`, `Spartan UI`).
    - Action buttons: "Live Demo" (external link) and "GitHub Source" (repository link).
    - Optional accordion expansion for deep technical details.
- **Invariants**: Missing demo or repo links must gracefully hide the button rather than producing a broken 404 URL.

---

### Section 2.7: Verified Certifications (`#certificates` / `CertificatesComponent`)
- **Structure**:
  - Certification title, issuing organization (e.g., Google Cloud, AWS, Meta), issue date, and expiration status.
  - Direct "Verify Credential" external link button.

---

### Section 2.8: Awards & Honors (`#awards` / `AwardsComponent`)
- **Structure**:
  - Award title, competition/hackathon event name, organizing body, and year won.
  - Recognition narrative highlighting project achievement.

---

## 3. Core Calculations & Logic

### A. Responsive Grid Layout (`BreakpointObserver`)
- **Breakpoint Logic**:
  - `Breakpoints.XSmall` (<600px): **1 Column** (Stacked mobile cards).
  - `Breakpoints.Small` (600px - 959px): **2 Columns**.
  - `Breakpoints.Medium` (960px - 1279px): **2 Columns**.
  - `Breakpoints.Large` (1280px - 1919px): **2 Columns**.
  - `Breakpoints.XLarge` (>=1920px): **2 Columns**.
- **Calculation**: Binds `gridColumns` signal dynamically to avoid layout redraw delay.

### B. Navigation ScrollSpy
- **Calculation**: Intersection Observer checks section visibility (`intersectionRatio >= 0.4`).
- Computes `activeSection` identifier and highlights the corresponding navbar link in real time.

### C. Theme Persistence (`ThemeService`)
- Toggles `darkMode` signal between `true` and `false`.
- Adds/removes class `'dark'` on `<html>` element.
- Persists user preference to `localStorage.getItem('theme')`.

---

## 4. Pre-Implementation Checkpoint Protocol

Whenever an implementation prompt targets the **Portfolio Module**, follow this gate:

### Step 1: Impact Classification
- 🟢 **Additive**: Adding a new project card, new skill category, new award item, or new interactive animation effect.
- 🟡 **Behavioral Modification**: Changing the layout order of sections, modifying existing project metadata, altering navigation scroll behavior, or changing theme color tokens.
- 🔴 **Breaking Change**: Removing an entire section (e.g., hiding Experience or Projects), breaking existing anchor IDs, or making sections require login.

### Step 2: Interactive Question Trigger
If any proposed change is **🟡 Behavioral Modification** or **🔴 Breaking Change**:
**PAUSE execution immediately.** Use `ask_question`:
- **Title**: Existing functionality impact detected in Portfolio Module
- **Question**: "The prompt modifies existing portfolio presentation: `<EXACT_EXISTING_BEHAVIOR>`. How would you like to proceed?"
- **Option 1**: "(Recommended) Keep existing behavior intact: update the prompt / approach to be additive (`<SUGGESTED_PROMPT_UPDATE>`)"
- **Option 2**: "Approve changing the existing portfolio section to match the new requirement"
