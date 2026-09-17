/* js/store.js — shared submission storage for LUKIE FX */
(function () {
  const KEY = 'lfx_submissions';

  const readAll = () => {
    try {
      const raw = localStorage.getItem(KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  };

  const writeAll = (list) => {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('lfx:submissions-changed'));
  };

  const add = (type, data) => {
    const entry = {
      id: 'sub_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      type,
      status: 'new',
      read: false,
      createdAt: new Date().toISOString(),
      data
    };
    const list = readAll();
    list.unshift(entry);
    writeAll(list);
    return entry;
  };

  const remove      = (id) => writeAll(readAll().filter(s => s.id !== id));
  const setStatus   = (id, status) =>
    writeAll(readAll().map(s => s.id === id ? { ...s, status } : s));
  const markAllRead = () =>
    writeAll(readAll().map(s => ({ ...s, read: true })));
  const unreadCount = () => readAll().filter(s => !s.read).length;

  window.LFXStore = { readAll, add, remove, setStatus, markAllRead, unreadCount };
})();
