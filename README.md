# Cleantech Industry Resources — ClearSky-OMEGA Portal

Client deployment of the ClearSky-OMEGA EnergyOS portal for **Cleantech
Industry Resources (CIR)** ([cleantechir.com](https://cleantechir.com)).

CIR is a Burlington, Vermont development-and-engineering services firm — legal
entity Solar Industry Resources, LLC — that sells renewable project
*development-as-a-service*: site diligence, interconnection, permitting and
systems engineering, run on a 24-hour cycle across national portfolios. They
don't own the assets. They advance other people's projects and hand them back.

So this trial opens the three tools that map to the front of a development
engagement — find the site, read the grid around it, design what goes on it —
and deliberately leaves the ownership dashboard off.

---

## Trial account

| | |
|---|---|
| Account tier | **Trial** (`tierLevel: -1`) |
| Starts | **Tue Sep 1, 2026** |
| Length | **60 days** |
| Last full day | **Fri Oct 30, 2026** |
| Expires | **Sat Oct 31, 2026, 00:00** local |
| On expiry | Banner only — access continues (`lockOnExpiry: false`) |

The countdown banner moves through four states: blue before Sep 1, amber Sep 1
through Oct 23, red for the last seven days (Oct 24–30), grey from Oct 31.

Today is Aug 30, so the account ships in its **pre-start** state — the banner
will read "60 days left in your 60-day trial · starts Sep 1, 2026". That is
correct, not a bug: `notStarted` reports the full allotment rather than the
calendar distance to the end. **Sign-in is not blocked before the start date.**
If CIR is given the URL this week they can get in immediately and the clock
still won't begin until Sep 1. If that isn't what you want, don't hand over the
link until Monday — there is no config flag for "not yet open".

### Cutting access off at expiry

`lockOnExpiry: false` is deliberate: the trial lapsing shows a banner but does
**not** lock anyone out. To make expiry hard, set it to `true` in `config.js`:

```js
trial: { startsAt: '2026-09-01', days: 60, lockOnExpiry: true }
```

From Oct 31 every CIR sign-in is then refused with a message pointing at
`dev@clearsky-usa.com`. Domains in `adminDomains` keep access regardless.

### Extending the trial

Change `days`, or move `startsAt`. Both take effect on next page load — no
rebuild. To convert to a paid account, drop the `trial` block entirely and set
`accountTier: 'Enterprise'` with `tierLevel: 3`.

---

## What's in here

| File | Shared? | Notes |
|---|---|---|
| `index.html` | shared **+1 line** | Portal dashboard — carries the `omega-assets.js` script tag |
| `marketplace.html` | **shared** | App marketplace |
| `projects.html` | **shared** | Project list |
| `editor.html` | **shared** | BESS Site Map application — served same-origin |
| `omega-brand.js` | **shared** | Tenant resolution + branding |
| `omega-terms.js` | **shared** | Terms of Service gate |
| `omega-assets.js` | **shared** | Asset Owner Command Center — **present but disabled** |
| `firestore-terms.rules` | shared | Terms acceptance rule |
| `firestore-assets.rules` | shared | `financeOffers` rule |
| `firestore-capacity.rules` | shared — **NEW** | `capacityAllocations` rule for Site Finder |
| `config.js` | **tenant-specific** | The only file to edit |
| `cir-logo.png` | tenant asset | Topbar + sign-in mark (dark ink — see below) |
| `cir-logo-white.png` | tenant asset | Your original, for dark backgrounds |
| `omega-logo.png` | platform asset | ClearSky-OMEGA mark |

Byte-identical to the Walters repo, including `index.html`. Verify before you
cut the next one:

```
shasum index.html marketplace.html projects.html editor.html \
       omega-brand.js omega-terms.js omega-assets.js
```

### Why omega-assets.js ships even though it's off

`index.html` loads `/omega-assets.js` unconditionally. Omitting the file would
404 on every page load for no benefit. Shipping it and setting
`assets.enabled: false` keeps `index.html` byte-identical across tenants and
costs one no-op script. The module checks `enabled` before it mounts anything,
so nothing renders and nothing is read.

### Grid Atlas and Site Finder are not in this repo

Both resolve through `OMEGATools.hrefFor()` to
`https://tools.csebuilders.com` + their file, plus `?org=cleantechir.com`.
They live on the shared tool host and are updated there once for every tenant.
Only `editor.html` is same-origin (`action: 'new:bess'` opens the project modal,
which navigates to `/editor.html?id=…`), which is why it's the one application
file in the repo.

---

## ⚠ Before this goes live — read this section first

### 1. Confirm `sitefinder` is in the deployed catalog. This is the one that will bite.

`OMEGATools.hydrate()` does this:

```js
db.collection('tools').orderBy('sort').get().then(function (snap) {
  if (!snap.empty) { self._tools = list; }   // ← wholesale REPLACEMENT
});
```

If the Firestore `tools` collection is non-empty, it **replaces `SEED_TOOLS`
entirely** — it does not merge. `SEED_TOOLS` currently carries 40 tools
including `sitefinder`, which is new. If the `tools` collection was last
imported before `sitefinder` was added, then:

- Site Finder is absent from the marketplace grid,
- its pinned dashboard tile has nothing to render,
- and `config.js` looks wrong when it isn't.

Walters never hit this because both its tools are old. CIR's trial is built
around the newest tool in the registry, so this repo is the first one where a
stale `tools` collection is a launch blocker rather than a cosmetic gap.

**Check:** open the marketplace and count. Fewer than 40 tools, or no Site
Finder under *Interconnection & Grid* → run **Import / Update Applications** in
the admin console, then reload.

### 2. Deploy `firestore-capacity.rules`.

New file. Without it, Site Finder falls back to browser-local claims and shows
"Local only" in the corner chip. It does not error, it does not refuse — it
just silently stops sharing holds between reps, which is the only thing the
ledger exists to do. Full reasoning is in the file header.

Verify by signing in as two users in the same org and confirming a claim made
by one leaves the other's inventory.

### 3. Confirm Site Finder's dependencies are on the tool host.

Site Finder is dark until all of these sit beside `clearsky-sitefinder.html`
on `tools.csebuilders.com`:

```
omega-capacity-ledger.js    allocation math + shared claims
omega-listings-source.js    property providers
omega-comed-layers.js       hosting capacity / C&I / Illinois Shines
ci-industrial.js            C&I parcel bundle      (falls back to tools host)
ilshines-sites.js           Illinois Shines bundle (same fallback)
```

Per the current parcel-layer status, DuPage and Lake are built, McHenry is
unconfirmed and Cook is still failing. **Cook is the county a demo will reach
for first.** If it's still empty on Sep 1, drive the demo through DuPage or
Lake and say why, rather than letting them search Chicago and find nothing.

### 4. Authorize both domains in Firebase.

Console → Authentication → Settings → Authorized domains. Google sign-in fails
without this. The Firebase block in `config.js` is the live `clearsky-portal`
project — no placeholders — so this is the one step standing between upload and
a working sign-in.

### 5. Deploy the other two rules files.

`firestore-terms.rules` matters most: without it the terms gate fails closed and
**nobody can sign in, on any tenant**. `firestore-assets.rules` is inert for
this tenant (the block is disabled) but belongs in the merged file anyway.

### 6. Confirm `userOrg()` resolves both CIR domains to the same orgId.

Everything here is scoped to `orgId: 'cleantechir.com'`, but sign-ins may
arrive on `cleantechindustryresources.com`. If `userOrg()` derives the org from
the raw email domain rather than from the tenant config, a
`@cleantechindustryresources.com` user authenticates fine and then sees an
**empty workspace** — their reads are scoped to an org nobody wrote to. Check
this before the second domain is used in anger; it is the most likely way this
deployment fails in a way that looks like a data problem instead of a config
problem.

### 7. Seed or import their projects with `orgId: 'cleantechir.com'`.

Otherwise the portal authenticates fine and shows an empty pipeline.

### 8. Resolve `isConsoleViewer()` before this account carries real sites.

Two hardcoded domains currently get read access to every tenant's `/projects`
documents. CIR works national portfolios for named developers; their site list
is the commercially sensitive part of their business. This was already flagged
on the platform — it is more pointed here than it was for Walters.

---

## Access rules

Primary domain is `cleantechir.com`. **A second domain is open**, which is a
departure from the Walters repo and is deliberate:

| Domain | Who | Why open |
|---|---|---|
| `cleantechir.com` | CIR, short brand domain | primary; site footer and `connect@` |
| `cleantechindustryresources.com` | CIR, long-form domain | published as their inbound contact address; staff addresses appear on both |

Walters got one domain because its sister brands had no separate mail presence.
CIR is the opposite case — both domains are demonstrably in live use for staff
mail, and opening only the short one would refuse a real fraction of the trial
team with a message that reads like the portal is broken.

Both land in the **same** workspace: `orgId` is pinned to `cleantechir.com`
regardless of which address signs in, so there is no data split. See pre-launch
item 6 — the pinning has to hold in the Firestore rules too, not just here.

If the trial team turns out to sit entirely on one domain, drop the other. Their
legal entity, Solar Industry Resources LLC, has no observed mail domain of its
own; don't pre-open one.

`csebuilders.com` and `clearsky-usa.com` may preview and survive expiry.

To admit an individual outside address — a client-side engineer sitting in on a
session, say — add the address rather than opening their whole domain:

```js
allowedEmails: ['someone@example.com']
```

---

## Tools during the trial

The **entire catalog is visible**. Anything this account can't use renders with
an "Upgrade" badge and a mailto to `dev@clearsky-usa.com`.

Unlocked for CIR:

| Key | Tool | Category | Tier | Notes |
|---|---|---|---|---|
| `sitefinder` | Site Finder | interconnection | DELUXE (2) | pinned first |
| `gridatlas` | Grid Atlas | interconnection | ALL (0) | pinned |
| `editor` | BESS Site Map | design | STANDARD (1) | pinned |

All three are in `requiredTools` as well as `unlockedTools`, so all three tiles
are on "My Applications" the moment they sign in — required tools render before
any user pinning and can't be removed. The order is the intended walkthrough:
**find the site → read the grid → design the asset.**

### How the gate works

```
unlocked = requiredTools.has(key)
        || unlockedTools.has(key)
        || tierLevel >= (tool.tier ?? 1)
```

Tiers are `ALL=0`, `STANDARD=1`, `DELUXE=2`, `ENTERPRISE=3`. `tierLevel` is
**-1** so nothing passes on tier alone and access comes only from the two lists.

Note this catches `gridatlas` too. It is `TIER.ALL`, so on any tenant with
`tierLevel: 0` it would open for free — but -1 sits below zero, so it has to be
listed explicitly. **Deleting a key from `unlockedTools` locks the tool even if
it's still in `requiredTools`.** Keep the two lists in sync.

`tierLevel: 0` was the tempting shortcut here and is the wrong call: it would
also open `comedcap` (ComEd Capacity Finder), which is the *one-address lookup*
version of Site Finder. Having both on the dashboard invites the question of why
there are two ComEd tools, and the honest answer — that one is a downgrade of
the other — is not the note to end a demo on.

### ⚠ Site Finder is ComEd-only. CIR is national.

This is the commercial risk in this trial and it should be named in the kickoff
call, not discovered in week three.

Site Finder browses **northern Illinois** C&I property ranked by deliverable kW,
shaded from ComEd's published hosting-capacity map. It is territory-bound by
data, not by licence: outside ComEd there is no hosting-capacity layer to shade
against and the tool has nothing to rank.

CIR is headquartered in Vermont and its published work spans national
portfolios — 450+ sites for a Virginia developer, high-volume residential
through mega-scale single-site. **A CIR user's first instinct will be to search
their own footprint, and they will get an empty map.**

Two ways to play it, both fine, but pick one before the demo:

1. **Frame it as the ComEd pilot.** Site Finder is the worked example of what
   the platform does in a territory where the utility publishes capacity data.
   The pitch is the method, and ComEd is where it's live today. This is honest
   and it's the reason `gridatlas` — which is national — is pinned beside it.
2. **Lead with Grid Atlas and Editor**, and hold Site Finder back as the
   "here's what a fully-instrumented territory looks like" moment.

What *doesn't* work is putting a national services firm in front of an Illinois
map with no framing. Grid Atlas is the tool that actually covers their
footprint — substations, lines, plants, EIA data, nationwide — so it carries
the weight in every region CIR actually works, and Site Finder is the depth
demo.

**If this trial is meant to prove out a specific region for them, ask which one
now.** If it's ComEd territory, this repo is already right. If it's PJM or
ISO-NE — plausible for a Vermont firm — Site Finder is the wrong third tool and
`sitediscovery` (Site Discovery & Screening, ranks a pipeline the tenant
already assembled, no utility data dependency) is the better swap. That's a
two-line edit to `unlockedTools` and `requiredTools`.

### Natural next unlocks

`comedcap` if they stay in ComEd territory and want the one-address lookup;
`interconnect` (Interconnection Screener) and `intake` (Project Intake) if the
conversation moves toward CIR routing work into ClearSky. `proforma` is the
obvious ask if they start being asked for economics by their own clients.

---

## Note on the logo

Your file is a white wordmark on transparency, with the blue C|R block on the
left. **It would have been invisible in the portal.** The sign-in card is
`rgba(255,255,255,.96)` and the topbar chip is `#fff` — on both, everything
except the blue square would have vanished, and it would have looked like a
broken image rather than a colour problem.

So it ships twice:

- **`cir-logo.png`** — the wordmark recoloured to `#0F2733`, the portal's own
  body-text colour, so it sits at the same weight as the interface text beside
  it. The blue block and the white `C|R` inside it are untouched. Trimmed to
  content with 6px of transparent padding. Used for the topbar chip, the
  sign-in card, and `exportBrand` (proposals and PDFs are white paper too).
- **`cir-logo-white.png`** — your original, trimmed the same way. For dark
  backgrounds. Nothing currently points at it; it's there so the next dark
  surface doesn't need this work redone.

**Sizing.** The recoloured mark is 490×170 (2.88:1). The sign-in card renders
at a fixed 88px tall inside 420px of card, leaving ~324px usable — this lands
at 254px, comfortable. In the 22px topbar chip it's ~63px wide, well inside the
150px mobile clamp.

If CIR can supply a dark-text or SVG original, drop it in under the same
filename and nothing else changes.

`clientName` is **Cleantech Industry Resources** — the trading name, not the
legal entity (Solar Industry Resources, LLC). If a contract or a proposal export
needs the legal name, `exportBrand.name` is a one-line edit and is separate from
the on-screen `clientName` for exactly this reason.

---

## Why the Asset Owner Command Center is off

Walters got `omega-assets.js` because they sell the equipment today and want to
own or finance it tomorrow — offers received, assets on the books, portfolio
P&L, IRR.

CIR's business is the opposite shape. They are a services firm: they advance
projects for developers, builders, landowners and financiers, with transparent
cost and no change orders, and they hand the project over. There is no portfolio
on their balance sheet for the block to report on. Enabled, it would show four
permanently empty cards.

The sample data is worse than the empty state, not better: it's a Southern
California C&I storage portfolio built for a Southern California distributor. In
front of a Vermont firm running national portfolios it reads as a mistake — and
a services audience checks whose numbers those are first.

`assets.enabled: false`, `sampleData: false`. If CIR ever does start holding
assets, flip `enabled` and seed real projects — leave `sampleData` off.

The stock dashboard — site count, stage mix, storage quoted — is the pipeline
view, and pipeline is what CIR actually manages.

---

## Terms of Service gate

Unchanged from every other tenant. New accounts must accept before the portal
renders: a consent checkbox on the sign-up form, plus the real enforcement — a
gate that runs after authentication and before the app renders, because a
checkbox would miss Google sign-in entirely and would miss version bumps.

Acceptance is recorded at `termsAcceptances/{uid}` with uid, email, orgId,
version and a server timestamp. Bump `TERMS_VERSION` in `omega-terms.js` to
re-prompt everyone.

### ⚠ Deploy the rules

```
firebase deploy --only firestore:rules
```

Until `termsAcceptances` is live in Firebase the acceptance write returns
permission-denied and the gate **fails closed — nobody can sign in, on any
tenant**. Confirm `termsAcceptances`, `financeOffers` and `capacityAllocations`
all appear in Firebase Console → Firestore → Rules before calling it done.

### Not legal advice

The terms are a standard SaaS starting point covering platform IP, licence
scope, use restrictions, customer data ownership, confidentiality, trial terms,
and an engineering-output disclaimer stating that generated site plans,
one-lines and pro formas are estimates rather than sealed engineering
documents. **Have a lawyer review before relying on any of it.** Two
placeholders are marked REVIEW in the file: governing law and venue (currently
Iowa) and the formal notice address (currently `dev@clearsky-usa.com`).

That disclaimer deserves a second look for this tenant specifically. CIR sells
**systems engineering** as its product and stamps deliverables for clients. A
services firm handing a ClearSky-generated one-line to its own customer is a
sublicensing question the current terms don't clearly address, and the
engineering-output disclaimer protects ClearSky without saying anything about
what CIR may redistribute. Worth asking the lawyer about before the trial
converts.

---

## Open questions for you

1. **Which territory is this trial really about?** The single most consequential
   answer. If it's ComEd, ship as-is. If it's ISO-NE or PJM, swap `sitefinder`
   for `sitediscovery` before Sep 1. Everything in the tools section above hangs
   on this.
2. **Who is the trial sponsor?** `supportEmail` points at the public
   `connect@cleantechir.com`, which is a slow route even over 60 days.
3. **Whose sites go in?** CIR's own prospecting, or their clients'? If it's
   client work, one orgId for all of CIR means every client's pipeline sits in
   one workspace, visible to every CIR user. That's probably fine internally and
   probably not fine contractually. Ask before they import.
4. **Is 60 days plus no expiry lock what you meant?** With `lockOnExpiry: false`
   the account keeps working from Oct 31 with a grey banner. Combined with the
   pre-start access noted above, the practical window is "now until you turn it
   off". Fine if intended.
