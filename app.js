(function () {
  'use strict';

  var STORAGE_KEY = 'ledger.v1';
  var PIN_SALT = 'ledger-app-salt-v1';
  var APP_VERSION = '2.0';

  var PIN_MAX_FAILS = 5;
  var PIN_COOLDOWN_MS = 30000;

  var DAY = 86400000;
  var HOUR = 3600000;
  var MINUTE = 60000;

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

  var ICON_OPTIONS = ['', 'quit', 'cigarette', 'phone', 'food', 'drink', 'dice', 'controller', 'moon', 'sugar', 'pill', 'bag', 'clock', 'coffee', 'flame', 'leaf', 'cart', 'tv', 'cards', 'eye', 'heart'];

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
    flame: '<path d="M12 2c1 3-2 4-2 7a4 4 0 108 0c0-2-1-3-2-4 1 3-1 4-2 4-1.5 0-2-2-2-3 0-2 1-3 0-4z"/>',
    leaf: '<path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16z"/><path d="M4 20L14 10"/>',
    cart: '<path d="M3 4h2l2.5 11h10l2-8H6.5"/><circle cx="9" cy="19" r="1.4"/><circle cx="16" cy="19" r="1.4"/>',
    tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/>',
    cards: '<rect x="3" y="6" width="11" height="15" rx="1.5" transform="rotate(-8 8.5 13.5)"/><rect x="10" y="4" width="11" height="15" rx="1.5" transform="rotate(8 15.5 11.5)"/>',
    eye: '<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>',
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z"/>'
  };

  function iconMarkup(key) {
    var inner = ICON_SVGS[key];
    if (!inner) return null;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
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
    { key: '1d', ms: 1 * DAY, title: '1 day clean' },
    { key: '3d', ms: 3 * DAY, title: '3 days clean' },
    { key: '1w', ms: 7 * DAY, title: '1 week clean' },
    { key: '2w', ms: 14 * DAY, title: '2 weeks clean' },
    { key: '1mo', ms: 30 * DAY, title: '1 month clean' },
    { key: '3mo', ms: 91 * DAY, title: '3 months clean' },
    { key: '6mo', ms: 182 * DAY, title: '6 months clean' },
    { key: '1y', ms: 365 * DAY, title: '1 year clean' }
  ];

  // Every quote below is checked against a primary source. Where the popular
  // version is a paraphrase, the attribution says so.
  var QUOTES = [
    { text: 'Fall seven times, stand up eight.', author: 'Japanese proverb' },
    { text: 'I’ve failed over and over and over again in my life. And that is why I succeed.', author: 'Michael Jordan' },
    { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
    { text: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius, Meditations 5.20' },
    { text: 'Waste no more time arguing about what a good man should be. Be one.', author: 'Marcus Aurelius, Meditations 10.16' },
    { text: 'Turn your wounds into wisdom.', author: 'Oprah Winfrey' },
    { text: 'You cannot swim for new horizons until you have courage to lose sight of the shore.', author: 'William Faulkner' },
    { text: 'Strength does not come from winning. Your struggles develop your strengths.', author: 'Arnold Schwarzenegger' },
    { text: 'Whether you think you can or you think you can’t, you’re right.', author: 'Henry Ford' },
    { text: 'Ever tried. Ever failed. No matter. Try again. Fail again. Fail better.', author: 'Samuel Beckett, Worstward Ho' },
    { text: 'When we are no longer able to change a situation, we are challenged to change ourselves.', author: 'Viktor Frankl, Man’s Search for Meaning' },
    { text: 'A journey of a thousand miles begins with a single step.', author: 'Laozi, Tao Te Ching' },
    { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Will Durant, on Aristotle' },
    { text: 'How we spend our days is, of course, how we spend our lives.', author: 'Annie Dillard, The Writing Life' },
    { text: 'Dripping water hollows out stone, not through force but through persistence.', author: 'Ovid, Epistulae ex Ponto' },
    { text: 'If there is no struggle, there is no progress.', author: 'Frederick Douglass' },
    { text: 'You may not control all the events that happen to you, but you can decide not to be reduced by them.', author: 'Maya Angelou, Letter to My Daughter' },
    { text: 'Not everything that is faced can be changed, but nothing can be changed until it is faced.', author: 'James Baldwin' },
    { text: 'Almost everything will work again if you unplug it for a few minutes, including you.', author: 'Anne Lamott' },
    { text: 'No man is free who is not master of himself.', author: 'Epictetus' },
    { text: 'We suffer more often in imagination than in reality.', author: 'Seneca, Letters to Lucilius' }
  ];

  function todaysQuote() {
    var now = new Date();
    var start = new Date(now.getFullYear(), 0, 0);
    var dayOfYear = Math.floor((now - start) / DAY);
    return QUOTES[dayOfYear % QUOTES.length];
  }

  // ---------- storage ----------

  function freshData() {
    return {
      pinHash: null,
      pinFails: 0,
      pinLockedUntil: 0,
      onboarded: false,
      habits: [],
      customActivities: [],
      removedDefaults: [],
      viewMode: 'list'
    };
  }

  function normalizeCustomMilestone(m) {
    return { id: m.id || uid(), days: m.days, label: typeof m.label === 'string' ? m.label : '' };
  }

  function normalizeHabit(h) {
    return {
      id: h.id || uid(),
      name: h.name || 'Habit',
      emoji: h.emoji || '',
      why: typeof h.why === 'string' ? h.why : '',
      createdAt: typeof h.createdAt === 'number' ? h.createdAt : Date.now(),
      lastRelapseAt: typeof h.lastRelapseAt === 'number' ? h.lastRelapseAt : null,
      relapses: Array.isArray(h.relapses) ? h.relapses.filter(function (t) { return typeof t === 'number'; }) : [],
      archived: !!h.archived,
      milestonesHit: Array.isArray(h.milestonesHit) ? h.milestonesHit : [],
      customMilestones: Array.isArray(h.customMilestones) ? h.customMilestones.filter(function (m) { return m && typeof m.days === 'number' && m.days > 0; }).map(normalizeCustomMilestone) : []
    };
  }

  function normalizeData(parsed) {
    if (!parsed || typeof parsed !== 'object') return freshData();
    var habits = Array.isArray(parsed.habits) ? parsed.habits.map(normalizeHabit) : [];
    return {
      pinHash: typeof parsed.pinHash === 'string' ? parsed.pinHash : null,
      pinFails: typeof parsed.pinFails === 'number' ? parsed.pinFails : 0,
      pinLockedUntil: typeof parsed.pinLockedUntil === 'number' ? parsed.pinLockedUntil : 0,
      // Anyone with existing habits has already been through the first run.
      onboarded: parsed.onboarded === true || habits.length > 0,
      habits: habits,
      customActivities: Array.isArray(parsed.customActivities) ? parsed.customActivities.filter(function (a) { return typeof a === 'string'; }) : [],
      removedDefaults: Array.isArray(parsed.removedDefaults) ? parsed.removedDefaults.filter(function (a) { return typeof a === 'string'; }) : [],
      viewMode: parsed.viewMode === 'grid' ? 'grid' : 'list'
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

  function $(id) { return document.getElementById(id); }

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

  function streakStart(habit) {
    return habit.lastRelapseAt || habit.createdAt;
  }

  function currentStreakMs(habit) {
    return Math.max(0, Date.now() - streakStart(habit));
  }

  // Completed streak segments, oldest first: [{start, end, ms}]
  function completedSegments(habit) {
    var sorted = habit.relapses.slice().sort(function (a, b) { return a - b; });
    var points = [Math.min(habit.createdAt, sorted.length ? sorted[0] : habit.createdAt)].concat(sorted);
    var segs = [];
    for (var i = 1; i < points.length; i++) {
      segs.push({ start: points[i - 1], end: points[i], ms: Math.max(0, points[i] - points[i - 1]) });
    }
    return segs;
  }

  function bestStreakMs(habit) {
    var best = 0;
    completedSegments(habit).forEach(function (s) { if (s.ms > best) best = s.ms; });
    var cur = currentStreakMs(habit);
    if (cur > best) best = cur;
    return best;
  }

  function averageStreakMs(habit) {
    var segs = completedSegments(habit);
    if (!segs.length) return null;
    var total = 0;
    segs.forEach(function (s) { total += s.ms; });
    return total / segs.length;
  }

  function formatStreak(ms, short) {
    var totalMinutes = Math.floor(ms / MINUTE);
    var totalHours = Math.floor(ms / HOUR);
    var totalDays = Math.floor(ms / DAY);
    if (totalDays >= 1) return { value: totalDays, unit: short ? (totalDays === 1 ? 'day' : 'days') : (totalDays === 1 ? 'day clean' : 'days clean') };
    if (totalHours >= 1) return { value: totalHours, unit: short ? (totalHours === 1 ? 'hour' : 'hours') : (totalHours === 1 ? 'hour clean' : 'hours clean') };
    var m = Math.max(0, totalMinutes);
    return { value: m, unit: short ? (m === 1 ? 'minute' : 'minutes') : (m === 1 ? 'minute clean' : 'minutes clean') };
  }

  // "2 days", "5 hours", "12 minutes", "under a minute"
  function formatDuration(ms) {
    if (ms >= DAY) { var d = Math.floor(ms / DAY); return d + (d === 1 ? ' day' : ' days'); }
    if (ms >= HOUR) { var h = Math.floor(ms / HOUR); return h + (h === 1 ? ' hour' : ' hours'); }
    var m = Math.floor(ms / MINUTE);
    if (m < 1) return 'under a minute';
    return m + (m === 1 ? ' minute' : ' minutes');
  }

  // Whole days once past a day; hours or minutes before that.
  function figureParts(ms) {
    if (ms >= DAY) { var d = Math.floor(ms / DAY); return { value: String(d), unit: d === 1 ? 'day' : 'days' }; }
    if (ms >= HOUR) { var h = Math.floor(ms / HOUR); return { value: String(h), unit: h === 1 ? 'hour' : 'hours' }; }
    var m = Math.max(0, Math.floor(ms / MINUTE));
    return { value: String(m), unit: m === 1 ? 'minute' : 'minutes' };
  }

  function paintFigure(host, ms) {
    var p = figureParts(ms);
    host.innerHTML = '';
    host.appendChild(document.createTextNode(p.value));
    host.appendChild(el('small', '', p.unit));
  }


  function formatDateTime(ms) {
    var d = new Date(ms);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) + ', ' +
      d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  function formatDateShort(ms) {
    var d = new Date(ms);
    var opts = { month: 'short', day: 'numeric' };
    if (d.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
    return d.toLocaleDateString(undefined, opts);
  }

  function formatTimeOnly(ms) {
    return new Date(ms).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }

  function formatDateline(d) {
    return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  }

  function relativeAgo(ms) {
    var diff = Date.now() - ms;
    var days = Math.floor(diff / DAY);
    if (days <= 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 30) return days + ' days ago';
    var months = Math.floor(days / 30);
    if (months === 1) return 'a month ago';
    if (months < 12) return months + ' months ago';
    var years = Math.floor(months / 12);
    return years === 1 ? 'a year ago' : years + ' years ago';
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  function dateInputValue(d) {
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function timeInputValue(d) {
    return pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  function parseDateTimeInputs(dateVal, timeVal) {
    if (!dateVal) return NaN;
    var parts = dateVal.split('-');
    var timeParts = (timeVal || '00:00').split(':');
    var d = new Date(
      parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10),
      parseInt(timeParts[0], 10) || 0, parseInt(timeParts[1], 10) || 0
    );
    return d.getTime();
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function svgEl(tag, attrs) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }

  function useSymbol(id) {
    var svg = svgEl('svg', { viewBox: '0 0 24 24' });
    var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#' + id);
    use.setAttribute('href', '#' + id);
    svg.appendChild(use);
    return svg;
  }

  function plural(n, word) { return n + ' ' + (n === 1 ? word : word + 's'); }

  // ---------- milestones (derived) ----------

  function milestoneDefaultTitle(days) {
    return (days === 1 ? '1 day clean' : days + ' days clean');
  }

  function habitMilestones(habit) {
    return MILESTONES.concat(habit.customMilestones.map(function (m) {
      return { key: 'custom_' + m.id, ms: m.days * DAY, title: m.label || milestoneDefaultTitle(m.days), custom: m };
    })).sort(function (a, b) { return a.ms - b.ms; });
  }

  function nextMilestone(habit) {
    var cur = currentStreakMs(habit);
    var list = habitMilestones(habit);
    for (var i = 0; i < list.length; i++) {
      if (list[i].ms > cur) return list[i];
    }
    return null;
  }

  function prevMilestoneMs(habit, next) {
    var list = habitMilestones(habit);
    var prev = 0;
    for (var i = 0; i < list.length; i++) {
      if (next && list[i].ms >= next.ms) break;
      prev = list[i].ms;
    }
    return prev;
  }

  // Progress from the previous milestone to the next one, 0..1
  function milestoneProgress(habit) {
    var next = nextMilestone(habit);
    if (!next) return { next: null, ratio: 1 };
    var cur = currentStreakMs(habit);
    var prev = prevMilestoneMs(habit, next);
    var ratio = (cur - prev) / (next.ms - prev);
    return { next: next, ratio: Math.max(0, Math.min(1, ratio)) };
  }

  // How many streaks (completed or current) reached this milestone, and when first.
  function milestoneRecord(habit, m) {
    var segs = completedSegments(habit);
    var count = 0;
    var first = null;
    segs.forEach(function (s) {
      if (s.ms >= m.ms) { count++; if (first === null) first = s.start + m.ms; }
    });
    var curStart = streakStart(habit);
    var inCurrent = currentStreakMs(habit) >= m.ms;
    if (inCurrent) { count++; if (first === null) first = curStart + m.ms; }
    return { count: count, first: first, inCurrent: inCurrent };
  }

  // ---------- app state ----------

  var state = {
    screen: 'lock',
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
    milestoneQueue: [],
    calendarOffset: 0,
    relapseMode: null
  };

  var screens = ['lockScreen', 'setupScreen', 'onboardScreen', 'homeScreen', 'detailScreen', 'overviewScreen', 'triggerScreen'];

  function showScreenEl(id, direction) {
    screens.forEach(function (s) {
      var node = $(s);
      var show = s === id;
      node.classList.toggle('hidden', !show);
      if (show) {
        node.classList.remove('screen-push', 'screen-pop');
        if (direction === 'push') node.classList.add('screen-push');
        if (direction === 'pop') node.classList.add('screen-pop');
        // restart the entrance animation
        node.style.animation = 'none';
        void node.offsetWidth;
        node.style.animation = '';
      }
    });
    window.scrollTo(0, 0);
  }

  // ---------- lock / setup ----------

  function initLockFlow() {
    if (!data.pinHash) {
      state.screen = 'setup';
      state.setupStage = 'create';
      state.setupFirstPin = null;
      state.setupBuffer = '';
      $('setupSub').textContent = 'Choose a 4-digit PIN. It locks this app every time you leave it.';
      renderPinDots('setupPinDots', 0);
      $('setupError').textContent = '';
      showScreenEl('setupScreen');
    } else {
      state.screen = 'lock';
      state.unlocked = false;
      state.lockBuffer = '';
      $('lockSub').textContent = 'Enter your PIN';
      renderPinDots('pinDots', 0);
      $('lockError').textContent = '';
      showScreenEl('lockScreen');
      refreshLockout();
    }
  }

  function renderPinDots(containerId, filledCount, errorMode) {
    var dots = $(containerId).children;
    for (var i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('filled', i < filledCount && !errorMode);
      dots[i].classList.toggle('error', !!errorMode && i < 4);
    }
  }

  function shakeDots(containerId) {
    var node = $(containerId);
    node.classList.remove('shake');
    void node.offsetWidth;
    node.classList.add('shake');
  }

  function lockoutRemaining() {
    return Math.max(0, (data.pinLockedUntil || 0) - Date.now());
  }

  var lockoutTimer = null;

  function refreshLockout() {
    clearInterval(lockoutTimer);
    var remaining = lockoutRemaining();
    if (remaining <= 0) {
      if (state.screen === 'lock' && $('lockError').textContent.indexOf('Wait') === 0) $('lockError').textContent = '';
      return;
    }
    function paint() {
      var r = lockoutRemaining();
      if (r <= 0) {
        clearInterval(lockoutTimer);
        $('lockError').textContent = '';
        return;
      }
      $('lockError').textContent = 'Wait ' + Math.ceil(r / 1000) + 's before trying again.';
    }
    paint();
    lockoutTimer = setInterval(paint, 500);
  }

  function handlePinDigit(screenKind, digit) {
    if (screenKind === 'lock') {
      if (lockoutRemaining() > 0) { shakeDots('pinDots'); return; }
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
      $('lockError').textContent = '';
      state.lockBuffer = '';
      if (data.pinFails || data.pinLockedUntil) {
        data.pinFails = 0;
        data.pinLockedUntil = 0;
        saveData();
      }
      unlockApp();
    } else {
      data.pinFails = (data.pinFails || 0) + 1;
      var locked = false;
      if (data.pinFails >= PIN_MAX_FAILS) {
        data.pinLockedUntil = Date.now() + PIN_COOLDOWN_MS;
        locked = true;
      }
      saveData();
      $('lockError').textContent = locked ? '' : "That's not it.";
      renderPinDots('pinDots', 4, true);
      shakeDots('pinDots');
      setTimeout(function () {
        state.lockBuffer = '';
        renderPinDots('pinDots', 0);
        if (locked) refreshLockout();
      }, 450);
    }
  }

  function handleSetupComplete() {
    if (state.setupStage === 'create') {
      state.setupFirstPin = state.setupBuffer;
      state.setupBuffer = '';
      state.setupStage = 'confirm';
      $('setupSub').textContent = 'Enter it once more to confirm.';
      $('setupError').textContent = '';
      renderPinDots('setupPinDots', 0);
    } else {
      if (state.setupBuffer === state.setupFirstPin) {
        data.pinHash = hashPin(state.setupBuffer);
        data.pinFails = 0;
        data.pinLockedUntil = 0;
        saveData();
        state.setupBuffer = '';
        state.setupFirstPin = null;
        unlockApp();
      } else {
        $('setupError').textContent = "Those didn't match. Start again.";
        renderPinDots('setupPinDots', 4, true);
        shakeDots('setupPinDots');
        setTimeout(function () {
          state.setupStage = 'create';
          state.setupFirstPin = null;
          state.setupBuffer = '';
          $('setupSub').textContent = 'Choose a 4-digit PIN. It locks this app every time you leave it.';
          $('setupError').textContent = '';
          renderPinDots('setupPinDots', 0);
        }, 600);
      }
    }
  }

  function openChangePinSheet() {
    state.changePinStage = 'create';
    state.changePinFirst = null;
    state.changePinBuffer = '';
    $('changePinSub').textContent = 'Enter a new 4-digit PIN.';
    $('changePinError').textContent = '';
    renderPinDots('changePinDots', 0);
    openSheet('changePinSheet');
  }

  function handleChangePinComplete() {
    if (state.changePinStage === 'create') {
      state.changePinFirst = state.changePinBuffer;
      state.changePinBuffer = '';
      state.changePinStage = 'confirm';
      $('changePinSub').textContent = 'Enter it once more to confirm.';
      $('changePinError').textContent = '';
      renderPinDots('changePinDots', 0);
    } else {
      if (state.changePinBuffer === state.changePinFirst) {
        data.pinHash = hashPin(state.changePinBuffer);
        data.pinFails = 0;
        data.pinLockedUntil = 0;
        saveData();
        state.changePinBuffer = '';
        state.changePinFirst = null;
        closeSheet('changePinSheet');
        showToast('PIN changed.');
      } else {
        $('changePinError').textContent = "Those didn't match. Start again.";
        renderPinDots('changePinDots', 4, true);
        shakeDots('changePinDots');
        setTimeout(function () {
          state.changePinStage = 'create';
          state.changePinFirst = null;
          state.changePinBuffer = '';
          $('changePinSub').textContent = 'Enter a new 4-digit PIN.';
          $('changePinError').textContent = '';
          renderPinDots('changePinDots', 0);
        }, 600);
      }
    }
  }

  function unlockApp() {
    state.unlocked = true;
    if (!data.onboarded && activeHabits().length === 0) {
      goToScreen('onboard');
      return;
    }
    var target = state.preLockScreen || 'home';
    if (target === 'trigger' || target === 'onboard') target = state.currentHabitId ? 'detail' : 'home';
    if (target === 'detail' && !findHabit(state.currentHabitId)) target = 'home';
    goToScreen(target);
    setTimeout(checkMilestones, 700);
  }

  function relock() {
    if (!state.unlocked) return;
    state.unlocked = false;
    state.preLockScreen = state.screen;
    closeAllSheets();
    stopBreathing();
    clearInterval(triggerTimerHandle);
    hideToast();
    state.lockBuffer = '';
    $('lockSub').textContent = 'Enter your PIN';
    renderPinDots('pinDots', 0);
    $('lockError').textContent = '';
    state.screen = 'lock';
    showScreenEl('lockScreen');
    refreshLockout();
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) relock();
  });

  // ---------- navigation ----------

  function goToScreen(name, habitId, direction) {
    var from = state.screen;
    state.screen = name;
    if (habitId) {
      if (habitId !== state.currentHabitId) state.calendarOffset = 0;
      state.currentHabitId = habitId;
    }
    if (!direction) {
      if (name === 'detail' && from === 'home') direction = 'push';
      else if (name === 'home' && (from === 'detail' || from === 'overview')) direction = 'pop';
      else if (name === 'overview' && from === 'home') direction = 'push';
    }
    if (name === 'home') { renderHome(); showScreenEl('homeScreen', direction); }
    else if (name === 'detail') { renderDetail(state.currentHabitId); showScreenEl('detailScreen', direction); }
    else if (name === 'overview') { renderOverview(); showScreenEl('overviewScreen', direction); }
    else if (name === 'trigger') { showScreenEl('triggerScreen'); }
    else if (name === 'onboard') { $('onboardDate').textContent = formatDateline(new Date()); showScreenEl('onboardScreen'); }
  }

  // ---------- home ----------

  var homeRefs = {};

  function renderHome() {
    homeRefs = {};
    var quote = todaysQuote();
    $('quoteText').textContent = '“' + quote.text + '”';
    $('quoteAuthor').textContent = quote.author;
    $('homeDate').textContent = formatDateline(new Date());

    var list = activeHabits();
    var listEl = $('habitList');
    var emptyEl = $('emptyState');
    listEl.innerHTML = '';
    listEl.classList.toggle('grid-mode', data.viewMode === 'grid');
    $('viewToggleBtn').textContent = data.viewMode === 'grid' ? 'List' : 'Grid';
    $('viewToggleBtn').classList.toggle('hidden', list.length < 2);

    if (list.length === 0) {
      emptyEl.classList.remove('hidden');
      $('homeBottomBar').classList.add('hidden');
      return;
    }
    emptyEl.classList.add('hidden');
    $('homeBottomBar').classList.remove('hidden');

    list.forEach(function (habit, i) {
      var card = el('button', 'habit-card');
      card.type = 'button';
      card.style.setProperty('--i', i);

      var top = el('div', 'habit-card-top');
      var nameRow = el('div', 'habit-name-row');
      if (habit.emoji) nameRow.appendChild(makeIconEl(habit.emoji, 'habit-emoji'));
      nameRow.appendChild(el('span', 'habit-name-text', habit.name));
      top.appendChild(nameRow);
      var bestEl = el('span', 'habit-best eyebrow');
      top.appendChild(bestEl);
      card.appendChild(top);

      var streakRow = el('div', 'habit-streak-row');
      var numEl = el('span', 'habit-streak-num');
      var unitEl = el('span', 'habit-streak-unit');
      streakRow.appendChild(numEl);
      streakRow.appendChild(unitEl);
      card.appendChild(streakRow);

      var prog = el('div', 'habit-progress');
      var track = el('div', 'progress');
      var fill = el('i');
      track.appendChild(fill);
      var nextLabel = el('span', 'next-label');
      prog.appendChild(track);
      prog.appendChild(nextLabel);
      card.appendChild(prog);

      card.addEventListener('click', function () { goToScreen('detail', habit.id); });

      listEl.appendChild(card);
      homeRefs[habit.id] = { numEl: numEl, unitEl: unitEl, bestEl: bestEl, fill: fill, nextLabel: nextLabel };
      paintHomeCard(habit, homeRefs[habit.id]);
      // let the width transition run from 0
      requestAnimationFrame(function () { paintProgress(habit, fill, nextLabel); });
    });
  }

  function paintHomeCard(habit, ref) {
    var parts = formatStreak(currentStreakMs(habit), true);
    ref.numEl.textContent = parts.value;
    ref.unitEl.textContent = parts.unit + ' clean';
    ref.bestEl.innerHTML = '';
    ref.bestEl.appendChild(document.createTextNode('best '));
    ref.bestEl.appendChild(el('b', '', formatDuration(bestStreakMs(habit))));
  }

  function paintProgress(habit, fill, label) {
    var p = milestoneProgress(habit);
    fill.style.width = Math.round(p.ratio * 100) + '%';
    label.innerHTML = '';
    if (!p.next) {
      label.textContent = 'Past every milestone';
      return;
    }
    var remaining = p.next.ms - currentStreakMs(habit);
    label.appendChild(el('b', '', p.next.title.replace(' clean', '')));
    label.appendChild(document.createTextNode(' in ' + formatDuration(remaining)));
  }

  // ---------- detail ----------

  var detailRefs = null;

  function renderDetail(habitId, opts) {
    opts = opts || {};
    var habit = findHabit(habitId);
    if (!habit) { goToScreen('home'); return; }

    var nameHost = $('detailName');
    nameHost.innerHTML = '';
    if (habit.emoji) nameHost.appendChild(makeIconEl(habit.emoji, 'habit-emoji'));
    nameHost.appendChild(document.createTextNode(habit.name));

    var numEl = $('detailStreakNum');
    numEl.classList.remove('is-reset');
    if (opts.reset) { void numEl.offsetWidth; numEl.classList.add('is-reset'); }

    detailRefs = {
      habitId: habitId,
      numEl: numEl,
      unitEl: $('detailStreakUnit'),
      bestEl: $('detailBest'),
      fill: $('detailProgressFill'),
      nextLabel: $('detailNextLabel')
    };
    paintDetailFigures(habit);

    var sinceText = (habit.relapses.length ? 'Since your last relapse, ' : 'Counting since ') + formatDateTime(streakStart(habit));
    $('detailSince').textContent = sinceText;

    $('detailProgressFill').style.width = '0%';
    requestAnimationFrame(function () { paintProgress(habit, detailRefs.fill, detailRefs.nextLabel); });

    renderPatterns(habit);
    renderCalendar(habit);
    renderMilestoneList(habit);
    renderHistory(habit);
  }

  function paintDetailFigures(habit) {
    var parts = formatStreak(currentStreakMs(habit), false);
    detailRefs.numEl.textContent = parts.value;
    detailRefs.unitEl.textContent = parts.unit;

    paintFigure(detailRefs.bestEl, bestStreakMs(habit));

    var avg = averageStreakMs(habit);
    var avgEl = $('detailAvg');
    if (avg === null) {
      avgEl.textContent = '–';
    } else {
      paintFigure(avgEl, avg);
    }

    $('detailRelapseCount').textContent = habit.relapses.length;
    var onLedger = Math.max(1, Math.floor((Date.now() - Math.min(habit.createdAt, streakStart(habit))) / DAY) + 1);
    $('detailTrackingDays').textContent = onLedger;
  }

  // ---------- patterns ----------

  var BANDS = [
    { key: 'morning', label: 'Morning', range: '5–12', test: function (h) { return h >= 5 && h < 12; } },
    { key: 'afternoon', label: 'Afternoon', range: '12–17', test: function (h) { return h >= 12 && h < 17; } },
    { key: 'evening', label: 'Evening', range: '17–22', test: function (h) { return h >= 17 && h < 22; } },
    { key: 'night', label: 'Night', range: '22–5', test: function (h) { return h >= 22 || h < 5; } }
  ];
  var WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function renderPatterns(habit) {
    var body = $('patternsBody');
    var note = $('patternsNote');
    body.innerHTML = '';
    var segs = completedSegments(habit);
    var n = habit.relapses.length;

    if (n < 3) {
      note.textContent = '';
      var msg = n === 0
        ? 'Patterns appear once there are a few entries to compare. Right now there is one streak, and it is this one.'
        : 'Patterns appear after three or so entries. Too early to read anything into ' + (n === 1 ? 'one entry.' : 'two entries.');
      body.appendChild(el('p', 'empty-note', msg));
      // still show the streak bars if there is at least one completed segment
      if (segs.length) body.appendChild(buildStreakChart(habit, segs));
      return;
    }

    note.textContent = plural(n, 'entry').replace('entrys', 'entries');

    // --- summary sentence ---
    var bandCounts = BANDS.map(function (b) { return 0; });
    var dayCounts = [0, 0, 0, 0, 0, 0, 0];
    var weekend = 0;
    habit.relapses.forEach(function (ts) {
      var d = new Date(ts);
      var h = d.getHours();
      BANDS.forEach(function (b, i) { if (b.test(h)) bandCounts[i]++; });
      dayCounts[d.getDay()]++;
      if (d.getDay() === 0 || d.getDay() === 6) weekend++;
    });
    var topBand = 0;
    bandCounts.forEach(function (c, i) { if (c > bandCounts[topBand]) topBand = i; });
    var topDay = 0;
    dayCounts.forEach(function (c, i) { if (c > dayCounts[topDay]) topDay = i; });

    var summary = el('p', 'pattern-summary');
    var bandShare = bandCounts[topBand] / n;
    var frag = document.createDocumentFragment();
    if (bandShare >= 0.4) {
      frag.appendChild(el('b', '', bandCounts[topBand] + ' of ' + n));
      frag.appendChild(document.createTextNode(' happened in the ' + BANDS[topBand].label.toLowerCase() + '. '));
    } else {
      frag.appendChild(document.createTextNode('No single time of day stands out. '));
    }
    var weekendShare = weekend / n;
    if (weekendShare >= 0.6) {
      frag.appendChild(el('b', '', weekend + ' of ' + n));
      frag.appendChild(document.createTextNode(' fell on a weekend.'));
    } else if (weekendShare <= 0.15 && n >= 5) {
      frag.appendChild(document.createTextNode('Almost all of them were on weekdays' + (dayCounts[topDay] >= 2 ? ', ' + WEEKDAYS[topDay] + ' most often.' : '.')));
    } else if (dayCounts[topDay] / n >= 0.4) {
      frag.appendChild(el('b', '', WEEKDAYS[topDay]));
      frag.appendChild(document.createTextNode(' comes up more than any other day.'));
    } else {
      frag.appendChild(document.createTextNode('They are spread across the week.'));
    }

    // trend: compare mean of last 3 completed streaks to the ones before
    if (segs.length >= 4) {
      var recent = segs.slice(-3);
      var earlier = segs.slice(0, -3);
      var mean = function (arr) { var t = 0; arr.forEach(function (s) { t += s.ms; }); return t / arr.length; };
      var r = mean(recent), e = mean(earlier);
      if (r > e * 1.25) frag.appendChild(document.createTextNode(' Your recent streaks are running longer than your early ones.'));
      else if (r < e * 0.75) frag.appendChild(document.createTextNode(' Recent streaks have been shorter than your early ones. Worth noticing, not worth a verdict.'));
    }
    summary.appendChild(frag);
    body.appendChild(summary);

    body.appendChild(buildStreakChart(habit, segs));
    body.appendChild(buildBandChart(bandCounts, n));
    body.appendChild(buildWeekdayChart(dayCounts, n));
  }

  function chartBlock(title, meta) {
    var block = el('div', 'chart-block');
    var head = el('div', 'chart-title');
    head.appendChild(el('span', 'eyebrow', title));
    if (meta) head.appendChild(el('span', 'chart-meta', meta));
    block.appendChild(head);
    return block;
  }

  // Column chart of streak lengths: completed segments + the current one.
  function buildStreakChart(habit, segs) {
    var MAX_BARS = 14;
    var items = segs.map(function (s) { return { ms: s.ms, start: s.start, end: s.end, current: false }; });
    items.push({ ms: currentStreakMs(habit), start: streakStart(habit), end: null, current: true });
    if (items.length > MAX_BARS) items = items.slice(items.length - MAX_BARS);
    var best = bestStreakMs(habit);

    var block = chartBlock('Streak lengths', items.length < segs.length + 1 ? 'last ' + items.length : plural(items.length, 'streak'));

    var W = 320, H = 104, padL = 0, padB = 16, padT = 18;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'chart', role: 'img' });
    svg.setAttribute('aria-label', 'Streak lengths, oldest to newest');
    var innerW = W - padL;
    var slot = innerW / items.length;
    var barW = Math.min(22, slot * 0.62);
    var maxMs = Math.max(best, DAY);
    var plotH = H - padB - padT;

    // baseline
    svg.appendChild(svgEl('line', { x1: 0, x2: W, y1: H - padB + 0.5, y2: H - padB + 0.5, class: 'axis' }));
    // best marker
    if (best > 0) {
      var by = padT + plotH - (best / maxMs) * plotH;
      svg.appendChild(svgEl('line', { x1: 0, x2: W, y1: by + 0.5, y2: by + 0.5, class: 'marker' }));
    }

    var tip = el('div', 'chart-tip');
    items.forEach(function (it, i) {
      var h = Math.max(2, (it.ms / maxMs) * plotH);
      var x = padL + slot * i + (slot - barW) / 2;
      var y = padT + plotH - h;
      var cls = 'bar' + (it.current ? ' is-current' : '') + (!it.current && it.ms === best && best > 0 ? ' is-best' : '');
      var bar = svgEl('path', { d: roundedTopRect(x, y, barW, h, Math.min(4, barW / 2)), class: cls });
      bar.style.setProperty('--i', i);
      svg.appendChild(bar);
      // label the best and the current bar only
      if (it.current || (it.ms === best && best > 0)) {
        var lbl = svgEl('text', { x: x + barW / 2, y: y - 5, 'text-anchor': 'middle', class: 'bar-lbl' + (it.current ? ' strong' : '') });
        lbl.textContent = it.current ? 'now' : 'best';
        svg.appendChild(lbl);
      }
      var hit = svgEl('rect', { x: padL + slot * i, y: 0, width: slot, height: H, class: 'bar-hit' });
      var describe = function () {
        var when = it.current ? 'Current streak, since ' + formatDateShort(it.start) : formatDateShort(it.start) + ' to ' + formatDateShort(it.end);
        tip.textContent = formatDuration(it.ms) + ' · ' + when;
        Array.prototype.forEach.call(svg.querySelectorAll('.bar'), function (b) { b.classList.remove('is-active'); });
        bar.classList.add('is-active');
      };
      hit.addEventListener('mouseenter', describe);
      hit.addEventListener('click', describe);
      svg.appendChild(hit);
    });

    // axis labels: first and last dates
    var first = svgEl('text', { x: 0, y: H - 3 });
    first.textContent = formatDateShort(items[0].start);
    svg.appendChild(first);
    if (items.length > 1) {
      var last = svgEl('text', { x: W, y: H - 3, 'text-anchor': 'end' });
      last.textContent = 'now';
      svg.appendChild(last);
    }

    block.appendChild(svg);
    tip.textContent = 'Dashed line marks your best: ' + formatDuration(best) + '. Tap a bar for details.';
    block.appendChild(tip);
    return block;
  }

  function roundedTopRect(x, y, w, h, r) {
    r = Math.min(r, h);
    return 'M' + x + ' ' + (y + h) +
      ' V' + (y + r) +
      ' Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y +
      ' H' + (x + w - r) +
      ' Q' + (x + w) + ' ' + y + ' ' + (x + w) + ' ' + (y + r) +
      ' V' + (y + h) + ' Z';
  }

  function buildBandChart(counts, n) {
    var block = chartBlock('Time of day');
    var bar = el('div', 'band-bar');
    var max = Math.max.apply(null, counts);
    counts.forEach(function (c, i) {
      var seg = el('div', 'band-seg' + (c === max && c > 0 ? ' is-high' : '') + (c === 0 ? ' is-empty' : ''));
      seg.style.flexGrow = c === 0 ? 0.25 : c;
      seg.title = BANDS[i].label + ': ' + c;
      bar.appendChild(seg);
    });
    block.appendChild(bar);
    var legend = el('div', 'band-legend');
    counts.forEach(function (c, i) {
      var s = el('span');
      s.appendChild(el('b', '', BANDS[i].label));
      s.appendChild(document.createTextNode(c + (c === 1 ? ' entry' : ' entries')));
      legend.appendChild(s);
    });
    block.appendChild(legend);
    return block;
  }

  function buildWeekdayChart(counts, n) {
    var block = chartBlock('Day of week');
    var W = 320, H = 80, padB = 16, padT = 16;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'chart', role: 'img' });
    svg.setAttribute('aria-label', 'Relapses by day of week');
    var slot = W / 7;
    var barW = 22;
    var max = Math.max(1, Math.max.apply(null, counts));
    var plotH = H - padB - padT;
    svg.appendChild(svgEl('line', { x1: 0, x2: W, y1: H - padB + 0.5, y2: H - padB + 0.5, class: 'axis' }));
    var tip = el('div', 'chart-tip');
    counts.forEach(function (c, i) {
      var h = c === 0 ? 2 : Math.max(3, (c / max) * plotH);
      var x = slot * i + (slot - barW) / 2;
      var y = padT + plotH - h;
      var bar = svgEl('path', { d: roundedTopRect(x, y, barW, h, 4), class: 'bar' + (c === max && c > 0 ? ' is-high' : '') + (c === 0 ? ' is-empty' : '') });
      bar.style.setProperty('--i', i);
      svg.appendChild(bar);
      if (c === max && c > 0) {
        var lbl = svgEl('text', { x: x + barW / 2, y: y - 5, 'text-anchor': 'middle', class: 'bar-lbl strong' });
        lbl.textContent = c;
        svg.appendChild(lbl);
      }
      var t = svgEl('text', { x: slot * i + slot / 2, y: H - 3, 'text-anchor': 'middle' });
      t.textContent = WEEKDAYS[i].charAt(0);
      svg.appendChild(t);
      var hit = svgEl('rect', { x: slot * i, y: 0, width: slot, height: H, class: 'bar-hit' });
      var describe = function () {
        tip.textContent = WEEKDAYS[i] + ': ' + plural(c, 'entry').replace('entrys', 'entries');
        Array.prototype.forEach.call(svg.querySelectorAll('.bar'), function (b) { b.classList.remove('is-active'); });
        bar.classList.add('is-active');
      };
      hit.addEventListener('mouseenter', describe);
      hit.addEventListener('click', describe);
      svg.appendChild(hit);
    });
    block.appendChild(svg);
    block.appendChild(tip);
    return block;
  }

  // ---------- calendar ----------

  function renderCalendar(habit) {
    var now = new Date();
    var viewDate = new Date(now.getFullYear(), now.getMonth() + state.calendarOffset, 1);
    var year = viewDate.getFullYear();
    var month = viewDate.getMonth();

    $('calMonthLabel').textContent = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    var relapseDays = {};
    habit.relapses.forEach(function (ts) {
      var d = new Date(ts);
      relapseDays[d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate()] = true;
    });

    var grid = $('calGrid');
    grid.innerHTML = '';
    var firstDayOfWeek = new Date(year, month, 1).getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var startDate = new Date(Math.min(habit.createdAt, streakStart(habit)));
    startDate.setHours(0, 0, 0, 0);
    var todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    for (var i = 0; i < firstDayOfWeek; i++) {
      grid.appendChild(el('div', 'cal-cell cal-blank'));
    }
    for (var day = 1; day <= daysInMonth; day++) {
      var cellDate = new Date(year, month, day);
      var cell = el('div', 'cal-cell', String(day));
      cell.style.setProperty('--i', day);
      var key = year + '-' + month + '-' + day;
      if (cellDate.getTime() === todayDate.getTime()) cell.classList.add('today');
      if (cellDate > todayDate) cell.classList.add('future');
      else if (cellDate < startDate) cell.classList.add('dim');
      else if (relapseDays[key]) cell.classList.add('event');
      grid.appendChild(cell);
    }

    var startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    var currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    $('calPrevBtn').disabled = viewDate.getTime() <= startMonth.getTime();
    $('calNextBtn').disabled = viewDate.getTime() >= currentMonthStart.getTime();
  }

  // ---------- history ----------

  function renderHistory(habit) {
    var host = $('historyList');
    host.innerHTML = '';
    $('historyNote').textContent = habit.relapses.length ? plural(habit.relapses.length, 'entry').replace('entrys', 'entries') : '';
    if (habit.relapses.length === 0) {
      host.appendChild(el('p', 'empty-note', 'No relapses on record. If one happens, log it here and the count simply restarts.'));
      return;
    }
    var sorted = habit.relapses.slice().sort(function (a, b) { return b - a; });
    var segs = completedSegments(habit);
    var segByEnd = {};
    segs.forEach(function (s) { segByEnd[s.end] = s; });
    sorted.forEach(function (ts) {
      var row = el('div', 'history-row');
      var main = el('div', 'history-main');
      main.appendChild(el('span', 'history-date', formatDateShort(ts) + ', ' + formatTimeOnly(ts) + ' · ' + relativeAgo(ts)));
      var seg = segByEnd[ts];
      if (seg && seg.ms > 0) main.appendChild(el('span', 'history-gap', 'Ended a streak of ' + formatDuration(seg.ms)));
      row.appendChild(main);
      var rm = el('button', 'history-remove', 'Remove');
      rm.addEventListener('click', function () {
        openConfirm('Remove this entry?', 'It comes off the history. If it was the most recent one, your current streak will be recalculated from the entry before it.', function () {
          removeRelapseEntry(habit.id, ts);
          closeConfirm();
          showToast('Entry removed.');
        }, 'Remove');
      });
      row.appendChild(rm);
      host.appendChild(row);
    });
  }

  // ---------- milestones list ----------

  function renderMilestoneList(habit) {
    var host = $('milestoneListEl');
    host.innerHTML = '';
    var list = habitMilestones(habit);
    var next = nextMilestone(habit);
    var cur = currentStreakMs(habit);
    list.forEach(function (m) {
      var rec = milestoneRecord(habit, m);
      var row = el('div', 'ms-row');
      var mark = el('span', 'ms-mark');
      if (rec.inCurrent) {
        row.classList.add('is-hit');
        mark.appendChild(useSymbol('sym-check'));
      } else if (next && m.key === next.key) {
        row.classList.add('is-next');
        mark.appendChild(useSymbol('sym-dot'));
      } else {
        row.classList.add('is-pending');
        mark.appendChild(useSymbol('sym-ring'));
      }
      row.appendChild(mark);
      var titleWrap = el('div');
      titleWrap.appendChild(el('span', 'ms-title', m.title));
      row.appendChild(titleWrap);

      var metaWrap = el('div', 'ms-meta');
      if (rec.inCurrent) {
        metaWrap.textContent = 'Reached ' + formatDateShort(streakStart(habit) + m.ms) + (rec.count > 1 ? ' · ' + rec.count + '×' : '');
      } else if (next && m.key === next.key) {
        metaWrap.textContent = 'In ' + formatDuration(m.ms - cur) + (rec.count ? ' · reached ' + rec.count + '× before' : '');
      } else {
        metaWrap.textContent = rec.count ? 'Reached ' + rec.count + '× before' : '';
      }
      if (m.custom) {
        var rm = el('button', 'ms-remove', 'Remove');
        rm.addEventListener('click', function () {
          openConfirm('Remove this milestone?', 'Only the target goes. Your streak and history are untouched.', function () {
            habit.customMilestones = habit.customMilestones.filter(function (x) { return x.id !== m.custom.id; });
            resyncMilestonesHit(habit);
            saveData();
            closeConfirm();
            renderMilestoneList(habit);
            if (detailRefs) paintProgress(habit, detailRefs.fill, detailRefs.nextLabel);
          }, 'Remove');
        });
        metaWrap.appendChild(document.createTextNode(metaWrap.textContent ? ' ' : ''));
        metaWrap.appendChild(rm);
      }
      row.appendChild(metaWrap);
      host.appendChild(row);
    });
  }

  function addCustomMilestone(habitId) {
    var habit = findHabit(habitId);
    if (!habit) return;
    var daysInput = $('newMilestoneDaysInput');
    var labelInput = $('newMilestoneLabelInput');
    var days = parseInt(daysInput.value, 10);
    if (!days || days < 1) {
      daysInput.focus();
      return;
    }
    var exists = habit.customMilestones.some(function (m) { return m.days === days; }) ||
      MILESTONES.some(function (m) { return m.ms === days * DAY; });
    if (exists) {
      showToast('There is already a milestone at ' + plural(days, 'day') + '.');
      return;
    }
    habit.customMilestones.push({ id: uid(), days: days, label: labelInput.value.trim() });
    resyncMilestonesHit(habit);
    saveData();
    daysInput.value = '';
    labelInput.value = '';
    daysInput.blur();
    labelInput.blur();
    renderMilestoneList(habit);
    if (detailRefs) paintProgress(habit, detailRefs.fill, detailRefs.nextLabel);
    showToast('Milestone set at ' + plural(days, 'day') + '.');
  }

  // ---------- streak card ----------

  function drawStreakCard(habit) {
    var size = 1080;
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');

    // paper
    ctx.fillStyle = '#F7F4EC';
    ctx.fillRect(0, 0, size, size);

    var margin = 96;
    ctx.fillStyle = '#1A1A1A';

    // masthead rule
    ctx.fillRect(margin, 150, size - margin * 2, 4);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '700 44px "Fraunces"';
    ctx.fillText('Quit it', margin, 130);

    ctx.textAlign = 'right';
    ctx.font = '500 26px "Work Sans"';
    ctx.fillStyle = '#8F8B80';
    ctx.fillText(new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }), size - margin, 130);

    // eyebrow
    ctx.textAlign = 'left';
    ctx.fillStyle = '#8F8B80';
    ctx.font = '600 26px "Work Sans"';
    var eyebrow = 'TIME CLEAN';
    drawTracked(ctx, eyebrow, margin, 260, 4);

    // habit name
    ctx.fillStyle = '#1A1A1A';
    ctx.font = '600 52px "Fraunces"';
    ctx.fillText(fitText(ctx, habit.name, size - margin * 2), margin, 330);

    // number
    var parts = formatStreak(currentStreakMs(habit), true);
    var numText = String(parts.value);
    var numSize = 400;
    if (numText.length >= 4) numSize = 270;
    else if (numText.length === 3) numSize = 330;
    ctx.font = '700 ' + numSize + 'px "Fraunces"';
    ctx.textBaseline = 'alphabetic';
    var numY = 740;
    ctx.fillText(numText, margin - 14, numY);
    var numW = ctx.measureText(numText).width;

    ctx.font = '500 46px "Work Sans"';
    ctx.fillStyle = '#5E5B52';
    ctx.fillText(parts.unit + ' clean', margin + numW + 6, numY);

    // mustard rule under the number
    ctx.fillStyle = '#E8B923';
    ctx.fillRect(margin, numY + 64, size - margin * 2, 4);

    // footer figures
    var footY = numY + 136;
    ctx.fillStyle = '#8F8B80';
    ctx.font = '600 24px "Work Sans"';
    drawTracked(ctx, 'BEST STREAK', margin, footY, 4);
    drawTracked(ctx, 'RELAPSES LOGGED', size / 2 + 40, footY, 4);

    var bp = figureParts(bestStreakMs(habit));
    ctx.fillStyle = '#1A1A1A';
    ctx.font = '700 64px "Fraunces"';
    ctx.fillText(bp.value, margin, footY + 80);
    var bw = ctx.measureText(bp.value).width;
    ctx.fillText(String(habit.relapses.length), size / 2 + 40, footY + 80);
    ctx.font = '500 28px "Work Sans"';
    ctx.fillStyle = '#5E5B52';
    ctx.fillText(bp.unit, margin + bw + 14, footY + 80);

    // footer
    ctx.fillStyle = '#8F8B80';
    ctx.font = '500 24px "Work Sans"';
    ctx.textAlign = 'right';
    ctx.fillText('Kept privately, on one phone.', size - margin, size - 56);

    return canvas;
  }

  function drawTracked(ctx, text, x, y, tracking) {
    var cx = x;
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      ctx.fillText(ch, cx, y);
      cx += ctx.measureText(ch).width + tracking;
    }
  }

  function fitText(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    var t = text;
    while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
    return t + '…';
  }

  var cardBlob = null;
  var cardUrl = null;

  function openStreakCard(habitId) {
    var habit = findHabit(habitId);
    if (!habit) return;
    var preview = $('cardPreview');
    preview.innerHTML = '';
    $('cardShareBtn').disabled = true;
    document.fonts.ready.then(function () {
      var canvas = drawStreakCard(habit);
      var img = document.createElement('img');
      img.alt = 'Streak card for ' + habit.name;
      img.src = canvas.toDataURL('image/png');
      preview.appendChild(img);
      canvas.toBlob(function (blob) {
        cardBlob = blob;
        if (cardUrl) URL.revokeObjectURL(cardUrl);
        cardUrl = blob ? URL.createObjectURL(blob) : null;
        var link = $('cardDownloadLink');
        link.href = cardUrl || '#';
        link.download = habit.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '-streak.png';
        var file = blob ? new File([blob], link.download, { type: 'image/png' }) : null;
        var canShare = !!(file && navigator.canShare && navigator.canShare({ files: [file] }));
        $('cardShareBtn').disabled = false;
        $('cardShareBtn').textContent = canShare ? 'Share' : 'Save image';
        $('cardShareBtn').dataset.mode = canShare ? 'share' : 'save';
        $('cardDownloadLink').classList.toggle('hidden', !canShare);
        $('cardHint').textContent = canShare
          ? 'Only what you see here goes in the image. Nothing else.'
          : 'Only what you see here goes in the image. On iPhone, you can also press and hold it to save.';
      }, 'image/png');
    });
    openSheet('cardSheet');
  }

  function shareOrSaveCard() {
    var habit = findHabit(state.currentHabitId);
    if (!habit || !cardBlob) return;
    var link = $('cardDownloadLink');
    if ($('cardShareBtn').dataset.mode === 'share') {
      var file = new File([cardBlob], link.download, { type: 'image/png' });
      navigator.share({ files: [file], title: habit.name + ' streak' }).then(function () {
        closeSheet('cardSheet');
      }).catch(function () {});
    } else {
      link.click();
    }
  }

  // ---------- settings (overview) ----------

  function renderOverview() {
    var host = $('overviewList');
    host.innerHTML = '';
    var list = activeHabits();
    list.forEach(function (habit) {
      var row = el('button', 'overview-row');
      row.type = 'button';
      var name = el('div', 'overview-row-name');
      if (habit.emoji) name.appendChild(makeIconEl(habit.emoji, 'habit-emoji'));
      name.appendChild(el('span', 'habit-name-text', habit.name));
      var parts = formatStreak(currentStreakMs(habit), true);
      var num = el('div', 'overview-row-num', parts.value + ' ' + parts.unit + ' clean · ' + plural(habit.relapses.length, 'relapse'));
      row.appendChild(name);
      row.appendChild(num);
      row.addEventListener('click', function () { goToScreen('detail', habit.id, 'push'); });
      host.appendChild(row);
    });
    if (!list.length) host.appendChild(el('p', 'empty-note', 'Nothing active right now.'));

    var archived = data.habits.filter(function (h) { return h.archived; });
    var archHost = $('archivedList');
    archHost.innerHTML = '';
    $('archivedSection').classList.toggle('hidden', archived.length === 0);
    archived.forEach(function (habit) {
      var row = el('div', 'overview-row');
      var archName = el('div', 'overview-row-name');
      if (habit.emoji) archName.appendChild(makeIconEl(habit.emoji, 'habit-emoji'));
      archName.appendChild(el('span', 'habit-name-text', habit.name));
      row.appendChild(archName);
      var restoreBtn = el('button', 'btn btn-sm', 'Restore');
      restoreBtn.addEventListener('click', function () {
        habit.archived = false;
        resyncMilestonesHit(habit);
        saveData();
        renderOverview();
        showToast('Back on the ledger: ' + habit.name);
      });
      row.appendChild(restoreBtn);
      archHost.appendChild(row);
    });

    $('activitiesCount').textContent = plural(activeActivities().length, 'idea');
    $('aboutVersion').textContent = 'v' + APP_VERSION + ' · ' + plural(data.habits.length, 'habit') + ' on this device';
  }

  // ---------- habit sheet (add/edit) ----------

  function openHabitSheet(habitId) {
    state.editingHabitId = habitId || null;
    var habit = habitId ? findHabit(habitId) : null;
    $('habitSheetTitle').textContent = habit ? 'Edit habit' : 'Add a habit';
    $('habitNameInput').value = habit ? habit.name : '';
    $('habitWhyInput').value = habit ? (habit.why || '') : '';
    $('habitSheetError').textContent = '';
    state.selectedEmoji = habit ? (habit.emoji || '') : '';
    renderEmojiGrid();
    var sinceField = $('habitSinceField');
    sinceField.classList.toggle('hidden', !!habit);
    if (!habit) {
      var now = new Date();
      $('habitSinceDate').value = dateInputValue(now);
      $('habitSinceDate').max = dateInputValue(now);
      $('habitSinceTime').value = timeInputValue(now);
    }
    openSheet('habitSheet');
    setTimeout(function () { $('habitNameInput').focus(); }, 380);
  }

  function renderEmojiGrid() {
    var grid = $('emojiGrid');
    grid.innerHTML = '';
    ICON_OPTIONS.forEach(function (em) {
      var opt = el('button', 'icon-opt');
      opt.type = 'button';
      if (!em) {
        opt.classList.add('icon-opt-blank');
        opt.textContent = 'none';
        opt.setAttribute('aria-label', 'No mark');
      } else {
        opt.innerHTML = iconMarkup(em) || '';
        opt.setAttribute('aria-label', em);
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
    var name = $('habitNameInput').value.trim();
    var why = $('habitWhyInput').value.trim();
    var errEl = $('habitSheetError');
    if (!name) {
      errEl.textContent = 'Give it a name, even a short one.';
      $('habitNameInput').focus();
      return;
    }
    if (state.editingHabitId) {
      var habit = findHabit(state.editingHabitId);
      habit.name = name;
      habit.emoji = state.selectedEmoji;
      habit.why = why;
      saveData();
      closeSheet('habitSheet');
      renderDetail(habit.id);
      showToast('Saved.');
    } else {
      var since = parseDateTimeInputs($('habitSinceDate').value, $('habitSinceTime').value);
      if (isNaN(since)) since = Date.now();
      if (since > Date.now() + MINUTE) {
        errEl.textContent = "That start is in the future. Pick a time up to now.";
        return;
      }
      since = Math.min(since, Date.now());
      var wasOnboarding = !data.onboarded;
      var newHabit = {
        id: uid(),
        name: name,
        emoji: state.selectedEmoji,
        why: why,
        createdAt: since,
        lastRelapseAt: null,
        relapses: [],
        archived: false,
        milestonesHit: [],
        customMilestones: []
      };
      resyncMilestonesHit(newHabit);
      data.habits.push(newHabit);
      data.onboarded = true;
      saveData();
      closeSheet('habitSheet');
      goToScreen('home');
      showToast(wasOnboarding ? 'On the ledger. The count is running.' : 'Added. The count is running.');
    }
  }

  // ---------- relapse / streak actions ----------

  // Marks milestones already passed by the current streak as "hit" without
  // celebrating them, so a fresh or backdated streak doesn't flood past
  // milestones, but future ones (e.g. re-reaching 1 week after a relapse)
  // still trigger a celebration normally.
  function resyncMilestonesHit(habit) {
    var cur = currentStreakMs(habit);
    habit.milestonesHit = habitMilestones(habit).filter(function (m) { return cur >= m.ms; }).map(function (m) { return m.key; });
  }

  function logRelapse(habitId, timestamp) {
    var habit = findHabit(habitId);
    if (!habit) return;
    var ts = typeof timestamp === 'number' ? timestamp : Date.now();
    habit.relapses.push(ts);
    habit.lastRelapseAt = Math.max.apply(null, habit.relapses);
    resyncMilestonesHit(habit);
    saveData();
    if (state.screen === 'detail') renderDetail(habitId, { reset: true });
    else renderHome();
    showToast('Logged. Counting from ' + (Date.now() - ts < MINUTE ? 'now.' : formatDateShort(ts) + '.'), {
      action: 'Undo',
      duration: 6000,
      onAction: function () {
        removeRelapseEntry(habitId, ts, true);
        showToast('Undone. The streak is back.');
      }
    });
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
      habit.lastRelapseAt = timestamp;
    } else {
      // No relapse on record: this is the start of tracking itself.
      habit.createdAt = timestamp;
      habit.lastRelapseAt = null;
    }
    resyncMilestonesHit(habit);
    saveData();
    if (state.screen === 'detail') renderDetail(habitId);
    else renderHome();
  }

  function removeRelapseEntry(habitId, timestamp, quiet) {
    var habit = findHabit(habitId);
    if (!habit) return;
    var idx = habit.relapses.indexOf(timestamp);
    if (idx === -1) return;
    habit.relapses.splice(idx, 1);
    habit.lastRelapseAt = habit.relapses.length ? Math.max.apply(null, habit.relapses) : null;
    resyncMilestonesHit(habit);
    saveData();
    if (state.screen === 'detail' && state.currentHabitId === habitId) renderDetail(habitId);
    else if (state.screen === 'home') renderHome();
  }

  // --- log relapse sheet ---

  function openRelapseSheet(habitId) {
    var habit = findHabit(habitId);
    if (!habit) return;
    state.relapseMode = null;
    $('relapseWhenFields').classList.add('hidden');
    $('relapseSaveBtn').classList.add('hidden');
    $('relapseError').textContent = '';
    $('relapseNowBtn').classList.remove('selected');
    $('relapseEarlierBtn').classList.remove('selected');
    var now = new Date();
    $('relapseDate').value = dateInputValue(now);
    $('relapseDate').max = dateInputValue(now);
    $('relapseTime').value = timeInputValue(now);
    openSheet('relapseSheet');
  }

  function chooseRelapseEarlier() {
    state.relapseMode = 'earlier';
    $('relapseEarlierBtn').classList.add('selected');
    $('relapseNowBtn').classList.remove('selected');
    $('relapseWhenFields').classList.remove('hidden');
    $('relapseSaveBtn').classList.remove('hidden');
  }

  function saveRelapseEarlier() {
    var habit = findHabit(state.currentHabitId);
    if (!habit) return;
    var errEl = $('relapseError');
    var ts = parseDateTimeInputs($('relapseDate').value, $('relapseTime').value);
    if (isNaN(ts)) { errEl.textContent = 'Enter a date and time.'; return; }
    if (ts > Date.now()) { errEl.textContent = "That's in the future. Pick a time up to now."; return; }
    if (ts <= streakStart(habit)) {
      errEl.textContent = 'That is before this streak started (' + formatDateTime(streakStart(habit)) + '). To move the start, use "Correct this" instead.';
      return;
    }
    closeSheet('relapseSheet');
    logRelapse(habit.id, ts);
  }

  // --- correct start time sheet ---

  function openLastRelapseSheet(habitId) {
    var habit = findHabit(habitId);
    if (!habit) return;
    var base = new Date(streakStart(habit));
    $('lastRelapseDate').value = dateInputValue(base);
    $('lastRelapseTime').value = timeInputValue(base);
    var now = new Date();
    $('lastRelapseDate').max = dateInputValue(now);
    $('lastRelapseError').textContent = '';
    $('lastRelapseText').textContent = habit.relapses.length
      ? 'This moves your most recent relapse to the right moment, so the count starts from there. Correcting it again later edits the same entry. It never adds a second relapse.'
      : 'This sets the moment you actually stopped, so the count starts from there. Nothing is logged as a relapse.';
    openSheet('lastRelapseSheet');
  }

  function saveLastRelapseSheet() {
    var habit = findHabit(state.currentHabitId);
    if (!habit) return;
    var errEl = $('lastRelapseError');
    var ts = parseDateTimeInputs($('lastRelapseDate').value, $('lastRelapseTime').value);
    if (isNaN(ts)) { errEl.textContent = 'Enter a date and time.'; return; }
    if (ts > Date.now()) { errEl.textContent = "That's in the future. Pick a time up to now."; return; }
    if (habit.relapses.length > 1) {
      var sorted = habit.relapses.slice().sort(function (a, b) { return a - b; });
      var previous = sorted[sorted.length - 2];
      if (ts <= previous) {
        errEl.textContent = 'That is before the relapse on ' + formatDateShort(previous) + '. Remove that entry from History first if it is wrong.';
        return;
      }
    }
    setLastRelapseAt(habit.id, ts);
    closeSheet('lastRelapseSheet');
    showToast('Start corrected.');
  }

  // ---------- sheets ----------

  var openSheets = [];

  function openSheet(id) {
    hideToast();
    var node = $(id);
    node.classList.remove('hidden');
    void node.offsetWidth;
    node.classList.add('is-open');
    if (openSheets.indexOf(id) === -1) openSheets.push(id);
  }

  function closeSheet(id) {
    var node = $(id);
    if (node.classList.contains('hidden')) return;
    node.classList.remove('is-open');
    openSheets = openSheets.filter(function (s) { return s !== id; });
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      node.classList.add('hidden');
    }
    node.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 450);
  }

  function closeAllSheets() {
    document.querySelectorAll('.sheet-backdrop').forEach(function (n) {
      n.classList.remove('is-open');
      n.classList.add('hidden');
    });
    openSheets = [];
    $('milestoneBackdrop').classList.add('hidden');
    milestoneShowing = false;
    state.confirmCallback = null;
  }

  function wireSheetBackdrops() {
    document.querySelectorAll('[data-sheet]').forEach(function (backdrop) {
      backdrop.addEventListener('click', function (e) {
        if (e.target !== backdrop) return;
        if (backdrop.id === 'confirmSheet') closeConfirm();
        else closeSheet(backdrop.id);
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && openSheets.length) {
        var top = openSheets[openSheets.length - 1];
        if (top === 'confirmSheet') closeConfirm(); else closeSheet(top);
      }
    });
  }

  // ---------- confirm sheet ----------

  function openConfirm(title, text, onConfirm, okLabel, okClass) {
    $('confirmTitle').textContent = title;
    $('confirmText').textContent = text;
    var ok = $('confirmOk');
    ok.textContent = okLabel || 'Confirm';
    ok.className = 'btn ' + (okClass || 'btn-danger');
    state.confirmCallback = onConfirm;
    openSheet('confirmSheet');
  }

  function closeConfirm() {
    closeSheet('confirmSheet');
    state.confirmCallback = null;
  }

  // ---------- trigger flow ----------

  var lastTriggerText = null;
  var triggerOpenedAt = 0;
  var triggerTimerHandle = null;

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
    hideToast();
    lastTriggerText = null;
    var text = pickActivity();
    lastTriggerText = text;
    $('triggerText').textContent = text;
    var habit = findHabit(state.currentHabitId);
    var why = habit && habit.why ? habit.why : '';
    $('triggerWhy').classList.toggle('hidden', !why);
    $('triggerWhyText').textContent = why ? '“' + why + '”' : '';
    showTriggerMode('idea');
    triggerOpenedAt = Date.now();
    clearInterval(triggerTimerHandle);
    paintTriggerTimer();
    triggerTimerHandle = setInterval(paintTriggerTimer, 1000);
    goToScreen('trigger');
  }

  function paintTriggerTimer() {
    var s = Math.floor((Date.now() - triggerOpenedAt) / 1000);
    var m = Math.floor(s / 60);
    $('triggerTimer').textContent = 'Here for ' + m + ':' + pad2(s % 60);
  }

  function closeTrigger() {
    clearInterval(triggerTimerHandle);
    stopBreathing();
    var stayed = Date.now() - triggerOpenedAt;
    goToScreen(state.currentHabitId && findHabit(state.currentHabitId) ? 'detail' : 'home');
    if (stayed >= 2 * MINUTE) showToast('You stayed with it for ' + formatDuration(stayed) + '.');
  }

  function rerollTrigger() {
    var card = $('triggerCard');
    var text = pickActivity();
    lastTriggerText = text;
    card.classList.add('is-swapping');
    setTimeout(function () {
      $('triggerText').textContent = text;
      card.classList.remove('is-swapping');
    }, 150);
  }

  function showTriggerMode(mode) {
    var breathing = mode === 'breathe';
    $('triggerIdeaMode').classList.toggle('hidden', breathing);
    $('triggerBreathMode').classList.toggle('hidden', !breathing);
    $('triggerIdeaActions').classList.toggle('hidden', breathing);
    $('triggerBreathActions').classList.toggle('hidden', !breathing);
  }

  // --- box breathing: 4 in, 4 hold, 4 out, 4 hold, four rounds ---

  var breathTimers = [];
  var breathing = false;
  var BREATH_PHASES = [
    { cls: 'is-in', label: 'Breathe in' },
    { cls: 'is-hold-in', label: 'Hold' },
    { cls: 'is-out', label: 'Breathe out' },
    { cls: 'is-hold-out', label: 'Hold' }
  ];
  var BREATH_ROUNDS = 4;
  var BREATH_SECONDS = 4;

  function startBreathing() {
    stopBreathing();
    breathing = true;
    showTriggerMode('breathe');
    var ring = $('breathRing');
    ring.className = 'breath-ring';
    $('breathPhase').textContent = 'Get ready';
    $('breathCount').textContent = '';
    var t = 900;
    for (var round = 0; round < BREATH_ROUNDS; round++) {
      BREATH_PHASES.forEach(function (phase, pi) {
        var r = round;
        breathTimers.push(setTimeout(function () {
          ring.className = 'breath-ring ' + phase.cls;
          $('breathPhase').textContent = phase.label;
          $('breathCount').textContent = 'Round ' + (r + 1) + ' of ' + BREATH_ROUNDS;
        }, t));
        for (var s = 1; s <= BREATH_SECONDS; s++) {
          (function (sec) {
            breathTimers.push(setTimeout(function () {
              $('breathCount').textContent = 'Round ' + (r + 1) + ' of ' + BREATH_ROUNDS + ' · ' + sec;
            }, t + sec * 1000 - 1000));
          })(s);
        }
        t += BREATH_SECONDS * 1000;
      });
    }
    breathTimers.push(setTimeout(function () {
      ring.className = 'breath-ring';
      $('breathPhase').textContent = 'Done';
      $('breathCount').textContent = 'A minute, well spent.';
      $('breathStopBtn').textContent = 'Back';
    }, t));
  }

  function stopBreathing() {
    breathTimers.forEach(clearTimeout);
    breathTimers = [];
    if (!breathing) return;
    breathing = false;
    $('breathStopBtn').textContent = 'Stop';
    showTriggerMode('idea');
  }

  // ---------- milestones ----------

  function checkMilestones() {
    if (!state.unlocked) return;
    var queued = false;
    data.habits.forEach(function (habit) {
      if (habit.archived) return;
      var cur = currentStreakMs(habit);
      habit.milestonesHit = habit.milestonesHit || [];
      var newlyHit = [];
      habitMilestones(habit).forEach(function (m) {
        if (cur >= m.ms && habit.milestonesHit.indexOf(m.key) === -1) {
          habit.milestonesHit.push(m.key);
          newlyHit.push(m);
        }
      });
      if (newlyHit.length) {
        // Several crossed while the app was closed: acknowledge only the largest.
        var top = newlyHit[newlyHit.length - 1];
        state.milestoneQueue.push({ habitName: habit.name, title: top.title, when: streakStart(habit) + top.ms });
        queued = true;
      }
    });
    if (queued) {
      saveData();
      maybeShowMilestone();
    }
  }

  var milestoneShowing = false;

  function maybeShowMilestone() {
    if (milestoneShowing || state.milestoneQueue.length === 0) return;
    if (state.screen === 'lock' || state.screen === 'setup') return;
    milestoneShowing = true;
    var next = state.milestoneQueue.shift();
    $('milestoneHabitName').textContent = next.habitName;
    $('milestoneTitle').textContent = next.title;
    $('milestoneSub').textContent = 'Reached ' + formatDateTime(next.when) + '. Entered in your ledger.';
    var node = $('milestoneBackdrop');
    node.classList.remove('is-closing');
    node.classList.remove('hidden');
    // keep the detail figures fresh behind it
    if (state.screen === 'detail' && detailRefs) renderMilestoneList(findHabit(detailRefs.habitId));
  }

  function closeMilestone() {
    var node = $('milestoneBackdrop');
    node.classList.add('is-closing');
    setTimeout(function () {
      node.classList.add('hidden');
      node.classList.remove('is-closing');
      milestoneShowing = false;
      if (state.milestoneQueue.length) setTimeout(maybeShowMilestone, 250);
    }, 220);
  }

  // ---------- activities sheet ----------

  function openActivities() {
    renderActivityList();
    openSheet('activitiesSheet');
  }

  function renderActivityList() {
    var host = $('activityListEl');
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
      var label = el('span', '', a);
      label.appendChild(el('span', 'is-custom', 'yours'));
      row.appendChild(label);
      var rm = el('button', 'activity-remove', 'Remove');
      rm.addEventListener('click', function () {
        data.customActivities.splice(idx, 1);
        saveData();
        renderActivityList();
      });
      row.appendChild(rm);
      host.appendChild(row);
    });
    if (!defaults.length && !data.customActivities.length) {
      host.appendChild(el('p', 'empty-note', 'The list is empty, so "I’m triggered" will fall back to a breathing prompt. Add at least one idea.'));
    }
  }

  function addCustomActivity() {
    var input = $('newActivityInput');
    var val = input.value.trim();
    if (!val) return;
    data.customActivities.push(val);
    saveData();
    input.value = '';
    renderActivityList();
    var list = $('activityListEl');
    list.scrollTop = list.scrollHeight;
  }

  // ---------- backup & restore ----------

  function openBackupSheet() {
    $('backupExportArea').value = JSON.stringify(data, null, 2);
    $('backupImportArea').value = '';
    $('backupImportError').textContent = '';
    openSheet('backupSheet');
  }

  function copyBackupText() {
    var textarea = $('backupExportArea');
    function showCopied() { showToast('Copied. Paste it somewhere private.'); }
    function showFailed() { showToast("Couldn't copy automatically. Tap the box and copy by hand."); }
    function legacy() {
      textarea.select();
      try { document.execCommand('copy') ? showCopied() : showFailed(); } catch (e) { showFailed(); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textarea.value).then(showCopied, legacy);
    } else {
      legacy();
    }
  }

  function restoreBackup() {
    var errEl = $('backupImportError');
    var raw = $('backupImportArea').value.trim();
    if (!raw) {
      errEl.textContent = 'Paste your backup text first.';
      return;
    }
    var parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      errEl.textContent = "That doesn't read as backup text. Check that you copied all of it.";
      return;
    }
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.habits)) {
      errEl.textContent = "That doesn't look like a Quit it backup.";
      return;
    }
    errEl.textContent = '';
    var count = parsed.habits.length;
    openConfirm(
      'Replace everything with this backup?',
      'Everything on this device is replaced by the ' + plural(count, 'habit') + ' in the backup, including its PIN. There is no undo.',
      function () {
        var restored = normalizeData(parsed);
        // Keep whichever PIN protects this device if the backup has none.
        if (!restored.pinHash) restored.pinHash = data.pinHash;
        restored.pinFails = 0;
        restored.pinLockedUntil = 0;
        data = restored;
        // Don't celebrate a backlog of milestones the moment the backup lands.
        data.habits.forEach(resyncMilestonesHit);
        saveData();
        closeConfirm();
        closeSheet('backupSheet');
        location.reload();
      },
      'Restore'
    );
  }

  // ---------- toast ----------

  var toastTimer = null;

  function showToast(text, opts) {
    opts = opts || {};
    var toast = $('toast');
    var action = $('toastAction');
    $('toastText').textContent = text;
    action.textContent = opts.action || '';
    action.classList.toggle('hidden', !opts.action);
    action.onclick = opts.onAction ? function () { hideToast(); opts.onAction(); } : null;
    toast.classList.toggle('above-bar', state.screen === 'home' && !$('homeBottomBar').classList.contains('hidden'));
    toast.classList.remove('hidden');
    void toast.offsetWidth;
    toast.classList.add('is-open');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, opts.duration || (opts.action ? 5000 : 2400));
  }

  function hideToast() {
    var toast = $('toast');
    toast.classList.remove('is-open');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.add('hidden'); }, 300);
  }

  // ---------- live tick ----------

  function tick() {
    if (!state.unlocked) return;

    if (state.screen === 'home') {
      Object.keys(homeRefs).forEach(function (id) {
        var habit = findHabit(id);
        if (!habit) return;
        paintHomeCard(habit, homeRefs[id]);
        paintProgress(habit, homeRefs[id].fill, homeRefs[id].nextLabel);
      });
    } else if (state.screen === 'detail' && detailRefs) {
      var h = findHabit(detailRefs.habitId);
      if (h) {
        paintDetailFigures(h);
        paintProgress(h, detailRefs.fill, detailRefs.nextLabel);
      }
    }

    checkMilestones();
  }

  setInterval(tick, 15000);

  // ---------- wiring ----------

  function wirePad(kind) {
    var pad = document.querySelector('.pin-pad[data-pad="' + kind + '"]');

    pad.querySelectorAll('.pin-key[data-digit]').forEach(function (btn) {
      btn.addEventListener('click', function () { handlePinDigit(kind, btn.getAttribute('data-digit')); });
    });
    pad.querySelector('.pin-key[data-action="back"]').addEventListener('click', function () { handlePinBack(kind); });
  }

  function wire() {
    wirePad('lock');
    wirePad('setup');
    wirePad('changePin');

    $('changePinBtn').addEventListener('click', openChangePinSheet);
    $('changePinCancel').addEventListener('click', function () { closeSheet('changePinSheet'); });
    $('settingsLockBtn').addEventListener('click', relock);

    $('forgotPinBtn').addEventListener('click', function () {
      openConfirm(
        'Reset the app?',
        "There is no way to recover a PIN. Resetting wipes every habit, streak, and entry on this device so you can start over. If you have a backup, you can restore it afterwards.",
        function () {
          localStorage.removeItem(STORAGE_KEY);
          data = freshData();
          closeConfirm();
          initLockFlow();
        },
        'Wipe and reset'
      );
    });

    // onboarding
    $('onboardAddBtn').addEventListener('click', function () { openHabitSheet(null); });

    // home
    $('addHabitFab').addEventListener('click', function () { openHabitSheet(null); });
    $('emptyAddBtn').addEventListener('click', function () { openHabitSheet(null); });
    $('overviewBtn').addEventListener('click', function () { goToScreen('overview'); });
    $('viewToggleBtn').addEventListener('click', function () {
      data.viewMode = data.viewMode === 'grid' ? 'list' : 'grid';
      saveData();
      renderHome();
    });
    $('lockNowBtn').addEventListener('click', relock);

    // detail
    $('detailBackBtn').addEventListener('click', function () { goToScreen('home'); });
    $('detailEditBtn').addEventListener('click', function () { openHabitSheet(state.currentHabitId); });
    $('logRelapseBtn').addEventListener('click', function () { openRelapseSheet(state.currentHabitId); });
    $('relapseNowBtn').addEventListener('click', function () {
      closeSheet('relapseSheet');
      logRelapse(state.currentHabitId);
    });
    $('relapseEarlierBtn').addEventListener('click', chooseRelapseEarlier);
    $('relapseSaveBtn').addEventListener('click', saveRelapseEarlier);
    $('relapseCancel').addEventListener('click', function () { closeSheet('relapseSheet'); });
    $('calPrevBtn').addEventListener('click', function () {
      state.calendarOffset -= 1;
      renderCalendar(findHabit(state.currentHabitId));
    });
    $('calNextBtn').addEventListener('click', function () {
      state.calendarOffset += 1;
      renderCalendar(findHabit(state.currentHabitId));
    });
    $('setLastTimeBtn').addEventListener('click', function () { openLastRelapseSheet(state.currentHabitId); });
    $('saveStreakCardBtn').addEventListener('click', function () { openStreakCard(state.currentHabitId); });
    $('cardShareBtn').addEventListener('click', shareOrSaveCard);
    $('cardCloseBtn').addEventListener('click', function () { closeSheet('cardSheet'); });
    $('addMilestoneBtn').addEventListener('click', function () { addCustomMilestone(state.currentHabitId); });
    $('newMilestoneLabelInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') addCustomMilestone(state.currentHabitId); });
    $('lastRelapseCancel').addEventListener('click', function () { closeSheet('lastRelapseSheet'); });
    $('lastRelapseSave').addEventListener('click', saveLastRelapseSheet);
    $('triggerBtn').addEventListener('click', openTrigger);
    $('archiveBtn').addEventListener('click', function () {
      var habit = findHabit(state.currentHabitId);
      if (!habit) return;
      openConfirm('Archive this habit?', 'It leaves the ledger but keeps its full history. You can bring it back from Settings at any time.', function () {
        habit.archived = true;
        saveData();
        closeConfirm();
        goToScreen('home');
        showToast('Archived ' + habit.name + '.', { action: 'Undo', onAction: function () {
          habit.archived = false;
          resyncMilestonesHit(habit);
          saveData();
          renderHome();
        } });
      }, 'Archive', 'btn-ink');
    });
    $('deleteBtn').addEventListener('click', function () {
      var habit = findHabit(state.currentHabitId);
      if (!habit) return;
      openConfirm('Delete ' + habit.name + '?', 'This removes it and every entry in its history from this device. There is no undo. Archiving keeps the history if you would rather just hide it.', function () {
        data.habits = data.habits.filter(function (h) { return h.id !== state.currentHabitId; });
        saveData();
        closeConfirm();
        goToScreen('home');
        showToast('Deleted.');
      }, 'Delete');
    });

    // settings
    $('overviewBackBtn').addEventListener('click', function () { goToScreen('home'); });
    $('activitiesBtn').addEventListener('click', openActivities);
    $('backupBtn').addEventListener('click', openBackupSheet);
    $('backupCloseBtn').addEventListener('click', function () { closeSheet('backupSheet'); });
    $('backupCopyBtn').addEventListener('click', copyBackupText);
    $('backupRestoreBtn').addEventListener('click', restoreBackup);

    // habit sheet
    $('habitSheetCancel').addEventListener('click', function () { closeSheet('habitSheet'); });
    $('habitSheetSave').addEventListener('click', saveHabitSheet);
    $('habitNameInput').addEventListener('keydown', function (e) { if (e.key === 'Enter') saveHabitSheet(); });

    // confirm sheet
    $('confirmCancel').addEventListener('click', closeConfirm);
    $('confirmOk').addEventListener('click', function () {
      if (state.confirmCallback) state.confirmCallback();
    });

    // trigger
    $('triggerRerollBtn').addEventListener('click', rerollTrigger);
    $('triggerBreatheBtn').addEventListener('click', startBreathing);
    $('breathStopBtn').addEventListener('click', stopBreathing);
    $('triggerOkayBtn').addEventListener('click', closeTrigger);
    $('triggerCloseBtn').addEventListener('click', closeTrigger);

    // milestone
    $('milestoneOkBtn').addEventListener('click', closeMilestone);

    // activities
    $('activitiesDoneBtn').addEventListener('click', function () {
      closeSheet('activitiesSheet');
      if (state.screen === 'overview') renderOverview();
    });
    $('addActivityBtn').addEventListener('click', addCustomActivity);
    $('newActivityInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') addCustomActivity();
    });

    wireSheetBackdrops();

    // physical keyboard support for pin entry (desktop convenience)
    document.addEventListener('keydown', function (e) {
      var kind = null;
      if (state.screen === 'lock') kind = 'lock';
      else if (state.screen === 'setup') kind = 'setup';
      else if (openSheets.indexOf('changePinSheet') !== -1) kind = 'changePin';
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
