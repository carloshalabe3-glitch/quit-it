(function () {
  'use strict';

  var STORAGE_KEY = 'ledger.v1';
  var CARD_SERIF = 'ui-serif, "New York", "Iowan Old Style", Georgia, serif';
  var CARD_SANS = '-apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, sans-serif';
  var PIN_SALT = 'ledger-app-salt-v1';
  var APP_VERSION = '3.0';

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
      faceIdCredential: null,
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
      urges: Array.isArray(h.urges) ? h.urges.filter(function (t) { return typeof t === 'number'; }) : [],
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
      faceIdCredential: typeof parsed.faceIdCredential === 'string' ? parsed.faceIdCredential : null,
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

  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reduceMotion() { return !!motionQuery && motionQuery.matches; }

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

  // The clean-since date (createdAt) restarts the count just like a relapse,
  // so relapses logged before it are history and never reset today's streak.
  function streakStart(habit) {
    return Math.max(habit.lastRelapseAt || 0, habit.createdAt);
  }

  function countsFromRelapse(habit) {
    return !!habit.lastRelapseAt && habit.lastRelapseAt >= habit.createdAt;
  }

  function ledgerStart(habit) {
    return habit.relapses.length ? Math.min(habit.createdAt, Math.min.apply(null, habit.relapses)) : habit.createdAt;
  }

  function currentStreakMs(habit) {
    return Math.max(0, Date.now() - streakStart(habit));
  }

  // Completed streak segments, oldest first: [{start, end, ms}]. A run only
  // counts once its start is known: a relapse or the clean-since date.
  function completedSegments(habit) {
    var events = habit.relapses.map(function (t) { return { t: t, relapse: true }; });
    events.push({ t: habit.createdAt, relapse: false });
    events.sort(function (a, b) { return a.t - b.t || (a.relapse ? -1 : 1); });
    var segs = [];
    var runStart = null;
    events.forEach(function (e) {
      if (!e.relapse) { runStart = e.t; return; }
      if (runStart !== null) segs.push({ start: runStart, end: e.t, ms: Math.max(0, e.t - runStart) });
      runStart = e.t;
    });
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
    var opts = { weekday: 'short', month: 'short', day: 'numeric' };
    if (d.getFullYear() !== new Date().getFullYear()) opts = { month: 'short', day: 'numeric', year: 'numeric' };
    return d.toLocaleDateString(undefined, opts) + ', ' +
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

  // ---------- tips (each one shows for the first few visits, then goes quiet) ----------

  var TIPS_KEY = 'ledger.tips';
  var TIP_SESSIONS = 3;
  var tipCounts = (function () { try { return JSON.parse(localStorage.getItem(TIPS_KEY)) || {}; } catch (e) { return {}; } })();
  var tipsThisSession = {};

  function useTip(key) {
    if (tipsThisSession[key]) return true;
    if ((tipCounts[key] || 0) >= TIP_SESSIONS) return false;
    tipsThisSession[key] = true;
    tipCounts[key] = (tipCounts[key] || 0) + 1;
    try { localStorage.setItem(TIPS_KEY, JSON.stringify(tipCounts)); } catch (e) {}
    return true;
  }

  function showTip(node, key, when) {
    node.classList.toggle('hidden', !(when !== false && useTip(key)));
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
    detailTab: 'calendar',
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
    // Coming back to Home doesn't replay its entrance; after an edge swipe nothing animates at all.
    document.body.classList.toggle('instant', direction === 'instant');
    document.body.classList.toggle('returning', direction === 'pop' || direction === 'instant');
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
      drawLockMark();
      paintFaceIdKey();
      tryFaceId();
    }
  }

  // Restart the pen-stroke animation; called whenever the lock screen is actually in view.
  function drawLockMark() {
    var mark = $('lockMark');
    mark.classList.remove('is-drawing');
    void mark.getBoundingClientRect();
    mark.classList.add('is-drawing');
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
    if (!backupNudgeChecked) { backupNudgeChecked = true; setTimeout(maybeNudgeBackup, 1400); }
  }
  var backupNudgeChecked = false;

  function relock() {
    if (!state.unlocked) return;
    state.unlocked = false;
    state.preLockScreen = state.screen;
    closeAllSheets();
    document.querySelectorAll('.ctx-backdrop').forEach(function (n) { n.remove(); });
    stopBreathing();
    cancelInkWipe();
    inkStop();
    triggerOpening = false;
    clearInterval(triggerTimerHandle);
    hideToast();
    state.lockBuffer = '';
    $('lockSub').textContent = 'Enter your PIN';
    renderPinDots('pinDots', 0);
    $('lockError').textContent = '';
    state.screen = 'lock';
    applyTheme();
    showScreenEl('lockScreen');
    refreshLockout();
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) relock();
    else if (state.screen === 'lock') { drawLockMark(); tryFaceId(); }
  });

  // ---------- Face ID ----------
  // An optional passkey on this phone, used only as a key to the lock screen: iOS
  // has to pass its own Face ID check before the passkey answers. The PIN stays
  // as the way in whenever Face ID doesn't.

  var faceIdBusy = false;

  function randomBytes(n) {
    var b = new Uint8Array(n);
    crypto.getRandomValues(b);
    return b;
  }

  function bytesToB64(buf) {
    var s = '';
    new Uint8Array(buf).forEach(function (c) { s += String.fromCharCode(c); });
    return btoa(s);
  }

  function b64ToBytes(str) {
    var s = atob(str);
    var b = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) b[i] = s.charCodeAt(i);
    return b;
  }

  function faceIdSupported(cb) {
    if (!window.PublicKeyCredential || !PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) { cb(false); return; }
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(cb, function () { cb(false); });
  }

  function paintFaceIdKey() {
    $('faceIdKey').classList.toggle('empty', !data.faceIdCredential);
  }

  function renderFaceIdRow() {
    faceIdSupported(function (ok) {
      $('faceIdBtn').classList.toggle('hidden', !ok && !data.faceIdCredential);
      $('faceIdMeta').textContent = data.faceIdCredential ? 'On' : 'Off';
    });
  }

  function enableFaceId() {
    navigator.credentials.create({
      publicKey: {
        challenge: randomBytes(32),
        rp: { name: 'Quit it' },
        user: { id: randomBytes(16), name: 'Quit it', displayName: 'Quit it lock screen' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' },
        timeout: 60000,
        attestation: 'none'
      }
    }).then(function (cred) {
      data.faceIdCredential = bytesToB64(cred.rawId);
      saveData();
      renderFaceIdRow();
      paintFaceIdKey();
      showToast('Face ID is on.');
    }, function (err) {
      showToast(err && err.name === 'NotAllowedError' ? 'Face ID wasn’t turned on.' : 'Face ID isn’t available here.');
    });
  }

  function toggleFaceId() {
    if (!data.faceIdCredential) { enableFaceId(); return; }
    data.faceIdCredential = null;
    saveData();
    renderFaceIdRow();
    paintFaceIdKey();
    showToast('Face ID is off.');
  }

  // The answer has to be for this challenge, from this app, with Face ID actually checked.
  function faceIdAnswerOk(assertion, challenge) {
    try {
      var client = JSON.parse(new TextDecoder().decode(assertion.response.clientDataJSON));
      var expected = bytesToB64(challenge).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      var flags = new Uint8Array(assertion.response.authenticatorData)[32];
      return client.type === 'webauthn.get' && client.challenge === expected && client.origin === location.origin && (flags & 0x04) !== 0;
    } catch (e) {
      return false;
    }
  }

  function tryFaceId() {
    if (!data.faceIdCredential || faceIdBusy || state.unlocked || state.screen !== 'lock' || document.hidden) return;
    faceIdBusy = true;
    var challenge = randomBytes(32);
    navigator.credentials.get({
      publicKey: {
        challenge: challenge,
        allowCredentials: [{ type: 'public-key', id: b64ToBytes(data.faceIdCredential) }],
        userVerification: 'required',
        timeout: 60000
      }
    }).then(function (assertion) {
      faceIdBusy = false;
      if (state.unlocked || state.screen !== 'lock' || !faceIdAnswerOk(assertion, challenge)) return;
      state.lockBuffer = '';
      renderPinDots('pinDots', 0);
      $('lockError').textContent = '';
      if (data.pinFails || data.pinLockedUntil) {
        data.pinFails = 0;
        data.pinLockedUntil = 0;
        saveData();
      }
      clearInterval(lockoutTimer);
      unlockApp();
    }, function () {
      faceIdBusy = false;
    });
  }

  // ---------- navigation ----------

  // Detail and Settings add one history entry so Safari's swipe-back works;
  // returning Home any other way pops it so history stays in step.
  var SUB_SCREENS = { detail: true, overview: true };
  var ignoreNextPop = false;

  function goToScreen(name, habitId, direction, fromHistory) {
    var from = state.screen;
    state.screen = name;
    if (habitId) {
      if (habitId !== state.currentHabitId) state.calendarOffset = 0;
      state.currentHabitId = habitId;
    }
    if (!fromHistory) {
      var inSub = history.state && history.state.sub;
      if (SUB_SCREENS[name] && !inSub) history.pushState({ sub: true }, '');
      else if (name === 'home' && inSub) { ignoreNextPop = true; history.back(); }
    }
    if (from === 'trigger' && name !== 'trigger') {
      clearInterval(triggerTimerHandle);
      stopBreathing();
      inkStop();
      applyTheme();
    }
    if (!direction) {
      if (name === 'detail' && from === 'home') direction = 'push';
      else if (name === 'home' && (from === 'detail' || from === 'overview')) direction = 'pop';
      else if (name === 'overview' && from === 'home') direction = 'push';
    }
    if (name === 'home') { renderHome(); showScreenEl('homeScreen', direction); }
    else if (name === 'detail') { renderDetail(state.currentHabitId, { enter: true }); showScreenEl('detailScreen', direction); }
    else if (name === 'overview') { renderOverview(); showScreenEl('overviewScreen', direction); }
    else if (name === 'trigger') { showScreenEl('triggerScreen'); }
    else if (name === 'onboard') { $('onboardDate').textContent = formatDateline(new Date()); showScreenEl('onboardScreen'); }
  }

  window.addEventListener('popstate', function () {
    if (ignoreNextPop) { ignoreNextPop = false; return; }
    if (history.state && history.state.sub) return;
    // Going back while locked never skips the PIN; it just changes where unlocking lands.
    if (!state.unlocked) { if (SUB_SCREENS[state.preLockScreen]) state.preLockScreen = 'home'; return; }
    // Safari already animated its own swipe-back, so land on Home without another animation.
    if (SUB_SCREENS[state.screen] || state.screen === 'trigger') goToScreen('home', null, 'instant', true);
  });

  // The installed home-screen app has no browser swipe-back, so drag from the left edge here.
  // Like iOS, Home is already drawn underneath and slides in with a slight parallax.
  function wireEdgeSwipe(screen) {
    if (!window.navigator.standalone) return;
    var under = null;
    var tracking = false, locked = false, startX = 0, startY = 0, dx = 0, lastX = 0, lastT = 0, speed = 0;

    function paint(p) {
      screen.style.transform = 'translateX(' + (p * 100) + '%)';
      under.style.transform = 'translateX(' + (-30 + 30 * p) + '%)';
      under.style.setProperty('--shade', String(0.2 * (1 - p)));
    }
    function cleanup() {
      screen.classList.remove('is-dragging', 'is-settling', 'is-leaving');
      screen.style.transform = '';
      if (under) {
        under.classList.remove('is-under', 'is-settling', 'is-leaving');
        under.style.transform = '';
        under.style.removeProperty('--shade');
      }
      under = null;
    }

    screen.addEventListener('touchstart', function (e) {
      if (!SUB_SCREENS[state.screen] || under || e.touches[0].clientX > 22) return;
      tracking = true; locked = false; dx = 0; speed = 0;
      startX = lastX = e.touches[0].clientX; startY = e.touches[0].clientY; lastT = e.timeStamp;
    }, { passive: true });
    screen.addEventListener('touchmove', function (e) {
      if (!tracking) return;
      var x = e.touches[0].clientX;
      var mx = x - startX, my = e.touches[0].clientY - startY;
      if (!locked) {
        if (Math.abs(mx) < 6 && Math.abs(my) < 6) return;
        if (Math.abs(my) > Math.abs(mx)) { tracking = false; return; }
        locked = true;
        renderHome();
        under = $('homeScreen');
        document.body.classList.add('instant');
        under.classList.add('is-under');
        screen.classList.add('is-dragging');
      }
      e.preventDefault();
      if (e.timeStamp > lastT) speed = (x - lastX) / (e.timeStamp - lastT);
      lastX = x; lastT = e.timeStamp;
      dx = Math.max(0, mx);
      paint(Math.min(1, dx / screen.offsetWidth));
    }, { passive: false });

    function end() {
      if (!tracking) return;
      tracking = false;
      if (!locked) return;
      var commit = dx > screen.offsetWidth * 0.35 || (speed > 0.45 && dx > 30);
      screen.classList.remove('is-dragging');
      screen.classList.add(commit ? 'is-leaving' : 'is-settling');
      under.classList.add(commit ? 'is-leaving' : 'is-settling');
      paint(commit ? 1 : 0);
      setTimeout(function () {
        cleanup();
        if (commit) goToScreen('home', null, 'instant');
        else document.body.classList.remove('instant');
      }, 260);
    }
    screen.addEventListener('touchend', end);
    screen.addEventListener('touchcancel', end);
  }

  // Text follows the iPhone's text-size setting: Apple's body text is 17px at
  // the default size, which maps to this app's 16px; scaled and capped.
  function applyTextSize() {
    if (!window.CSS || !CSS.supports('font', '-apple-system-body')) return;
    var probe = document.createElement('div');
    probe.style.cssText = 'font: -apple-system-body; position: absolute; visibility: hidden;';
    document.body.appendChild(probe);
    var px = parseFloat(getComputedStyle(probe).fontSize);
    probe.remove();
    if (!px) return;
    var size = Math.min(21, Math.max(14, 16 * px / 17));
    document.documentElement.style.fontSize = size + 'px';
  }

  function archiveHabit(habit) {
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
  }

  // ---------- press-and-hold menu ----------

  var MENU_ICONS = {
    relapse: '<path d="M4 12a8 8 0 108-8"/><path d="M4 4v4h4"/>',
    card: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h5"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9"/><path d="M10 13h4"/>'
  };

  function attachHoldMenu(card, habit) {
    var timer = null, sx = 0, sy = 0;
    card.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      delete card.dataset.longPressed;
      sx = e.clientX; sy = e.clientY;
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (!state.unlocked || state.screen !== 'home') return;
        card.dataset.longPressed = '1';
        openHabitMenu(habit, card);
      }, 480);
    });
    card.addEventListener('pointermove', function (e) {
      if (Math.abs(e.clientX - sx) > 8 || Math.abs(e.clientY - sy) > 8) clearTimeout(timer);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (t) {
      card.addEventListener(t, function () { clearTimeout(timer); });
    });
    card.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  // Preview and menu share one width and stack as a group, kept on screen,
  // starting near where the finger pressed; the preview glides there from the original row.
  function placeMenu(preview, menu, rect) {
    var w = Math.min(window.innerWidth - 32, 528);
    var left = (window.innerWidth - w) / 2;
    preview.style.width = menu.style.width = w + 'px';
    preview.style.left = menu.style.left = left + 'px';
    var gap = 10;
    var pH = preview.offsetHeight, mH = menu.offsetHeight;
    var topMin = 16 + (parseFloat(getComputedStyle(document.body).paddingTop) || 0);
    var top = Math.max(topMin, Math.min(rect.top, window.innerHeight - pH - gap - mH - 24));
    preview.style.top = top + 'px';
    menu.style.top = (top + pH + gap) + 'px';
    preview.style.transform = 'translateY(' + (rect.top - top) + 'px) scale(0.96)';
    void preview.offsetWidth;
  }

  function openHabitMenu(habit, card) {
    var items = [
      { label: 'Log a relapse', icon: 'relapse', destructive: true, run: function () { state.currentHabitId = habit.id; openRelapseSheet(habit.id); } },
      { label: 'Streak card', icon: 'card', run: function () { openStreakCard(habit.id); } },
      { label: 'Edit', icon: 'edit', run: function () { openHabitSheet(habit.id); } },
      { label: 'Archive', icon: 'archive', run: function () { archiveHabit(habit); } }
    ];
    var rect = card.getBoundingClientRect();
    var backdrop = el('div', 'ctx-backdrop');
    // The preview is always the full list-style row (even from grid view), so nothing gets cut off.
    var preview = el('div', 'ctx-preview');
    var clone = card.cloneNode(true);
    clone.removeAttribute('style');
    preview.appendChild(clone);
    backdrop.appendChild(preview);

    var menu = el('div', 'ctx-menu');
    menu.setAttribute('role', 'menu');
    items.forEach(function (item) {
      var b = el('button', 'ctx-item' + (item.destructive ? ' is-destructive' : ''));
      b.type = 'button';
      b.setAttribute('role', 'menuitem');
      b.appendChild(el('span', '', item.label));
      b.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 24 24">' + MENU_ICONS[item.icon] + '</svg>');
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        close();
        setTimeout(item.run, 120);
      });
      menu.appendChild(b);
    });
    backdrop.appendChild(menu);
    document.body.appendChild(backdrop);
    placeMenu(preview, menu, rect);
    requestAnimationFrame(function () {
      backdrop.classList.add('is-open');
      preview.style.transform = '';
    });

    function close() {
      backdrop.classList.remove('is-open');
      document.removeEventListener('keydown', onKey);
      setTimeout(function () { backdrop.remove(); }, 220);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
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

    showTip($('homeTip'), 'home-hold', list.length > 0);

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

      attachHoldMenu(card, habit);
      card.addEventListener('click', function () {
        if (card.dataset.longPressed) { delete card.dataset.longPressed; return; }
        goToScreen('detail', habit.id);
      });

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
    ref.unitEl.textContent = parts.unit;
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

    var nums = document.querySelectorAll('#heroClock .clock-num');
    nums.forEach(function (n) { n.classList.remove('is-reset'); });
    if (opts.reset) {
      void nums[0].offsetWidth;
      nums.forEach(function (n) { n.classList.add('is-reset'); });
    }
    // Arriving on the page, or restarting the count, draws the tally afresh.
    if (opts.enter || opts.reset) $('heroTally')._key = null;

    detailRefs = {
      habitId: habitId,
      bestEl: $('detailBest'),
      fill: $('detailProgressFill'),
      nextLabel: $('detailNextLabel')
    };
    paintDetailFigures(habit);

    $('detailSince').textContent = 'Since ' + formatDateTime(streakStart(habit));
    $('setLastTimeBtn').classList.toggle('hidden', countsFromRelapse(habit));

    $('detailProgressFill').style.width = '0%';
    requestAnimationFrame(function () { paintProgress(habit, detailRefs.fill, detailRefs.nextLabel); });

    renderPatterns(habit);
    renderCalendar(habit);
    showTip($('calTip'), 'calendar');
    renderMilestoneList(habit);
    renderHistory(habit);
    showDetailTab(state.detailTab);
  }

  function showDetailTab(name) {
    state.detailTab = name;
    document.querySelectorAll('#detailTabs .ledger-tab').forEach(function (t, i) {
      if (t.dataset.tab === name) $('detailTabs').style.setProperty('--tab-i', i);
      t.classList.toggle('is-active', t.dataset.tab === name);
      t.setAttribute('aria-selected', t.dataset.tab === name ? 'true' : 'false');
    });
    document.querySelectorAll('#detailScreen .detail-pane').forEach(function (p) {
      p.classList.toggle('hidden', p.dataset.pane !== name);
    });
  }

  // A figure on the clean-time ledger. When it changes while you watch, the new
  // number settles into place like a fresh entry.
  function setFigure(node, text, animate) {
    if (node.textContent === text) return;
    node.textContent = text;
    if (animate && node.animate && !reduceMotion()) {
      node.animate([{ opacity: 0, transform: 'translateY(0.16em)' }, { opacity: 1, transform: 'none' }], { duration: 460, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' });
    }
  }

  // The hero: days, hours and minutes clean, the rule under them inked across once a
  // minute, and the tally of days below. `live` is the once-a-second repaint.
  function paintClock(habit, live) {
    var ms = currentStreakMs(habit);
    var d = Math.floor(ms / DAY), h = Math.floor((ms % DAY) / HOUR), m = Math.floor((ms % HOUR) / MINUTE);
    setFigure($('detailStreakNum'), String(d), live);
    setFigure($('heroHours'), pad2(h), live);
    setFigure($('heroMinutes'), pad2(m), live);
    $('detailStreakUnit').textContent = d === 1 ? 'day' : 'days';
    $('heroHoursUnit').textContent = h === 1 ? 'hour' : 'hours';
    $('heroMinutesUnit').textContent = m === 1 ? 'minute' : 'minutes';
    var clock = $('heroClock');
    clock.classList.toggle('is-long', d >= 1000);
    clock.setAttribute('aria-label', plural(d, 'day') + ', ' + plural(h, 'hour') + ', ' + plural(m, 'minute') + ' clean');

    var pen = $('heroPen');
    var p = (ms % MINUTE) / MINUTE;
    if (!live || p < (pen._p || 0)) {
      pen.classList.add('is-wrapping');
      pen.style.setProperty('--p', p.toFixed(4));
      void pen.offsetWidth;
      pen.classList.remove('is-wrapping');
    }
    if (live) pen.style.setProperty('--p', Math.min(1, p + 1 / 60).toFixed(4));
    pen._p = p;

    var svg = $('heroTally');
    var frac = (ms % DAY) / DAY;
    var key = habit.id + ':' + d;
    if (svg._key !== key) {
      buildTally(svg, d, frac, svg._key === null || svg._key === undefined);
      svg._key = key;
    } else if (svg._live) {
      svg._live.style.strokeDasharray = frac.toFixed(4) + ' 2';
    }
  }

  // ---------- tally ----------
  // The mark from the lock screen, carried through: one ink stroke per clean day,
  // every fifth one struck across the four before it. The stroke for the day in
  // progress is ghosted and fills with mustard as the day goes.

  function tallyNoise(i, salt) {
    var x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
    return (x - Math.floor(x)) * 2 - 1;
  }

  function fx(n) { return (Math.round(n * 100) / 100).toString(); }

  // Stroke number i (from 0), on the lock mark's own proportions: strokes 8 apart
  // and 28 tall, the slash reaching 5 past each side. A hand never repeats itself
  // exactly, so each stroke leans and lands a hair differently.
  function tallyStroke(i, perRow, pitch, u) {
    var b = Math.floor(i / 5), k = i % 5;
    var x0 = (b % perRow) * pitch + 5 * u;
    var y0 = Math.floor(b / perRow) * 42 * u + 2.5 * u;
    if (k < 4) {
      var x = x0 + k * 8 * u;
      return 'M' + fx(x + tallyNoise(i, 1) * 0.7 * u) + ' ' + fx(y0 + tallyNoise(i, 2) * 1.2 * u) +
        'L' + fx(x + tallyNoise(i, 3) * 0.7 * u) + ' ' + fx(y0 + (28 + tallyNoise(i, 4) * 1.2) * u);
    }
    return 'M' + fx(x0 - 5 * u) + ' ' + fx(y0 + (23 + tallyNoise(i, 5) * 1.5) * u) +
      'L' + fx(x0 + 29 * u) + ' ' + fx(y0 + (5 + tallyNoise(i, 6) * 1.5) * u);
  }

  // Picks how many bundles fit across so the tally stays a few rows tall, however long the streak.
  function tallyLayout(strokes, width, maxRows, maxHeight) {
    var bundles = Math.ceil(strokes / 5);
    var choices = [8, 10, 12, 16, 20, 25, 32, 40, 50];
    var lay = null;
    for (var c = 0; c < choices.length; c++) {
      var perRow = choices[c];
      var pitch = width / perRow, u = pitch / 44;
      var rows = Math.ceil(bundles / perRow);
      lay = { perRow: perRow, pitch: pitch, u: u, rows: rows, height: (rows * 28 + (rows - 1) * 14 + 5) * u, stroke: Math.max(0.9, 3.6 * u) };
      if (rows <= maxRows && (!maxHeight || lay.height <= maxHeight)) break;
    }
    return lay;
  }

  function buildTally(svg, days, frac, animate) {
    var W = 320;
    var lay = tallyLayout(days + 1, W, 5);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + fx(lay.height));
    svg.style.aspectRatio = W + ' / ' + fx(lay.height);
    svg.innerHTML = '';
    function add(d, cls, order) {
      var path = svgEl('path', { d: d, class: cls, 'stroke-width': fx(lay.stroke), pathLength: 1 });
      if (order !== undefined) path.style.setProperty('--i', order);
      svg.appendChild(path);
      return path;
    }
    var count;
    if (days <= 60) {
      // few enough to draw one by one, the way they were made
      for (var i = 0; i < days; i++) add(tallyStroke(i, lay.perRow, lay.pitch, lay.u), 't', i);
      count = days;
    } else {
      // a long streak arrives a bundle at a time
      var full = Math.floor(days / 5);
      for (var b = 0; b <= full; b++) {
        var d = '';
        for (var k = b * 5; k < Math.min(days, b * 5 + 5); k++) d += tallyStroke(k, lay.perRow, lay.pitch, lay.u);
        if (d) add(d, 'tb', b);
      }
      count = full + 1;
    }
    var step = Math.min(days <= 60 ? 55 : 30, 900 / Math.max(1, count));
    svg.style.setProperty('--step', step.toFixed(1) + 'ms');
    svg.style.setProperty('--after', Math.round(280 + count * step) + 'ms');
    var today = tallyStroke(days, lay.perRow, lay.pitch, lay.u);
    add(today, 'is-ghost');
    svg._live = add(today, 'is-live');
    svg._live.style.strokeDasharray = frac.toFixed(4) + ' 2';
    svg.classList.toggle('is-drawing', !!animate);
  }

  function paintDetailFigures(habit, live) {
    paintClock(habit, !!live);

    paintFigure(detailRefs.bestEl, bestStreakMs(habit));

    var avg = averageStreakMs(habit);
    var avgEl = $('detailAvg');
    if (avg === null) {
      avgEl.textContent = '–';
    } else {
      paintFigure(avgEl, avg);
    }

    $('detailRelapseCount').textContent = habit.relapses.length;
    var onLedger = Math.max(1, Math.floor((Date.now() - ledgerStart(habit)) / DAY) + 1);
    $('detailTrackingDays').textContent = onLedger;
  }

  // ---------- patterns ----------
  // One report for urges and relapses. On every chart urges are ink above the
  // line and relapses are terracotta below it, one mark for each time it happened.

  var BANDS = [
    { key: 'morning', label: 'Morning', range: '5–12', test: function (h) { return h >= 5 && h < 12; } },
    { key: 'afternoon', label: 'Afternoon', range: '12–17', test: function (h) { return h >= 12 && h < 17; } },
    { key: 'evening', label: 'Evening', range: '17–22', test: function (h) { return h >= 17 && h < 22; } },
    { key: 'night', label: 'Night', range: '22–5', test: function (h) { return h >= 22 || h < 5; } }
  ];
  var WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // An urge "passed" if no relapse was logged in the 24 hours after it.
  var URGE_WINDOW = DAY;

  // 'passed', 'lost' (a relapse followed within a day) or 'open' (too recent to call), oldest first.
  function urgeOutcomes(habit) {
    var now = Date.now();
    return habit.urges.map(function (t) {
      var lost = habit.relapses.some(function (r) { return r >= t && r - t < URGE_WINDOW; });
      return lost ? 'lost' : (now - t >= URGE_WINDOW ? 'passed' : 'open');
    });
  }

  function renderPatterns(habit) {
    var body = $('patternsBody');
    $('patternsNote').textContent = '';
    body.innerHTML = '';
    var nU = habit.urges.length, nR = habit.relapses.length;
    if (!nU && !nR) {
      body.appendChild(el('p', 'empty-note', 'Nothing to compare yet.'));
      return;
    }
    body.appendChild(buildReportFigures(habit));
    if (nU + nR >= 2) {
      body.appendChild(buildHourChart(habit));
      body.appendChild(buildWeekdayChart(habit));
    }
    var segs = completedSegments(habit);
    if (segs.length) body.appendChild(buildStreakChart(habit, segs));
  }

  function reportFigure(num, small, label, swatch) {
    var fig = el('div', 'report-fig');
    var n = el('div', 'report-num', String(num));
    if (small) n.appendChild(el('small', '', small));
    fig.appendChild(n);
    var l = el('div', 'report-label eyebrow');
    if (swatch) l.appendChild(el('i', 'swatch' + (swatch === 'terra' ? ' swatch-terra' : '')));
    l.appendChild(document.createTextNode(label));
    fig.appendChild(l);
    return fig;
  }

  // Urges, how many of them passed, and relapses; then every urge as one small
  // stroke, in order, so the run of ink is visible at a glance.
  function buildReportFigures(habit) {
    var wrap = el('div', 'report-head');
    var outcomes = urgeOutcomes(habit);
    var passed = outcomes.filter(function (o) { return o === 'passed'; }).length;
    var settled = outcomes.filter(function (o) { return o !== 'open'; }).length;
    var row = el('div', 'report-figures');
    row.appendChild(reportFigure(outcomes.length, '', 'Urges', 'ink'));
    row.appendChild(reportFigure(settled ? passed : '–', settled ? 'of ' + settled : '', 'Passed'));
    row.appendChild(reportFigure(habit.relapses.length, '', 'Relapses', 'terra'));
    wrap.appendChild(row);
    if (outcomes.length) {
      var strip = el('div', 'outcome-row');
      strip.setAttribute('role', 'img');
      strip.setAttribute('aria-label', settled ? passed + ' of ' + settled + ' urges passed' : plural(outcomes.length, 'urge'));
      outcomes.slice(-90).forEach(function (o, i) {
        var mark = el('i', o === 'lost' ? 'is-lost' : (o === 'open' ? 'is-open' : ''));
        mark.style.setProperty('--i', i);
        strip.appendChild(mark);
      });
      wrap.appendChild(strip);
    }
    return wrap;
  }

  function chartBlock(title, meta) {
    var block = el('div', 'chart-block');
    var head = el('div', 'chart-title');
    head.appendChild(el('span', 'eyebrow', title));
    if (meta) head.appendChild(el('span', 'chart-meta', meta));
    block.appendChild(head);
    return block;
  }

  // The one slot that clearly leads, or -1 when nothing stands out.
  function clearPeak(counts, share) {
    var total = 0, top = 0;
    counts.forEach(function (c, i) { total += c; if (c > counts[top]) top = i; });
    if (total < 3 || counts[top] < 2 || counts[top] / total < share) return -1;
    return top;
  }

  // Urges say more about when it gets hard; relapses stand in until there are enough of them.
  function patternSeries(habit) {
    return habit.urges.length >= 3 ? habit.urges : habit.relapses;
  }

  function hourLabel(h, compact) {
    var s = new Date(2000, 0, 1, h).toLocaleTimeString(undefined, { hour: 'numeric' });
    return compact ? s.replace(/\s+/g, '').toLowerCase() : s;
  }

  function countPhrase(u, r) {
    var parts = [];
    if (u) parts.push(plural(u, 'urge'));
    if (r) parts.push(plural(r, 'relapse'));
    return parts.length ? parts.join(' · ') : 'nothing logged';
  }

  // Columns of unit marks. o: { up, down, blockWidth, labels, shade, aria, describe }
  function buildMirrorChart(o) {
    var n = o.up.length;
    var W = 320, slot = W / n, bw = o.blockWidth;
    var maxUp = Math.max.apply(null, o.up), maxDown = Math.max.apply(null, o.down);
    var UNIT = 9, GAP = 1.5, AIR = 3;
    var unitUp = maxUp ? Math.min(UNIT, 56 / maxUp) : UNIT;
    var unitDown = maxDown ? Math.min(UNIT, 32 / maxDown) : UNIT;
    var upH = Math.max(20, maxUp * unitUp), downH = maxDown * unitDown;
    var base = 4 + upH + AIR;
    var bottom = base + AIR + downH + (maxDown ? 3 : 0);
    var H = bottom + 14;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'chart', role: 'img' });
    svg.setAttribute('aria-label', o.aria);
    (o.shade || []).forEach(function (r) {
      svg.appendChild(svgEl('rect', { x: r[0] * slot, y: 0, width: (r[1] - r[0]) * slot, height: bottom, class: 'night' }));
    });
    svg.appendChild(svgEl('line', { x1: 0, x2: W, y1: base, y2: base, class: 'axis' }));

    function stack(g, x, from, dir, count, unit, cls, order) {
      if (!count) return;
      if (unit < 5) {
        var h = count * unit - GAP;
        var solid = svgEl('rect', { x: x, y: dir < 0 ? from - h : from, width: bw, height: h, class: 'blk ' + cls });
        solid.style.setProperty('--i', order);
        g.appendChild(solid);
        return;
      }
      for (var k = 0; k < count; k++) {
        var y = dir < 0 ? from - (k + 1) * unit + GAP : from + k * unit;
        var blk = svgEl('rect', { x: x, y: y, width: bw, height: unit - GAP, class: 'blk ' + cls });
        blk.style.setProperty('--i', order + k * 2);
        g.appendChild(blk);
      }
    }

    var tip = el('div', 'chart-tip');
    var cols = [];
    o.up.forEach(function (u, i) {
      var g = svgEl('g', { class: 'col' });
      var x = slot * i + (slot - bw) / 2;
      stack(g, x, base - AIR, -1, u, unitUp, 'u', i);
      stack(g, x, base + AIR, 1, o.down[i], unitDown, 'r', i);
      g.appendChild(svgEl('line', { x1: x - 1, x2: x + bw + 1, y1: base, y2: base, class: 'col-mark' }));
      if (o.labels[i]) {
        var t = svgEl('text', { x: o.labelAnchor === 'start' ? slot * i + 1 : slot * i + slot / 2, y: H - 2, 'text-anchor': o.labelAnchor === 'start' ? 'start' : 'middle' });
        t.textContent = o.labels[i];
        g.appendChild(t);
      }
      var hit = svgEl('rect', { x: slot * i, y: 0, width: slot, height: H, class: 'hit' });
      var show = function () {
        tip.textContent = o.describe(i);
        cols.forEach(function (c) { c.classList.remove('is-active'); });
        g.classList.add('is-active');
      };
      hit.addEventListener('mouseenter', show);
      hit.addEventListener('click', show);
      g.appendChild(hit);
      cols.push(g);
      svg.appendChild(g);
    });
    return { svg: svg, tip: tip };
  }

  function buildHourChart(habit) {
    var up = [], down = [];
    for (var h = 0; h < 24; h++) { up.push(0); down.push(0); }
    habit.urges.forEach(function (t) { up[new Date(t).getHours()]++; });
    habit.relapses.forEach(function (t) { down[new Date(t).getHours()]++; });
    var bandCounts = BANDS.map(function () { return 0; });
    patternSeries(habit).forEach(function (t) {
      var hr = new Date(t).getHours();
      BANDS.forEach(function (b, i) { if (b.test(hr)) bandCounts[i]++; });
    });
    var peak = clearPeak(bandCounts, 0.4);
    var block = chartBlock('Time of day', peak === -1 ? '' : BANDS[peak].label);
    var chart = buildMirrorChart({
      up: up, down: down, blockWidth: 9.5,
      labels: up.map(function (c, i) { return i % 6 === 0 ? hourLabel(i, true) : null; }),
      labelAnchor: 'start',
      shade: [[0, 5], [22, 24]],
      aria: 'Urges and relapses by hour of the day',
      describe: function (i) { return hourLabel(i) + ' · ' + countPhrase(up[i], down[i]); }
    });
    block.appendChild(chart.svg);
    block.appendChild(chart.tip);
    return block;
  }

  function buildWeekdayChart(habit) {
    var up = [0, 0, 0, 0, 0, 0, 0], down = [0, 0, 0, 0, 0, 0, 0], lead = [0, 0, 0, 0, 0, 0, 0];
    habit.urges.forEach(function (t) { up[new Date(t).getDay()]++; });
    habit.relapses.forEach(function (t) { down[new Date(t).getDay()]++; });
    patternSeries(habit).forEach(function (t) { lead[new Date(t).getDay()]++; });
    var peak = clearPeak(lead, 0.34);
    var block = chartBlock('Day of week', peak === -1 ? '' : WEEKDAYS_LONG[peak]);
    var chart = buildMirrorChart({
      up: up, down: down, blockWidth: 26,
      labels: WEEKDAYS.map(function (d) { return d.charAt(0); }),
      aria: 'Urges and relapses by day of the week',
      describe: function (i) { return WEEKDAYS_LONG[i] + ' · ' + countPhrase(up[i], down[i]); }
    });
    block.appendChild(chart.svg);
    block.appendChild(chart.tip);
    return block;
  }

  // Every streak as one pen stroke, oldest first; the one still running is mustard.
  function buildStreakChart(habit, segs) {
    var MAX = 24;
    var items = segs.map(function (s) { return { ms: s.ms, start: s.start, end: s.end, current: false }; });
    items.push({ ms: currentStreakMs(habit), start: streakStart(habit), end: null, current: true });
    if (items.length > MAX) items = items.slice(items.length - MAX);
    var best = bestStreakMs(habit);

    var block = chartBlock('Streaks', 'best ' + formatDuration(best));

    var W = 320, H = 98, padB = 16, padT = 16;
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'chart', role: 'img' });
    svg.setAttribute('aria-label', 'Streak lengths, oldest to newest');
    var slot = W / Math.max(items.length, 10);
    var sw = Math.max(2.5, Math.min(5, slot * 0.3));
    var maxMs = Math.max(best, DAY);
    var plotH = H - padB - padT;
    var base = H - padB;

    if (best > 0) {
      var by = padT + plotH - (best / maxMs) * plotH;
      svg.appendChild(svgEl('line', { x1: 0, x2: W, y1: by, y2: by, class: 'marker' }));
    }
    svg.appendChild(svgEl('line', { x1: 0, x2: W, y1: base, y2: base, class: 'axis' }));

    var tip = el('div', 'chart-tip');
    var strokes = [];
    var bestLabelled = false;
    items.forEach(function (it, i) {
      var h = Math.max(3, (it.ms / maxMs) * plotH);
      var cx = slot * i + slot / 2;
      var top = base - h + sw / 2;
      var stroke = svgEl('path', { d: 'M' + fx(cx) + ' ' + fx(base - sw / 2 - 1.5) + 'V' + fx(Math.min(top, base - sw / 2 - 2)), class: 'stroke' + (it.current ? ' is-current' : ''), 'stroke-width': fx(sw), pathLength: 1 });
      stroke.style.setProperty('--i', i);
      svg.appendChild(stroke);
      strokes.push(stroke);
      var isBest = !it.current && it.ms === best && best > 0 && !bestLabelled;
      if (it.current || isBest) {
        if (isBest) bestLabelled = true;
        var anchor = cx < 14 ? 'start' : (cx > W - 14 ? 'end' : 'middle');
        var lbl = svgEl('text', { x: anchor === 'middle' ? cx : (anchor === 'start' ? cx - sw / 2 : cx + sw / 2), y: base - h - 5, 'text-anchor': anchor, class: 'bar-lbl' + (it.current ? ' strong' : '') });
        lbl.textContent = it.current ? 'NOW' : 'BEST';
        svg.appendChild(lbl);
      }
      var hit = svgEl('rect', { x: slot * i, y: 0, width: slot, height: H, class: 'hit' });
      var describe = function () {
        var when = it.current ? 'since ' + formatDateShort(it.start) : formatDateShort(it.start) + ' to ' + formatDateShort(it.end);
        tip.textContent = formatDuration(it.ms) + ' · ' + when;
        strokes.forEach(function (b) { b.classList.remove('is-active'); });
        if (!it.current) stroke.classList.add('is-active');
      };
      hit.addEventListener('mouseenter', describe);
      hit.addEventListener('click', describe);
      svg.appendChild(hit);
    });

    var first = svgEl('text', { x: 0, y: H - 2 });
    first.textContent = formatDateShort(items[0].start).toUpperCase();
    svg.appendChild(first);

    block.appendChild(svg);
    tip.textContent = useTip('pattern-bars') ? 'Tap a stroke for its dates.' : '';
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
      if (cellDate > todayDate) {
        cell.classList.add('future');
      } else {
        cell.classList.add('is-editable');
        cell.dataset.key = key;
        cell.dataset.y = year;
        cell.dataset.m = month;
        cell.dataset.d = day;
        if (relapseDays[key]) cell.classList.add('event');
      }
      grid.appendChild(cell);
    }
    while (grid.children.length % 7) grid.appendChild(el('div', 'cal-cell cal-blank'));

    var currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    $('calPrevBtn').disabled = false;
    $('calNextBtn').disabled = viewDate.getTime() >= currentMonthStart.getTime();
  }

  // ---------- history ----------

  function renderHistory(habit) {
    var host = $('historyList');
    host.innerHTML = '';
    $('historyNote').textContent = '';
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
      titleWrap.appendChild(el('span', 'ms-title', m.title.replace(' clean', '')));
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
  // A poster, 4:5. Paper, one mustard sun, the count set large in ink over it,
  // and the days themselves tallied underneath.

  function drawStreakCard(habit) {
    var W = 1080, H = 1350, M = 96;
    var PAPER = '#F7F4EC', INK = '#1A1A1A', INK2 = '#5A574E', INK3 = '#857F72', MUSTARD = '#E8B923', GHOST = '#C6C0AC';
    var canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    var ctx = canvas.getContext('2d');
    var ms = currentStreakMs(habit);
    var parts = formatStreak(ms, true);
    var days = Math.floor(ms / DAY);

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);

    // the sun, running off the right edge
    ctx.fillStyle = MUSTARD;
    ctx.beginPath();
    ctx.arc(W - 236, 548, 352, 0, Math.PI * 2);
    ctx.fill();

    // masthead: the mark, the name of the ledger, the date, and a thick-and-thin rule
    ctx.strokeStyle = INK;
    ctx.lineCap = 'square';
    ctx.lineWidth = 4.6;
    ctx.save();
    ctx.translate(M - 6, 76);
    ctx.scale(1.2, 1.2);
    ctx.stroke(new Path2D('M12 10v28M20 10v28M28 10v28M36 10v28M7 33L41 15'));
    ctx.restore();
    ctx.fillStyle = INK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '700 46px ' + CARD_SERIF;
    ctx.fillText('Quit it', M + 62, 121);
    ctx.fillStyle = INK2;
    ctx.font = '600 21px ' + CARD_SANS;
    var dateText = new Date().toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
    drawTracked(ctx, dateText, W - M - trackedWidth(ctx, dateText, 4.5), 119, 4.5);
    ctx.fillStyle = INK;
    ctx.fillRect(M, 152, W - M * 2, 5);
    ctx.fillRect(M, 165, W - M * 2, 1.5);

    // what it is
    ctx.font = '600 62px ' + CARD_SERIF;
    ctx.fillText(fitText(ctx, habit.name, W - M * 2), M, 268);

    // the count
    var numText = String(parts.value);
    var numSize = numText.length >= 4 ? 372 : (numText.length === 3 ? 480 : 590);
    ctx.font = '600 ' + numSize + 'px ' + CARD_SERIF;
    if ('letterSpacing' in ctx) ctx.letterSpacing = Math.round(-numSize * 0.035) + 'px';
    var numY = 800;
    ctx.fillText(numText, M - numSize * 0.03, numY);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';

    ctx.font = 'italic 400 66px ' + CARD_SERIF;
    ctx.fillStyle = INK;
    ctx.fillText(parts.unit + ' clean', M, numY + 98);

    // the days, tallied; today's stroke is still being drawn
    var top = 968, room = 176;
    var lay = tallyLayout(days + 1, W - M * 2, 4, room);
    ctx.save();
    ctx.translate(M, top + (room - lay.height) / 2);
    ctx.lineWidth = lay.stroke;
    ctx.strokeStyle = INK;
    var done = '';
    for (var i = 0; i < days; i++) done += tallyStroke(i, lay.perRow, lay.pitch, lay.u);
    if (done) ctx.stroke(new Path2D(done));
    ctx.strokeStyle = GHOST;
    ctx.stroke(new Path2D(tallyStroke(days, lay.perRow, lay.pitch, lay.u)));
    ctx.restore();

    // foot: since when, and the best there has been
    ctx.fillStyle = INK;
    ctx.fillRect(M, 1178, W - M * 2, 1.5);
    var colB = W / 2 + 24;
    ctx.fillStyle = INK3;
    ctx.font = '600 21px ' + CARD_SANS;
    drawTracked(ctx, 'SINCE', M, 1228, 4.5);
    drawTracked(ctx, 'BEST', colB, 1228, 4.5);
    ctx.fillStyle = INK;
    ctx.font = '600 44px ' + CARD_SERIF;
    ctx.fillText(new Date(streakStart(habit)).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }), M, 1284);
    ctx.fillText(formatDuration(bestStreakMs(habit)), colB, 1284);

    return canvas;
  }

  function trackedWidth(ctx, text, tracking) {
    var w = 0;
    for (var i = 0; i < text.length; i++) w += ctx.measureText(text.charAt(i)).width + tracking;
    return w - tracking;
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
          : 'Only what you see here goes in the image.' + (useTip('card-save') ? ' On iPhone, you can also press and hold it to save.' : '');
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
    $('backupMeta').textContent = backupAgeLabel();
    renderFaceIdRow();
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
    showTip($('whyTip'), 'habit-why');
    if (!habit) showTip($('sinceTip'), 'habit-since');
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
      if (state.screen === 'detail') renderDetail(habit.id);
      else renderHome();
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

  // Moves the clean-since date. Only offered while the current streak counts
  // from it; once a later relapse exists, the calendar handles edits.
  function correctTrackingStart(habitId, timestamp) {
    var habit = findHabit(habitId);
    if (!habit) return;
    habit.createdAt = timestamp;
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
    $('lastRelapseText').textContent = 'This sets the moment you actually stopped, so the count starts from there. Nothing is logged as a relapse.';
    openSheet('lastRelapseSheet');
  }

  function saveLastRelapseSheet() {
    var habit = findHabit(state.currentHabitId);
    if (!habit) return;
    var errEl = $('lastRelapseError');
    var ts = parseDateTimeInputs($('lastRelapseDate').value, $('lastRelapseTime').value);
    if (isNaN(ts)) { errEl.textContent = 'Enter a date and time.'; return; }
    if (ts > Date.now()) { errEl.textContent = "That's in the future. Pick a time up to now."; return; }
    if (habit.lastRelapseAt && ts <= habit.lastRelapseAt) {
      errEl.textContent = 'That is before your relapse on ' + formatDateShort(habit.lastRelapseAt) + ', so the count would start there instead.';
      return;
    }
    correctTrackingStart(habit.id, ts);
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
  var triggerOpening = false;

  // Every "I'm triggered" quietly logs an urge for that habit. Reopening within
  // 15 minutes is the same urge, and closing within 3 seconds was a mis-tap.
  var URGE_MERGE = 15 * MINUTE;
  var URGE_MISTAP = 3000;
  var loggedUrgeAt = null;

  function logUrge(habit) {
    loggedUrgeAt = null;
    if (!habit) return;
    var now = Date.now();
    var last = habit.urges[habit.urges.length - 1];
    if (last && now - last < URGE_MERGE) return;
    habit.urges.push(now);
    loggedUrgeAt = now;
    saveData();
  }

  function dropMistappedUrge(habit, stayed) {
    if (!habit || !loggedUrgeAt || stayed >= URGE_MISTAP) return;
    var idx = habit.urges.indexOf(loggedUrgeAt);
    if (idx !== -1) { habit.urges.splice(idx, 1); saveData(); }
    loggedUrgeAt = null;
  }

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
    if (triggerOpening) return;
    hideToast();
    lastTriggerText = null;
    var text = pickActivity();
    lastTriggerText = text;
    $('triggerText').textContent = text;
    var habit = findHabit(state.currentHabitId);
    logUrge(habit);
    var why = habit && habit.why ? habit.why : '';
    $('triggerWhy').classList.toggle('hidden', !why);
    $('triggerWhyText').textContent = why ? '“' + why + '”' : '';
    showTriggerMode('idea');
    triggerOpenedAt = Date.now();
    triggerOpening = true;
    // The page goes dark from the button outward, like ink let into water.
    inkWipe(true, $('triggerBtn'), function () {
      triggerOpening = false;
      if (!state.unlocked || state.screen !== 'detail') return;
      clearInterval(triggerTimerHandle);
      paintTriggerTimer();
      triggerTimerHandle = setInterval(paintTriggerTimer, 1000);
      setThemeColor(THEME_COLORS.dark);
      goToScreen('trigger');
      inkStart();
    });
  }

  function paintTriggerTimer() {
    var s = Math.floor((Date.now() - triggerOpenedAt) / 1000);
    var m = Math.floor(s / 60);
    $('triggerTimer').textContent = m + ':' + pad2(s % 60);
  }

  function closeTrigger() {
    if (state.screen !== 'trigger') return;
    clearInterval(triggerTimerHandle);
    stopBreathing();
    var stayed = Date.now() - triggerOpenedAt;
    dropMistappedUrge(findHabit(state.currentHabitId), stayed);
    var dest = state.currentHabitId && findHabit(state.currentHabitId) ? 'detail' : 'home';
    // ...and draws back into the button it came from.
    inkWipe(false, null, function () {
      goToScreen(dest, null, 'instant');
      if (stayed >= 2 * MINUTE) showToast('You stayed with it for ' + formatDuration(stayed) + '.');
      return dest === 'detail' ? $('triggerBtn') : null;
    });
  }

  function rerollTrigger() {
    var card = $('triggerCard');
    var text = pickActivity();
    lastTriggerText = text;
    card.classList.add('is-swapping');
    setTimeout(function () {
      $('triggerText').textContent = text;
      card.classList.remove('is-swapping');
    }, 230);
  }

  function showTriggerMode(mode) {
    var breathing = mode === 'breathe';
    $('triggerIdeaMode').classList.toggle('hidden', breathing);
    $('triggerBreathMode').classList.toggle('hidden', !breathing);
    $('triggerIdeaActions').classList.toggle('hidden', breathing);
    $('triggerBreathActions').classList.toggle('hidden', !breathing);
  }

  // --- the page turning to ink and back ---
  // A flat dark circle that opens from (or closes into) one spot, covering the
  // change of screen underneath it. With Reduce Motion the screens simply swap.

  var inkWipeState = null;

  function cancelInkWipe() {
    if (!inkWipeState) return;
    var st = inkWipeState;
    inkWipeState = null;
    if (st.anim) st.anim.cancel();
    st.node.remove();
  }

  function inkCircle(target) {
    var rect = target ? target.getBoundingClientRect() : null;
    var on = rect && rect.width > 0;
    var x = on ? rect.left + rect.width / 2 : window.innerWidth / 2;
    var y = on ? rect.top + rect.height / 2 : window.innerHeight / 2;
    var dx = Math.max(x, window.innerWidth - x), dy = Math.max(y, window.innerHeight - y);
    var max = Math.sqrt(dx * dx + dy * dy) + 12;
    return {
      shut: 'circle(0px at ' + x.toFixed(1) + 'px ' + y.toFixed(1) + 'px)',
      open: 'circle(' + max.toFixed(1) + 'px at ' + x.toFixed(1) + 'px ' + y.toFixed(1) + 'px)'
    };
  }

  // opening: the ink spreads from originEl, then swap() runs underneath it.
  // closing: swap() runs first and returns the element the ink draws back into.
  function inkWipe(opening, originEl, swap) {
    cancelInkWipe();
    var node = el('div', 'ink-wipe');
    if (reduceMotion() || !node.animate) { swap(); return; }
    var st = inkWipeState = { node: node, anim: null };
    document.body.appendChild(node);
    if (opening) {
      var c = inkCircle(originEl);
      node.style.clipPath = c.shut;
      st.anim = node.animate([{ clipPath: c.shut }, { clipPath: c.open }], { duration: 620, easing: 'cubic-bezier(0.6, 0, 0.3, 1)', fill: 'forwards' });
      st.anim.onfinish = function () {
        if (inkWipeState !== st) return;
        swap();
        requestAnimationFrame(function () { if (inkWipeState === st) cancelInkWipe(); });
      };
    } else {
      var c2 = inkCircle(swap());
      if (inkWipeState !== st) return;
      st.anim = node.animate([{ clipPath: c2.open }, { clipPath: c2.shut }], { duration: 560, easing: 'cubic-bezier(0.5, 0, 0.2, 1)', fill: 'forwards' });
      st.anim.onfinish = function () { if (inkWipeState === st) cancelInkWipe(); };
    }
  }

  // --- the ink ---
  // Flat mustard ink on the dark page, drawn behind the words: a few nested washes
  // with uneven, slowly shifting edges around a solid heart. It rests at the edge of
  // the page while you read. When you breathe it moves under your thumb, spreads
  // across the page as you breathe in, and draws back as you breathe out.

  var INK_RGB = '232, 185, 35';
  var INK_WASHES = [
    { r0: 0.37, r1: 1.34, a: 0.045, wob: 0.07, pow: 0.72, seed: 0.0 },
    { r0: 0.30, r1: 1.00, a: 0.055, wob: 0.085, pow: 0.92, seed: 1.0 },
    { r0: 0.23, r1: 0.70, a: 0.075, wob: 0.10, pow: 1.2, seed: 2.0 },
    { r0: 0.16, r1: 0.44, a: 0.10, wob: 0.11, pow: 1.55, seed: 3.0 }
  ];
  // [lobes around the edge, strength, drift]
  var INK_HARMONICS = [[1, 0.5, 0.11], [2, 1.0, -0.17], [3, 0.8, 0.23], [4, 0.55, -0.29], [5, 0.45, 0.19], [7, 0.3, -0.37], [9, 0.2, 0.31], [13, 0.1, -0.43]];
  var INK_POINTS = 72;
  var ink = null;

  function inkEdge(theta, t, seed) {
    var n = 0;
    for (var i = 0; i < INK_HARMONICS.length; i++) {
      var h = INK_HARMONICS[i];
      n += h[1] * Math.sin(h[0] * theta + i * 1.9 + seed * 0.55 * (1 + i * 0.3) + t * h[2] * 2.4);
    }
    return n / 1.9;
  }

  function inkBlob(c, cx, cy, radius, wobble, t, seed) {
    var pts = [];
    for (var i = 0; i < INK_POINTS; i++) {
      var th = i / INK_POINTS * Math.PI * 2;
      var r = radius * (1 + wobble * inkEdge(th, t, seed));
      pts.push(cx + Math.cos(th) * r, cy + Math.sin(th) * r);
    }
    var len = pts.length;
    c.beginPath();
    c.moveTo((pts[len - 2] + pts[0]) / 2, (pts[len - 1] + pts[1]) / 2);
    for (var k = 0; k < len; k += 2) {
      var nx = pts[(k + 2) % len], ny = pts[(k + 3) % len];
      c.quadraticCurveTo(pts[k], pts[k + 1], (pts[k] + nx) / 2, (pts[k + 1] + ny) / 2);
    }
    c.closePath();
  }

  function inkStart() {
    inkStop();
    var canvas = $('inkCanvas');
    ink = { canvas: canvas, ctx: canvas.getContext('2d'), t: 0, rest: 0, blend: 0, appear: 0, last: 0, raf: 0, sig: '' };
    inkResize();
    ink.raf = requestAnimationFrame(inkFrame);
  }

  function inkStop() {
    if (!ink) return;
    cancelAnimationFrame(ink.raf);
    ink.ctx.clearRect(0, 0, ink.w, ink.h);
    ink = null;
  }

  function inkResize() {
    if (!ink) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    ink.w = window.innerWidth;
    ink.h = window.innerHeight;
    ink.canvas.width = Math.round(ink.w * dpr);
    ink.canvas.height = Math.round(ink.h * dpr);
    ink.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ink.sig = '';
  }

  function inkFrame(now) {
    if (!ink) return;
    var dt = ink.last ? Math.min(64, now - ink.last) : 16;
    ink.last = now;
    var still = reduceMotion();
    var breathing = !!breath;
    var goal = breathing ? 1 : 0;
    if (still) {
      ink.blend = goal;
      ink.appear = 1;
    } else {
      ink.blend += (goal - ink.blend) * Math.min(1, dt / 280);
      if (Math.abs(goal - ink.blend) < 0.0005) ink.blend = goal;
      ink.appear = Math.min(1, ink.appear + dt / 1600);
      // The edges only move while the ink is alive: resting, or held under your thumb.
      if (!breathing) { ink.rest += dt / 1000; ink.t += dt / 2000; }
      else if (breath.holding) ink.t += dt / 1000;
    }
    inkPaint(still);
    ink.raf = requestAnimationFrame(inkFrame);
  }

  function inkPaint(still) {
    var c = ink.ctx, w = ink.w, h = ink.h;
    var U = Math.min(w, h, 520);
    var e = breathEase(ink.blend);
    var restX = w + U * 0.05, restY = h * 0.2;
    var cx = restX, cy = restY;
    var ring = $('breathRing').getBoundingClientRect();
    if (ring.width) {
      cx = restX + (ring.left + ring.width / 2 - restX) * e;
      cy = restY + (ring.top + ring.height / 2 - restY) * e;
    }
    var restLevel = 0.1 + 0.04 * Math.sin(ink.rest * 0.63);   // one slow swell about every ten seconds
    var level = restLevel + (breathLevel() - restLevel) * e;
    var grow = still ? 1 : 1 - Math.pow(1 - ink.appear, 3);    // bleeds in when the screen opens
    var sig = [Math.round(cx), Math.round(cy), level.toFixed(4), ink.t.toFixed(3), grow.toFixed(3), w, h].join(',');
    if (sig === ink.sig) return;
    ink.sig = sig;

    c.clearRect(0, 0, w, h);
    // With Reduce Motion nothing travels: the stain keeps its size and only deepens and fades.
    var spread = still ? 0.42 : level;
    var strength = still ? 0.4 + 0.6 * level : 1;
    for (var i = 0; i < INK_WASHES.length; i++) {
      var l = INK_WASHES[i];
      var p = Math.pow(spread, l.pow);
      c.fillStyle = 'rgba(' + INK_RGB + ', ' + (l.a * strength).toFixed(3) + ')';
      inkBlob(c, cx, cy, U * (l.r0 + (l.r1 - l.r0) * p) * grow, l.wob * (0.7 + 0.6 * p), ink.t, l.seed);
      c.fill();
    }
    c.fillStyle = 'rgb(' + INK_RGB + ')';
    inkBlob(c, cx, cy, U * (0.07 + 0.05 * spread) * grow, 0.06, ink.t * 1.4, 5.0);
    c.fill();
  }

  window.addEventListener('resize', inkResize);

  // --- hold-to-breathe: box breathing that only moves while your thumb is on the circle ---
  // 4s in, 4s hold, 4s out, 4s hold, four rounds. Letting go pauses it exactly where it is.

  var BREATH_PHASES = [
    { label: 'Breathe in', from: 0, to: 1 },
    { label: 'Hold', from: 1, to: 1 },
    { label: 'Breathe out', from: 1, to: 0 },
    { label: 'Hold', from: 0, to: 0 }
  ];
  var BREATH_ROUNDS = 4;
  var BREATH_PHASE_MS = 4000;
  var breath = null;

  function startBreathing() {
    stopBreathing();
    breath = { elapsed: 0, holding: false, last: 0, raf: 0, done: false };
    showTriggerMode('breathe');
    showTip($('breathTip'), 'breath');
    paintBreath();
  }

  function stopBreathing() {
    if (!breath) return;
    cancelAnimationFrame(breath.raf);
    breath = null;
    $('breathRing').classList.remove('is-holding', 'is-done');
    $('breathRounds').classList.remove('is-done');
    $('breathPhase').classList.remove('is-changing');
    $('breathPhase').textContent = 'Hold the circle';
    $('breathCount').textContent = '';
    $('breathStopBtn').textContent = 'Stop';
    showTriggerMode('idea');
  }

  function breathEase(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  // How full the breath is right now: 0 empty, 1 full.
  function breathLevel() {
    if (!breath || breath.done) return 0;
    var phase = BREATH_PHASES[Math.floor(breath.elapsed / BREATH_PHASE_MS) % BREATH_PHASES.length];
    var within = (breath.elapsed % BREATH_PHASE_MS) / BREATH_PHASE_MS;
    return phase.from + (phase.to - phase.from) * breathEase(within);
  }

  function setBreathPhase(text) {
    var node = $('breathPhase');
    if (node.textContent === text) return;
    node.textContent = text;
    node.classList.remove('is-changing');
    void node.offsetWidth;
    node.classList.add('is-changing');
  }

  // Four rounds, four strokes: each is drawn as its round goes by.
  function paintBreathRounds(done) {
    var rounds = $('breathRounds');
    var roundMs = BREATH_PHASES.length * BREATH_PHASE_MS;
    rounds.querySelectorAll('.breath-round').forEach(function (stroke, i) {
      var f = Math.max(0, Math.min(1, (breath.elapsed - i * roundMs) / roundMs));
      stroke.style.strokeDasharray = f.toFixed(4) + ' 2';
      stroke.style.opacity = f > 0 ? 1 : 0;
    });
    rounds.classList.toggle('is-done', !!done);
  }

  function paintBreath() {
    var ring = $('breathRing');
    var total = BREATH_PHASES.length * BREATH_ROUNDS * BREATH_PHASE_MS;
    if (breath.elapsed >= total) {
      breath.done = true;
      breath.holding = false;
      ring.classList.remove('is-holding');
      ring.classList.add('is-done');
      $('breathArc').style.strokeDasharray = '0 2';
      paintBreathRounds(true);
      setBreathPhase('Done');
      $('breathCount').textContent = 'Four rounds done.';
      $('breathStopBtn').textContent = 'Back';
      return;
    }
    var idx = Math.floor(breath.elapsed / BREATH_PHASE_MS);
    var phase = BREATH_PHASES[idx % BREATH_PHASES.length];
    var within = (breath.elapsed % BREATH_PHASE_MS) / BREATH_PHASE_MS;
    // the ring is traced once per phase, so a hold has something to follow too
    $('breathArc').style.strokeDasharray = within.toFixed(4) + ' 2';
    paintBreathRounds(false);
    if (!breath.holding) {
      setBreathPhase('Hold the circle');
      return;
    }
    setBreathPhase(phase.label);
    var spoken = 'Round ' + (Math.floor(idx / BREATH_PHASES.length) + 1) + ' of ' + BREATH_ROUNDS;
    if ($('breathCount').textContent !== spoken) $('breathCount').textContent = spoken;
  }

  function breathTick(now) {
    if (!breath || !breath.holding) return;
    // a frame can be stamped a hair before the touch that started it; never run backwards
    breath.elapsed += Math.max(0, Math.min(now - breath.last, 100));
    breath.last = now;
    paintBreath();
    if (breath && breath.holding) breath.raf = requestAnimationFrame(breathTick);
  }

  function wireBreathRing() {
    var ring = $('breathRing');
    ring.addEventListener('pointerdown', function (e) {
      if (!breath || breath.done) return;
      try { ring.setPointerCapture(e.pointerId); } catch (err) {}
      breath.holding = true;
      breath.last = performance.now();
      ring.classList.add('is-holding');
      paintBreath();
      breath.raf = requestAnimationFrame(breathTick);
    });
    function release() {
      if (!breath || !breath.holding) return;
      breath.holding = false;
      cancelAnimationFrame(breath.raf);
      ring.classList.remove('is-holding');
      paintBreath();
    }
    ring.addEventListener('pointerup', release);
    ring.addEventListener('pointercancel', release);
    ring.addEventListener('contextmenu', function (e) { e.preventDefault(); });
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

  // ---------- backup reminder ----------
  // Remembers when a backup was last copied out. After a month without one, the
  // app offers it once, then again a week later if it still hasn't happened.

  var BACKUP_KEY = 'ledger.backup';
  var BACKUP_EVERY = 30 * 86400000;
  var BACKUP_RENUDGE = 7 * 86400000;

  function backupInfo() {
    try { return JSON.parse(localStorage.getItem(BACKUP_KEY)) || {}; } catch (e) { return {}; }
  }

  function saveBackupInfo(info) {
    try { localStorage.setItem(BACKUP_KEY, JSON.stringify(info)); } catch (e) {}
  }

  function markBackedUp() {
    var info = backupInfo();
    info.last = Date.now();
    saveBackupInfo(info);
  }

  function backupAgeLabel() {
    var last = backupInfo().last;
    if (!last) return 'Not backed up yet';
    var days = Math.floor((Date.now() - last) / 86400000);
    return 'Last backup: ' + (days <= 0 ? 'today' : days === 1 ? 'yesterday' : days + ' days ago');
  }

  function maybeNudgeBackup() {
    var habits = activeHabits();
    if (!habits.length) return;
    var info = backupInfo();
    var now = Date.now();
    var since = info.last || Math.min.apply(null, habits.map(function (h) { return h.createdAt; }));
    if (now - since < BACKUP_EVERY) return;
    if (info.nudged && now - info.nudged < BACKUP_RENUDGE) return;
    info.nudged = now;
    saveBackupInfo(info);
    showToast(info.last ? 'A month since your last backup.' : 'Your history only lives on this phone.', { action: 'Back up', onAction: openBackupSheet, duration: 6000 });
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
    function showCopied() {
      markBackedUp();
      $('backupMeta').textContent = backupAgeLabel();
      showToast('Copied. Paste it somewhere private.');
    }
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

  // ---------- appearance ----------
  // The app's own light/dark choice, or 'auto' to follow the phone. The inline
  // script in index.html applies it before first paint; this keeps it in step after.

  var THEME_KEY = 'ledger.theme';
  var THEME_COLORS = { light: '#F7F4EC', dark: '#161513' };
  var darkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function themePref() {
    var pref = null;
    try { pref = localStorage.getItem(THEME_KEY); } catch (e) {}
    return pref === 'light' || pref === 'dark' ? pref : 'auto';
  }

  function setThemeColor(color) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', color);
  }

  function applyTheme() {
    var pref = themePref();
    var dark = pref === 'dark' || (pref === 'auto' && !!darkQuery && darkQuery.matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    // The triggered screen is dark in either appearance.
    setThemeColor(THEME_COLORS[dark || state.screen === 'trigger' ? 'dark' : 'light']);
  }

  function setThemePref(pref) {
    try {
      if (pref === 'auto') localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, pref);
    } catch (e) {}
    applyTheme();
    paintThemeControl();
  }

  if (darkQuery) {
    if (darkQuery.addEventListener) darkQuery.addEventListener('change', applyTheme);
    else if (darkQuery.addListener) darkQuery.addListener(applyTheme);
  }

  var THEME_HINTS = {
    auto: 'Automatic · follows your iPhone.',
    light: 'Light · this app stays light.',
    dark: 'Dark · this app stays dark.'
  };

  function paintThemeControl() {
    var pref = themePref();
    $('themePick').querySelectorAll('.theme-opt').forEach(function (opt) {
      var on = opt.dataset.themePref === pref;
      opt.classList.toggle('is-active', on);
      opt.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    $('themeHint').textContent = THEME_HINTS[pref];
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
        paintDetailFigures(h, true);
        paintProgress(h, detailRefs.fill, detailRefs.nextLabel);
      }
    }

    checkMilestones();
  }

  setInterval(tick, 15000);

  // The clean-time ledger on a habit's page is kept to the second.
  setInterval(function () {
    if (!state.unlocked || state.screen !== 'detail' || !detailRefs) return;
    var h = findHabit(detailRefs.habitId);
    if (h) paintClock(h, true);
  }, 1000);

  // ---------- wiring ----------

  function wirePad(kind) {
    var pad = document.querySelector('.pin-pad[data-pad="' + kind + '"]');

    pad.querySelectorAll('.pin-key[data-digit]').forEach(function (btn) {
      btn.addEventListener('click', function () { handlePinDigit(kind, btn.getAttribute('data-digit')); });
    });
    pad.querySelector('.pin-key[data-action="back"]').addEventListener('click', function () { handlePinBack(kind); });
  }

  function wire() {
    $('themePick').querySelectorAll('.theme-opt').forEach(function (opt) {
      opt.addEventListener('click', function () { setThemePref(opt.dataset.themePref); });
    });
    paintThemeControl();
    // iOS Safari only shows :active press states when a touch listener exists.
    document.addEventListener('touchstart', function () {}, { passive: true });
    applyTextSize();
    document.addEventListener('visibilitychange', function () { if (!document.hidden) applyTextSize(); });
    wireEdgeSwipe($('detailScreen'));
    wireEdgeSwipe($('overviewScreen'));
    wirePad('lock');
    wirePad('setup');
    wirePad('changePin');

    $('changePinBtn').addEventListener('click', openChangePinSheet);
    $('faceIdBtn').addEventListener('click', toggleFaceId);
    $('faceIdKey').addEventListener('click', tryFaceId);
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
    document.querySelectorAll('#detailTabs .ledger-tab').forEach(function (t) {
      t.addEventListener('click', function () {
        if (state.detailTab !== t.dataset.tab) showDetailTab(t.dataset.tab);
      });
    });
    $('calPrevBtn').addEventListener('click', function () {
      state.calendarOffset -= 1;
      renderCalendar(findHabit(state.currentHabitId));
    });
    $('calNextBtn').addEventListener('click', function () {
      state.calendarOffset += 1;
      renderCalendar(findHabit(state.currentHabitId));
    });
    $('calGrid').addEventListener('click', function (e) {
      var cell = e.target.closest('.cal-cell.is-editable');
      if (!cell) return;
      var habit = findHabit(state.currentHabitId);
      if (!habit) return;
      var y = Number(cell.dataset.y), m = Number(cell.dataset.m), d = Number(cell.dataset.d);
      var onDay = habit.relapses.filter(function (ts) {
        var dt = new Date(ts);
        return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d;
      });
      if (onDay.length === 0) {
        var ts = new Date(y, m, d, 12, 0, 0, 0).getTime();
        if (ts > Date.now()) ts = Date.now();
        logRelapse(habit.id, ts);
      } else {
        var target = onDay[onDay.length - 1];
        openConfirm('Remove this relapse?', 'It comes off the history. If it was the most recent one, your current streak will be recalculated from the entry before it.', function () {
          removeRelapseEntry(habit.id, target);
          closeConfirm();
          showToast('Entry removed.');
        });
      }
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
      if (habit) archiveHabit(habit);
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
    // Copying the text by hand counts as a backup too.
    $('backupExportArea').addEventListener('copy', function () { markBackedUp(); $('backupMeta').textContent = backupAgeLabel(); });
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
    wireBreathRing();
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
    // When a new version takes over, reload once so it's used right away
    // instead of only after the app is closed and reopened again.
    var hadController = !!navigator.serviceWorker.controller;
    var reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (!hadController || reloading) return;
      reloading = true;
      location.reload();
    });
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(function (reg) {
        if (!reg || !reg.update) return;
        reg.update();
        // Home-screen apps often resume instead of relaunching, so check then too.
        document.addEventListener('visibilitychange', function () {
          if (!document.hidden) reg.update();
        });
      }).catch(function () {});
    });
  }
})();
