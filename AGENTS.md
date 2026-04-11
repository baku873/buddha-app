# AGENTS.md
# AI Agent Configuration for Full-Stack & Mobile Engineering

> This file defines how Claude Opus and Gemini operate across your engineering stack.
> Place this file at the root of your monorepo or per-project root.

---

## Agent Roster

| Agent | Model | Primary Role |
|-------|-------|-------------|
| `opus` | Claude Opus 4 (`claude-opus-4-6`) | Architect, system design, complex reasoning, code review |
| `gemini` | Gemini 2.5 Pro | Frontend generation, Android/Kotlin, multimodal, rapid scaffolding |

---

## Agent Capabilities & Specialization

### Opus — The Architect
Claude Opus handles tasks that require deep reasoning, multi-step planning, and precision.

**Full-Stack Strengths:**
- System architecture decisions (database schema, API design, microservice boundaries)
- Complex backend logic: auth flows, payment processing, multi-tenant isolation
- Security review: identifying injection vectors, race conditions, privilege escalation
- Writing and refactoring business-critical code in TypeScript, Python, Go, Rust
- Debugging hard production issues (memory leaks, deadlocks, data races)
- Writing comprehensive tests: unit, integration, contract, e2e specs
- Code review with reasoning — explains *why*, not just *what*
- Database query optimization, index strategy, migration planning
- API contract design (REST, GraphQL, gRPC, tRPC)
- CI/CD pipeline design and Dockerfile optimization

**Mobile Strengths:**
- Swift/SwiftUI architecture (TCA, MVVM+Coordinator, Clean Architecture)
- React Native architecture decisions and bridge optimization
- Performance profiling guidance and memory management
- App store review strategy and rejection avoidance
- Deep linking, push notification architecture, background task handling
- Offline-first sync logic and conflict resolution

---

### Gemini — The Builder
Gemini handles high-velocity generation, visual reasoning, and Android-native work.

**Full-Stack Strengths:**
- Rapid UI scaffolding: React, Vue, Next.js, SvelteKit components
- Multimodal input: screenshot → working code, Figma image → component
- Boilerplate generation at scale (routes, controllers, models, migrations)
- Documentation generation from codebases
- OpenAPI spec generation and mock server setup
- Frontend state management (Zustand, Redux, Jotai, TanStack Query)
- Tailwind/CSS layout from design references

**Mobile Strengths:**
- Android/Kotlin/Jetpack Compose (native specialty)
- Cross-platform Flutter/Dart generation
- Converting designs or screenshots into native UI code
- Gradle build configuration, dependency management
- Material Design 3 implementation
- Android-specific: WorkManager, Room, DataStore, Hilt

---

## Task Routing Rules

When an agent receives a task, it should self-route or be explicitly assigned using the syntax:

```
@opus   → architecture, security, complex bugs, critical logic, reviews
@gemini → UI generation, Android native, multimodal, scaffolding, docs
```

### Decision Matrix

| Task Type | Route To | Reason |
|-----------|----------|--------|
| Design a new microservice | `@opus` | Requires system-level reasoning |
| Generate CRUD endpoints for a resource | `@gemini` | Repetitive, high-volume generation |
| Review PR for security issues | `@opus` | Deep reasoning required |
| Convert Figma screenshot to React component | `@gemini` | Multimodal strength |
| Architect mobile offline sync | `@opus` | Complex conflict resolution logic |
| Scaffold Jetpack Compose screen | `@gemini` | Android native specialty |
| Write a complex SQL query | `@opus` | Multi-step reasoning |
| Generate TypeScript types from JSON | `@gemini` | Pattern matching, fast generation |
| Debug a production memory leak | `@opus` | Root cause analysis |
| Set up CI/CD YAML | `@gemini` | Template-based generation |
| Write auth middleware | `@opus` | Security-critical |
| Generate test fixtures / mocks | `@gemini` | High volume, low risk |

---

## Workflow Patterns

### Pattern 1: Architect → Build (Standard Feature)
```
1. @opus   → Define architecture, data model, API contract
2. @gemini → Scaffold boilerplate from the contract
3. @opus   → Implement critical business logic
4. @gemini → Generate tests structure and mocks
5. @opus   → Review, harden, finalize
```

### Pattern 2: Visual → Code (Design-to-Implementation)
```
1. Attach screenshot/Figma export
2. @gemini → Generate component from image
3. @opus   → Review component, add accessibility, connect to state/API
```

### Pattern 3: Bug Investigation
```
1. @opus   → Analyze logs, stack traces, reproduce hypothesis
2. @opus   → Write the fix with explanation
3. @gemini → Generate regression tests for the fix
```

### Pattern 4: Mobile Feature (Cross-Platform)
```
1. @opus   → Define shared domain logic and data layer
2. @gemini → Generate Jetpack Compose (Android) implementation
3. @opus   → Implement SwiftUI (iOS) with architectural consistency
4. @gemini → Generate React Native bridge or shared component if needed
```

### Pattern 5: API-First Development
```
1. @opus   → Design OpenAPI / GraphQL schema
2. @gemini → Generate server stubs, client SDKs, mock server
3. @opus   → Implement handlers with validation and error handling
4. @gemini → Generate API documentation and Postman collection
```

---

## Coding Standards Agents Must Follow

### Universal
- All code must be typed (TypeScript strict mode, typed Python, Swift non-optional where possible)
- No hardcoded secrets — use environment variables or secret managers
- Every public function must have a JSDoc/docstring with `@param`, `@returns`, `@throws`
- Errors must be explicit — no silent catches, no swallowed exceptions
- Follow the existing naming conventions in the file before inventing new ones

### Full-Stack
- **API responses** must follow the project's envelope format: `{ data, error, meta }`
- **Database** changes require a migration file — never mutate schema directly
- **Auth** — always check permissions at the service layer, not just the route layer
- **Logging** — structured JSON logs with `level`, `message`, `trace_id`, `user_id`
- **Rate limiting** — all public endpoints must be rate-limited
- **Environment** — code must work across `development`, `staging`, `production`

### Mobile
- No UI logic in ViewModels / Presenters — pure state transformation only
- All network calls must handle offline state gracefully
- Accessibility: every interactive element needs a content description / accessibility label
- No synchronous operations on the main thread (network, disk I/O)
- Deep links must be handled defensively — treat all external input as untrusted

---

## Context Each Agent Receives Per Task

Agents must always be given the following context block at the top of every session:

```
PROJECT: <name>
STACK: <e.g. Next.js 15, Supabase, React Native, Swift 6>
PLATFORM: <web | ios | android | cross-platform>
CURRENT TASK: <one-line description>
RELATED FILES: <list paths>
CONSTRAINTS: <e.g. cannot break existing API contract, must stay under 200ms>
```

---

## Prohibited Behaviors

Both agents must NEVER:

- Delete or overwrite files without explicit instruction
- Add new dependencies without listing them and asking for approval
- Change public API contracts without flagging it as a breaking change
- Write code that only works locally (hardcoded localhost, absolute paths)
- Use `any` type in TypeScript without a `// TODO: type this properly` comment
- Generate placeholder logic like `// implement later` in production code paths
- Commit secrets, tokens, or passwords — even in comments
- Skip error handling with the justification "this won't fail"

---

## Mobile-Specific Agent Instructions

### iOS (Opus)
- Default to SwiftUI unless the task explicitly requires UIKit
- Use `async/await` over completion handlers
- Use `@MainActor` for all UI state mutations
- Prefer value types (`struct`) over reference types (`class`) unless identity matters
- Use `Sendable` conformance where concurrency is involved

### Android (Gemini)
- Default to Jetpack Compose; use Views only for legacy maintenance
- Use Kotlin coroutines + Flow — no RxJava in new code
- Follow single-activity architecture with Navigation Compose
- Use Hilt for dependency injection
- Use `StateFlow` for UI state, `SharedFlow` for one-time events

### React Native (Both)
- Opus handles business logic, native module architecture, and performance
- Gemini handles JSX component generation and styling
- New Arch (Fabric + TurboModules) by default — old arch only if specified
- Use `react-native-reanimated` for animations, never `Animated` API for complex cases

---

## Handoff Protocol Between Agents

When Opus designs and Gemini implements (or vice versa), the handoff artifact must include:

```markdown
## Handoff: <feature name>

**From:** @opus | @gemini
**To:** @opus | @gemini

### What was decided
<decisions made, with reasoning>

### Contract
<API shape, component props, function signature — exact types>

### Assumptions made
<list — the receiving agent must validate these>

### Out of scope for this handoff
<explicitly list what is NOT being handed off>

### Files to create / modify
- `path/to/file.ts` — <what to do>
```

---

## Performance Benchmarks Agents Must Target

| Metric | Target | Agent Responsible |
|--------|--------|-------------------|
| API response (p95) | < 200ms | Opus |
| Frontend LCP | < 2.5s | Gemini |
| Mobile app cold start | < 1s (iOS), < 1.5s (Android) | Opus (iOS), Gemini (Android) |
| Bundle size increase per PR | < 10KB gzipped | Gemini |
| Test coverage on new code | > 80% | Both |
| Lighthouse score | > 90 | Gemini |

---

## Example Prompts That Unlock Full Potential

### For Opus
```
@opus You are a senior staff engineer. Review this authentication middleware
for security vulnerabilities. Think step by step. Consider: injection attacks,
timing attacks, token leakage, privilege escalation. Output: findings ranked
by severity with fix recommendations and code samples.
```

```
@opus Design the data model and sync architecture for offline-first note
syncing. Users can edit on multiple devices simultaneously. Handle conflicts.
Output: ER diagram in text, sync algorithm pseudocode, edge case analysis.
```

### For Gemini
```
@gemini [attach screenshot] Convert this design to a Jetpack Compose screen.
Use Material 3. Extract all hardcoded strings to a strings resource.
Make it match pixel-perfect.
```

```
@gemini Generate a complete Next.js API route for POST /api/users with:
Zod validation, Prisma ORM, error handling, rate limiting via upstash,
and a corresponding unit test using vitest.
```

---

## Changelog
- v1.0 — Initial AGENTS.md for full-stack + mobile with Opus and Gemini