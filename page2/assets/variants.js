(() => {
  document.querySelectorAll('[data-composition]').forEach(link=>link.addEventListener('click',()=>{
    const url=new URL(link.href),params=new URLSearchParams(location.search);
    const selected=[...document.querySelectorAll('.key')].findIndex(key=>key.getAttribute('aria-selected')==='true');
    url.searchParams.set('s',Math.max(0,selected));
    if(params.get('zoom')==='100')url.searchParams.set('zoom','100');
    link.href=url.href;
  }));
})();
