/* =============================================================
   LUKIE FX — store.js
   Shared submission storage used by app.js and admin.js.
   ============================================================= */
(function () {
  const KEY = 'lfx_submissions';

  const readAll = () => {
    try {
      const raw = localStorage.getItem(KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (err) {
      console.warn('[LFXStore] read failed', err);
      return [];
    }
  };

  const writeAll = (list) => {
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('lfx:submissions-changed'));
  };

  const add = (type, data) => {
    const entry = {
      id: 'sub_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      type: type || 'unknown',
      status: 'new',
      read: false,
      createdAt: new Date().toISOString(),
      data: data || {}
    };
    const list = readAll();
    list.unshift(entry);
    writeAll(list);
    return entry;
  };

  const remove = (id) => {
    const list = readAll().filter(s => s.id !== id);
    writeAll(list);
  };

  const setStatus = (id, status) => {
    const list = readAll().map(s => s.id === id ? { ...s, status } : s);
    writeAll(list);
  };

  const markAllRead = () => {
    const list = readAll().map(s => ({ ...s, read: true }));
    writeAll(list);
  };

  const unreadCount = () => readAll().filter(s => !s.read).length;

  const clearAll = () => writeAll([]);

  window.LFXStore = {
    readAll, add, remove, setStatus, markAllRead, unreadCount, clearAll
  };
})();
