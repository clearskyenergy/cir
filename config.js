/* ═══════════════════════════════════════════════════════════════════════════════
   /config.js — CLEANTECH INDUSTRY RESOURCES (CIR)
   ClearSky-OMEGA EnergyOS · client deployment

   This is the ONLY file that differs between tenants. index.html,
   marketplace.html, projects.html, editor.html, omega-brand.js, omega-terms.js
   and omega-assets.js are shared verbatim across every deployment — do not edit
   them here.
   ═══════════════════════════════════════════════════════════════════════════════ */
window.CLEARSKY_CONFIG = {

  /* ── Firebase ──────────────────────────────────────────────────────────────
     Project: clearsky-portal — the same project the demo and the other tenants
     use, so CIR is a tenant inside it rather than a separate instance. The
     Firestore rules scope by email domain via userOrg(), which resolves
     @cleantechir.com to the orgId below with no rules change needed.

     These are web-app credentials, public by design (they ship in every page
     load). The security boundary is the Firestore rules, not this key.       */
  firebase: {
    apiKey:            'AIzaSyABoM1lgOYUnd5ZadaoTMhYmA9cHa8Tyo0',
    authDomain:        'clearsky-portal.firebaseapp.com',
    projectId:         'clearsky-portal',
    storageBucket:     'clearsky-portal.firebasestorage.app',
    messagingSenderId: '742134484347',
    appId:             '1:742134484347:web:ab0f95fd221536158481de',
    measurementId:     'G-8D92GNW555'
  },

  /* ── The tenant ───────────────────────────────────────────────────────────── */
  tenant: {
    type:          'developer',
    orgId:         'cleantechir.com',        // hard tenant lock — scopes ALL Firestore reads
    clientName:    'Cleantech Industry Resources',
    allowedDomain: 'cleantechir.com',        // primary sign-in domain

    /* CIR runs two live mail domains, not one. cleantechir.com is the short
       brand domain and the one on their site footer; cleantechindustryresources.com
       is the long-form domain and is the address published on their own
       LinkedIn for inbound contact. Staff addresses appear on BOTH. Opening
       only the short one would refuse roughly half the people who might sign
       up, and the refusal reads as a broken portal rather than a policy.

       Both land in the SAME workspace: orgId above is fixed at cleantechir.com
       regardless of which address signs in, so there is no data split.

       If the trial team turns out to be entirely on one domain, drop the other
       — an unused domain in this list is a wider door than the trial needs.

       Their legal entity is Solar Industry Resources, LLC; no separate mail
       domain has been observed for it. Do not pre-open one.                  */
    allowedDomains: ['cleantechindustryresources.com'],

    logo:          '/cir-logo.png',

    /* ── TRIAL ────────────────────────────────────────────────────────────────
       The gate in omega-tools.js is:
           unlocked = requiredTools.has(key)
                   || unlockedTools.has(key)
                   || tierLevel >= (tool.tier ?? 1)

       Tool tiers run ALL=0, STANDARD=1, DELUXE=2, ENTERPRISE=3. tierLevel 0
       would unlock every tier-0 tool — including ComEd Capacity Finder, which
       overlaps Site Finder and muddies what this trial is demonstrating. -1
       sits below TIER.ALL, so no tool passes on tier and access comes ONLY
       from the explicit lists below. The catalog still renders in full;
       everything unlisted shows an "Upgrade" badge.                          */
    accountTier:   'Trial',
    tierLevel:     -1,

    trial: {
      startsAt:     '2026-09-01',   // Tuesday Sep 1, 2026 — local midnight
      days:         60,             // runs through end of Fri Oct 30, 2026
      lockOnExpiry: false           // see README before flipping this to true
    },

    /* ── PINNED DASHBOARD TILES ───────────────────────────────────────────
       requiredTools are placed on "My Applications" first, always, and can't
       be removed by the user. All three trial tools are pinned, so the whole
       trial surface is on the dashboard the moment they sign in — no visit to
       the marketplace, no "+ Add to dashboard" click.

       Order here is the render order, and it is the intended walkthrough:
       find the site, read the grid around it, design the asset.            */
    requiredTools: ['sitefinder', 'gridatlas', 'editor'],

    /* ── WHAT THIS ACCOUNT CAN USE ────────────────────────────────────────
       Everything else in the catalog still renders, badged "Upgrade".

       gridatlas is TIER.ALL and sitefinder is TIER.DELUXE, but with
       tierLevel -1 neither passes on tier — both must be listed explicitly
       here. Removing a key from this list locks the tool even if it is
       still in requiredTools above; keep the two lists in sync.            */
    unlockedTools: [
      'editor',      // BESS Site Map   (design,          tier 1)
      'gridatlas',   // Grid Atlas      (interconnection, tier 0)
      'sitefinder'   // Site Finder     (interconnection, tier 2)
    ],

    /* ── ASSET OWNER COMMAND CENTER — OFF ─────────────────────────────────
       omega-assets.js ships in this repo so index.html stays byte-identical
       to the other tenants, but the block is disabled. It answers an asset
       owner's questions (what do we own, what is it worth, who is bidding on
       it). CIR is a development-and-engineering services firm — they advance
       other people's projects and hand them over. They do not hold the assets,
       so a portfolio P&L and an offer funnel would be empty forever, or worse,
       filled with sample numbers that describe somebody else's balance sheet.

       The stock dashboard — site count, stage mix, storage quoted — is the
       pipeline view, and that is the right one for this account.

       If CIR does start owning: set enabled true, sampleData false, and seed
       real projects. Do NOT turn sampleData on for a demo here — the sample
       is a Southern California C&I portfolio and CIR is a Vermont firm working
       national portfolios. It would read as a mistake.                     */
    assets: {
      enabled:      false,
      sampleData:   false
    },

    /* Branding for customer-facing exports (proposals, PDFs). */
    exportBrand: {
      logo:              '/cir-logo.png',
      name:              'Cleantech Industry Resources',
      poweredBy:         'Powered by ClearSky-OMEGA',
      platformCopyright: '© 2026 ClearSky Energy Solutions LLC · ClearSky-OMEGA platform'
    }
  },

  /* ── ClearSky staff who may preview this deployment ───────────────────────
     These domains keep access even after the trial expires, so you can always
     get in to demo or troubleshoot.                                          */
  adminDomains: ['csebuilders.com', 'clearsky-usa.com'],

  platformName: 'ClearSky-OMEGA',

  /* CIR's own public address — shown to their users for help with the product
     itself. connect@ is their published inbound address; info@ also resolves.
     Swap for the trial sponsor's direct address once you know who that is; a
     shared inbox is a slow route even on a 60-day trial. */
  supportEmail: 'connect@cleantechir.com',

  /* ClearSky's address. Everything commercial routes here: the trial banner's
     Upgrade link, locked-tool "Upgrade to unlock" buttons, and the expired-
     trial message. Kept separate from supportEmail so upgrade requests reach
     you rather than the customer's own help desk. */
  upgradeEmail: 'dev@clearsky-usa.com'
};


/* ═══════════════════════════════════════════════════════════════════════════════
   SETUP GUARD
   Catches the two things that break a fresh deployment and says so in plain
   language, instead of leaving a raw Firebase SDK string on the sign-in card.
   Safe to delete once this deployment is live.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function (cfg) {
  var problems = [];

  var fb = cfg.firebase || {};
  var placeholder = false;
  for (var k in fb) {
    if (fb.hasOwnProperty(k) && String(fb[k]).indexOf('REPLACE_ME') >= 0) placeholder = true;
  }
  if (placeholder) {
    problems.push('/config.js still has placeholder Firebase credentials. '
      + 'Copy the firebase block from a working deployment, or from '
      + 'Firebase Console \u2192 Project settings \u2192 Your apps \u2192 Web app.');
  }

  /* Firebase Auth only permits an insecure origin on localhost. */
  var host = location.hostname;
  var localish = (host === 'localhost' || host === '127.0.0.1' || host === '[::1]');
  if (location.protocol === 'http:' && !localish) {
    problems.push('This page is served over HTTP. Firebase Auth requires HTTPS '
      + 'outside localhost \u2014 Google sign-in will fail and passwords are sent '
      + 'in cleartext. Install a certificate for ' + host + '.');
  }

  if (!problems.length) return;

  var MSG = 'Deployment not finished: ' + problems.join(' \u00B7 ');

  if (window.console && console.error) {
    for (var i = 0; i < problems.length; i++) {
      console.error('[ClearSky-OMEGA setup] ' + problems[i]);
    }
  }

  /* Don't just paint the message — hold it. Firebase's own error fires later,
     when the user clicks Create account, and would otherwise overwrite this
     with the raw SDK string that sent you looking in the wrong place. */
  function apply() {
    var el = document.getElementById('auth-err');
    if (!el) { return setTimeout(apply, 200); }

    el.textContent = MSG;
    el.style.display = 'block';

    /* Any later auth error re-shows the setup message instead. */
    if (typeof window.showAuthErr === 'function' && !window.showAuthErr.__omegaSetup) {
      var wrapped = function () {
        el.textContent = MSG;
        el.style.display = 'block';
      };
      wrapped.__omegaSetup = true;
      window.showAuthErr = wrapped;
    }

    /* Sign-in cannot succeed in this state, so make that visible rather than
       letting it fail confusingly on click. */
    var ids = ['email-auth-btn', 'google-signin-btn'];
    for (var j = 0; j < ids.length; j++) {
      var b = document.getElementById(ids[j]);
      if (b) {
        b.disabled = true;
        b.style.opacity = '0.5';
        b.style.cursor = 'not-allowed';
        b.title = MSG;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
})(window.CLEARSKY_CONFIG);
