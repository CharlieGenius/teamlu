(async function(){
 if(/(?:invite_token|recovery_token)=/.test(location.hash)){location.replace('/editor.html'+location.hash);return;}
 const defaults=await fetch('/assets/default-content.json').then(r=>r.json());
 try { const response=await fetch('/api/content'); if(!response.ok)throw new Error(); const saved=await response.json(); window.TEAM_CONTENT=saved.content||defaults; } catch { window.TEAM_CONTENT=defaults; }
 document.querySelectorAll('[data-copy]').forEach(el=>{const value=window.TEAM_CONTENT.copy[el.dataset.copy];if(typeof value==='string')el.textContent=value;});
 const images=window.TEAM_CONTENT.images||{};
 const safeImage=value=>typeof value==='string'&&/^\/api\/images\?key=[a-f0-9-]{36}\.(png|jpeg|webp)$/.test(value);
 for(const [key,variable] of Object.entries({plate:'--editor-plate',prize:'--editor-prize',team:'--editor-team'}))if(safeImage(images[key]))document.documentElement.style.setProperty(variable,'url("'+images[key]+'")');
 if(safeImage(images.hero))document.querySelector('.hero .eagle').src=images.hero;
 window.TEAM_AVATAR_IMAGE=safeImage(images.avatar)?images.avatar:'/assets/reference-5.png';
 for(let i=0;i<11;i++){await new Promise(resolve=>{const s=document.createElement('script');s.src='/assets/runtime-'+i+'.js';s.onload=resolve;s.onerror=resolve;document.body.appendChild(s);});}
})();