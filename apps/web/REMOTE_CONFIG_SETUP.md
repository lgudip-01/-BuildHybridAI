# Analysis Remote Config

Current policy: `clause-analysis-v2` (November 20). The v1 generic risk-topic
checklist is retired. Published/cached v1 payloads use current application
default prompts; independently read remote false flags still disable analysis
or device fallback. The client reports source defaults in that case. It must
not claim v2 remote verification until a v2 payload is actually published and
activated. This correction updates local templates only; it does not publish
server settings. Earlier remote verification applies to the older v1 payload.

## Publish in Firebase Console

1. Open clause-guard-hackathon → Run → Remote Config (use Console search if needed).
2. Add the following three parameters. If Remote Config already contains other
   parameters, keep them; add these rather than replacing the whole template.
3. For cg_analysis_config choose String. Open analysis.remote-defaults.json in
   this folder and copy the entire file contents (including its outer braces)
   into the default value. The file is ready to paste; no unescaping is needed.
4. For cg_analysis_enabled and cg_device_fallback_enabled choose Boolean and
   set their default values to true.
5. Publish changes. Reload the development app to load a fresh configuration.

| Key | Type | Default |
| --- | --- | --- |
| cg_analysis_config | String containing JSON | Version/model/cloudPrompt/devicePrompt in remoteconfig.template.json |
| cg_analysis_enabled | Boolean | true |
| cg_device_fallback_enabled | Boolean | true |

The template is a catalog for web/Android/iOS teammates. Remote Config values
are client-readable. Never place API secrets, debug tokens, contract text,
questions, replacement maps, or user data in these parameters.

## Behavior

The web loader runs only after runtime approval passes. It initializes the SDK,
reads previously activated values, and attempts fetch/activate with a 1.5-second
SDK timeout and a 2.5-second overall wait. Unsupported browsers and initialization
failures use local defaults. Offline fetch failures retain activated cached
values when available. One immutable snapshot is used for a complete batch and
one load is performed per app/page. Background work finishing after the deadline
can populate SDK cache but cannot mutate the batch snapshot already returned.
The SDK minimum fetch interval is one hour; new published changes are not promised
to arrive instantly. The disabled flag is a best-effort client control, not an
immediate server-side quota/security switch.

A config payload must have exactly version, model, cloudPrompt and devicePrompt.
The version must match the application's ANALYSIS_VERSION. Model identifiers
must equal the currently verified gemini-3.5-flash-lite; other model choices
require a fresh no-cost pricing/account review. Prompts must contain 20–12000 characters. Invalid payloads use local
settings. An explicit false feature flag remains false even if the payload is
invalid. Unknown/malformed flag strings use enabled local defaults.

The application appends fixed output-format instructions to modified prompts.
Response schema, approval, leak-checking, placeholder validation, and raw-text
ONLY_ON_DEVICE inference remain application-owned. Remote settings never disable
those protections. Disabling device fallback chooses ONLY_IN_CLOUD for masked
analysis. Chat remains unimplemented and has no Remote Config enable switch.

## Verify

```sh
npm run test:analysis --workspace @clause-guard/web
npm run build --workspace @clause-guard/web
```

Automated tests cover payload rejection, disabled flags with invalid payloads,
fixed output rules, unsupported browsers, offline cache, request deduplication,
and a hanging initialization deadline. Analyzer unit tests use the default config
snapshot; real engine integration also mocks configuration transport, never the
engine identity registry. The development-only check below verifies activated Console values without
waiting for approval.ts; genuine engine analysis still needs separate checking.

After the engine lands, check an approved synthetic batch with each flag state:
analysis disabled must make no model call; fallback disabled must use cloud only;
remasking during config loading must reject before generation. Record those
results without dumping App Check tokens or real contract content. Native bridges
should parse the same versioned payload and retain the same hardcoded privacy
rules; native Remote Config integration is a separate teammate task.

## Verify published values without the engine

Use a checkout containing PR #10's latest files. This does not update an older
ZIP download automatically. From the repository root run:

```sh
npm run dev --workspace @clause-guard/web
```

Open the displayed localhost URL in Chrome, then open DevTools → Console.
Paste this whole block once:

```js
var configCheck = await import('/src/remoteConfigSmokeTest.ts');
console.log(await configCheck.runRemoteConfigSmokeTest());
```

Expected status: REMOTE_CONFIG_VALUES_VERIFIED, with all three parameterSources
set to remote, the configured model/version, and both flags true for the initial
setup. This check reads configuration only: no AI inference or contract text.
Do not share the separate App Check debug-token line the SDK may print.

The result includes lastFetchStatus and lastSuccessfulFetchAt. A remote value
may be previously activated/cached; a pass does not prove the newest Console
publication was fetched. The normal one-hour SDK fetch interval applies. If
values are missing or invalid, the check fails instead of calling local defaults
a successful verification. Reload before checking again; the loader uses one
snapshot per page. This check does not test App Check enforcement, model
availability, offline inference, or engine approval. Those checks remain separate.
