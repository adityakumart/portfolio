// Background Service Worker for RR Fleet Management Chrome Extension

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const ALARM_NAME = 'rr_inactivity_watchdog';

// Initialize alarms on installation or startup
chrome.runtime.onInstalled.addListener(() => {
  setupWatchdog();
  updateBadgeFromStorage();
});

chrome.runtime.onStartup.addListener(() => {
  setupWatchdog();
  updateBadgeFromStorage();
});

function setupWatchdog() {
  chrome.alarms.get(ALARM_NAME, (alarm) => {
    if (!alarm) {
      chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });
    }
  });
}

// Check inactivity on alarm tick
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    checkInactivity();
  }
});

function checkInactivity() {
  chrome.storage.local.get(['rr_session_last_active', 'rr_session_is_locked', 'rr_token'], (res) => {
    // Only check if user is logged in
    if (!res.rr_token) {
      clearBadge();
      return;
    }

    if (res.rr_session_is_locked === 'true' || res.rr_session_is_locked === true) {
      setLockedBadge();
      return;
    }

    const lastActive = parseInt(res.rr_session_last_active, 10);
    if (!isNaN(lastActive) && (Date.now() - lastActive >= INACTIVITY_TIMEOUT_MS)) {
      // Mark session as locked in storage
      chrome.storage.local.set({ rr_session_is_locked: 'true' });
      setLockedBadge();
    } else {
      clearBadge();
    }
  });
}

// React to storage changes immediately
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;

  if (changes.rr_token && !changes.rr_token.newValue) {
    clearBadge();
    return;
  }

  if (changes.rr_session_is_locked) {
    if (changes.rr_session_is_locked.newValue === 'true' || changes.rr_session_is_locked.newValue === true) {
      setLockedBadge();
    } else {
      clearBadge();
    }
  }
});

function updateBadgeFromStorage() {
  chrome.storage.local.get(['rr_session_is_locked', 'rr_token'], (res) => {
    if (res.rr_token && (res.rr_session_is_locked === 'true' || res.rr_session_is_locked === true)) {
      setLockedBadge();
    } else {
      clearBadge();
    }
  });
}

function setLockedBadge() {
  chrome.action.setBadgeText({ text: 'LOCK' });
  chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
}

function clearBadge() {
  chrome.action.setBadgeText({ text: '' });
}
