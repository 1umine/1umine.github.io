const search = document.querySelector('#search');
if (search) {
  const cards = [...document.querySelectorAll('.post-card')];
  const filters = [...document.querySelectorAll('.filter')];
  let category = '', tag = '';
  function filter(updateUrl = true) {
    const query = search.value.trim().toLowerCase();
    let count = 0;
    for (const card of cards) {
      card.hidden = !!((category && card.dataset.category !== category) || (tag && !JSON.parse(card.dataset.tags).includes(tag)) || (query && !card.dataset.search.includes(query)));
      if (!card.hidden) count++;
    }
    filters.forEach(button => { const active = button.dataset.category === category; button.classList.toggle('active', active); button.setAttribute('aria-pressed',String(active)); });
    document.querySelector('#empty').hidden = count > 0;
    document.querySelector('.search-status').textContent = query || tag || category ? `找到 ${count} 篇文章` : '';
    const tagBox = document.querySelector('#active-tag');
    tagBox.replaceChildren(); tagBox.hidden = !tag;
    if (tag) { tagBox.append(document.createTextNode(`# ${tag}`)); const clear = document.createElement('button'); clear.textContent = '清除 ×'; clear.addEventListener('click',()=>{ tag=''; filter(); }); tagBox.append(clear); }
    if (updateUrl) { const params = new URLSearchParams(); if (category) params.set('category',category); if (tag) params.set('tag',tag); if (query) params.set('q',search.value.trim()); history.replaceState(null,'',location.pathname + (params.size ? '?' + params : '') + location.hash); }
  }
  function fromUrl() { const params = new URLSearchParams(location.search); category = params.get('category') || ''; tag = params.get('tag') || ''; search.value = params.get('q') || ''; filter(false); }
  filters.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;filter();}));
  search.addEventListener('input',()=>filter());
  window.addEventListener('popstate',fromUrl);
  document.addEventListener('keydown',event=>{if(event.key==='/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName) && !document.activeElement.isContentEditable){event.preventDefault(); search.focus();}});
  fromUrl();
}
for (const block of document.querySelectorAll('.prose pre')) {
  const button = document.createElement('button'); button.className='copy-code'; button.textContent='复制'; button.setAttribute('aria-label','复制代码');
  button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(block.querySelector('code').textContent);button.textContent='已复制';}catch{button.textContent='请选中复制';}setTimeout(()=>{button.textContent='复制';},2000);}); block.append(button);
}
const tocLinks = [...document.querySelectorAll('.toc nav a')];
if (tocLinks.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){tocLinks.forEach(link=>{const active=decodeURIComponent(link.hash.slice(1))===entry.target.id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}}},{rootMargin:'0px 0px -65% 0px'});
  document.querySelectorAll('.prose [id]').forEach(heading=>observer.observe(heading));
}
