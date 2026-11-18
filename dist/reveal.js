// Purple curtain and upward text reveal, inspired by the reference portfolio.
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const prepared = new WeakSet();
  const running = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      observer.unobserve(element);
      if (motion.matches) return;
      const content = document.createElement('span');
      content.style.display = 'block';
      while (element.firstChild) content.append(element.firstChild);
      const curtain = document.createElement('span');
      curtain.setAttribute('aria-hidden', 'true');
      curtain.style.cssText = 'position:absolute;inset:4px 0;background:var(--accent,#be63f9);z-index:2;pointer-events:none;transform-origin:right';
      const originalPosition = element.style.position;
      const originalOverflow = element.style.overflow;
      element.style.position = 'relative';
      element.style.overflow = 'hidden';
      element.append(content, curtain);
      const delay = element.closest('.hero') ? (element.tagName === 'H1' ? 80 : element.tagName === 'H2' ? 180 : 280) : 40;
      const options = {duration:650, delay, easing:'cubic-bezier(.22,1,.36,1)', fill:'both'};
      const textAnimation = content.animate([{opacity:0,transform:'translateY(50px)'},{opacity:1,transform:'translateY(0)'}], {...options, delay:delay+180});
      const wipeAnimation = curtain.animate([{transform:'scaleX(1)'},{transform:'scaleX(0)'}], options);
      const cleanup = () => {
        textAnimation.cancel(); wipeAnimation.cancel();
        content.replaceWith(...content.childNodes); curtain.remove();
        element.style.position = originalPosition; element.style.overflow = originalOverflow;
        running.delete(cleanup);
      };
      running.add(cleanup);
      Promise.allSettled([textAnimation.finished,wipeAnimation.finished]).then(() => {if(running.has(cleanup)) cleanup();});
    });
  }, {threshold:.12, rootMargin:'0px 0px -24px 0px'});
  function prepare() {
    document.querySelectorAll('main h1, main h2, main p').forEach(element => {
      if (prepared.has(element)) return;
      prepared.add(element);
      observer.observe(element);
    });
  }
  prepare();
  // Filtering replaces project paragraphs; observe these new nodes too.
  const gallery = document.querySelector('#project-grid');
  const changes = new MutationObserver(prepare);
  if (gallery) changes.observe(gallery, {childList:true});
  motion.addEventListener('change', () => {
    if (motion.matches) { observer.disconnect(); changes.disconnect(); [...running].forEach(cleanup=>cleanup()); }
  });
})();
