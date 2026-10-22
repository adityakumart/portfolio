---
description: Enforce non-breaking feature development and checkpoint gates across User, RR, Portfolio, and Planner modules
globs: **/*
---

# Feature Development Checkpoint & Preservation Rule

## Objective
Ensure that whenever new features or enhancements are requested, existing functionality is **never changed or broken** without explicit user acknowledgment and approval.

---

## 1. Module Specification Reference
Before proposing or writing code that impacts any of the following domains, the agent **MUST** inspect the relevant specification file:
- **User Module**: `docs/checkpoints/user-module.md`
- **RR (Royal Rentals) Module**: `docs/checkpoints/rr-module.md`
- **Portfolio Module**: `docs/checkpoints/portfolio-module.md`
- **Planner Module**: `docs/checkpoints/planner-module.md`

---

## 2. Mandatory Pre-Implementation Checkpoint Gate

Whenever the user submits a prompt to implement or modify functionality:

### Phase A: Impact Analysis & Classification
The agent must assess each planned code change and classify it into:
- 🟢 **Additive**: Creates new files, functions, components, or routes without altering existing contracts or behaviors.
- 🟡 **Behavioral Modification**: Changes existing component behavior, logic paths, default settings, or layout order.
- 🔴 **Breaking Change**: Modifies public function signatures, deletes/renames routes, alters data schemas, breaks test assertions, or changes auth restrictions.

### Phase B: Checkpoint Halt & User Query
- If **ANY** change is classified as **🟡 Behavioral Modification** or **🔴 Breaking Change**:
  1. The agent **MUST NOT** edit code immediately.
  2. The agent **MUST** trigger a checkpoint using the `ask_question` tool (or interactive prompt) asking the user:
     - State clearly which existing functionality would change.
     - Provide a recommended non-breaking/additive alternative (e.g. prompt update, feature flag, adapter).
     - Give the user two options:
       - **Option 1 (Recommended)**: Keep existing functionality intact and update the prompt/approach to be non-breaking.
       - **Option 2**: Approve changing the existing functionality to the new behavior.
  3. Wait for the user's decision before proceeding.

### Phase C: Plan Documentation
For multi-step or complex tasks, document the change in `docs/plans/` or update the module's checkpoint file with an Impact Table before implementing.
