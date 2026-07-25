# GitHub Pages Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the existing PWA from a public `niuroumian1/pelvic-core-training` repository to an HTTPS GitHub Pages project URL without changing its training behavior.

**Architecture:** Keep the app inside `pwa/` and add a root-level GitHub Actions workflow that installs, tests, builds, and uploads `pwa/dist`. Configure Vite, React Router, and the web app manifest from one deployment base path so assets, navigation fallback, icons, and the Service Worker all work below `/pelvic-core-training/`.

**Tech Stack:** React 18, TypeScript, Vite 6, vite-plugin-pwa, Vitest, GitHub Actions, GitHub Pages

## Global Constraints

- Preserve the existing training flow, state machine, animation, storage, vibration, and S23 behavior.
- The repository is public and contains no credentials, tokens, local logs, or personal training data.
- The deployed base path is exactly `/pelvic-core-training/`.
- GitHub Pages deployment must be produced from `pwa/` by GitHub Actions.
- A failed test or failed production build must prevent deployment.
- Application display metadata remains centralized in `pwa/src/config/appConfig.ts`.

---

### Task 1: Make the PWA project-path aware

**Files:**
- Modify: `pwa/vite.config.ts`
- Modify: `pwa/src/App.tsx`
- Create: `pwa/src/config/deployment.test.ts`

**Interfaces:**
- Consumes: Vite `BASE_URL` generated from the configured `base`.
- Produces: matching Vite asset paths, React Router basename, manifest `id`, `start_url`, and `scope`.

- [ ] **Step 1: Add a failing deployment contract test**

Create a test that loads the exported deployment base and asserts:

```ts
expect(deploymentBase).toBe('/pelvic-core-training/')
expect(toManifestPath('pelvic-core-training')).toBe('/pelvic-core-training/')
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm test -- --run src/config/deployment.test.ts`

Expected: FAIL because the deployment helpers do not exist.

- [ ] **Step 3: Add the deployment base and connect all path consumers**

Export a normalized `deploymentBase` from the Vite configuration source, set Vite `base`, use it for manifest `id`, `start_url`, and `scope`, and pass `import.meta.env.BASE_URL` to `BrowserRouter` as `basename`.

- [ ] **Step 4: Run the focused test and full suite**

Run: `npm test -- --run src/config/deployment.test.ts`

Expected: PASS.

Run: `npm test`

Expected: all existing and new tests PASS.

### Task 2: Add GitHub Pages continuous deployment

**Files:**
- Create: `.github/workflows/deploy-pages.yml`
- Modify: `.gitignore` only if generated output or local logs are not already excluded.

**Interfaces:**
- Consumes: repository `master` branch and `pwa/package-lock.json`.
- Produces: tested static artifact from `pwa/dist` and a GitHub Pages deployment.

- [ ] **Step 1: Inspect ignore rules and tracked files for publish safety**

Run: `git status --short && git ls-files`

Expected: no `.env`, tokens, npm logs, `node_modules`, local storage exports, or `dist` artifacts are tracked.

- [ ] **Step 2: Add the Pages workflow**

Use official GitHub actions with:

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

The build job checks out `master`, sets up Node with npm caching against `pwa/package-lock.json`, runs `npm ci`, `npm test`, and `npm run build` in `pwa/`, then uploads `pwa/dist`. The deploy job uses the `github-pages` environment and deploys only the uploaded artifact.

- [ ] **Step 3: Build locally and inspect generated paths**

Run: `npm run build`

Expected: PASS and `pwa/dist` contains `index.html`, the manifest, registered Service Worker files, and assets whose URLs are rooted at `/pelvic-core-training/`.

- [ ] **Step 4: Run the production preview smoke test**

Run: `npm run preview -- --host 127.0.0.1 --port 4173`

Expected: the locally built app responds; this confirms the artifact itself before GitHub rewrites the hosting origin.

### Task 3: Document, publish, and verify

**Files:**
- Modify: `docs/PROJECT_STATUS.md`
- Modify: `docs/PWA_S23_ACCEPTANCE.md`
- Modify: `pwa/README.md`

**Interfaces:**
- Consumes: passing local verification and the new public GitHub repository.
- Produces: repository URL, Pages URL, and a repeatable desktop/S23 acceptance checklist.

- [ ] **Step 1: Record deployment operation and acceptance steps**

Document the public source URL, expected Pages URL, automatic deployment behavior, and checks for install prompt, icon, standalone launch, online reload, and offline cold start.

- [ ] **Step 2: Run the final local quality gate**

Run: `npm test`

Expected: all tests PASS.

Run: `npm run build`

Expected: PASS with no TypeScript or Vite errors.

- [ ] **Step 3: Commit the reviewed deployment changes**

Stage only the plan, deployment configuration, workflow, tests, and documentation. Commit with:

```text
ci: deploy PWA to GitHub Pages
```

- [ ] **Step 4: Create and push the public repository**

Create `niuroumian1/pelvic-core-training`, add it as `origin`, and push `master`. Never place a GitHub token in a file, command transcript, or repository.

- [ ] **Step 5: Enable and observe GitHub Pages**

Set Pages source to GitHub Actions if required, wait for the workflow to complete, and open:

```text
https://niuroumian1.github.io/pelvic-core-training/
```

Expected: HTTP 200 over HTTPS and no asset, manifest, icon, or Service Worker 404s.

- [ ] **Step 6: Perform desktop and Samsung S23 acceptance**

On desktop and S23:

1. Open the HTTPS URL and complete one training session.
2. Install/add the PWA and confirm the configured icon and app name.
3. Launch from the home screen and confirm standalone display.
4. Reload once online, close the PWA, disable networking, then cold-launch it.
5. Confirm the shell opens offline and the previously stored training record remains.
