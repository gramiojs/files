# @gramio/files

## Build & Test Commands

- **Build**: `bunx pkgroll`
- **Test**: `bun test`
- **Regenerate `media-methods-helper.ts`**: `bun run generate` (reads `./tg-bot-api/public/dev/custom.min.json`)
- **Type-check**: `bunx tsc --noEmit`
- **Lint/format**: `bunx @biomejs/biome check ./src` (or `bun lint:fix` to apply)

## Release process

Publishing is automated via the `publish.yml` GitHub Actions workflow — there is no local `npm publish` step. Trigger and monitor it with `gh`:

```bash
# 1. bump package.json version, commit, push to origin/main
git push origin main

# 2. kick off the workflow (workflow_dispatch)
gh workflow run publish.yml --repo gramiojs/files --ref main

# 3. find the run id and watch it until it exits
gh run list --repo gramiojs/files --workflow=publish.yml --limit 1
gh run watch <run-id> --repo gramiojs/files --exit-status

# on failure, pull the error lines only (don't dump the full log)
gh run view <run-id> --repo gramiojs/files --log-failed | grep "error TS"

# confirm the new version landed on npm
curl -s https://registry.npmjs.org/@gramio/files/latest | jq -r .version
```

The workflow runs `tsc --noEmit`, then `bun jsr` (preparation step), then publishes to JSR (`bunx jsr publish --allow-dirty`) and npm (`bun publish --access public`), and finally creates a GitHub Release tagged `v${version}` whose body comes from `scripts/generate-changelog.ts`. `prepublishOnly` runs `bun test && bunx pkgroll` locally if someone bypasses the workflow.

## Testing

Every new feature or bug fix must be covered by tests in `test/`. Run `bun test` to verify before finishing. Tests run against the published `@gramio/types` schema, so when bumping types the snapshots in `extract-files-to-form-data.test.ts` and `utils.test.ts` may need updating.

## Code Style

- Formatter: Biome with **tab** indentation, **double quotes**
- Strict TypeScript (`strict: true`)
- ESModule output (`type: "module"`); use `.js` extensions in imports (source files import `./utils.js` etc.)
- Dual publish: pkgroll emits both ESM (`dist/index.js`) and CJS (`dist/index.cjs`) with matching `.d.ts` / `.d.cts`

## Architecture

```
@gramio/types schema (custom.min.json)
        ↓
  scripts/generate.ts — walks every method's arguments tree
      ├─ findInputFileInArguments() recurses through reference / any_of / array
      ├─ flags fields where reference === "InputFile" OR (type === "string" && name === "media")
      └─ deduplicates by field name, tags each with type: "array" | "union" and parent property
        ↓
  src/media-methods-helper.ts (generated, @codegenerated marker)
      └─ MEDIA_METHODS: per-method [predicate, Extractor[] | null]
            • predicate: runtime check `isBlob(params.x)` for each upload field
            • extractor list: null when files live at top level, otherwise where to find them
        ↓
  src/utils.ts — runtime consumers
      ├─ isMediaUpload(method, params) → boolean (uses predicate)
      ├─ convertJsonToFormData(method, params) → FormData (mutates params)
      └─ extractFilesToFormData(method, params) → [FormData | undefined, params]
```

### Public surface (`src/index.ts`)

| Export | Source | Purpose |
|---|---|---|
| `MediaUpload` | `media-upload.ts` | Static factories that turn `path` / `stream` / `buffer` / `url` / `text` into `File` |
| `MediaInput` | `media-input.ts` | Static factories for `TelegramInputMedia*` payloads (`photo`, `video`, `audio`, `document`, `animation`) |
| `isBlob`, `MEDIA_METHODS` | `media-methods-helper.ts` | Generated lookup + Blob/Promise guard |
| `isMediaUpload`, `convertJsonToFormData`, `extractFilesToFormData`, `convertStreamToBuffer` | `utils.ts` | Runtime helpers used by transports |

### Key Modules

- `src/media-upload.ts` — `File` constructors. All paths normalize to `new File([new Uint8Array(...)], name)` so Bun/Node/Deno agree on the bytes (see commit d5e730a — raw `Buffer` was breaking Bun's `File` constructor).
- `src/media-input.ts` — Thin typed wrappers around `TelegramInputMedia*`. Each just spreads `{ type, media, ...options }`.
- `src/media-methods-helper.ts` — **Generated**. Do not hand-edit; rerun `bun run generate` after a Telegram Bot API or `@gramio/types` bump.
- `src/utils.ts` — `convertJsonToFormData` mutates `params` in place to rewrite nested `InputFile` references as `attach://file-N`; `extractFilesToFormData` returns `[undefined, params]` when no files were found so callers can fall back to JSON. Both `await` `Promise<File>` for back-compat (`isBlob` warns once that this path is deprecated).
- `scripts/generate.ts` — Codegen entry. Expects `./tg-bot-api/public/dev/custom.min.json` to exist next to the package; that file is produced by `@gramio/schema-parser`.

### Extractor shape

```ts
type Extractor = { name: string; type: "array" | "union"; property: string };
```

- `type: "array"` — field is an array of objects each potentially containing a file (e.g. `sendMediaGroup.media[].media`). Iterate, swap each entry's file with `attach://file-N`.
- `type: "union"` — field is a nested object that *may* contain a file under one of its variants (e.g. `editMessageMedia.media.media`). Check `name in params[property]` before reading.
- `null` extractor list (second tuple slot) — file lives at top level (`sendPhoto.photo`, `setWebhook.certificate`); no rewriting is needed, the field is appended directly to `FormData`.

### `Promise<File>` deprecation

`MediaUpload.path`, `.stream`, `.url` return `Promise<File>`. Passing the unawaited promise into a method param still works — `isBlob` and the extractors `await` it — but `isBlob` logs a one-time warning. New code should `await` at the call site.
