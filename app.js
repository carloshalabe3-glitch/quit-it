(function () {
  'use strict';

  var STORAGE_KEY = 'ledger.v1';
  var PIN_SALT = 'ledger-app-salt-v1';

  var DEFAULT_ACTIVITIES = [
    'Splash cold water on your face',
    'Do 20 pushups',
    'Go for a walk outside',
    'Call or text someone you trust',
    'Journal for 5 minutes',
    'Take a cold shower',
    'Drink a full glass of water',
    'Stretch for 5 minutes',
    'Do one small chore',
    'Box breathing for 2 minutes',
    'Listen to one song, really listen to it',
    'Tidy one small area',
    'Learn something new',
    'Read'
  ];

  var FALLBACK_ACTIVITY = 'Take five slow, deep breaths';

  var ICON_OPTIONS = ['', 'quit', 'cigarette', 'phone', 'food', 'drink', 'dice', 'controller', 'moon', 'sugar', 'pill', 'bag', 'clock', 'coffee', 'flame'];

  var ICON_SVGS = {
    quit: '<circle cx="12" cy="12" r="9"/><line x1="5.5" y1="18.5" x2="18.5" y2="5.5"/>',
    cigarette: '<rect x="2" y="14" width="14" height="4" rx="1"/><rect x="16" y="14" width="3" height="4" fill="currentColor" stroke="none"/><path d="M13 9c1-1 1-2 0-3M17 9c1-1 1-2 0-3"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><line x1="10" y1="18" x2="14" y2="18"/>',
    food: '<path d="M6 2v8M4 2v4a2 2 0 004 0V2M6 10v12"/><path d="M18 2c-2 0-3 2-3 5s1 4 3 4v11"/>',
    drink: '<path d="M8 2h8l-1 7a3 3 0 01-6 0z"/><line x1="12" y1="15" x2="12" y2="21"/><line x1="8" y1="21" x2="16" y2="21"/>',
    dice: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.1" fill="currentColor" stroke="none"/><circle cx="16" cy="8" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="8" cy="16" r="1.1" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1.1" fill="currentColor" stroke="none"/>',
    controller: '<rect x="2" y="8" width="20" height="10" rx="5"/><line x1="7" y1="11" x2="7" y2="15"/><line x1="5" y1="13" x2="9" y2="13"/><circle cx="16" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="18" cy="14" r="1" fill="currentColor" stroke="none"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 119.5 4a7 7 0 1010.5 10.5z"/>',
    sugar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.2"/><circle cx="8" cy="7" r=".9" fill="currentColor" stroke="none"/><circle cx="16.5" cy="8" r=".9" fill="currentColor" stroke="none"/><circle cx="8.5" cy="17" r=".9" fill="currentColor" stroke="none"/>',
    pill: '<rect x="4" y="9" width="16" height="6" rx="3" transform="rotate(45 12 12)"/><line x1="12" y1="6.5" x2="12" y2="17.5" transform="rotate(45 12 12)"/>',
    bag: '<path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 016 0v2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="12" x2="12" y2="7"/><line x1="12" y1="12" x2="16" y2="14"/>',
    coffee: '<path d="M4 8h13v6a5 5 0 01-5 5H9a5 5 0 01-5-5z"/><path d="M17 9h2a2 2 0 010 4h-2"/><path d="M8 4c0 1-1 1-1 2M12 4c0 1-1 1-1 2"/>',
    flame: '<path d="M12 2c1 3-2 4-2 7a4 4 0 108 0c0-2-1-3-2-4 1 3-1 4-2 4-1.5 0-2-2-2-3 0-2 1-3 0-4z"/>'
  };

  function iconMarkup(key) {
    var inner = ICON_SVGS[key];
    if (!inner) return null;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }

  function makeIconEl(key, cls) {
    var span = document.createElement('span');
    span.className = cls || 'habit-emoji';
    var markup = iconMarkup(key);
    if (markup) {
      span.innerHTML = markup;
      span.classList.add('habit-icon-svg');
    } else {
      span.textContent = key;
    }
    return span;
  }

  var MILESTONES = [
    { key: '1d', ms: 1 * 86400000, title: '1 day clean' },
    { key: '3d', ms: 3 * 86400000, title: '3 days clean' },
    { key: '1w', ms: 7 * 86400000, title: '1 week clean' },
    { key: '2w', ms: 14 * 86400000, title: '2 weeks clean' },
    { key: '1mo', ms: 30 * 86400000, title: '1 month clean' },
    { key: '3mo', ms: 91 * 86400000, title: '3 months clean' },
    { key: '6mo', ms: 182 * 86400000, title: '6 months clean' },
    { key: '1y', ms: 365 * 86400000, title: '1 year clean' }
  ];

  // ---------- storage ----------

  function freshData() {
    return { pinHash: null, habits: [], customActivities: [], removedDefaults: [] };
  }

  function normalizeHabit(h) {
    return {
      id: h.id || uid(),
      name: h.name || 'Habit',
      emoji: h.emoji || '',
      createdAt: typeof h.createdAt === 'number' ? h.createdAt : Date.now(),
      lastRelapseAt: typeof h.lastRelapseAt === 'number' ? h.lastRelapseAt : null,
      relapses: Array.isArray(h.relapses) ? h.relapses.filter(function (t) { return typeof t === 'number'; }) : [],
      archived: !!h.archived,
      milestonesHit: Array.isArray(h.milestonesHit) ? h.milestonesHit : []
    };
  }

  function normalizeData(parsed) {
    if (!parsed || typeof parsed !== 'object') return freshData();
    return {
      pinHash: typeof parsed.pinHash === 'string' ? parsed.pinHash : null,
      habits: Array.isArray(parsed.habits) ? parsed.habits.map(normalizeHabit) : [],
      customActivities: Array.isArray(parsed.customActivities) ? parsed.customActivities.filter(function (a) { return typeof a === 'string'; }) : [],
      removedDefaults: Array.isArray(parsed.removedDefaults) ? parsed.removedDefaults.filter(function (a) { return typeof a === 'string'; }) : []
    };
  }

  function loadData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return freshData();
      return normalizeData(JSON.parse(raw));
    } catch (e) {
      return freshData();
    }
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  var data = loadData();

  // ---------- helpers ----------

  function uid() {
    return 'h_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function simpleHash(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) {
      h = ((h * 33) ^ str.charCodeAt(i)) >>> 0;
    }
    return h.toString(36);
  }

  function hashPin(pin) {
    return simpleHash(pin + PIN_SALT);
  }

  function activeActivities() {
    var defaults = DEFAULT_ACTIVITIES.filter(function (a) { return data.removedDefaults.indexOf(a) === -1; });
    return defaults.concat(data.customActivities);
  }

  function activeHabits() {
    return data.habits.filter(function (h) { return !h.archived; });
  }

  function findHabit(id) {
    for (var i = 0; i < data.habits.length; i++) {
      if (data.habits[i].id === id) return data.habits[i];
    }
    return null;
  }

  function currentStreakMs(habit) {
    var start = habit.lastRelapseAt || habit.createdAt;
    return Math.max(0, Date.now() - start);
  }

  function bestStreakMs(habit) {
    var sorted = habit.relapses.slice().sort(function (a, b) { return a - b; });
    var points = [habit.createdAt].concat(sorted);
    var best = 0;
    for (var i = 1; i < points.length; i++) {
      var seg = points[i] - points[i - 1];
      if (seg > best) best = seg;
    }
    var cur = currentStreakMs(habit);
    if (cur > best) best = cur;
    return best;
  }

  function formatStreak(ms, short) {
    var totalMinutes = Math.floor(ms / 60000);
    var totalHours = Math.floor(ms / 3600000);
    var totalDays = Math.floor(ms / 86400000);
    if (totalDays >= 1) {
      return { value: totalDays, unit: short ? 'days' : (totalDays === 1 ? 'day clean' : 'days clean') };
    }
    if (totalHours >= 1) {
      return { value: totalHours, unit: short ? 'hrs' : (totalHours === 1 ? 'hour clean' : 'hours clean') };
    }
    return { value: Math.max(0, totalMinutes), unit: short ? 'min' : (totalMinutes === 1 ? 'minute clean' : 'minutes clean') };
  }

  function formatDays(ms) {
    return Math.floor(ms / 86400000);
  }

  function formatDateTime(ms) {
    var d = new Date(ms);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ', ' +
      d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  function formatDateShort(ms) {
    var d = new Date(ms);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function relativeAgo(ms) {
    var diff = Date.now() - ms;
    var days = Math.floor(diff / 86400000);
    if (days <= 0) return 'today';
    if (days === 1) return '1 day ago';
    if (days < 30) return days + ' days ago';
    var months = Math.floor(days / 30);
    if (months === 1) return '1 month ago';
    if (months < 12) return months + ' months ago';
    var years = Math.floor(months / 12);
    return years === 1 ? '1 year ago' : years + ' years ago';
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // ---------- app state ----------

  var state = {
    screen: 'lock', // lock | setup | home | detail | overview | trigger
    unlocked: false,
    preLockScreen: 'home',
    currentHabitId: null,
    lockBuffer: '',
    setupStage: 'create',
    setupFirstPin: null,
    setupBuffer: '',
    changePinStage: 'create',
    changePinFirst: null,
    changePinBuffer: '',
    editingHabitId: null,
    selectedEmoji: '',
    confirmCallback: null,
    triggerText: '',
    milestoneQueue: []
  };

  var screens = ['lockScreen', 'setupScreen', 'homeScreen', 'detailScreen', 'overviewScreen', 'triggerScreen'];

  function showScreenEl(id) {
    screens.forEach(function (s) {
      document.getElementById(s).classList.toggle('hidden', s !== id);
    });
  }

  // ---------- lock / setup ----------

  function initLockFlow() {
    if (!data.pinHash) {
      state.screen = 'setup';
      state.setupStage = 'create';
      state.setupFirstPin = null;
      state.setupBuffer = '';
      document.getElementById('setupSub').textContent = 'This is private. Set a 4-digit PIN to lock the app.';
      renderPinDots('setupPinDots', 0);
      document.getElementById('setupError').textContent = '';
      showScreenEl('setupScreen');
    } else {
      state.screen = 'lock';
      state.unlocked = false;
      state.lockBuffer = '';
      document.getElementById('lockSub').textContent = 'Enter your PIN';
      renderPinDots('pinDots', 0);
      document.getElementById('lockError').textContent = '';
      showScreenEl('lockScreen');
    }
  }

  function renderPinDots(containerId, filledCount, errorMode) {
    var dots = document.getElementById(containerId).children;
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('filled', i < filledCount && !errorMode);
      dots[i].classList.toggle('error', !!errorMode && i < 4);
    }
  }

  function handlePinDigit(screenKind, digit) {
    if (screenKind === 'lock') {
      if (state.lockBuffer.length >= 4) return;
      state.lockBuffer += digit;
      renderPinDots('pinDots', state.lockBuffer.length);
      if (state.lockBuffer.length === 4) checkLockPin();
    } else if (screenKind === 'changePin') {
      if (state.changePinBuffer.length >= 4) return;
      state.changePinBuffer += digit;
      renderPinDots('changePinDots', state.changePinBuffer.length);
      if (state.changePinBuffer.length === 4) handleChangePinComplete();
    } else {
      if (state.setupBuffer.length >= 4) return;
      state.setupBuffer += digit;
      renderPinDots('setupPinDots', state.setupBuffer.length);
      if (state.setupBuffer.length === 4) handleSetupComplete();
    }
  }

  function handlePinBack(screenKind) {
    if (screenKind === 'lock') {
      state.lockBuffer = state.lockBuffer.slice(0, -1);
      renderPinDots('pinDots', state.lockBuffer.length);
    } else if (screenKind === 'changePin') {
      state.changePinBuffer = state.changePinBuffer.slice(0, -1);
      renderPinDots('changePinDots', state.changePinBuffer.length);
    } else {
      state.setupBuffer = state.setupBuffer.slice(0, -1);
      renderPinDots('setupPinDots', state.setupBuffer.length);
    }
  }

  function checkLockPin() {
    var ok = hashPin(state.lockBuffer) === data.pinHash;
    if (ok) {
      document.getElementById('lockError').textContent = '';
      unlockApp();
    } else {
      document.getElementById('lockError').textContent = 'Wrong PIN. Try again.';
      renderPinDots('pinDots', 4, true);
      setTimeout(function () {
        state.lockBuffer = '';
        renderPinDots('pinDots', 0);
      }, 450);
    }
  }

  function handleSetupComplete() {
    if (state.setupStage === 'create') {
      state.setupFirstPin = state.setupBuffer;
      state.setupBuffer = '';
      state.setupStage = 'confirm';
      document.getElementById('setupSub').textContent = 'Enter your PIN again to confirm.';
      document.getElementById('setupError').textContent = '';
      renderPinDots('setupPinDots', 0);
    } else {
      if (state.setupBuffer === state.setupFirstPin) {
        data.pinHash = hashPin(state.setupBuffer);
        saveData();
        unlockApp();
      } else {
        document.getElementById('setupError').textContent = "PINs didn't match. Start over.";
        renderPinDots('setupPinDots', 4, true);
        setTimeout(function () {
          state.setupStage = 'create';
          state.setupFirstPin = null;
          state.setupBuffer = '';
          document.getElementById('setupSub').textContent = 'This is private. Set a 4-digit PIN to lock the app.';
          document.getElementById('setupError').textContent = '';
          renderPinDots('setupPinDots', 0);
        }, 500);
      }
    }
  }

  function openChangePinSheet() {
    state.changePinStage = 'create';
    state.changePinFirst = null;
    state.changePinBuffer = '';
    document.getElementById('changePinSub').textContent = 'Enter a new 4-digit PIN.';
    document.getElementById('changePinError').textContent = '';
    renderPinDots('changePinDots', 0);
    document.getElementById('changePinSheet').classList.remove('hidden');
  }

  function closeChangePinSheet() {
    document.getElementById('changePinSheet').classList.add('hidden');
  }

  function handleChangePinComplete() {
    if (state.changePinStage === 'create') {
      state.changePinFirst = state.changePinBuffer;
      state.changePinBuffer = '';
      state.changePinStage = 'confirm';
      document.getElementById('changePinSub').textContent = 'Enter it again to confirm.';
      document.getElementById('changePinError').textContent = '';
      renderPinDots('changePinDots', 0);
    } else {
      if (state.changePinBuffer === state.changePinFirst) {
        data.pinHash = hashPin(state.changePinBuffer);
        saveData();
        closeChangePinSheet();
      } else {
        document.getElementById('changePinError').textContent = "PINs didn't match. Start over.";
        renderPinDots('changePinDots', 4, true);
        setTimeout(function () {
          state.changePinStage = 'create';
          state.changePinFirst = null;
          state.changePinBuffer = '';
          document.getElementById('changePinSub').textContent = 'Enter a new 4-digit PIN.';
          document.getElementById('changePinError').textContent = '';
          renderPinDots('changePinDots', 0);
        }, 500);
      }
    }
  }

  function unlockApp() {
    state.unlocked = true;
    goToScreen(state.preLockScreen || 'home');
  }

  function relock() {
    if (!state.unlocked) return;
    state.unlocked = false;
    state.preLockScreen = state.screen;
    closeAllSheets();
    state.lockBuffer = '';
    document.getElementById('lockSub').textContent = 'Enter your PIN';
    renderPinDots('pinDots', 0);
    document.getElementById('lockError').textContent = '';
    state.screen = 'lock';
    showScreenEl('lockScreen');
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) relock();
  });

  // ---------- navigation ----------

  function goToScreen(name, habitId) {
    state.screen = name;
    if (habitId) state.currentHabitId = habitId;
    if (name === 'home') { renderHome(); showScreenEl('homeScreen'); }
    else if (name === 'detail') { renderDetail(state.currentHabitId); showScreenEl('detailScreen'); }
    else if (name === 'overview') { renderOverview(); showScreenEl('overviewScreen'); }
    else if (name === 'trigger') { showScreenEl('triggerScreen'); }
  }

  // ---------- home ----------

  var homeRefs = {};

  function renderHome() {
    homeRefs = {};
    var list = activeHabits();
    var listEl = document.getElementById('habitList');
    var emptyEl = document.getElementById('emptyState');
    var totalStrip = document.getElementById('totalStrip');
    listEl.innerHTML = '';

    if (list.length === 0) {
      emptyEl.classList.remove('hidden');
      totalStrip.classList.add('hidden');
      return;
    }
    emptyEl.classList.add('hidden');
    totalStrip.classList.remove('hidden');
    document.getElementById('totalDaysNum').textContent = totalCleanDays();

    list.forEach(function (habit) {
      var card = el('button', 'habit-card');
      card.type = 'button';

      var top = el('div', 'habit-card-top');
      var nameRow = el('div', 'habit-name-row');
      if (habit.emoji) nameRow.appendChild(makeIconEl(habit.emoji, 'habit-emoji'));
      nameRow.appendChild(document.createTextNode(habit.name));
      top.appendChild(nameRow);
      var bestEl = el('span', 'habit-best', 'best ' + formatDays(bestStreakMs(habit)) + 'd');
      top.appendChild(bestEl);
      card.appendChild(top);

      var streakRow = el('div', 'habit-streak-row');
      var parts = formatStreak(currentStreakMs(habit), true);
      var numEl = el('span', 'habit-streak-num', String(parts.value));
      var unitEl = el('span', 'habit-streak-unit', parts.unit + ' clean');
      streakRow.appendChild(numEl);
      streakRow.appendChild(unitEl);
      card.appendChild(streakRow);

      card.addEventListener('click', function () { goToScreen('detail', habit.id); });

      listEl.appendChild(card);
      homeRefs[habit.id] = { numEl: numEl, unitEl: unitEl, bestEl: bestEl };
    });
  }

  function totalCleanDays() {
    var totalMs = 0;
    activeHabits().forEach(function (h) { totalMs += currentStreakMs(h); });
    return Math.floor(totalMs / 86400000);
  }

  // ---------- detail ----------

  var detailRefs = null;

  function renderDetail(habitId) {
    var habit = findHabit(habitId);
    if (!habit) { goToScreen('home'); return; }

    document.getElementById('detailName').innerHTML = '';
    var nameHost = document.getElementById('detailName');
    if (habit.emoji) nameHost.appendChild(makeIconEl(habit.emoji, 'habit-emoji'));
    nameHost.appendChild(document.createTextNode(habit.name));

    var cur = currentStreakMs(habit);
    var parts = formatStreak(cur, false);
    document.getElementById('detailStreakNum').textContent = parts.value;
    document.getElementById('detailStreakUnit').textContent = parts.unit;
    var startLabel = habit.lastRelapseAt ? 'Since last relapse: ' : 'Tracking since: ';
    document.getElementById('detailSince').textContent = startLabel + formatDateTime(habit.lastRelapseAt || habit.createdAt);

    document.getElementById('detailBest').textContent = formatDays(bestStreakMs(habit));
    document.getElementById('detailRelapseCount').textContent = habit.relapses.length;

    detailRefs = {
      habitId: habitId,
      numEl: document.getElementById('detailStreakNum'),
      unitEl: document.getElementById('detailStreakUnit'),
      bestEl: document.getElementById('detailBest')
    };

    renderHeatmap(habit);
    renderHistory(habit);
  }

  function renderHeatmap(habit) {
    var host = document.getElementById('heatmap');
    host.innerHTML = '';
    var days = 90;
    var relapseDays = {};
    habit.relapses.forEach(function (ts) {
      var key = new Date(ts).toDateString();
      relapseDays[key] = true;
    });
    var today = new Date();
    for (var i = days - 1; i >= 0; i--) {
      var d = new Date(today);
      d.setDate(d.getDate() - i);
      var cell = el('div', 'heat-cell');
      if (d.getTime() < new Date(habit.createdAt).setHours(0, 0, 0, 0)) {
        cell.style.opacity = '0.35';
      }
      if (relapseDays[d.toDateString()]) {
        cell.setAttribute('data-level', '3');
      }
      host.appendChild(cell);
    }
  }

  function renderHistory(habit) {
    var host = document.getElementById('historyList');
    host.innerHTML = '';
    if (habit.relapses.length === 0) {
      host.appendChild(el('div', 'history-empty', 'No relapses logged yet.'));
      return;
    }
    var sorted = habit.relapses.slice().sort(function (a, b) { return b - a; });
    sorted.forEach(function (ts) {
      var row = el('div', 'history-row');
      var left = el('span', '');
      left.appendChild(el('span', 'history-date', formatDateShort(ts) + ' '));
      left.appendChild(el('span', 'history-ago', relativeAgo(ts)));
      row.appendChild(left);
      var rm = el('button', 'history-remove', 'Remove');
      rm.addEventListener('click', function () {
        openConfirm('Remove this entry?', 'This removes it from the relapse history and may change your current streak.', function () {
          removeRelapseEntry(habit.id, ts);
          closeConfirm();
        });
      });
      row.appendChild(rm);
      host.appendChild(row);
    });
  }

  // ---------- overview ----------

  function renderOverview() {
    document.getElementById('overviewTotalNum').textContent = totalCleanDays();
    var host = document.getElementById('overviewList');
    host.innerHTML = '';

    var list = activeHabits();
    list.forEach(function (habit) {
      var row = el('div', 'overview-row');
      var name = el('div', 'overview-row-name');
      if (habit.emoji) {
        var ovIcon = makeIconEl(habit.emoji, 'habit-emoji');
        ovIcon.style.marginRight = '0.4em';
        name.appendChild(ovIcon);
      }
      name.appendChild(document.createTextNode(habit.name));
      var num = el('div', 'overview-row-num', formatDays(currentStreakMs(habit)) + 'd current · ' + habit.relapses.length + ' relapses');
      row.appendChild(name);
      row.appendChild(num);
      row.style.cursor = 'pointer';
      row.addEventListener('click', function () { goToScreen('detail', habit.id); });
      host.appendChild(row);
    });

    var archived = data.habits.filter(function (h) { return h.archived; });
    if (archived.length) {
      var heading = el('div', 'detail-section', '');
      heading.style.paddingBottom = '0';
      var h2 = el('h2', '', 'Archived');
      heading.appendChild(h2);
      host.appendChild(heading);
      archived.forEach(function (habit) {
        var row = el('div', 'overview-row');
        var archName = el('div', 'overview-row-name');
        if (habit.emoji) {
          var archIcon = makeIconEl(habit.emoji, 'habit-emoji');
          archIcon.style.marginRight = '0.4em';
          archName.appendChild(archIcon);
        }
        archName.appendChild(document.createTextNode(habit.name));
        row.appendChild(archName);
        var restoreBtn = el('button', 'btn', 'Restore');
        restoreBtn.style.padding = '0.4rem 0.7rem';
        restoreBtn.style.fontSize = '0.85rem';
        restoreBtn.addEventListener('click', function () {
          habit.archived = false;
          saveData();
          renderOverview();
        });
        row.appendChild(restoreBtn);
        host.appendChild(row);
      });
    }

    if (list.length === 0 && archived.length === 0) {
      host.appendChild(el('div', 'history-empty', 'No habits yet.'));
    }
  }

  // ---------- habit sheet (add/edit) ----------

  function openHabitSheet(habitId) {
    state.editingHabitId = habitId || null;
    var habit = habitId ? findHabit(habitId) : null;
    document.getElementById('habitSheetTitle').textContent = habit ? 'Edit habit' : 'Add a habit';
    document.getElementById('habitNameInput').value = habit ? habit.name : '';
    state.selectedEmoji = habit ? (habit.emoji || '') : '';
    renderEmojiGrid();
    document.getElementById('habitSheet').classList.remove('hidden');
    setTimeout(function () { document.getElementById('habitNameInput').focus(); }, 50);
  }

  function closeHabitSheet() {
    document.getElementById('habitSheet').classList.add('hidden');
  }

  function renderEmojiGrid() {
    var grid = document.getElementById('emojiGrid');
    grid.innerHTML = '';
    ICON_OPTIONS.forEach(function (em) {
      var opt = el('button', 'emoji-opt');
      opt.type = 'button';
      if (!em) {
        opt.classList.add('emoji-opt-blank');
        opt.textContent = '—';
      } else {
        opt.innerHTML = iconMarkup(em) || '';
      }
      if (em === state.selectedEmoji) opt.classList.add('selected');
      opt.addEventListener('click', function () {
        state.selectedEmoji = em;
        renderEmojiGrid();
      });
      grid.appendChild(opt);
    });
  }

  function saveHabitSheet() {
    var name = document.getElementById('habitNameInput').value.trim();
    if (!name) {
      document.getElementById('habitNameInput').focus();
      return;
    }
    if (state.editingHabitId) {
      var habit = findHabit(state.editingHabitId);
      habit.name = name;
      habit.emoji = state.selectedEmoji;
      saveData();
      closeHabitSheet();
      goToScreen('detail', habit.id);
    } else {
      var newHabit = {
        id: uid(),
        name: name,
        emoji: state.selectedEmoji,
        createdAt: Date.now(),
        lastRelapseAt: null,
        relapses: [],
        archived: false,
        milestonesHit: []
      };
      data.habits.push(newHabit);
      saveData();
      closeHabitSheet();
      goToScreen('home');
    }
  }

  // ---------- relapse / streak actions ----------

  // Marks milestones already passed by the current streak as "hit" without
  // celebrating them, so a fresh or backdated streak doesn't flood past
  // milestones, but future ones (e.g. re-reaching 1 week after a relapse)
  // still trigger a celebration normally.
  function resyncMilestonesHit(habit) {
    var cur = currentStreakMs(habit);
    habit.milestonesHit = MILESTONES.filter(function (m) { return cur >= m.ms; }).map(function (m) { return m.key; });
  }

  function logRelapse(habitId) {
    var habit = findHabit(habitId);
    if (!habit) return;
    habit.lastRelapseAt = Date.now();
    habit.relapses.push(habit.lastRelapseAt);
    resyncMilestonesHit(habit);
    saveData();
    if (state.screen === 'detail') renderDetail(habitId);
    else renderHome();
  }

  // Corrects the CURRENT streak's start time. If a relapse is already on
  // record, this replaces that entry rather than adding a new one — editing
  // the date/time twice should not double-count as two relapses.
  function setLastRelapseAt(habitId, timestamp) {
    var habit = findHabit(habitId);
    if (!habit) return;
    if (habit.relapses.length > 0) {
      var maxIdx = 0;
      for (var i = 1; i < habit.relapses.length; i++) {
        if (habit.relapses[i] > habit.relapses[maxIdx]) maxIdx = i;
      }
      habit.relapses[maxIdx] = timestamp;
    }
    habit.lastRelapseAt = timestamp;
    resyncMilestonesHit(habit);
    saveData();
    if (state.screen === 'detail') renderDetail(habitId);
    else renderHome();
  }

  function removeRelapseEntry(habitId, timestamp) {
    var habit = findHabit(habitId);
    if (!habit) return;
    var idx = habit.relapses.indexOf(timestamp);
    if (idx === -1) return;
    habit.relapses.splice(idx, 1);
    habit.lastRelapseAt = habit.relapses.length ? Math.max.apply(null, habit.relapses) : null;
    resyncMilestonesHit(habit);
    saveData();
    renderDetail(habitId);
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function openLastRelapseSheet(habitId) {
    var habit = findHabit(habitId);
    if (!habit) return;
    var base = new Date(habit.lastRelapseAt || habit.createdAt);
    document.getElementById('lastRelapseDate').value =
      base.getFullYear() + '-' + pad2(base.getMonth() + 1) + '-' + pad2(base.getDate());
    document.getElementById('lastRelapseTime').value =
      pad2(base.getHours()) + ':' + pad2(base.getMinutes());
    var now = new Date();
    document.getElementById('lastRelapseDate').max =
      now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate());
    document.getElementById('lastRelapseError').textContent = '';
    document.getElementById('lastRelapseSheet').classList.remove('hidden');
  }

  function closeLastRelapseSheet() {
    document.getElementById('lastRelapseSheet').classList.add('hidden');
  }

  function saveLastRelapseSheet() {
    var dateVal = document.getElementById('lastRelapseDate').value;
    var timeVal = document.getElementById('lastRelapseTime').value || '00:00';
    var errEl = document.getElementById('lastRelapseError');
    if (!dateVal) {
      errEl.textContent = 'Enter a date.';
      return;
    }
    var parts = dateVal.split('-');
    var timeParts = timeVal.split(':');
    var d = new Date(
      parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10),
      parseInt(timeParts[0], 10), parseInt(timeParts[1], 10)
    );
    var ts = d.getTime();
    if (isNaN(ts)) {
      errEl.textContent = "That date/time doesn't look right.";
      return;
    }
    if (ts > Date.now()) {
      errEl.textContent = "That's in the future — pick a time up to now.";
      return;
    }
    setLastRelapseAt(state.currentHabitId, ts);
    closeLastRelapseSheet();
  }

  // ---------- confirm sheet ----------

  function openConfirm(title, text, onConfirm) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmText').textContent = text;
    state.confirmCallback = onConfirm;
    document.getElementById('confirmSheet').classList.remove('hidden');
  }

  function closeConfirm() {
    document.getElementById('confirmSheet').classList.add('hidden');
    state.confirmCallback = null;
  }

  function closeAllSheets() {
    document.getElementById('habitSheet').classList.add('hidden');
    document.getElementById('confirmSheet').classList.add('hidden');
    document.getElementById('activitiesSheet').classList.add('hidden');
    document.getElementById('milestoneBackdrop').classList.add('hidden');
    document.getElementById('lastRelapseSheet').classList.add('hidden');
    document.getElementById('backupSheet').classList.add('hidden');
    document.getElementById('changePinSheet').classList.add('hidden');
  }

  // ---------- trigger flow ----------

  var lastTriggerText = null;

  function pickActivity() {
    var pool = activeActivities();
    if (pool.length === 0) return FALLBACK_ACTIVITY;
    if (pool.length === 1) return pool[0];
    var choice;
    do {
      choice = pool[Math.floor(Math.random() * pool.length)];
    } while (choice === lastTriggerText);
    return choice;
  }

  function openTrigger() {
    lastTriggerText = null;
    var text = pickActivity();
    lastTriggerText = text;
    document.getElementById('triggerText').textContent = text;
    goToScreen('trigger');
  }

  function rerollTrigger() {
    var card = document.getElementById('triggerCard');
    card.classList.remove('flipping');
    void card.offsetWidth;
    card.classList.add('flipping');
    var text = pickActivity();
    lastTriggerText = text;
    setTimeout(function () {
      document.getElementById('triggerText').textContent = text;
    }, 250);
  }

  // ---------- milestones ----------

  function checkMilestones() {
    data.habits.forEach(function (habit) {
      if (habit.archived) return;
      var cur = currentStreakMs(habit);
      habit.milestonesHit = habit.milestonesHit || [];
      MILESTONES.forEach(function (m) {
        if (cur >= m.ms && habit.milestonesHit.indexOf(m.key) === -1) {
          habit.milestonesHit.push(m.key);
          state.milestoneQueue.push({ habitName: habit.name, title: m.title });
        }
      });
    });
    if (state.milestoneQueue.length) {
      saveData();
      maybeShowMilestone();
    }
  }

  var milestoneShowing = false;

  function maybeShowMilestone() {
    if (milestoneShowing || state.milestoneQueue.length === 0) return;
    milestoneShowing = true;
    var next = state.milestoneQueue.shift();
    document.getElementById('milestoneHabitName').textContent = next.habitName;
    document.getElementById('milestoneTitle').textContent = next.title;
    document.getElementById('milestoneBackdrop').classList.remove('hidden');
  }

  function closeMilestone() {
    document.getElementById('milestoneBackdrop').classList.add('hidden');
    milestoneShowing = false;
    if (state.milestoneQueue.length) setTimeout(maybeShowMilestone, 250);
  }

  // ---------- activities sheet ----------

  function openActivities() {
    renderActivityList();
    document.getElementById('activitiesSheet').classList.remove('hidden');
  }

  function renderActivityList() {
    var host = document.getElementById('activityListEl');
    host.innerHTML = '';
    var defaults = DEFAULT_ACTIVITIES.filter(function (a) { return data.removedDefaults.indexOf(a) === -1; });
    defaults.forEach(function (a) {
      var row = el('div', 'activity-row');
      row.appendChild(el('span', '', a));
      var rm = el('button', 'activity-remove', 'Remove');
      rm.addEventListener('click', function () {
        data.removedDefaults.push(a);
        saveData();
        renderActivityList();
      });
      row.appendChild(rm);
      host.appendChild(row);
    });
    data.customActivities.forEach(function (a, idx) {
      var row = el('div', 'activity-row');
      row.appendChild(el('span', '', a));
      var rm = el('button', 'activity-remove', 'Remove');
      rm.addEventListener('click', function () {
        data.customActivities.splice(idx, 1);
        saveData();
        renderActivityList();
      });
      row.appendChild(rm);
      host.appendChild(row);
    });
  }

  function addCustomActivity() {
    var input = document.getElementById('newActivityInput');
    var val = input.value.trim();
    if (!val) return;
    data.customActivities.push(val);
    saveData();
    input.value = '';
    renderActivityList();
  }

  // ---------- backup & restore ----------

  function openBackupSheet() {
    document.getElementById('backupExportArea').value = JSON.stringify(data, null, 2);
    document.getElementById('backupImportArea').value = '';
    document.getElementById('backupImportError').textContent = '';
    document.getElementById('backupCopyStatus').textContent = '';
    document.getElementById('backupSheet').classList.remove('hidden');
  }

  function closeBackupSheet() {
    document.getElementById('backupSheet').classList.add('hidden');
  }

  function copyBackupText() {
    var textarea = document.getElementById('backupExportArea');
    var statusEl = document.getElementById('backupCopyStatus');
    function showCopied() { statusEl.textContent = 'Copied.'; }
    function showFailed() { statusEl.textContent = "Couldn't copy automatically — tap the box and copy manually."; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textarea.value).then(showCopied, function () {
        textarea.select();
        try {
          document.execCommand('copy') ? showCopied() : showFailed();
        } catch (e) {
          showFailed();
        }
      });
    } else {
      textarea.select();
      try {
        document.execCommand('copy') ? showCopied() : showFailed();
      } catch (e) {
        showFailed();
      }
    }
  }

  function restoreBackup() {
    var errEl = document.getElementById('backupImportError');
    var raw = document.getElementById('backupImportArea').value.trim();
    if (!raw) {
      errEl.textContent = 'Paste your backup text first.';
      return;
    }
    var parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      errEl.textContent = "That doesn't look like valid backup text.";
      return;
    }
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.habits)) {
      errEl.textContent = "That doesn't look like a valid backup.";
      return;
    }
    errEl.textContent = '';
    openConfirm(
      'Restore this backup?',
      'This replaces everything currently on this device — all habits, streaks, and history — with what is in the pasted backup. This cannot be undone.',
      function () {
        data = normalizeData(parsed);
        saveData();
        closeConfirm();
        closeBackupSheet();
        location.reload();
      }
    );
  }

  // ---------- live tick ----------

  function tick() {
    if (!state.unlocked) return;

    if (state.screen === 'home') {
      Object.keys(homeRefs).forEach(function (id) {
        var habit = findHabit(id);
        if (!habit) return;
        var ref = homeRefs[id];
        var parts = formatStreak(currentStreakMs(habit), true);
        ref.numEl.textContent = parts.value;
        ref.unitEl.textContent = parts.unit + ' clean';
        ref.bestEl.textContent = 'best ' + formatDays(bestStreakMs(habit)) + 'd';
      });
      document.getElementById('totalDaysNum').textContent = totalCleanDays();
    } else if (state.screen === 'detail' && detailRefs) {
      var h = findHabit(detailRefs.habitId);
      if (h) {
        var p = formatStreak(currentStreakMs(h), false);
        detailRefs.numEl.textContent = p.value;
        detailRefs.unitEl.textContent = p.unit;
        detailRefs.bestEl.textContent = formatDays(bestStreakMs(h));
      }
    }

    checkMilestones();
  }

  setInterval(tick, 20000);

  // ---------- wiring ----------

  function wire() {
    // lock pin pad
    document.querySelectorAll('#lockScreen .pin-key[data-digit]').forEach(function (btn) {
      btn.addEventListener('click', function () { handlePinDigit('lock', btn.getAttribute('data-digit')); });
    });
    document.querySelector('#lockScreen .pin-key[data-action="back"]').addEventListener('click', function () {
      handlePinBack('lock');
    });

    // setup pin pad
    document.querySelectorAll('#setupScreen .pin-key[data-digit]').forEach(function (btn) {
      btn.addEventListener('click', function () { handlePinDigit('setup', btn.getAttribute('data-digit')); });
    });
    document.querySelector('#setupScreen .pin-key[data-action="back"]').addEventListener('click', function () {
      handlePinBack('setup');
    });

    // change PIN pad
    document.querySelectorAll('#changePinSheet .pin-key[data-digit]').forEach(function (btn) {
      btn.addEventListener('click', function () { handlePinDigit('changePin', btn.getAttribute('data-digit')); });
    });
    document.querySelector('#changePinSheet .pin-key[data-action="back"]').addEventListener('click', function () {
      handlePinBack('changePin');
    });
    document.getElementById('changePinBtn').addEventListener('click', openChangePinSheet);
    document.getElementById('changePinCancel').addEventListener('click', closeChangePinSheet);

    document.getElementById('forgotPinBtn').addEventListener('click', function () {
      openConfirm(
        'Reset the app?',
        "This wipes all habits, streaks, and history stored on this device. There's no way to undo this. Only do this if you've forgotten your PIN.",
        function () {
          localStorage.removeItem(STORAGE_KEY);
          data = freshData();
          closeConfirm();
          initLockFlow();
        }
      );
    });

    // home
    document.getElementById('addHabitFab').addEventListener('click', function () { openHabitSheet(null); });
    document.getElementById('emptyAddBtn').addEventListener('click', function () { openHabitSheet(null); });
    document.getElementById('overviewBtn').addEventListener('click', function () { goToScreen('overview'); });
    document.getElementById('lockNowBtn').addEventListener('click', relock);

    // detail
    document.getElementById('detailBackBtn').addEventListener('click', function () { goToScreen('home'); });
    document.getElementById('detailEditBtn').addEventListener('click', function () { openHabitSheet(state.currentHabitId); });
    document.getElementById('logRelapseBtn').addEventListener('click', function () { logRelapse(state.currentHabitId); });
    document.getElementById('setLastTimeBtn').addEventListener('click', function () { openLastRelapseSheet(state.currentHabitId); });
    document.getElementById('lastRelapseCancel').addEventListener('click', closeLastRelapseSheet);
    document.getElementById('lastRelapseSave').addEventListener('click', saveLastRelapseSheet);
    document.getElementById('triggerBtn').addEventListener('click', openTrigger);
    document.getElementById('archiveBtn').addEventListener('click', function () {
      var habit = findHabit(state.currentHabitId);
      openConfirm('Archive this habit?', 'It will be hidden from your list but the history stays saved. You can restore it later from Overview.', function () {
        habit.archived = true;
        saveData();
        closeConfirm();
        goToScreen('home');
      });
    });
    document.getElementById('deleteBtn').addEventListener('click', function () {
      openConfirm('Delete this habit?', 'This permanently removes it and all its history. This cannot be undone.', function () {
        data.habits = data.habits.filter(function (h) { return h.id !== state.currentHabitId; });
        saveData();
        closeConfirm();
        goToScreen('home');
      });
    });

    // overview
    document.getElementById('overviewBackBtn').addEventListener('click', function () { goToScreen('home'); });
    document.getElementById('activitiesBtn').addEventListener('click', openActivities);
    document.getElementById('backupBtn').addEventListener('click', openBackupSheet);
    document.getElementById('backupCloseBtn').addEventListener('click', closeBackupSheet);
    document.getElementById('backupCopyBtn').addEventListener('click', copyBackupText);
    document.getElementById('backupRestoreBtn').addEventListener('click', restoreBackup);

    // habit sheet
    document.getElementById('habitSheetCancel').addEventListener('click', closeHabitSheet);
    document.getElementById('habitSheetSave').addEventListener('click', saveHabitSheet);

    // confirm sheet
    document.getElementById('confirmCancel').addEventListener('click', closeConfirm);
    document.getElementById('confirmOk').addEventListener('click', function () {
      if (state.confirmCallback) state.confirmCallback();
    });

    // trigger
    document.getElementById('triggerRerollBtn').addEventListener('click', rerollTrigger);
    document.getElementById('triggerOkayBtn').addEventListener('click', function () { goToScreen(state.currentHabitId ? 'detail' : 'home'); });
    document.getElementById('triggerCloseBtn').addEventListener('click', function () { goToScreen(state.currentHabitId ? 'detail' : 'home'); });

    // milestone
    document.getElementById('milestoneOkBtn').addEventListener('click', closeMilestone);

    // activities
    document.getElementById('activitiesDoneBtn').addEventListener('click', function () {
      document.getElementById('activitiesSheet').classList.add('hidden');
    });
    document.getElementById('addActivityBtn').addEventListener('click', addCustomActivity);
    document.getElementById('newActivityInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') addCustomActivity();
    });

    // physical keyboard support for pin entry (desktop testing convenience)
    document.addEventListener('keydown', function (e) {
      var kind = null;
      if (state.screen === 'lock') kind = 'lock';
      else if (state.screen === 'setup') kind = 'setup';
      if (!kind) return;
      if (/^[0-9]$/.test(e.key)) handlePinDigit(kind, e.key);
      else if (e.key === 'Backspace') handlePinBack(kind);
    });
  }

  wire();
  initLockFlow();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(function (reg) {
        if (reg && reg.update) reg.update();
      }).catch(function () {});
    });
  }
})();
