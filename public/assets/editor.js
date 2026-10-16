(() => {
  const $ = id => document.getElementById(id);
  let content, revision = 0, dirty = false, active = 'personas', callback;
  const groups = { personas: 'Mi equipo', events: 'Calendario', progress: 'Estrellas del equipo', copy: 'Textos de la página', images: 'Imágenes' };
  let selected = 0, month = todayMonth(), search = '';
  function todayMonth(){ return new Date().toISOString().slice(0,7); }
  const labels = {nombre:'Nombre',historial:'Historial de objetivos',fecha:'Fecha',nota:'Nota',objetivos:'Objetivos',texto:'Objetivo',tag:'Etiqueta / plazo',icono:'Icono',estrellas:'Estrellas (0–7)',brillan:'Logros nuevos que brillan',aviones:'Aviones (0–14)',start:'Fecha de inicio',end:'Fecha de fin',title:'Título',short:'Título corto',time:'Horario',type:'Categoría',total:'Objetivo de estrellas',achieved:'Estrellas conseguidas',newStars:'Estrellas nuevas que brillan'};
  function status(text, kind='') { $('status').textContent=text; $('status').className=kind; }
  async function request(path, method='GET', data) {
    const response=await fetch(path,{method,headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined});
    const body=await response.json().catch(()=>null); if(!response.ok)throw new Error(body?.error||'El servicio no está disponible. Abre el editor de nuevo e inténtalo más tarde.');if(!body)throw new Error('El servicio ha enviado una respuesta inesperada. Inténtalo más tarde.');return body;
  }
  function changed(){dirty=true;status('Tienes cambios sin publicar.');}
  function button(text, handler, className='secondary'){const b=document.createElement('button');b.type='button';b.textContent=text;b.className=className;b.onclick=handler;return b;}
  const today=()=>new Date().toISOString().slice(0,10);
  function field(parent,obj,key,title) {
    const label=document.createElement('label');label.textContent=title||labels[key]||key;
    let input;
    if(key==='type'||key==='icono'){
      input=document.createElement('select');
      const options=key==='type'?{ssa:'SSA',genius:'Genius',oneshot:'Online',hito:'Hito',master:'Masterclass',salida:'Salida'}:{'':'Estrella',aguila:'Águila'};
      Object.entries(options).forEach(([value,text])=>{const option=document.createElement('option');option.value=value;option.textContent=text;input.append(option);});
    } else {
      input=document.createElement(key.startsWith('copy-')||key==='texto'?'textarea':'input');
      if(input.tagName==='INPUT'){input.type=typeof obj[key]==='number'?'number':['start','end','fecha'].includes(key)?'date':'text';if(input.type==='number'){input.min=key==='total'?'1':'0';input.step=['total','estrellas','aviones'].includes(key)?'1':'0.1';}}
    }
    if(input.type==='date')input.required=true;
    input.value=obj[key]??'';input.addEventListener('input',()=>{obj[key]=typeof obj[key]==='number'?Number(input.value):input.value;changed();});label.append(input);parent.append(label);
  }
  function el(tag, text, cls) { const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n; }
  function panel(parent,title,description){const box=el('section',undefined,'panel');box.append(el('h2',title));if(description)box.append(el('p',description,'hint'));parent.append(box);return box;}
  function normalize(){
    for(const key of ['eagle','contest'])for(const entry of content[key]){
      let person=content.personas.find(p=>p.id&&p.id===entry.profileId)||content.personas.find(p=>p.nombre.trim().toLocaleLowerCase()===entry.nombre.trim().toLocaleLowerCase());
      if(!person){person={nombre:entry.nombre,historial:[]};content.personas.push(person);}
      person.id ||= crypto.randomUUID();entry.profileId=person.id;
    }
    content.personas.forEach(p=>{p.id ||= crypto.randomUUID();p.historial.sort((a,b)=>b.fecha.localeCompare(a.fecha));});
    content.images ||= {};
  }
  function counter(parent,obj,key,max,title){
    const row=el('div',undefined,'counter');const caption=el('span',title);const value=el('output',String(obj[key]||0));
    const update=n=>{obj[key]=Math.max(0,Math.min(max,n));value.textContent=obj[key];if(key!=='brillan'&&obj.brillan>obj[key])obj.brillan=obj[key];changed();render();};
    const minus=button('−',()=>update((obj[key]||0)-1)),plus=button('+',()=>update((obj[key]||0)+1));minus.setAttribute('aria-label','Restar: '+title);plus.setAttribute('aria-label','Añadir: '+title);minus.disabled=(obj[key]||0)<=0;plus.disabled=(obj[key]||0)>=max;row.append(caption,minus,value,plus);
    parent.append(row);
  }
  function profiles(parent){
    const layout=el('div',undefined,'profile-layout'), side=el('aside',undefined,'people'), detail=el('div');layout.append(side,detail);parent.append(layout);
    const filter=el('input');filter.type='search';filter.placeholder='Buscar persona…';filter.value=search;filter.setAttribute('aria-label','Buscar persona');side.append(filter);
    const list=el('div');side.append(list);
    function roster(){list.replaceChildren();content.personas.forEach((p,i)=>{if(!p.nombre.toLocaleLowerCase().includes(search.toLocaleLowerCase()))return;const b=button(p.nombre||'Nueva persona',()=>{selected=i;render();},'person');b.classList.toggle('selected',selected===i);b.append(el('small',`${p.historial.length} actualizaciones · ${content.eagle.some(e=>e.profileId===p.id)?'Eagle':''} ${content.contest.some(e=>e.profileId===p.id)?'Contest':''}`));list.append(b);});}
    filter.oninput=()=>{search=filter.value;roster();};roster();
    side.append(button('+ Nueva persona',()=>{content.personas.push({id:crypto.randomUUID(),nombre:'Nueva persona',historial:[]});selected=content.personas.length-1;changed();render();}));
    const p=content.personas[selected];if(!p){detail.append(el('p','Añade una persona para empezar.'));return;}
    const identity=panel(detail,'Su perfil','Un solo nombre para sus objetivos y participaciones.');field(identity,p,'nombre');
    identity.querySelector('input').addEventListener('input',()=>{for(const key of ['eagle','contest']){const entry=content[key].find(e=>e.profileId===p.id);if(entry)entry.nombre=p.nombre;}roster();});field(identity,p,'icono');
    const participation=panel(detail,'Dónde participa','Activa cada sección y actualiza sus logros aquí.');
    for(const key of ['eagle','contest']){
      const entry=content[key].find(e=>e.profileId===p.id), metric=key==='eagle'?'estrellas':'aviones',max=key==='eagle'?7:14;
      const block=el('div',undefined,'participation');participation.append(block);const label=el('label',undefined,'toggle');const check=el('input');check.type='checkbox';check.checked=!!entry;label.append(check,el('span',key==='eagle'?'Aparece en Eagle':'Aparece en Contest'));block.append(label);
      check.onchange=()=>{if(check.checked)content[key].push({profileId:p.id,nombre:p.nombre,[metric]:0,brillan:0});else content[key]=content[key].filter(e=>e.profileId!==p.id);changed();render();};
      if(entry){counter(block,entry,metric,max,key==='eagle'?'Estrellas':'Aviones');counter(block,entry,'brillan',entry[metric],'Nuevos que brillan');}
    }
    const goals=panel(detail,'Objetivos e historial','La actualización más reciente aparece en su tarjeta. Las anteriores se conservan.');
    goals.append(button('+ Añadir actualización',()=>{p.historial.unshift({fecha:today(),nota:'',objetivos:[]});changed();render();}));
    if(!p.historial.length)goals.append(el('p','Todavía no tiene objetivos. Añade su primera actualización.'));
    p.historial.forEach((h,index)=>{
      const box=el('details');box.open=index===0;box.append(el('summary',`${h.fecha}${h.nota?' · '+h.nota:''}${index===0?' · Actual':' '}`));goals.append(box);field(box,h,'fecha');field(box,h,'nota');
      const bulk=el('label','Objetivos · uno por línea');const area=el('textarea');area.rows=Math.max(3,h.objetivos.length+1);area.placeholder='Hablar con 3 personas\nOrganizar la semana';area.value=h.objetivos.map(o=>o.texto+(o.tag?' | '+o.tag:'')).join('\n');
      area.oninput=()=>{h.objetivos=area.value.split('\n').filter(t=>t.trim()).map(line=>{const old=h.objetivos.find(o=>o.texto+(o.tag?' | '+o.tag:'')===line);if(old)return old;const [texto,...tag]=line.split(' | ');return {texto,tag:tag.join(' | ')};});changed();};bulk.append(area);box.append(bulk,el('p','Opcional: escribe «objetivo | plazo» para añadir una etiqueta.','hint'),button('Eliminar actualización',()=>{p.historial.splice(index,1);changed();render();},'remove'));
    });
    detail.append(button('Eliminar perfil',()=>{const snapshot=structuredClone(content),old=selected;content.personas.splice(selected,1);for(const key of ['eagle','contest'])content[key]=content[key].filter(e=>e.profileId!==p.id);selected=0;changed();render();status('Perfil eliminado.');$('status').append(button('Deshacer',()=>{content=snapshot;selected=old;changed();render();}));},'remove'));
  }
  function calendar(parent){
    const bar=panel(parent,'Tu agenda','Pulsa un día para añadir una actividad. Duplica eventos o crea varias semanas de una vez.');
    const tools=el('div',undefined,'calendar-tools');const picker=el('input');picker.type='month';picker.value=month;picker.setAttribute('aria-label','Mes del calendario');picker.onchange=()=>{if(picker.value){month=picker.value;render();}};tools.append(picker,button('+ Actividad',()=>eventForm(parent)));bar.append(tools);
    const grid=el('div',undefined,'calendar-grid');bar.append(grid);['L','M','X','J','V','S','D'].forEach(t=>grid.append(el('span',t,'weekday')));
    const [year,m]=month.split('-').map(Number),start=(new Date(year,m-1,1).getDay()+6)%7,days=new Date(year,m,0).getDate();
    for(let i=0;i<start;i++)grid.append(el('div'));
    for(let d=1;d<=days;d++){const iso=`${month}-${String(d).padStart(2,'0')}`,cell=el('div',undefined,'calendar-day');cell.append(button(String(d),()=>eventForm(parent,null,iso),'day-number'));content.events.filter(e=>e.start<=iso&&(e.end||e.start)>=iso).forEach(e=>{const b=button(e.short||e.title,()=>eventForm(parent,e),'event '+e.type);b.title=e.title;cell.append(b);});grid.append(cell);}
    const agenda=panel(parent,'Actividades del mes');const events=content.events.filter(e=>e.start.slice(0,7)===month||(e.start<month+'-01'&&(e.end||e.start)>=month+'-01')).sort((a,b)=>a.start.localeCompare(b.start));
    if(!events.length)agenda.append(el('p','Este mes está libre. Pulsa un día para empezar.'));
    events.forEach(e=>{const row=el('div',undefined,'agenda-row');row.append(el('span',e.start.slice(8)),el('div',`${e.title} · ${e.time}`),button('Editar',()=>eventForm(parent,e)),button('Duplicar',()=>eventForm(parent,null,e.start,{...e})));agenda.append(row);});
  }
  function eventForm(parent,existing,date=today(),duplicate){
    document.querySelector('.event-editor')?.remove();for(const section of parent.children)section.inert=true;const box=panel(parent,existing?'Editar actividad':'Nueva actividad');box.classList.add('event-editor');$('tabs').inert=true;$('publish').disabled=true;const form=el('form');box.append(form);const draft=structuredClone(existing||duplicate||{start:date,end:date,title:'',short:'',time:'',type:'ssa'});draft.end ||= draft.start;
    ['title','short','start','end','time','type'].forEach(k=>field(form,draft,k));form.querySelector('input').required=true;
    const repeat={weeks:1};if(!existing){field(form,repeat,'weeks','Número de semanas (1 = solo una vez)');const n=form.querySelector('input[type=number]');n.min=1;n.max=52;n.step=1;}
    const save=el('button','Guardar actividad');save.type='submit';form.append(save,button('Cancelar',()=>{box.remove();for(const section of parent.children)section.inert=false;$('tabs').inert=false;$('publish').disabled=pendingUploads>0;}));
    if(existing)form.append(button('Eliminar actividad',()=>{content.events.splice(content.events.indexOf(existing),1);changed();render();},'remove'));
    form.onsubmit=e=>{e.preventDefault();if(draft.end<draft.start){status('La fecha de fin debe ser igual o posterior al inicio.','error');return;}if(!draft.short.trim())draft.short=draft.title;
      if(existing)Object.assign(existing,draft);else{const shift=(iso,n)=>{const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n*7);return d.toISOString().slice(0,10);};for(let n=0;n<repeat.weeks;n++)content.events.push({...draft,start:shift(draft.start,n),end:shift(draft.end,n)});}changed();render();};box.scrollIntoView({behavior:'smooth',block:'center'});
  }
  const imageSlots={plate:['Plato de estrellas','/assets/reference-1.png'],prize:['Portada del premio','/assets/reference-2.jpeg'],team:['Fotografía de fondo','/assets/reference-3.jpeg'],hero:['Águila de cabecera','/assets/reference-4.png'],avatar:['Águila de los perfiles','/assets/reference-5.png']};
  function images(parent){
    const grid=el('div',undefined,'image-grid');parent.append(grid);
    for(const [key,[title,fallback]] of Object.entries(imageSlots)){
      const box=panel(grid,title,'JPG, PNG o WebP · máximo 3 MB');const img=el('img');img.src=content.images[key]||fallback;img.alt=title;box.append(img);
      const label=el('label','Sustituir imagen');const input=el('input');input.type='file';input.accept='image/jpeg,image/png,image/webp';label.append(input);box.append(label);
      input.onchange=async()=>{const file=input.files[0];if(!file)return;if(file.size>3*1024*1024){status('La imagen supera los 3 MB.','error');return;}input.disabled=true;pendingUploads++;$('publish').disabled=true;status('Subiendo imagen…');try{const r=await fetch('/api/images',{method:'POST',headers:{'Content-Type':file.type},body:file});const data=await r.json();if(!r.ok)throw new Error(data.error||'No se ha podido subir la imagen.');content.images[key]=data.url;img.src=data.url;changed();}catch(e){status(e.message,'error');}finally{input.disabled=false;pendingUploads--;$('publish').disabled=pendingUploads>0;}};
      box.append(button('Restaurar imagen original',()=>{delete content.images[key];changed();render();}));
    }
  }
  let pendingUploads=0;
  function render(){
    $('tabs').inert=false;$('publish').disabled=pendingUploads>0;const parent=$('fields');parent.replaceChildren();$('tabs').replaceChildren();
    for(const [key,name] of Object.entries(groups)){const b=button(name,()=>{active=key;render();});b.setAttribute('aria-pressed',String(active===key));$('tabs').append(b);}
    if(active==='personas')profiles(parent);
    else if(active==='events')calendar(parent);
    else if(active==='images')images(parent);
    else if(active==='progress'){const box=panel(parent,'El plato del equipo','Actualiza el objetivo global y las estrellas conseguidas. Admite decimales.');['total','achieved','newStars'].forEach(key=>field(box,content.progress,key));}
    else {
      const search=el('input');search.type='search';search.placeholder='Buscar un texto…';search.setAttribute('aria-label','Buscar texto');parent.append(search);
      const sections=[['Identidad y navegación',0,15],['Plato y premio',16,26],['Eagle y objetivos',27,34],['Contest',35,36],['Los 9 puntos',37,70],['Canal',71,81],['Calendario y pie',82,103]];
      sections.forEach(([title,start,end])=>{const box=el('details');box.append(el('summary',title));parent.append(box);for(let n=start;n<=end;n++){if([12,14,18,20,33,34,85,103].includes(n))continue;const key='copy-'+n;if(!(key in content.copy))continue;const row=el('div',undefined,'copy-field');field(row,content.copy,key,content.copy[key].trim().slice(0,75)||'Texto');box.append(row);}});
      search.oninput=()=>parent.querySelectorAll('details').forEach(box=>{let found=false;box.querySelectorAll('.copy-field').forEach(row=>{row.hidden=!row.querySelector('textarea').value.toLocaleLowerCase().includes(search.value.toLocaleLowerCase());if(!row.hidden)found=true;});box.hidden=!found;box.open=!!search.value;});
    }
  }
  async function openWorkspace(){
    const session=await request('/api/session');
    if(!session.canEdit){status(session.authenticated?'Tu cuenta necesita el rol admin. Solicita acceso al propietario de la academia.':'', 'error');return;}
    const saved=await request('/api/content');content=saved.content||await fetch('/assets/default-content.json').then(r=>r.json());revision=saved.revision;normalize();
    $('auth').hidden=true;$('workspace').hidden=false;render();status('Contenido cargado.');
  }
  $('login-form').onsubmit=async event=>{event.preventDefault();$('login-button').disabled=true;try{await request('/api/session','POST',{action:'login',email:$('email').value,password:$('password').value});$('password').value='';await openWorkspace();}catch(e){status(e.message,'error');}finally{$('login-button').disabled=false;}};
  $('recovery').onclick=async()=>{if(!$('email').reportValidity()||!$('email').value)return;$('recovery').disabled=true;status('Solicitando el correo de recuperación…');try{await request('/api/session','POST',{action:'recover',email:$('email').value.trim()});status('Si el correo corresponde a una cuenta, recibirás un enlace. Revisa también spam y utiliza únicamente el correo más reciente.');}catch(e){status(e.message,'error');}finally{$('recovery').disabled=false;}};
  $('password-form').onsubmit=async event=>{event.preventDefault();const submit=$('password-form').querySelector('button');submit.disabled=true;try{await request('/api/session','POST',{action:callback.action,token:callback.token,password:$('new-password').value});location.replace('/editor.html');}catch(e){status(e.message,'error');}finally{submit.disabled=false;}};
  $('password-form').append(button('Volver al acceso y solicitar otro enlace',()=>location.replace('/editor.html')));
  $('publish').onclick=async()=>{
    if(pendingUploads)return;
    if(content.personas.some(p=>!p.nombre.trim())||new Set(content.personas.map(p=>p.nombre.trim().toLocaleLowerCase())).size!==content.personas.length){status('Cada perfil necesita un nombre único.','error');return;}
    normalize();
    $('publish').disabled=true;$('fields').inert=true;$('tabs').inert=true;status('Publicando cambios…');try{const result=await request('/api/content','PUT',{content,revision});revision=result.revision;dirty=false;status('Cambios publicados. Ya están visibles en la página.','success');}catch(e){status(e.message,'error');}finally{$('publish').disabled=false;$('fields').inert=false;$('tabs').inert=false;}
  };
  $('logout').onclick=async()=>{try{await request('/api/session','POST',{action:'logout'});location.reload();}catch(e){status(e.message,'error');}};
  window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
  const hash=new URLSearchParams(location.hash.slice(1));
  const token=hash.get('invite_token')||hash.get('recovery_token');
  if(token){callback={action:hash.has('invite_token')?'invite':'reset',token};history.replaceState(null,'','/editor.html');$('login-form').hidden=true;$('password-form').hidden=false;status('Elige una contraseña para tu cuenta.');}
  else openWorkspace().catch(e=>status(e.message,'error'));
})();
