document.querySelectorAll('.linkedin-control').forEach(button => {
  const link=document.createElement('a');
  link.className='icon-link';
  link.href='https://www.linkedin.com/in/jebicksonsamuel';
  link.target='_blank';link.rel='noopener noreferrer';
  link.title='LinkedIn';link.setAttribute('aria-label','Jebickson Samuel on LinkedIn');
  link.innerHTML=button.innerHTML;button.replaceWith(link);
});
