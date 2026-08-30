# Cleantech Industry Resources — ClearSky-OMEGA Portal

Client deployment of the ClearSky-OMEGA EnergyOS portal for **Cleantech
Industry Resources (CIR)** ([cleantechir.com](https://cleantechir.com)).

CIR is a Burlington, Vermont development-and-engineering services firm — legal
entity Solar Industry Resources, LLC — that sells renewable project
*development-as-a-service*: siting and diligence, systems engineering,
interconnection, permitting, estimating and construction management, run on a
24-hour cycle across national portfolios. They don't own the assets. They
advance other people's projects and hand them back.

That shape is what this deployment is built around. The stock portal tracks
sites a tenant is developing **for itself**. CIR needs the opposite: a book of
work referred in **by its customers**, moving through defined service lines,
with the editor at the end of it.

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

Banner states: blue before Sep 1, amber Sep 1–Oct 23, red for the last seven
days (Oct 24–30), grey from Oct 31.

Today is Aug 30, so the account ships **pre-start**: the banner reads "60 days
left in your 60-day trial · starts Sep 1, 2026". That's correct, not a bug —
`notStarted` reports the full allotment rather than the calendar distance to
the end. **Sign-in is not blocked before the start date.** Hand over the URL
this week and they can get in immediately with the clock still not running.
There is no config flag for "not yet open"; if that matters, don't send the
link until Monday.

### Cutting access off at expiry

```js
trial: { startsAt: '2026-09-01', days: 60, lockOnExpiry: true }
```

From Oct 31 every CIR sign-in is then refused, pointing at
`dev@clearsky-usa.com`. `adminDomains` keep access regardless.

To convert to paid: drop the `trial` block, set `accountTier: 'Enterprise'`
and `tierLevel: 3`.

---

## What's in here

| File | Shared? | Notes |
|---|---|---|
| `index.html` | shared **+3 additions** | Portal dashboard — SSO handoff + delivery script |
| `marketplace.html` | **shared** | App marketplace |
| `projects.html` | **shared** | Project list |
| `editor.html` | **shared** | BESS Site Map — served same-origin |
| `omega-brand.js` | **shared** | Tenant resolution + branding |
| `omega-terms.js` | **shared** | Terms of Service gate |
| `omega-assets.js` | **shared** | Asset Owner Command Center — present, **disabled** |
| `omega-delivery.js` | **shared — NEW** | Service Delivery Console (model + dashboard block) |
| `intake.html` | **shared — NEW** | Log a referral |
| `queue.html` | **shared — NEW** | The service queue |
| `firestore-terms.rules` | shared | Terms acceptance |
| `firestore-assets.rules` | shared | `financeOffers` |
| `firestore-capacity.rules` | shared | `capacityAllocations` — Site Finder |
| `firestore-delivery.rules` | shared — **NEW** | `referrals` — the delivery console |
| `storage.rules` | shared — **NEW** | Referral attachments — **separate deploy** |
| `check-delivery.js` | dev tool | Validates the module without a browser |
| `config.js` | **tenant-specific** | The only file to edit |
| `cir-logo.png` | tenant asset | Topbar + sign-in (dark ink — see below) |
| `cir-logo-white.png` | tenant asset | Your original, for dark backgrounds |
| `omega-logo.png` | platform asset | ClearSky-OMEGA mark |

### The New Project modal — multi-select project type

The `index.html` you sent still carried the **old single dropdown** (`BESS –
Battery Energy Storage System / DCFC / Solar + Storage / Other`), so CIR was
opening the editor from a different modal than the live Walters deployment.
Your live Walters is ahead of the file. The grid is rebuilt here to match it:

| Key | Card | Sub |
|---|---|---|
| `der` | DER / Solar | PV, wind, generation on site |
| `bess` | Storage / BESS | Batteries, PCS, EMS |
| `compute` | Data centre / Compute | Compute blocks, load profile |
| `dcfc` | DCFC | 480V 3Ø fast charging |
| `l2` | Level 2 EV | 240V 1Ø off an existing service |
| `microgrid` | Microgrid | Islanding, transfer, critical loads |

Plus the "Opens with …" line, now assembled from the selection rather than
hardcoded — tick three and it reads *"Opens with solar & DER layout, BESS
build + sizer and DC fast-charging layout."*

**Two fields are written, and they are not interchangeable.**

`type` — **one** legacy string, derived not asked for. Every existing project
has it, and the dashboard's *Projects by Type* doughnut still rolls up on it.
`npPrimaryType()` takes the first selected scope in card order, so a
solar+storage+charging site reads `'solar'` — the same answer the old dropdown
would have given for the same site, which is what keeps historical charts
comparable. DER/Solar deliberately collapses to `'solar'` rather than `'der'`
for the same reason.

`siteScopes` — the **full array** of what the site contains.

**`siteScopes`, not `scopes`.** `scopes` on a project document already means
the *deliverables* requested — that's what `ops-data.js` writes on the ops
console, and what `omega-delivery.js` writes on the referral handoff. Site
hardware and requested packages are two vocabularies, and sharing a field
would have made every screening panel read a battery as a requested package.
Different meaning, different field. The referral→editor handoff now writes
both, mapping referral technology onto site scopes (`hybrid` → `['der','bess']`
and so on), so a job pushed from the queue opens the same way as one created
by hand.

**Also patched:** the doughnut's colour map had entries for `bess`, `dcfc`,
`solar` and `other` only. `compute`, `l2` and `microgrid` would all have
fallen through to the grey fallback — three identical slices with three
different labels. Colours added.

A sandbox seeds **nothing** selected, on purpose: a sandbox is deliberately
undecided, and the line asks rather than assuming a battery. Create is blocked
until at least one is picked.

### index.html has forked by four additions

All four are tenant-neutral and belong upstream. Until they're copied to the
shared source and back down, this repo differs from the `index.html` you sent
by exactly these:

```html
<script>…SSO veil guard…</script>          <!-- head, immediately before omega-sso.js -->
<script src="/omega-delivery.js"></script> <!-- beside omega-assets.js -->
```

plus the multi-select Project Type grid (markup, CSS and the modal JS), and
the extra entries in the `TC` colour map.

`<script type="module" src="/omega-sso.js">` was **already** in the file you
sent — served from this origin, first in `<head>`, as the comment there
requires. I've followed that rather than the gateway-hosted copy, and
`omega-sso.js` ships in this repo.

Everything else is byte-identical to the files you sent:

```
shasum marketplace.html projects.html editor.html omega-brand.js omega-terms.js omega-assets.js omega-sso.js
```

### Grid Atlas and Site Finder are not in this repo

Both resolve through `OMEGATools.hrefFor()` to `https://tools.csebuilders.com`
+ their file, plus `?org=cleantechir.com`. Only `editor.html` is same-origin,
because `action: 'new:bess'` opens the project modal, which navigates to
`/editor.html?id=…`.

---

## The Service Delivery Console

This is what makes the account CIR-shaped. `omega-delivery.js` adds a block
directly under My Applications, and two pages hang off it.

### The three pieces

**Dashboard block** — open jobs, awaiting reply, median first response, late,
in production, delivered. Then open work **by service line**, the pipeline,
and the top of the queue.

**`/intake.html`** — log a referral by hand. Customer, contact, project,
technology, site, capacity, service lines, priority, due date, files, notes.
Only the project name is required: a referral with a name and nothing else is
still a referral, and blocking on detail nobody has yet is how work goes
unlogged. Customer names autocomplete from the existing queue so the same
customer doesn't end up spelled three ways across a quarter.

**`/queue.html`** — the queue, filtered by service line. Change status, and
push a referral into the editor.

### ⚠ This is NOT the Omega project intake

Deliberately, and it is the thing most worth understanding about this repo.

`intake_projects` is **ClearSky's** delivery queue: the ops console reads it,
your staff are measured on its SLA, and it carries commission, quoting and
assignment. Records there are work ClearSky owes somebody a reply on.

CIR's referrals go to a **separate collection** — `delivery.collection`, set
to `referrals`. Nothing logged here reaches the ops console, starts a ClearSky
response clock, or puts CIR's customers in front of ClearSky staff.

Pointing `delivery.collection` at `intake_projects` to "unify the queues"
would not be a unification. It would drop a trial tenant's customers into your
worklist, start SLA clocks on jobs nobody at ClearSky owes a reply to, and the
first symptom would be your median first-reply going strange for reasons
nobody could trace. The warning is written into the config, the module header
and the rules file, in all three places on purpose.

**Graduating CIR onto the real intake later is a document copy, not a
translation.** The status *keys* in `omega-delivery.js` deliberately mirror
`intake_projects`' vocabulary — `submitted`, `in_review`, `quoted`,
`accepted`, `in_production`, `delivered`, `declined` — even though the labels
read differently for a services firm ("Referred" for `submitted`, "Scoping"
for `in_review`). `check-delivery.js` asserts the two lists still match.

### Service lines

Ten, in `delivery.services`, assembled from CIR's published catalogue:

| Key | Label |
|---|---|
| `siting` | Siting & screening |
| `diligence` | Site diligence / DDR |
| `engineering` | Systems engineering |
| `interconnection` | Interconnection |
| `permitting` | Permitting & AHJ |
| `estimating` | Estimating & bidding |
| `financial` | Financial modeling |
| `sitereview` | Dispatch: site review |
| `construction` | Construction management |
| `legal` | Legal & land support |

**Confirm this list with CIR in the kickoff call.** Their product page is a
client-rendered React app, so this came from their own descriptions elsewhere
— and a catalogue of a services firm's own work with something missing is the
first thing they'll notice.

**Keys are written onto every referral.** Renaming one orphans every record
that used it. The queue tags orphans in red under *Needs scoping* rather than
hiding them, but it's still a migration. Change labels freely; change keys
deliberately.

A referral counts once **per service line**, so the per-service total runs
ahead of the referral count — one site can carry four. That's what makes load
per service readable, and the block says so under the numbers.

### Three things the queue refuses to fudge

**Answered-but-unmeasured is not zero.** A referral already at `quoted` or
beyond with no `firstResponseAt` was clearly answered — somebody priced it —
but its response time reads `—`, not `0`. Counting it as zero would flatter
the median with work nobody measured. The count of those prints under *Median
reply* so the gap is visible rather than silent.

**No service line is not a small job.** A referral with nothing ticked is an
unanswered question about what the customer actually asked for. It gets its
own *Needs scoping* tab rather than being folded in with real work.

**Derived due dates are marked.** Left blank, the queue derives one from
priority and prints an asterisk, so nobody mistakes a working target for a
commitment the customer made.

### The response clock

`submittedAt` → `firstResponseAt`. First reply, not delivery.

It is **not retroactive** — referrals logged before this shipped read `—`
forever. `firstResponseAt` is stamped automatically the first time a referral
moves off `submitted`, because asking for a separate click is how the metric
ends up never recorded. It is **write-once in the rules**: without that, the
person being measured can move the number that measures them, and on a
single-tenant book of work there's no second party to notice.

Targets are wall-clock, not business hours:

| Priority | Target |
|---|---|
| Critical | 2 h |
| Rush | 8 h |
| Standard | 24 h |

Amber at 60%, red past it, and the clock keeps counting into overtime rather
than parking at 100% — a 20-minute miss and a two-day miss shouldn't look the
same.

**CIR's own pitch is a 24-hour work cycle and deliverables in a third of the
usual time**, so a 24h standard target is their claim rather than an arbitrary
one. If they'd rather not be measured against their own marketing during a
trial, raise it before the demo. Raising it quietly after the first miss is
worse than setting it honestly now.

A standard referral landing 6pm Friday is amber by Saturday lunchtime with
nobody at fault. Once volume makes that unfair, add a business-hours calendar
in `omega-delivery.js` — not a longer target, which would also slacken the
weekday number that matters.

### Files

Two kinds of attachment, both on `/intake.html`:

- **Uploads** — drag-drop or file picker, to Firebase Storage at
  `referrals/{orgId}/{referralId}/{filename}`. Capped at 25 MB.
- **Links** — Drive, Dropbox, anywhere. Stored as a URL.

Files are held in memory until submit and uploaded **after** the referral
document exists. Uploading first would orphan an object in Storage every time
somebody opens the form and closes it, with no document to clean up from. If
an upload fails the referral is already saved — you get a referral with no
files rather than no referral.

The 25 MB cap is about the browser, not Storage: past that, a field connection
stalls long enough that people reload the form and lose it. The cap is
enforced in **both** `/intake.html` and `storage.rules`; raising one without
the other means the form accepts a file the rules then refuse.

Set `delivery.uploads: false` for links only — the page says so plainly rather
than failing on click.

### Editor handoff

**Start in editor** on a queue row creates a `projects` document and links the
two (`referralId` on the project, `editorProjectId` on the referral), then
navigates to `/editor.html?id=…`. The referral moves to `in_production`.

The project is stamped with **CIR's** orgId, not the customer's — unlike the
ops console's version. On the ops console the client is another Omega tenant
with their own portal to see it in. Here CIR's customer has no Omega account
at all, so the project belongs to CIR and the customer's name rides in
`client`.

### Sample mode

`delivery.sampleData: true` fills the block and the queue with an illustrative
book of work — seven live referrals across eight service lines, plus one
delivered. It renders **only while the collection is empty for this org** and
paints a "Sample" ribbon. Status changes and editor handoff are disabled in
sample mode, because there's nothing real to write to.

It is deliberately imperfect: one referral never answered and 31h past a
critical target, one blocked on the customer, two late, and two answered but
never stamped. **A queue where everything is green teaches nobody how to read
it**, and CIR's own people will check the ugly rows first.

**Turn it off the moment the account carries real referrals.** It
self-destructs on the first one, but don't rely on that if a demo is being
screenshotted.

### Checking it

```
node check-delivery.js
```

Loads `config.js` and `omega-delivery.js` into a DOM, runs the sample book
through `analyse()`, and asserts the SLA states, the unmeasured gap, the
per-service counting, the scope-map unpacking, that the rules' status list
still matches `STATUS[]`, and that the collection is not `intake_projects`.
30 assertions; exits non-zero on any failure. Run it after any config edit.

---

## Signing in from clearskyomega.com

The gateway hands a signed-in user straight into this portal by appending
`#omega_sso=<idToken>`. `omega-sso.js` takes the token out of the address bar,
trades it at the Cloud Function for a custom token, signs in, and reloads
clean. A normal visit has no hash and nothing runs.

Two tags in `<head>`, and **the order matters**:

```html
<script>…inline veil guard…</script>
<script type="module" src="/omega-sso.js"></script>
```

**Why the inline guard exists.** `omega-sso.js` is a module, so it is deferred
and *cannot* run first however high it sits. Without the guard, the portal's
own auth observer fires, paints the sign-in card, and only then does the SSO
reload happen — so a user arriving from clearskyomega.com watches a login
screen flash past on their way in, which reads as "it logged me out". The
guard hides `#auth-screen` for that one paint, and removes itself after 6
seconds so a failed exchange doesn't strand somebody on a blank page.

Verified headlessly: the veil appears only when the URL carries
`#omega_sso=`, and a normal load is untouched.

**`omega-sso.js` is served from this origin**, per the comment already in the
file you sent and matching the NextNRG deployment. That means it is a copy,
and copies rot: the `EXCHANGE` constant inside it is a hardcoded v1 Cloud
Function URL, which is the line most likely to move. When it does, it has to
be re-copied to every hand-off target — this repo included.

On any failure both are inert and the normal sign-in card appears. The worst
case is the sign-in the user would have had anyway.

**Before this works:** this portal's origin has to be an authorized domain in
Firebase Auth, and the `omegaSso` function has to be deployed in
`clearsky-portal`. Neither is done from this repo.

---

## ⚠ Before this goes live

### 1. Confirm `sitefinder` is in the deployed catalog.

`OMEGATools.hydrate()` **replaces** `SEED_TOOLS` wholesale when the Firestore
`tools` collection is non-empty — it does not merge. `SEED_TOOLS` carries 40
tools including `sitefinder`, which is new. A `tools` collection imported
before `sitefinder` was added means Site Finder is absent from the marketplace,
its pinned tile has nothing to render, and `config.js` looks wrong when it
isn't.

**Check:** fewer than 40 tools in the marketplace, or no Site Finder under
*Interconnection & Grid* → run **Import / Update Applications**, then reload.

### 2. Deploy the Firestore rules — now four fragments.

```
firebase deploy --only firestore:rules
```

Confirm `termsAcceptances`, `financeOffers`, `capacityAllocations` **and
`referrals`** all appear in Firebase Console → Firestore → Rules.

`firestore-terms.rules` still matters most: without it the terms gate fails
closed and **nobody can sign in, on any tenant**.

`firestore-delivery.rules` fails asymmetrically, and it's worth knowing which
half: a missing rule denies **reads**, so the queue paints empty and looks
exactly like "no referrals yet" — check the browser console, the module names
the refused collection. **Writes** fail loudly with a message naming the file,
so the intake form is the honest half.

### 3. Deploy `storage.rules` — this is a SEPARATE deploy.

```
firebase deploy --only storage
```

`--only firestore:rules` does **not** touch Storage. Miss this and uploads on
`/intake.html` fail with `storage/unauthorized` while the referral itself
saves fine — so the record appears with no files attached and nothing says
why.

Also confirm `firebase.json` has a storage entry:

```json
"storage": { "rules": "storage.rules" }
```

Without it the CLI has nothing to deploy and reports success on an empty set
of targets, which reads like it worked.

**Storage rules cannot call `userOrg()`.** Different ruleset, no access to
your Firestore helpers, no way to import them. The org is derived from the
caller's email domain instead. That matters here because CIR has two sign-in
domains — `orgFor()` in `storage.rules` maps
`cleantechindustryresources.com` → `cleantechir.com`. **Keep it in step with
`allowedDomains` in `config.js`**, or a user on the second domain uploads
nothing and is told only "unauthorized".

### 4. Confirm Site Finder's dependencies are on the tool host.

Site Finder is dark until these sit beside `clearsky-sitefinder.html` on
`tools.csebuilders.com`:

```
omega-capacity-ledger.js    omega-listings-source.js    omega-comed-layers.js
ci-industrial.js            ilshines-sites.js
```

DuPage and Lake are built; McHenry is unconfirmed and Cook is still failing.
**Cook is the county a demo reaches for first.** If it's still empty on Sep 1,
drive the demo through DuPage or Lake and say why, rather than letting them
search Chicago and find nothing.

### 5. Authorize both domains in Firebase Auth.

Console → Authentication → Settings → Authorized domains. Google sign-in fails
without this, and so does the SSO handoff.

### 6. Confirm `userOrg()` resolves both CIR domains to the same orgId.

Everything is scoped to `orgId: 'cleantechir.com'`, but sign-ins may arrive on
`cleantechindustryresources.com`. If `userOrg()` derives the org from the raw
email domain rather than from the tenant config, that user authenticates fine
and sees an **empty workspace** — reads scoped to an org nobody wrote to. This
is the most likely way this deployment fails in a way that looks like a data
problem instead of a config problem.

### 7. Resolve `isConsoleViewer()` before this account carries real referrals.

Two hardcoded domains currently get read access to every tenant's `/projects`
documents. That was already a flagged platform risk. It is sharper here: CIR's
referrals name **their customers' projects**, and the editor projects created
from them carry the customer name in `client`. A cross-org read of `/projects`
is a read of who CIR is working for.

### 8. Decide on sample data before the demo.

`delivery.sampleData: true` ships on so the block isn't six empty cards on
first sign-in. Turn it off if the account will carry real referrals from day
one.

---

## Access rules

Primary domain is `cleantechir.com`. **A second domain is open**, deliberately:

| Domain | Why open |
|---|---|
| `cleantechir.com` | primary; site footer and `connect@` |
| `cleantechindustryresources.com` | published as their inbound contact address; staff addresses appear on both |

Walters got one domain because its sister brands had no separate mail presence.
CIR is the opposite case — both are in live use for staff mail, and opening
only the short one would refuse a real fraction of the trial team with a
message that reads like the portal is broken.

Both land in the **same** workspace: `orgId` is pinned to `cleantechir.com`
regardless of which address signs in. See pre-launch items 3 and 6 — that
pinning has to hold in the Firestore rules *and* in `storage.rules`, not just
here.

Their legal entity, Solar Industry Resources LLC, has no observed mail domain
of its own; don't pre-open one.

`csebuilders.com` and `clearsky-usa.com` may preview and survive expiry.

Individual outside addresses go in `allowedEmails`, rather than opening a whole
domain.

---

## Tools during the trial

Entire catalog visible; anything locked renders with an "Upgrade" badge and a
mailto to `dev@clearsky-usa.com`.

| Key | Tool | Category | Tier | Notes |
|---|---|---|---|---|
| `sitefinder` | Site Finder | interconnection | DELUXE (2) | pinned first |
| `gridatlas` | Grid Atlas | interconnection | ALL (0) | pinned |
| `editor` | BESS Site Map | design | STANDARD (1) | pinned |

All three are in `requiredTools` as well as `unlockedTools`, so all three tiles
are on My Applications at first sign-in. Order is the intended walkthrough:
**find the site → read the grid → design the asset** — and with the delivery
console directly below, the referral that started the job sits in the same
view.

```
unlocked = requiredTools.has(key) || unlockedTools.has(key) || tierLevel >= (tool.tier ?? 1)
```

`tierLevel` is **-1** so nothing passes on tier alone. This catches `gridatlas`
too, which is `TIER.ALL` and would otherwise open for free. **Deleting a key
from `unlockedTools` locks the tool even if it's still in `requiredTools`** —
keep the two in sync.

`tierLevel: 0` was the tempting shortcut and is wrong: it would also open
`comedcap`, the one-address-lookup version of Site Finder. Two ComEd tools on
one dashboard invites a question whose honest answer is that one is a downgrade
of the other.

### ⚠ Site Finder is ComEd-only. CIR is national.

The commercial risk in this trial, and it belongs in the kickoff call rather
than week three.

Site Finder browses **northern Illinois** C&I property shaded from ComEd's
published hosting-capacity map. It's territory-bound by data, not licence:
outside ComEd there's no capacity layer to shade against.

CIR is Vermont-headquartered and works national portfolios — 450+ sites for a
Virginia developer, high-volume residential through mega-scale. **Their first
instinct will be to search their own footprint and get an empty map.**

Two framings, both fine, pick one before the demo:

1. **The ComEd pilot.** Site Finder is the worked example of what the platform
   does where the utility publishes capacity data. The pitch is the method.
2. **Lead with Grid Atlas and the editor**, hold Site Finder as the
   "here's a fully-instrumented territory" moment.

Grid Atlas is national — substations, lines, plants, EIA — so it carries the
weight everywhere CIR actually works.

**If the trial is meant to prove out a specific region, ask which one now.**
ComEd territory: ship as-is. PJM or ISO-NE, plausible for a Vermont firm:
`sitediscovery` (ranks a pipeline the tenant already assembled, no utility data
dependency) is the better third tool, and it pairs naturally with the delivery
console since the referrals *are* the pipeline. Two-line edit.

### Marketplace hand-off is off for now

`delivery.marketplaceKey` is `null`. CIR's referrals are their **customers'**
projects, so pushing one into ClearSky's finance marketplace means brokering
somebody else's deal. That's a commercial conversation before it's a config
value — set it to `'financing'` once you've had it.

---

## Why the Asset Owner Command Center is off

Walters got `omega-assets.js` because they sell equipment today and want to own
or finance it tomorrow. CIR is the opposite shape: they advance projects for
developers, builders, landowners and financiers and hand them over. There's no
portfolio on their balance sheet for the block to report on, and enabled it
would show four permanently empty cards.

The sample is worse than the empty state, not better — a Southern California
C&I storage portfolio built for a Southern California distributor. In front of
a Vermont firm running national portfolios it reads as a mistake.

`omega-assets.js` still ships so `index.html` stays comparable across tenants;
the module checks `enabled` before it mounts anything. Verified headlessly on
this deployment: the delivery block mounts directly under My Applications, and
the assets block does not mount at all.

---

## Note on the logo

Your file is a white wordmark on transparency with the blue C|R block. **It
would have been invisible in the portal** — the sign-in card is
`rgba(255,255,255,.96)` and the topbar chip is `#fff`, so everything except the
blue square would have vanished and looked like a broken image.

- **`cir-logo.png`** — wordmark recoloured to `#0F2733`, the portal's own body
  text colour, so it sits at the same weight as the interface text beside it.
  Blue block and the white C|R inside it untouched. Trimmed with 6px padding.
  Used for the topbar chip, sign-in card, and `exportBrand`.
- **`cir-logo-white.png`** — your original, trimmed the same way, for dark
  backgrounds. Nothing points at it yet.

490×170 (2.88:1). At the card's fixed 88px height it lands at 254px inside
~324px usable. In the 22px topbar chip, ~63px, well inside the 150px mobile
clamp.

`clientName` is the trading name, not the legal entity. `exportBrand.name` is
separate for exactly that reason if a proposal needs *Solar Industry Resources,
LLC*.

---

## Terms of Service gate

Unchanged from every other tenant: a consent checkbox on sign-up, plus the real
enforcement — a gate after authentication and before the app renders, because a
checkbox would miss Google sign-in entirely and would miss version bumps.

Acceptance at `termsAcceptances/{uid}`. Bump `TERMS_VERSION` in `omega-terms.js`
to re-prompt everyone.

### Not legal advice

Standard SaaS starting point. **Have a lawyer review before relying on any of
it.** Two placeholders marked REVIEW: governing law and venue (Iowa) and the
notice address.

Two points need a second look for **this** tenant specifically, both sharper
than they were for Walters:

**Sublicensing.** CIR sells systems engineering and stamps deliverables for its
own clients. A services firm handing a ClearSky-generated one-line to its
customer is a redistribution question the current terms don't clearly address —
the engineering-output disclaimer protects ClearSky without saying anything
about what CIR may pass on.

**Their customers' data.** The delivery console means this account now holds
information about third parties who never agreed to anything: contact names,
emails, site addresses and uploaded files belonging to CIR's clients. The
customer-data ownership clause was written for a tenant's own project data. Ask
the lawyer whether it covers a tenant storing *its customers'* data, and
whether a DPA belongs in the conversion paperwork.

---

## Open questions for you

1. **Are the ten service lines right?** Assembled from public material. Wrong
   or missing lines are the first thing CIR will notice, and keys are painful
   to change once referrals carry them.
2. **Which territory is this trial about?** ComEd → ship as-is. ISO-NE or PJM →
   swap `sitefinder` for `sitediscovery` before Sep 1.
3. **Who is the trial sponsor?** `supportEmail` points at the public
   `connect@cleantechir.com`, slow even over 60 days.
4. **One workspace for all of CIR's clients?** Every CIR user sees every
   referral, including which developers CIR is working for and on what. Fine
   internally, possibly not fine contractually. Ask before they import.
5. **Is 60 days plus no expiry lock what you meant?** With
   `lockOnExpiry: false` and no pre-start block, the practical window is "now
   until you turn it off".
