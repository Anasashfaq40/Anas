const header=document.querySelector('[data-header]');
const nav=document.querySelector('#nav');
const menu=document.querySelector('.menu');
const progress=document.querySelector('.scroll-progress span');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer=matchMedia('(hover: hover) and (pointer: fine)').matches;

function syncScroll(){
  header.classList.toggle('scrolled',scrollY>20);
  const max=document.documentElement.scrollHeight-innerHeight;
  progress.style.transform=`scaleX(${max>0?scrollY/max:0})`;
}
syncScroll();
addEventListener('scroll',syncScroll,{passive:true});

menu.addEventListener('click',()=>{
  const open=menu.getAttribute('aria-expanded')==='true';
  menu.setAttribute('aria-expanded',String(!open));
  nav.classList.toggle('open',!open);
});
nav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  nav.classList.remove('open');menu.setAttribute('aria-expanded','false');
}));

const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}
}),{threshold:.1,rootMargin:'0px 0px -40px'});
document.querySelectorAll('.reveal').forEach((el,index)=>{
  el.style.transitionDelay=`${Math.min(index%4,3)*70}ms`;
  revealObserver.observe(el);
});

document.querySelectorAll('.filters button').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.filters button').forEach(item=>item.classList.remove('active'));
  button.classList.add('active');
  document.querySelectorAll('.project').forEach(project=>{
    const show=button.dataset.filter==='all'||project.dataset.category===button.dataset.filter;
    project.hidden=!show;if(show){project.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'})}
  });
}));

const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  const id=entry.target.id;
  nav.querySelectorAll('a[href^="#"]').forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${id}`));
}),{rootMargin:'-35% 0px -55%'});
document.querySelectorAll('main section[id]').forEach(section=>sectionObserver.observe(section));

if(finePointer&&!reduced){
  addEventListener('pointermove',event=>{
    document.documentElement.style.setProperty('--mouse-x',`${event.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y',`${event.clientY}px`);
  },{passive:true});

  document.querySelectorAll('.card,.project').forEach(card=>{
    card.addEventListener('pointermove',event=>{
      const rect=card.getBoundingClientRect();
      const x=event.clientX-rect.left,y=event.clientY-rect.top;
      card.style.setProperty('--spot-x',`${x}px`);card.style.setProperty('--spot-y',`${y}px`);
      card.style.transform=`perspective(850px) rotateX(${(rect.height/2-y)/36}deg) rotateY(${(x-rect.width/2)/36}deg) translateY(-5px)`;
    });
    card.addEventListener('pointerleave',()=>card.style.transform='');
  });

  document.querySelectorAll('.magnetic').forEach(button=>{
    button.addEventListener('pointermove',event=>{
      const rect=button.getBoundingClientRect();
      button.style.transform=`translate(${(event.clientX-rect.left-rect.width/2)*.12}px,${(event.clientY-rect.top-rect.height/2)*.16}px)`;
    });
    button.addEventListener('pointerleave',()=>button.style.transform='');
  });
}

document.querySelectorAll('.faq details').forEach(item=>item.addEventListener('toggle',()=>{
  if(!item.open)return;
  document.querySelectorAll('.faq details[open]').forEach(other=>{if(other!==item)other.open=false});
}));
document.querySelector('#year').textContent=new Date().getFullYear();
