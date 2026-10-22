# Module Checkpoint & Invariant Specification: Portfolio Module

**Module Path**: `apps/portfolio/src/app/modules/portfolio/`  
**Status**: Active Baseline  
**Framework**: Angular 18+ (Signals, OnPush, Spartan UI / SCSS)

---

## 1. Module Overview & Core Responsibilities
The **Portfolio Module** is the public-facing showcase of Aditya Kumar T's professional identity, resume, accomplishments, and engineering projects. It presents an interactive, highly polished, responsive presentation across desktop, tablet, and mobile viewports.

---

## 2. Core Section Architecture & Navigation

| Section / Component | Path | Core Function & Invariants |
|---|---|---|
| `HeroComponent` | `sub-components/hero/` | High-impact introduction, call-to-action buttons (Resume, Contact, Socials) |
| `SummaryComponent` | `sub-components/summary/` | Professional bio, key strengths, engineering philosophy |
| `SkillsComponent` | `sub-components/skills/` | Categorized tech stack badges (Frontend, Backend, Cloud, Tools) |
| `ExperienceComponent`| `sub-components/experience/`| Interactive career timeline, company roles, impact achievements |
| `EducationComponent` | `sub-components/education/` | Academic credentials and institutions |
| `ProjectsComponent` | `sub-components/projects/` | Showcase cards with live preview links, GitHub repositories, tag filters |
| `CertificatesComponent`| `sub-components/certificates/`| Verified certifications with credential badges and links |
| `AwardsComponent` | `sub-components/awards/` | Accolades, hackathon wins, recognitions |

---

## 3. Core Business Logic, Validations & Calculations

### A. Navigation ScrollSpy & Active Section Calculation
- **Intersection Observer / Scroll Offset**:
  - Monitors viewport position of section anchors: `#hero`, `#summary`, `#skills`, `#experience`, `#education`, `#projects`, `#certificates`, `#awards`.
  - Computes `activeSection` signal based on scroll threshold (e.g. `entry.intersectionRatio >= 0.4` or closest offset to header).
  - Updates navigation menu active indicator dynamically without jitter.

### B. Project Filtering & Tag Matching (`ProjectsComponent`)
- **Filter Chip State**:
  - Supported category filters: `'All' | 'Angular' | 'Full Stack' | 'Mobile' | 'AI'`.
  - Filter logic:
    - If `'All'`: returns full project catalog.
    - If specific category selected: returns projects where `project.tags.includes(selectedCategory)`.
  - Card hover micro-animations must not interfere with click navigation to live demo or GitHub repository.

### C. Theme Persistence & System Sync (`ThemeService`)
- **Theme Calculation & Local Storage**:
  - Reads stored preference from `localStorage.getItem('theme')`.
  - If null, defaults to system preference via `window.matchMedia('(prefers-color-scheme: dark)')`.
  - Applies class `'dark'` to document root element.
  - Toggling updates signal and persists new value back to `localStorage`.

### D. Anchor & External Link Safety
- External project/social links must include `target="_blank"` and `rel="noopener noreferrer"`.
- Internal jump links must execute smooth-scroll behavior: `{ behavior: 'smooth', block: 'start' }`.

---

## 4. Critical Invariants (Non-Negotiables)
1. **Public Availability & SEO**:
   - The root `/` route must load seamlessly without requiring authentication.
   - Meta tags, OpenGraph data, and semantic headings (`<h1>`, `<h2>`) must remain optimized for search engines.
2. **Smooth Section Navigation & Deep Linking**:
   - Section anchors (e.g. `#skills`, `#projects`, `#experience`) must remain unbroken if navigation links or headers are modified.
3. **Theme & Responsiveness**:
   - Must fully support both Dark and Light themes via `ThemeService`.
   - Grid layouts for projects, skills, and timeline cards must never break on mobile viewports (<640px).
4. **Content Preservation**:
   - Existing project descriptions, experience entries, and external links must not be overwritten or removed unless explicitly instructed by the prompt.

---

## 5. Pre-Implementation Checkpoint Protocol

Whenever an implementation prompt targets the **Portfolio Module**, follow this gate:

### Step 1: Impact Classification
- 🟢 **Additive**: Adding a new project card, new skill category, new award item, or new interactive animation effect.
- 🟡 **Behavioral Modification**: Changing the layout order of sections, modifying existing project metadata, altering navigation scroll behavior, or changing theme color tokens.
- 🔴 **Breaking Change**: Removing an entire section (e.g., hiding Experience or Projects), breaking existing anchor IDs, or making sections require login.

### Step 2: Checkpoint Gate Table
Include in the plan:
```markdown
| Target File / Feature | Impact | Existing Behavior | Proposed Behavior | Checkpoint Result |
|---|---|---|---|---|
| ... | 🟢 / 🟡 / 🔴 | ... | ... | Proceed / Needs User Question |
```

### Step 3: Interactive Question Trigger
If any proposed change is **🟡 Behavioral Modification** or **🔴 Breaking Change**:
**PAUSE execution immediately.** Use `ask_question`:
- **Title**: Existing functionality impact detected in Portfolio Module
- **Question**: "The prompt modifies existing portfolio presentation: `<EXACT_EXISTING_BEHAVIOR>`. How would you like to proceed?"
- **Option 1**: "(Recommended) Keep existing behavior intact: update the prompt / approach to be additive (`<SUGGESTED_PROMPT_UPDATE>`)"
- **Option 2**: "Approve changing the existing portfolio section to match the new requirement"
