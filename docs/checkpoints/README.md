# Portfolio Platform Invariant & Checkpoint Architecture

This directory houses the comprehensive, **page-by-page and view-by-view functional specifications** for every module in the application. These documents serve as living baseline contracts to prevent unwanted regressions and ensure new features are strictly additive.

---

## 📂 Complete Module Catalog & Page Inventories

| Module | Specification Document | Page & View Inventory | Key Logics & Validations Covered |
|---|---|---|---|
| **Dev Tools** | [`dev-tools-module.md`](file:///e:/Code/portfolio/docs/checkpoints/dev-tools-module.md) | **24 Tools** across 5 categories:<br>• Calculators (3 tools)<br>• Formatters (4 tools)<br>• Converters (5 tools)<br>• Generators (7 tools)<br>• Security/Tokens (5 tools) | • 100% client-side privacy guarantee<br>• Percentage & Experience interval math<br>• ReDoS protected regex engine<br>• JWT expiry calculations<br>• Number base real-time conversions |
| **User** | [`user-module.md`](file:///e:/Code/portfolio/docs/checkpoints/user-module.md) | **10 Dedicated Pages**:<br>• Sign In (`/login`)<br>• Profile Hub (`/user`)<br>• No Modules (`/no-modules`)<br>• AI Assistant (`/ai`)<br>• AI Workspace (`/chat`)<br>• File Manager (`/files`)<br>• Diet & Hydration (`/diet-hydration`)<br>• Master Admin (5 tabs)<br>• Telugu Movie Guesser (`/game`)<br>• Barricade Board Game (`/barricade`) | • Destination resolution logic (`0 / 1 / 2+` modules)<br>• Feature flag permissions gating (`user.modules`)<br>• Movie guesser TTS clues & streak multipliers<br>• File storage quotas & preview modal<br>• Calorie/macro math & midnight water resets |
| **Royal Rentals (RR)** | [`rr-module.md`](file:///e:/Code/portfolio/docs/checkpoints/rr-module.md) | **13 Pages & 4 Dialogs**:<br>• Public Vehicle Showcase<br>• Staff Login<br>• Stats Dashboard<br>• Active Bookings<br>• Advance Bookings<br>• Vehicle Inventory<br>• Customer Directory<br>• Activity Audit Logs<br>• Announcements & Home CMS | • Finalize return settlement: 5 scenarios (Case 1 to 4.2)<br>• Extra KM, extra hour & non-intimation fines<br>• Real-time vehicle schedule conflict engine<br>• 4 deposit options (`none`, `bike`, `cash`, `other`)<br>• Inactivity dashboard session auto-lock |
| **Planner** | [`planner-module.md`](file:///e:/Code/portfolio/docs/checkpoints/planner-module.md) | **5 Views & 2 Dialogs**:<br>• Header & Filter Bar<br>• Kanban Board<br>• Compact Task Checklist<br>• Notes Workspace<br>• Collaborative Projects<br>• Task Form Sheet<br>• Reminder Dialog | • Strict priority sort order (`urgent ➔ low`)<br>• Pinned note precedence (`isPinned`)<br>• Kanban drag-and-drop fractional `orderIndex`<br>• Granular collaborative permissions (`IProjectPermissions`)<br>• Instant offline cache & Chrome Extension badge sync |
| **Portfolio** | [`portfolio-module.md`](file:///e:/Code/portfolio/docs/checkpoints/portfolio-module.md) | **8 Cohesive Sections**:<br>• Hero Banner<br>• Professional Summary<br>• Categorized Skills<br>• Career Experience Timeline<br>• Education Credentials<br>• Projects Showcase<br>• Verified Certificates<br>• Awards & Honors | • Zero-auth public access invariant<br>• CDK BreakpointObserver column calculation (1 vs 2 cols)<br>• Dynamic SEO metadata & JSON-LD structured schema<br>• Intersection Observer navigation scrollspy<br>• Light/Dark theme persistence |

---

## 🚦 The Pre-Implementation Gate Protocol

Before executing any code modification, the AI assistant runs the prompt against the relevant module's page-by-page specification:

```mermaid
graph TD
    A["User submits prompt"] --> B["Identify target module & page/tool"]
    B --> C["Verify against docs/checkpoints/<module>.md"]
    C --> D["Impact Classification"]
    D --> E{"Any 🟡 Modified or 🔴 Breaking items?"}
    E -- No: Purely Additive 🟢 --> F["Proceed with implementation"]
    E -- Yes: 🟡 / 🔴 Detected --> G["🛑 HALT: Trigger interactive checkpoint"]
    G --> H{"User Decision"}
    H -- "Approve Change" --> I["Proceed with approved functional modification"]
    H -- "Update Prompt / Keep Intact" --> J["Refine approach to be strictly additive"]
```

---

## 📋 Impact Classification Legend
- 🟢 **Additive (Auto-Proceed)**: New tools, new sub-components, new routes, or non-conflicting additions.
- 🟡 **Behavioral Modification (Requires User Gate)**: Changing formulas, modifying default statuses, altering KYC rules, or changing UI order.
- 🔴 **Breaking Change (Requires User Gate)**: Deleting routes, removing features, changing API contracts, or breaking existing test assertions.
