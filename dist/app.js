(() => {
  'use strict';
  const profile = window.PORTFOLIO;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const escapeHTML = (text) => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeURL = (value) => { try {const url = new URL(value, location.href); return ['http:', 'https:'].includes(url.protocol) ? url.href : '#';} catch { return '#'; } };
  $$('[data-full-name]').forEach(el => el.textContent = profile.name);
  $$('[data-first-name]').forEach(el => el.textContent = profile.firstName);
  $$('[data-role]').forEach(el => el.textContent = profile.role);
  $$('[data-email]').forEach(el => el.href = `mailto:${profile.email}`);
  $$('[data-email-text]').forEach(el => el.textContent = profile.email);
  document.title = `${profile.name} — ${profile.role}`;
  $('#year').textContent = new Date().getFullYear();
  if ($('#stack-tags')) $('#stack-tags').innerHTML = profile.toolkit.map(tag => `<span>${escapeHTML(tag)}</span>`).join('');

  let activeFilter = 'all';
  let expanded = false;
  const grid = $('#project-grid');
  const galleryToggle = $('#gallery-toggle');
  function renderProjects() {
    const matching = profile.projects.filter(project => activeFilter === 'all' || project.category === activeFilter);
    const visible = matching;
    grid.innerHTML = visible.map(project => `<article class="project-card">
      <button class="project-image-button" data-project="${escapeHTML(project.id)}" aria-label="View ${escapeHTML(project.title)} project details"><img src="${escapeHTML(project.image)}" alt="${escapeHTML(project.title)} project illustration" width="960" height="533" loading="lazy"><span class="project-open" aria-hidden="true"><svg><use href="#arrow"/></svg></span></button>
      <div class="project-title-row"><h3>${escapeHTML(project.title)}</h3><span class="heading-line"></span><a class="icon-link" href="${safeURL(project.code)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(project.title)} source code"><svg><use href="#github"/></svg></a><a class="icon-link" href="${safeURL(project.live)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(project.title)} live website"><svg><use href="#arrow"/></svg></a></div>
      <p class="project-tech">${project.tags.map(escapeHTML).join(' · ')}</p><p class="project-description">${escapeHTML(project.description)}</p>
      <button class="text-link" data-project="${escapeHTML(project.id)}" aria-label="Details for ${escapeHTML(project.title)}">Explore project <svg><use href="#arrow"/></svg></button>
    </article>`).join('');
    $('#project-count').textContent = `${visible.length} of ${matching.length} projects`;

  }
  $$('.filter').forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter; expanded = false;
    $$('.filter').forEach(filter => {const selected = filter === button; filter.classList.toggle('active', selected); filter.setAttribute('aria-pressed', String(selected));});
    renderProjects();
  }));
  renderProjects();

  const dialog = $('#project-dialog');
  let lastProjectButton = null;
  grid.addEventListener('click', event => {
    const button = event.target.closest('[data-project]'); if (!button) return;
    const project = profile.projects.find(item => item.id === button.dataset.project); if (!project) return;
    lastProjectButton = button;
    $('#dialog-title').textContent = project.title;
    $('#dialog-image').src = project.image;
    $('#dialog-image').alt = `${project.title} project illustration`;
    $('#dialog-tags').innerHTML = project.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('');
    $('#dialog-description').textContent = project.detail;
    $('#dialog-live').href = safeURL(project.live);
    $('#dialog-code').href = safeURL(project.code);
    dialog.showModal(); document.body.classList.add('modal-open');
  });
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {if (event.target === dialog) {const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();}});
  dialog.addEventListener('close', () => {document.body.classList.remove('modal-open');lastProjectButton?.focus({preventScroll:true});});

  let toastTimer;
  function toast(message) {const element = $('#toast');element.textContent = message;element.classList.add('visible');clearTimeout(toastTimer);toastTimer = setTimeout(() => element.classList.remove('visible'), 3200);}
  $('#copy-email')?.addEventListener('click', async () => {
    try {await navigator.clipboard.writeText(profile.email);toast('Email address copied. Say hello!');}
    catch {toast(`Email: ${profile.email}`);const range = document.createRange();range.selectNodeContents($('[data-email-text]'));const selection = window.getSelection();selection.removeAllRanges();selection.addRange(range);}
  });

  const navLinks = $$('.sidebar nav a');
  const sections = navLinks.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
  let scrollQueued = false;
  function updateActiveSection() {
    const position = window.scrollY + Math.min(window.innerHeight * .35, 220);
    let current = '';
    for (const section of sections) if (section.offsetTop <= position) current = section.id;
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 20) current = 'contact';
    navLinks.forEach(link => {const active = link.hash === `#${current}`;link.classList.toggle('active', active);if(active) link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    scrollQueued = false;
  }
  window.addEventListener('scroll', () => {if(!scrollQueued) {scrollQueued = true;requestAnimationFrame(updateActiveSection);}}, {passive:true});
  updateActiveSection();

  const canvas = $('#dot-field');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const hero = $('.hero');
  let width = 0, height = 0;
  let pointer = {x:-1000,y:-1000};
  let target = {x:-1000,y:-1000};
  let animation = null;
  function draw() {
    ctx.clearRect(0,0,width,height);
    for(let x=16;x<width;x+=25) for(let y=16;y<height;y+=25) {
      const distance = Math.hypot(x-pointer.x,y-pointer.y);
      const influence = Math.max(0,1-distance/145);
      const fade = Math.min(1, y/55, (height-y)/55);
      const radius = 2.6 + influence*1.5;
      ctx.beginPath();ctx.arc(x,y,radius,0,Math.PI*2);
      ctx.fillStyle = influence > 0 ? `rgba(${70+Math.round(influence*119)},${63+Math.round(influence*33)},${78+Math.round(influence*167)},${fade*(.6+influence*.4)})` : `rgba(94,90,99,${fade*.45})`;
      ctx.fill();ctx.beginPath();ctx.arc(x-.6,y-.8,radius*.45,Math.PI,Math.PI*2);ctx.strokeStyle=`rgba(170,163,180,${fade*.17})`;ctx.lineWidth=1;ctx.stroke();
    }
  }
  function resize() {const rect = canvas.getBoundingClientRect();width=rect.width;height=rect.height;const ratio=Math.min(window.devicePixelRatio||1,2);canvas.width=width*ratio;canvas.height=height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);draw();}
  function animate() {pointer.x+=(target.x-pointer.x)*.2;pointer.y+=(target.y-pointer.y)*.2;draw();if(Math.hypot(target.x-pointer.x,target.y-pointer.y)>.5) animation=requestAnimationFrame(animate);else animation=null;}
  hero.addEventListener('pointermove', event => {if(reducedMotion.matches || event.pointerType==='touch') return;const rect=canvas.getBoundingClientRect();target={x:event.clientX-rect.left,y:event.clientY-rect.top};if(!animation) animation=requestAnimationFrame(animate);}, {passive:true});
  hero.addEventListener('pointerleave', () => {target={x:-1000,y:-1000};pointer={...target};if(animation) cancelAnimationFrame(animation);animation=null;draw();});
  new ResizeObserver(resize).observe(canvas);
})();
