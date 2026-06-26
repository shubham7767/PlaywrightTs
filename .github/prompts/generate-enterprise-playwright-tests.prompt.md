---
name: "Generate Enterprise Playwright Tests"
description: "Generate enterprise-style Playwright test cases for AEAutomation using the repo's fixtures, page objects, environment config, and data-driven patterns."
agent: "enterprise-playwright-test-generator"
model: "GPT-5 (copilot)"
argument-hint: "Paste feature details, ACs, auth requirement, inputs, and desired output file."
---
Generate or propose enterprise-style Playwright coverage for AEAutomation.

Use the repository patterns from [fixtures/base.fixture.ts](../fixtures/base.fixture.ts), [fixtures/auth.fixture.ts](../fixtures/auth.fixture.ts), [tests/login.spec.ts](../tests/login.spec.ts), and [playwright.config.ts](../playwright.config.ts).

Input to interpret:
- Feature or user story
- Preconditions and auth requirement
- Acceptance criteria
- Positive, negative, and edge scenarios
- Test data variants
- Target spec or page-object files if already known

Expected behavior:
- Reuse existing fixtures and page objects wherever possible
- Add page-object methods before placing complex selectors in specs
- Prefer parameterized and data-driven cases for repeated scenario families
- Keep tests deterministic with `beforeAll` and `beforeEach` where appropriate
- Respect env-driven `baseURL` and the current reporting setup

If enough detail is provided, implement the tests directly.
If details are incomplete, first return a concise enterprise test matrix, then scaffold the safest partial implementation.