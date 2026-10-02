// Background Service Worker for Portfolio User Workspace Extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('Portfolio User Workspace Extension installed.');

  // Set side panel behavior to open on action click
  if (chrome.sidePanel?.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((err) => {
      console.warn('sidePanel.setPanelBehavior error:', err);
    });
  }

  // Create Context Menus
  if (chrome.contextMenus) {
    chrome.contextMenus.create({
      id: 'save-planner-note',
      title: 'Save to Planner Notes',
      contexts: ['selection'],
    });

    chrome.contextMenus.create({
      id: 'add-planner-task',
      title: 'Add as Planner Task',
      contexts: ['selection'],
    });

    chrome.contextMenus.create({
      id: 'ask-ai-assistant',
      title: 'Ask AI Assistant',
      contexts: ['selection'],
    });
  }

  // Periodic Reminder Watchdog Alarm (every 1 minute)
  if (chrome.alarms) {
    chrome.alarms.create('user_reminder_watchdog', {
      periodInMinutes: 1,
    });
  }
});

// Context Menu Action Handler
chrome.contextMenus?.onClicked.addListener((info) => {
  const selectedText = (info.selectionText || '').trim();
  if (!selectedText) return;

  if (info.menuItemId === 'save-planner-note') {
    chrome.storage.local.get(['quick_notes_queue'], (res) => {
      const queue = res.quick_notes_queue || [];
      queue.push({
        content: selectedText,
        timestamp: new Date().toISOString(),
      });
      chrome.storage.local.set({ quick_notes_queue: queue }, () => {
        chrome.notifications?.create(`note_saved_${Date.now()}`, {
          type: 'basic',
          iconUrl: 'favicon.ico',
          title: 'Planner Note Saved',
          message: `Saved "${selectedText.slice(0, 45)}..." to your queue.`,
        });
      });
    });
  } else if (info.menuItemId === 'add-planner-task') {
    chrome.storage.local.get(['quick_tasks_queue'], (res) => {
      const queue = res.quick_tasks_queue || [];
      queue.push({
        title: selectedText,
        timestamp: new Date().toISOString(),
      });
      chrome.storage.local.set({ quick_tasks_queue: queue }, () => {
        chrome.notifications?.create(`task_saved_${Date.now()}`, {
          type: 'basic',
          iconUrl: 'favicon.ico',
          title: 'Task Added to Planner',
          message: `Task "${selectedText.slice(0, 45)}..." queued.`,
        });
      });
    });
  } else if (info.menuItemId === 'ask-ai-assistant') {
    chrome.storage.local.set({ pending_ai_prompt: selectedText }, () => {
      chrome.notifications?.create(`ai_prompt_${Date.now()}`, {
        type: 'basic',
        iconUrl: 'favicon.ico',
        title: 'Sent to AI Assistant',
        message: 'Open User Workspace to view response.',
      });
    });
  }
});

// Periodic Watchdog Alarm Listener
chrome.alarms?.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith('alarm_')) {
    chrome.notifications?.create(`reminder_${alarm.name}`, {
      type: 'basic',
      iconUrl: 'favicon.ico',
      title: 'Planner Task Reminder',
      message: 'You have a scheduled planner task due now.',
      priority: 2,
    });
  }
});
