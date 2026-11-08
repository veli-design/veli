# Protected preview site rehearsal (PD-1121)

This is a read-only smoke runner and an operator runbook, **not a deployment
workflow**. It neither creates preview infrastructure nor changes Cloudflare
configuration. Hosted execution remains blocked until the owner approves the
specific protected preview destinations and authentication test access. Do not
reuse production as a rehearsal target, enable `workers_dev` or `preview_urls`,
change domains, WFA or Access policies, or create credentials to bypass that blocker.

## Evidence and input requirements

Keep these artifacts outside the snapshot and outside production release receipts:

- An immutable, independently verified bundle and its recorded snapshot SHA-256.
  `verifySiteBundle` checks every file, locks and package identity before requests.
- The original producer's GitHub Actions run JSON, fetched from the repository API.
  Check the artifact belongs to that run and record its name/ID and download source
  separately. Set the expected repository explicitly (including any approved transfer),
  and copy the verified producer run, artifact ID/name and digest into `provenance`.
  The runner checks their consistency and labels the association operator-supplied;
  these fields are not independent cryptographic attestation. The runner validates producer policy; it cannot prove an arbitrary
  caller-supplied JSON file or digest came from GitHub. A recovery controller's HEAD
  may differ from the bundle source. Do not substitute HEAD for snapshot provenance.
- A target JSON (schema below) with the approved **separate** protected origins and
  independently recorded Worker version and deployment UUIDs for each application.
  These IDs are operator-supplied labels, not fetched or attested by the runner.
  Capture Cloudflare's actual version/deployment records before and after every leg.
- Read access for both origins. Supply only per-origin Access service headers or an
  approved Access cookie in memory. Do not put credentials in target files, evidence,
  shell history, screenshots, logs or source control. Do not create new access grants.

Example target shape (replace all placeholders with verified values):

```json
{
  "schema": 1,
  "environment": "protected-preview",
  "provenance": {
    "repository": "tradenetcorp/veli",
    "producerRun": 42471698178,
    "artifactId": 123,
    "artifactName": "REPLACE-WITH-VERIFIED-ARTIFACT-NAME",
    "snapshotSha256": "REPLACE-WITH-INDEPENDENT-DIGEST"
  },
  "web": {
    "origin": "https://approved-docs-preview.example.test",
    "workerName": "approved-docs-preview",
    "workerVersion": "00000000-0000-0000-0000-000000000000",
    "workerDeployment": "00000000-0000-0000-0000-000000000000"
  },
  "storybook": {
    "origin": "https://approved-stories-preview.example.test",
    "workerName": "approved-stories-preview",
    "workerVersion": "00000000-0000-0000-0000-000000000000",
    "workerDeployment": "00000000-0000-0000-0000-000000000000"
  }
}
```

The runner rejects the selected snapshot's canonical origins and all four known
current/historical Veli production origins guarded by `scripts/site-hosted-smoke.mjs`. This is an accident
check, not an authorization system: the operator must also exclude **all** current
and historical production aliases, and verify Access protection independently.
The runner does not inspect Access configuration. A local server must use `local-fixture` and
loopback origins; its evidence is never hosted rehearsal evidence.

## Run the read-only checks

Use Node 24 and the repository's Corepack pnpm. Provision the pinned browser with
`corepack pnpm exec node scripts/prepare-playground-browser.mjs /tmp/veli-smoke-browser`
if no prepared browser workspace exists. This does not build or alter the snapshot.

```sh
corepack pnpm exec node scripts/site-hosted-smoke.mjs \
  /absolute/snapshot SNAPSHOT_SHA256 /absolute/target.json \
  /absolute/original-producer.json /tmp/veli-smoke-browser \
  /absolute/rehearsal-evidence/candidate-first.json
```

An authorized caller may populate `VELI_SMOKE_ACCESS_JSON` through its secret
injection facility. Its structure is an object keyed by the **exact approved
origin**, containing only `CF-Access-Client-Id`, `CF-Access-Client-Secret`, or
`Cookie`. No CLI credential flags are provided. The programmatic
`smokeHostedBundle` API accepts the same `credentials` object in memory. Never
print this object. CLI failures intentionally omit raw network/browser exceptions.

The runner performs only GET requests, compares all public inventory file sizes
and SHA-256 hashes (including HTML, JS/CSS, fonts, docs/search catalogs and block
archives), follows only bounded same-origin redirects, and fails on login HTML,
missing files or stale content. `_headers` and `_redirects` are deployment inputs,
not fetchable assets. It opens a fresh browser context with service workers blocked,
blocks off-origin requests, WebSockets and non-GET methods, and applies access headers per
request without forwarding them across redirects. The native-fetch bridge has no cookie jar, strips response cookies and never copies browser cookies.
Unknown off-origin fonts/analytics fail closed. Existing optional
`fonts.googleapis.com` stylesheet requests are also blocked, but counted and recorded
without query strings rather than failing the smoke. No font-provider request is
sent. This validates bundled Inter with optional Google Fonts suppressed, **not**
full normal-network production rendering or external Dhivehi fonts.

Browser checks cover the landing page and its docs navigation, a Button MDX page and its section deep-link scroll, search from Input to Button and result
navigation, light/dark theme controls, local Inter font loading/application, Filter
Bar 0.1.1 when present in the selected catalog, and rendered Storybook Button
playground. The previous snapshot is allowed to lack Filter Bar. No source changes,
HMR probes, new snapshot capture or absent legacy `checks/*.json` files are needed.

The success file uses `kind: site-hosted-smoke` and records the environment,
snapshot digest/source, producer, canonical origins, target identities, inventory
hashes and browser results. It is written exclusively and only after all checks
pass. It must **never** be renamed to `delivery.json`, treated as a production
receipt, or used to claim a deploy occurred. Save failures separately, sanitized.

## Candidate → actual previous production → candidate

Deployment is a separate, explicitly approved operator action. Do not use this
runner or production deploy workflows to provision a preview environment.

1. Verify both downloaded bundles and producer/artifact provenance before starting.
   Save independent SHA-256 values and deployment records. Confirm the rollback
   bundle was actually deployed successfully, using its original production
   receipt/run and actual Worker deployment history, not merely a synthetic build.
2. Deploy the **unmodified candidate assets** to the approved protected preview
   Workers through the approved operator procedure. Keep original canonical URLs
   in the artifacts; do not rebuild or rewrite the bundle to preview URLs. Record
   actual preview Worker version/deployment IDs. Run the smoke command and save
   `candidate-first.json` with `environment: protected-preview`.
3. Deploy the **actual previous-production assets** to the same preview pair. Record
   the changed IDs. Run the smoke against that previous bundle's digest and its
   original producer, saving `previous-production.json`. Its historical canonical
   origins and absent Filter Bar are expected; hash verification must match that
   exact previous bundle. This leg is not a production rollback.
4. Reapply the identical candidate bundle, record new actual IDs, and save
   `candidate-restored.json`. Compare first/restored snapshot digests and inventory
   hashes; they must match. Confirm both origins correspond to the same leg and
   no production deployment or configuration changed.
5. Review the three successful hosted evidence files alongside independent Worker
   records. Retain the bundle digests and producer/artifact references together.
   A failed/partial leg, local fixture, or static-only check is not a successful
   hosted rollback rehearsal. Do not proceed to claim completion while blocked.
