
(function(){
  var raiz = document.documentElement;
  raiz.classList.add('js');
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function encender(el, retardo){
    setTimeout(function(){ el.classList.add('in'); }, retardo || 0);
  }

  // 1. La cabecera se forma al entrar
  var aguila = document.querySelector('.eagle');
  var piezas = Array.prototype.slice.call(document.querySelectorAll('.hero-inner > *:not(.eagle)'));
  function abrir(){
    if (aguila) encender(aguila, 80);
    piezas.forEach(function(el, i){ encender(el, 620 + i * 110); });
  }
  if (document.readyState === 'complete') abrir();
  else window.addEventListener('load', abrir);
  setTimeout(abrir, 1400);   // por si la imagen tarda

  // 2. Cada bloque aparece al llegar
  var bloques = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || quieto){
    Array.prototype.forEach.call(bloques, function(el){ el.classList.add('in'); });
  } else {
    var obs = new IntersectionObserver(function(entradas){
      entradas.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    Array.prototype.forEach.call(bloques, function(el){ obs.observe(el); });
  }

  // 3. El plato se monta: las estrellas salen del centro hacia su sitio
  var plato = document.getElementById('stars-plate');
  if (!plato) return;

  var estrellas = Array.prototype.slice.call(plato.querySelectorAll('.star'));
  var inicios = [];

  function sembrar(){
    var lado = plato.clientWidth || 480;
    var vw = window.innerWidth || lado;
    var alcance = Math.min(lado * 1.15, vw * 0.62);
    inicios = estrellas.map(function(){
      var ang = Math.random() * Math.PI * 2;
      var r = alcance * (0.55 + Math.random() * 0.75);
      return {
        x: Math.cos(ang) * r,
        y: Math.sin(ang) * r * 0.75 - lado * 0.15,
        rot: (Math.random() * 260 - 130)
      };
    });
  }

  function suave(t){ return 1 - Math.pow(1 - t, 4); }
  function limitar(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }

  function colocar(p){
    var n = estrellas.length;
    for (var i = 0; i < n; i++){
      var umbral = (i / n) * 0.44;          // el reparto entre la primera y la última
      var k = suave(limitar((p - umbral) / 0.56));   // cada una tarda su rato en llegar
      var s = inicios[i];
      var esc = 0.15 + 0.85 * k;
      estrellas[i].style.opacity = k < 0.04 ? 0 : k;
      estrellas[i].style.transform =
        'translate(calc(-50% + ' + (s.x * (1 - k)).toFixed(1) + 'px), calc(-50% + ' + (s.y * (1 - k)).toFixed(1) + 'px))' +
        ' scale(' + esc.toFixed(3) + ') rotate(' + (s.rot * (1 - k)).toFixed(1) + 'deg)';
    }
  }

  function progreso(){
    var r = plato.getBoundingClientRect();
    var vh = window.innerHeight || 800;
    var desde = vh * 1.00, hasta = vh * 0.20;   // termina justo cuando el plato queda bien encuadrado
    return limitar((desde - r.top) / (desde - hasta));
  }

  // el valor pintado persigue al del scroll, así el movimiento no da tirones
  var destino = 0, actual = 0, corriendo = false;

  function fotograma(){
    var d = destino - actual;
    actual += d * 0.034;
    if (Math.abs(destino - actual) < 0.0008){ actual = destino; corriendo = false; }
    else corriendo = true;
    if (actual > 0.02) plato.classList.add('in');
    colocar(actual);
    if (corriendo) requestAnimationFrame(fotograma);
  }

  function alScroll(){
    destino = progreso();
    if (!corriendo){ corriendo = true; requestAnimationFrame(fotograma); }
  }

  if (quieto){
    plato.classList.add('in');
    estrellas.forEach(function(s){ s.style.opacity = 1; s.style.transform = 'translate(-50%,-50%)'; });
  } else {
    sembrar();
    colocar(0);
    window.addEventListener('scroll', alScroll, { passive: true });
    window.addEventListener('resize', function(){ sembrar(); alScroll(); });
    destino = actual = progreso();
    colocar(actual);
    alScroll();
  }
})();
