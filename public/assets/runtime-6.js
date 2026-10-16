
(function(){
  var seccion = document.getElementById('foto');
  var lienzo = document.getElementById('cnav');
  if (!seccion || !lienzo || !lienzo.getContext) return;
  var ctx = lienzo.getContext('2d');
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var D = 'M58.78 11.39 Q60.00 8.00 61.22 11.39 L70.83 38.03 Q72.05 41.42 75.65 41.53 L103.95 42.43 Q107.55 42.55 104.71 44.76 L82.34 62.13 Q79.50 64.33 80.50 67.79 L88.39 94.99 Q89.39 98.45 86.41 96.43 L62.98 80.52 Q60.00 78.50 57.02 80.52 L33.59 96.43 Q30.61 98.45 31.61 94.99 L39.50 67.79 Q40.50 64.33 37.66 62.13 L15.29 44.76 Q12.45 42.55 16.05 42.43 L44.35 41.53 Q47.95 41.42 49.17 38.03 Z';
  var estrella = (typeof Path2D === 'function') ? new Path2D(D) : null;

  var w = 0, h = 0, dpr = 1;
  var nieve = [], brillos = [];

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
    // nieve
    nieve = [];
    var copos = Math.max(40, Math.round(w * h / 9000));
    for (var k = 0; k < copos; k++){
      nieve.push({ x: rnd(0, w), y: rnd(0, h), r: rnd(1, 3), v: rnd(0.18, 0.55), vaiven: rnd(6, 18), fase: rnd(0, 6.3) });
    }

    // estrellas doradas subiendo, como en el resto de la página
    brillos = [];
    var e = Math.max(8, Math.round(w * h / 42000));
    for (var m = 0; m < e; m++){
      brillos.push({ x: rnd(0, w), y: rnd(0, h), s: rnd(9, 22), v: rnd(0.10, 0.30), giro: rnd(0, 6.3), vgiro: rnd(-0.002, 0.002), alfa: rnd(0.25, 0.5), fase: rnd(0, 6.3), vaiven: rnd(6, 16) });
    }
  }

  function pintar(t, p){
    ctx.clearRect(0, 0, w, h);
    if (p <= 0.01) return;
    ctx.globalAlpha = p;

    if (estrella){
      for (var s = 0; s < brillos.length; s++){
        var g = brillos[s];
        ctx.save();
        ctx.translate(g.x + Math.sin(t / 3000 + g.fase) * g.vaiven, g.y);
        ctx.rotate(g.giro);
        var kk = g.s / 120;
        ctx.scale(kk, kk);
        ctx.translate(-60, -58);
        ctx.fillStyle = 'rgba(217,166,43,' + g.alfa + ')';
        ctx.fill(estrella);
        ctx.restore();
      }
    }

    for (var n = 0; n < nieve.length; n++){
      var c = nieve[n];
      ctx.beginPath();
      ctx.arc(c.x + Math.sin(t / 2200 + c.fase) * c.vaiven, c.y, c.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  function mover(){
    var i;
    for (i = 0; i < nieve.length; i++){
      nieve[i].y += nieve[i].v;
      if (nieve[i].y > h + 6){ nieve[i].y = -6; nieve[i].x = rnd(0, w); }
    }
    for (i = 0; i < brillos.length; i++){
      brillos[i].y -= brillos[i].v;
      brillos[i].giro += brillos[i].vgiro;
      if (brillos[i].y < -30){ brillos[i].y = h + 30; brillos[i].x = rnd(0, w); }
    }
  }

  function avance(){
    var r = seccion.getBoundingClientRect();
    var vh = window.innerHeight || 800;
    var p = (vh * 0.95 - r.top) / (vh * 0.55);
    return p < 0 ? 0 : (p > 1 ? 1 : p);
  }

  var visible = false;
  function bucle(t){
    var p = avance();
    seccion.style.setProperty('--nav', p.toFixed(3));
    if (!quieto) mover();
    pintar(t, p);
    if (visible) requestAnimationFrame(bucle);
  }

  medir();
  window.addEventListener('resize', medir);

  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(e){
      var dentro = e[0].isIntersecting;
      if (dentro && !visible){ visible = true; requestAnimationFrame(bucle); }
      else if (!dentro) visible = false;
    }, { rootMargin: '200px 0px' }).observe(seccion);
  } else {
    visible = true; requestAnimationFrame(bucle);
  }
  bucle(0);
})();
