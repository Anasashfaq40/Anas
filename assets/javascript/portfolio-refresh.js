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

const reel=document.querySelector('[data-reel]');
const reelSlides=[...document.querySelectorAll('[data-reel-slide]')];
const reelProgress=document.querySelector('[data-reel-progress]');
const reelCurrent=document.querySelector('[data-reel-current]');
let reelFrame=0;
function updateReel(){
  reelFrame=0;
  if(!reel||reduced||!reelSlides.length)return;
  const rect=reel.getBoundingClientRect();
  const distance=Math.max(1,reel.offsetHeight-innerHeight);
  const progress=Math.min(1,Math.max(0,-rect.top/distance));
  const position=progress*(reelSlides.length-1);
  const active=Math.min(reelSlides.length-1,Math.max(0,Math.round(position)));
  reelSlides.forEach((slide,index)=>{
    const delta=index-position;
    const magnitude=Math.abs(delta);
    const opacity=Math.max(0,1-magnitude*1.08);
    slide.style.opacity=opacity.toFixed(3);
    slide.style.transform=`translateY(${delta*10}%) scale(${1-Math.min(magnitude*.055,.11)})`;
    slide.style.filter=`blur(${Math.min(magnitude*7,10)}px)`;
    slide.style.clipPath=`inset(${Math.min(magnitude*6,10)}% ${Math.min(magnitude*2.5,4)}% round 32px)`;
    slide.style.zIndex=String(20-Math.round(magnitude*2));
    slide.setAttribute('aria-hidden',String(index!==active));
    const link=slide.querySelector('a');if(link)link.tabIndex=index===active?0:-1;
    const image=slide.querySelector('img');if(image)image.style.transform=`scale(1.08) translateY(${delta*-2.5}%)`;
  });
  reelProgress.style.transform=`scaleX(${progress})`;
  reelCurrent.textContent=String(active+1).padStart(2,'0');
}
function requestReel(){if(!reelFrame)reelFrame=requestAnimationFrame(updateReel)}
if(reel&&!reduced){updateReel();addEventListener('scroll',requestReel,{passive:true});addEventListener('resize',requestReel,{passive:true})}

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
