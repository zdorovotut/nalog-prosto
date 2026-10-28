(() => {
  const params=new URLSearchParams(location.search);
  const keys=[...document.querySelectorAll('.key')],panels=[...document.querySelectorAll('.response')];
  const art=document.querySelector('.artboard'),frame=document.querySelector('.scene-frame'),viewport=document.querySelector('.viewport');
  const capture=params.has('capture');if(capture)document.body.classList.add('capture');
  let selected=Math.max(0,Math.min(5,Number(params.get('s')??2)||0));
  let zoom=params.get('zoom')==='100'?'100':'fit';
  let mode='live';
  document.querySelector('[data-zoom]').textContent=zoom==='fit'?'Масштаб 100%':'Вписать в окно';
  function save(){if(capture)return;const u=new URL(location.href);u.searchParams.set('s',selected);if(zoom==='100')u.searchParams.set('zoom','100');else u.searchParams.delete('zoom');if(mode==='original')u.searchParams.set('mode','original');else u.searchParams.delete('mode');history.replaceState(null,'',u);}
  function resize(){const scale=zoom==='100'?1:Math.min(1,viewport.clientWidth/1672);art.style.transform=`scale(${scale})`;frame.style.width=(1672*scale)+'px';frame.style.height=(941*scale)+'px';}
  function fit(){const panel=panels[selected],inner=panel.querySelector('.response-inner');panel.classList.remove('dense','compact');if(inner.scrollHeight>548)panel.classList.add('dense');if(inner.scrollHeight>548)panel.classList.add('compact');}
  function select(i,focus=false){selected=i;keys.forEach((k,j)=>{k.setAttribute('aria-selected',String(i===j));k.tabIndex=i===j?0:-1;panels[j].hidden=i!==j;});fit();if(focus)keys[i].focus();save();}
  function display(next){mode=next;document.body.dataset.mode=mode;document.querySelectorAll('[data-display]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.display===mode)));save();}
  keys.forEach((k,i)=>{k.addEventListener('click',()=>select(i));k.addEventListener('keydown',e=>{let j=i;if(e.key==='ArrowDown'||e.key==='ArrowRight')j=(i+1)%6;else if(e.key==='ArrowUp'||e.key==='ArrowLeft')j=(i+5)%6;else if(e.key==='Home')j=0;else if(e.key==='End')j=5;else return;e.preventDefault();select(j,true);});});
  document.querySelectorAll('[data-display]').forEach(b=>b.addEventListener('click',()=>display(b.dataset.display)));
  document.querySelector('[data-zoom]').addEventListener('click',e=>{zoom=zoom==='fit'?'100':'fit';e.currentTarget.textContent=zoom==='fit'?'Масштаб 100%':'Вписать в окно';resize();save();});
  new ResizeObserver(resize).observe(viewport);addEventListener('resize',resize);
  select(selected);display(mode);resize();document.fonts.ready.then(()=>{fit();resize();});
})();
