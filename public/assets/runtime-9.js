
(function(){
  // ---- Ficha de cada persona -------------------------------------------
  // Cada persona tiene un historial: la entrada de arriba es la vigente y es
  // la que se ve en la tarjeta. Al añadir objetivos nuevos, se pone una
  // entrada nueva ARRIBA con su fecha y las anteriores quedan como historial.
  var PERSONAS = window.TEAM_CONTENT.personas.filter(function(p){return p.historial.length > 0;});

  var AGUILA = window.TEAM_AVATAR_IMAGE || '/assets/reference-5.png';
  var MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

  function fechaCorta(iso){
    var p = iso.split('-');
    return (+p[2]) + ' ' + MESES[+p[1] - 1] + ' ' + p[0];
  }

  function icono(p){
    return p.icono === 'aguila'
      ? '<div class="avatar aguila" aria-hidden="true"><img src="' + AGUILA + '" alt=""></div>'
      : '<div class="avatar" aria-hidden="true"><svg viewBox="0 0 120 120"><use href="#star-shape"></use></svg></div>';
  }

  function listaObjetivos(objetivos){
    var ul = document.createElement('ul');
    ul.className = 'goals';
    objetivos.forEach(function(o){
      var li = document.createElement('li');
      li.textContent = o.texto;
      if (o.tag){
        var t = document.createElement('span');
        t.className = 'tag';
        t.textContent = o.tag;
        li.appendChild(t);
      }
      ul.appendChild(li);
    });
    return ul;
  }

  // ---- Tarjetas ---------------------------------------------------------
  var grid = document.getElementById('personas-grid');
  if (!grid) return;

  PERSONAS.forEach(function(p, i){
    var vigente = p.historial[0];
    var card = document.createElement('button');
    card.type = 'button';
    card.className = 'member';
    card.dataset.persona = i;

    var head = document.createElement('div');
    head.className = 'member-head';
    head.innerHTML = icono(p) +
      '<div><h3>' + p.nombre.replace(/[&<>"']/g, function(c){return '&#'+c.charCodeAt(0)+';';}) + '</h3><p class="count">' +
      (vigente ? vigente.objetivos.length + (vigente.objetivos.length === 1 ? ' objetivo' : ' objetivos')
               : 'Sin objetivo todavía') +
      '</p></div>';
    card.appendChild(head);

    if (vigente) card.appendChild(listaObjetivos(vigente.objetivos));

    if (p.historial.length > 1){
      var pie = document.createElement('p');
      pie.className = 'ultima';
      pie.innerHTML = 'Actualizado el <b>' + fechaCorta(vigente.fecha) + '</b> · ' +
                      p.historial.length + ' versiones';
      card.appendChild(pie);
    }
    grid.appendChild(card);
  });

  // ---- Ficha ------------------------------------------------------------
  var ficha = document.getElementById('ficha');
  var fNombre = document.getElementById('ficha-nombre');
  var fSub = document.getElementById('ficha-sub');
  var fIcono = document.getElementById('ficha-icono');
  var fCuerpo = document.getElementById('ficha-cuerpo');
  var ultimoFoco = null;

  function abrir(i){
    var p = PERSONAS[i];
    fNombre.textContent = p.nombre;
    fSub.textContent = p.historial.length
      ? (p.historial.length === 1 ? 'Una versión de objetivos' : p.historial.length + ' versiones de objetivos')
      : 'Sin objetivo todavía';
    fIcono.outerHTML = icono(p).replace('class="avatar', 'id="ficha-icono" class="avatar');
    fIcono = document.getElementById('ficha-icono');

    fCuerpo.innerHTML = '';
    if (!p.historial.length){
      var vacio = document.createElement('p');
      vacio.className = 'ficha-vacia';
      vacio.textContent = 'Todavía no ha puesto sus objetivos.';
      fCuerpo.appendChild(vacio);
    } else {
      p.historial.forEach(function(e, k){
        var bloque = document.createElement('div');
        bloque.className = 'entrada' + (k > 0 ? ' vieja' : '');
        var cuando = document.createElement('p');
        cuando.className = 'cuando';
        cuando.textContent = fechaCorta(e.fecha);
        if (e.nota){
          var nota = document.createElement('span');
          nota.className = 'actual';
          nota.textContent = '· ' + e.nota;
          cuando.appendChild(nota);
        }
        if (k === 0){
          var vig = document.createElement('span');
          vig.className = 'actual';
          vig.textContent = '· vigente';
          cuando.appendChild(vig);
        }
        bloque.appendChild(cuando);
        bloque.appendChild(listaObjetivos(e.objetivos));
        fCuerpo.appendChild(bloque);
      });
    }

    ultimoFoco = document.activeElement;
    ficha.hidden = false;
    document.body.style.overflow = 'hidden';
    ficha.querySelector('.ficha-x').focus();
  }

  function cerrar(){
    ficha.hidden = true;
    document.body.style.overflow = '';
    if (ultimoFoco) ultimoFoco.focus();
  }

  grid.addEventListener('click', function(ev){
    var card = ev.target.closest('.member');
    if (card) abrir(+card.dataset.persona);
  });
  ficha.addEventListener('click', function(ev){
    if (ev.target.closest('[data-cerrar]')) cerrar();
  });
  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape' && !ficha.hidden) cerrar();
    if (ev.key === 'Tab' && !ficha.hidden){ ev.preventDefault(); ficha.querySelector('.ficha-x').focus(); }
  });
})();
