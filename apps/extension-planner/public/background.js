// Background Service Worker for Planner Chrome Extension (Manifest V3)

const REMINDER_ALARM_NAME = 'planner_reminder_watchdog';

// Initialize context menus and alarms on install
chrome.runtime.onInstalled.addListener(() => {
  setupAlarms();
  setupContextMenus();
  updateBadgeFromStorage();
});

chrome.runtime.onStartup.addListener(() => {
  setupAlarms();
  updateBadgeFromStorage();
});

function setupAlarms() {
  chrome.alarms.get(REMINDER_ALARM_NAME, (alarm) => {
    if (!alarm) {
      chrome.alarms.create(REMINDER_ALARM_NAME, { periodInMinutes: 1 });
    }
  });
}

function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'planner_save_note',
      title: 'Save "%s" to Planner Notes',
      contexts: ['selection'],
    });

    chrome.contextMenus.create({
      id: 'planner_add_task',
      title: 'Add "%s" as Planner Task',
      contexts: ['selection'],
    });
  });
}

// Handle Context Menu clicks for Quick Capture
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = (info.selectionText || '').trim();
  if (!selectedText) return;

  if (info.menuItemId === 'planner_save_note') {
    chrome.storage.local.get(['portfolio_planner_offline_cache'], (res) => {
      const cache = res.portfolio_planner_offline_cache || { notes: [], todos: [] };
      const newNote = {
        id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: selectedText.slice(0, 40) + (selectedText.length > 40 ? '...' : ''),
        content: selectedText,
        sourceUrl: tab?.url || '',
        tags: ['web-capture'],
        isPinned: false,
        color: '#10b981',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      cache.notes.unshift(newNote);
      chrome.storage.local.set({ portfolio_planner_offline_cache: cache }, () => {
        chrome.notifications.create(`capture_note_${Date.now()}`, {
          type: 'basic',
          iconUrl: 'favicon.ico',
          title: 'Saved to Planner Notes',
          message: newNote.title,
          priority: 1,
        });
      });
    });
  } else if (info.menuItemId === 'planner_add_task') {
    chrome.storage.local.get(['portfolio_planner_offline_cache'], (res) => {
      const cache = res.portfolio_planner_offline_cache || { notes: [], todos: [] };
      const today = new Date().toISOString().split('T')[0];
      const newTodo = {
        id: `todo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: selectedText.slice(0, 80),
        description: selectedText.length > 80 ? selectedText : undefined,
        status: 'pending',
        priority: 'medium',
        dueDate: today,
        tags: ['web-capture'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      cache.todos.unshift(newTodo);
      chrome.storage.local.set({ portfolio_planner_offline_cache: cache }, () => {
        updateBadgeFromStorage();
        chrome.notifications.create(`capture_task_${Date.now()}`, {
          type: 'basic',
          iconUrl: 'favicon.ico',
          title: 'Task Added to Planner',
          message: newTodo.title,
          priority: 1,
        });
      });
    });
  }
});

// Periodic alarm handler: Checks upcoming reminders
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === REMINDER_ALARM_NAME) {
    checkUpcomingReminders();
  }
});

function checkUpcomingReminders() {
  chrome.storage.local.get(['portfolio_planner_offline_cache'], (res) => {
    const cache = res.portfolio_planner_offline_cache;
    if (!cache || !cache.todos) return;

    const now = Date.now();
    cache.todos.forEach((todo) => {
      if (todo.status === 'completed' || !todo.reminder || todo.reminder.isTriggered) return;

      const reminderTimeMs = new Date(todo.reminder.reminderTime).getTime();
      if (!isNaN(reminderTimeMs) && reminderTimeMs <= now) {
        // Trigger notification
        chrome.notifications.create(`todo_reminder_${todo.id}`, {
          type: 'basic',
          iconUrl: 'favicon.ico',
          title: `Task Reminder: ${todo.title}`,
          message: todo.description || 'This task is due now.',
          priority: 2,
        });
        todo.reminder.isTriggered = true;
      }
    });

    chrome.storage.local.set({ portfolio_planner_offline_cache: cache });
    updateBadgeFromStorage();
  });
}

function updateBadgeFromStorage() {
  chrome.storage.local.get(['portfolio_planner_offline_cache'], (res) => {
    const cache = res.portfolio_planner_offline_cache;
    if (!cache || !cache.todos) {
      chrome.action.setBadgeText({ text: '' });
      return;
    }
    const pendingCount = cache.todos.filter((t) => t.status !== 'completed' && t.status !== 'archived').length;
    if (pendingCount > 0) {
      chrome.action.setBadgeText({ text: String(pendingCount) });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  });
}

// React to storage changes immediately
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.portfolio_planner_offline_cache) {
    updateBadgeFromStorage();
  }
});
