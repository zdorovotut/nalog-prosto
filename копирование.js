(() => {
  const mobile = matchMedia('(max-width:899px)');
  const root = document.getElementById('экран-1');
  const button = root.querySelector('.phone-copy');
  const status = root.querySelector('.copy-status');
  if (!button || !status) return;
  let timer = 0, busy = false;
  function say(text) {
    clearTimeout(timer); status.textContent = text;
    status.classList.add('is-visible');
    timer = setTimeout(() => { status.classList.remove('is-visible'); status.textContent = ''; }, 2200);
  }
  function fallback(text) {
    const selection = document.getSelection();
    const ranges = selection ? Array.from({length:selection.rangeCount},(_,i) => selection.getRangeAt(i).cloneRange()) : [];
    const active = document.activeElement;
    const area = document.createElement('textarea');
    area.value = text; area.readOnly = true;
    Object.assign(area.style, {position:'fixed', left:'0', top:'0', opacity:'0', fontSize:'16px', pointerEvents:'none'});
    document.body.append(area); area.select(); area.setSelectionRange(0, text.length);
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) {}
    area.remove();
    if (active && active.focus) active.focus({preventScroll:true});
    if (selection) { selection.removeAllRanges(); ranges.forEach(r => selection.addRange(r)); }
    return ok;
  }
  button.addEventListener('click', async () => {
    if (!mobile.matches || busy) return;
    busy = true;
    const text = button.dataset.number;
    let ok = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text); ok = true;
      }
    } catch (_) {}
    if (!ok) ok = fallback(text);
    if (mobile.matches) say(ok ? 'Номер скопирован' : 'Не удалось скопировать');
    busy = false;
  });
  mobile.addEventListener('change', () => {
    if (!mobile.matches) { clearTimeout(timer); status.classList.remove('is-visible'); status.textContent = ''; }
  });
})();
