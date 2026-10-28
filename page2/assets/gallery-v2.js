(() => {
  'use strict';
  const art=document.querySelector('.artboard'),frame=document.querySelector('.scene-frame'),viewport=document.querySelector('.viewport');
  const zoomControl=document.querySelector('[data-zoom-select]'),actual=document.querySelector('#actual-scale');
  const loading=document.querySelector('.loading'),loadingText=loading.querySelector('p'),retry=loading.querySelector('button'),status=document.querySelector('#status');
  const links=[...document.querySelectorAll('.compositions a[data-composition]')],keys=[...document.querySelectorAll('.key')],panels=[...document.querySelectorAll('.response')];
  const percentages=['100','90','80','70','60','50'],images=new Map();
  const initial=Number(document.body.dataset.initialVariant)||1,capture=new URLSearchParams(location.search).has('capture');
  let current=0,selected=2,zoom='fit',requestId=0,pending=initial,loadingTimer;
  if(capture)document.body.classList.add('capture');
  function storedZoom(){try{return sessionStorage.getItem('panel-gallery-zoom-v2');}catch{return null;}}
  function readState(){
    const p=new URLSearchParams(location.search),v=Number(p.get('v')||initial),s=Number(p.get('s')??2),z=p.get('zoom')||storedZoom()||'fit';
    return {variant:Number.isInteger(v)&&v>=1&&v<=5?v:initial,situation:Number.isInteger(s)&&s>=0&&s<6?s:2,zoom:percentages.includes(z)?z:'fit'};
  }
  function stateURL(variant=current||pending||initial){
    const u=new URL('./',location.href);u.search=location.search;u.searchParams.set('v',variant);u.searchParams.set('s',selected);u.searchParams.set('zoom',zoom);return u;
  }
  function save(push=false){
    if(!capture){const u=stateURL();history[push?'pushState':'replaceState'](null,'',u);}
    try{sessionStorage.setItem('panel-gallery-zoom-v2',zoom);}catch{}
    links.forEach(link=>link.href=stateURL(Number(link.dataset.composition)).href);
  }
  function resize(){
    const scale=zoom==='fit'?Math.max(.01,Math.min(1,viewport.clientWidth/1672,viewport.clientHeight/941)):Number(zoom)/100;
    art.style.transform=`scale(${scale})`;frame.style.width=`${1672*scale}px`;frame.style.height=`${941*scale}px`;
    zoomControl.value=zoom;actual.textContent=`${Math.round(scale*100)}%`;
  }
  function fitResponse(){
    const panel=panels[selected],inner=panel.firstElementChild;panel.classList.remove('dense','compact');
    if(inner.scrollHeight>548)panel.classList.add('dense');if(inner.scrollHeight>548)panel.classList.add('compact');
  }
  function selectSituation(i,focus=false,write=true){
    selected=i;keys.forEach((key,j)=>{key.setAttribute('aria-selected',String(i===j));key.tabIndex=i===j?0:-1;panels[j].hidden=i!==j;});
    fitResponse();if(focus)keys[i].focus();if(write)save();
  }
  function imageFor(n,priority='high'){
    if(images.has(n)){const item=images.get(n);if(priority==='high')item.image.fetchPriority='high';return item.promise;}
    const image=new Image(1672,941);image.className='artwork';image.alt='';image.setAttribute('aria-hidden','true');image.decoding='async';image.fetchPriority=priority;
    const promise=(async()=>{image.src=new URL(`assets/panel-${n}-v2.webp`,location.href).href;await image.decode();return image;})();
    images.set(n,{image,promise});promise.catch(()=>{if(images.get(n)?.promise===promise)images.delete(n);});return promise;
  }
  async function showVariant(n,{push=false}={}){
    const id=++requestId;pending=n;clearTimeout(loadingTimer);retry.hidden=true;
    if(current===0){loading.hidden=false;loadingText.textContent='Загружаем сравнение…';}
    else loadingTimer=setTimeout(()=>{if(id===requestId)status.textContent=`Загружаем вариант ${n}…`;},150);
    try{
      const [image]=await Promise.all([imageFor(n),document.fonts.ready]);if(id!==requestId)return;
      clearTimeout(loadingTimer);
      // One synchronous commit: the complete decoded background and geometry arrive together.
      art.querySelector('.artwork').replaceWith(image);current=n;document.body.dataset.composition=String(n);
      links.forEach(link=>{if(Number(link.dataset.composition)===n)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
      fitResponse();resize();art.classList.add('is-ready');loading.hidden=true;status.textContent='';save(push);
      document.title=`${links[n-1].textContent} · Сравнение второго экрана`;
      return true;
    }catch(error){
      if(id!==requestId)return;clearTimeout(loadingTimer);
      if(current){status.textContent='Не удалось загрузить вариант. Нажмите его ещё раз.';}
      else{loading.hidden=false;loadingText.textContent='Не удалось загрузить сравнение.';retry.hidden=false;}
      return false;
    }
  }
  zoomControl.addEventListener('change',()=>{zoom=zoomControl.value;resize();viewport.scrollTo(0,0);save();});
  links.forEach(link=>link.addEventListener('click',event=>{
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();const n=Number(link.dataset.composition);if(n!==current||pending!==current)showVariant(n,{push:true});
  }));
  keys.forEach((key,i)=>{
    key.addEventListener('click',()=>selectSituation(i));
    key.addEventListener('keydown',event=>{let j=i;if(['ArrowDown','ArrowRight'].includes(event.key))j=(i+1)%6;else if(['ArrowUp','ArrowLeft'].includes(event.key))j=(i+5)%6;else if(event.key==='Home')j=0;else if(event.key==='End')j=5;else return;event.preventDefault();selectSituation(j,true);});
  });
  retry.addEventListener('click',()=>showVariant(pending));
  new ResizeObserver(resize).observe(viewport);addEventListener('resize',resize);
  addEventListener('popstate',()=>{const state=readState();zoom=state.zoom;selected=state.situation;selectSituation(selected,false,false);showVariant(state.variant);});
  const state=readState();zoom=state.zoom;selected=state.situation;selectSituation(selected,false,false);resize();
  showVariant(state.variant).then(ok=>{
    if(!ok)return;
    setTimeout(async()=>{for(let n=1;n<=5;n++){if(n===current)continue;try{await imageFor(n,'low');}catch{}}},400);
  });
})();
