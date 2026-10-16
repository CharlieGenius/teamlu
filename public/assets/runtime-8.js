
(function(){
  var seccion = document.getElementById('contest');
  var lienzo = document.getElementById('cplanes');
  if (!seccion || !lienzo || !lienzo.getContext) return;
  var ctx = lienzo.getContext('2d');
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var D = 'M60 8 C67 8 71 19 72 35 L113 67 L113 80 L72 64 L72 89 L85 99 L85 110 L60 101 L35 110 L35 99 L48 89 L48 64 L7 80 L7 67 L48 35 C49 19 53 8 60 8 Z';
  var avion = (typeof Path2D === 'function') ? new Path2D(D) : null;

  var w = 0, h = 0, dpr = 1, flota = [];

  function rnd(a, b){ return a + Math.random() * (b - a); }

  function medir(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = lienzo.clientWidth; h = lienzo.clientHeight;
    lienzo.width = Math.round(w * dpr);
    lienzo.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    poblar();
  }

  function poblar(){
    flota = [];
    var cuantos = Math.round(Math.min(34, Math.max(12, w * h / 26000)));
    for (var i = 0; i < cuantos; i++){
      flota.push({
        x: rnd(0, w), y: rnd(0, h),
        s: rnd(9, 22),
        v: rnd(0.10, 0.32),
        vaiven: rnd(7, 20),
        fase: rnd(0, 6.3),
        giro: rnd(-0.35, 0.35),
        vgiro: rnd(-0.0016, 0.0016),
        alfa: rnd(0.45, 0.85)
      });
    }
  }

  function pintar(t){
    ctx.clearRect(0, 0, w, h);
    if (!avion) return;
    for (var i = 0; i < flota.length; i++){
      var a = flota[i];
      ctx.save();
      ctx.translate(a.x + Math.sin(t / 3000 + a.fase) * a.vaiven, a.y);
      ctx.rotate(a.giro);
      var k = a.s / 120;
      ctx.scale(k, k);
      ctx.translate(-60, -58);
      ctx.fillStyle = 'rgba(10,24,45,' + a.alfa + ')';
      ctx.fill(avion);
      ctx.restore();
    }
  }

  function mover(){
    for (var i = 0; i < flota.length; i++){
      var a = flota[i];
      a.y -= a.v;
      a.giro += a.vgiro;
      if (a.giro > 0.4 || a.giro < -0.4) a.vgiro *= -1;
      if (a.y < -30){ a.y = h + 30; a.x = rnd(0, w); }
    }
  }

  var visible = false;
  function bucle(t){
    if (!quieto) mover();
    pintar(t);
    if (visible) requestAnimationFrame(bucle);
  }

  medir();
  pintar(0);
  window.addEventListener('resize', medir);

  if ('IntersectionObserver' in window && !quieto){
    new IntersectionObserver(function(e){
      if (e[0].isIntersecting && !visible){ visible = true; requestAnimationFrame(bucle); }
      else if (!e[0].isIntersecting) visible = false;
    }, { rootMargin: '200px 0px' }).observe(seccion);
  }
})();
