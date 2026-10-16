
(function(){
  var canvas = document.getElementById('bg');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  var D = 'M58.78 11.39 Q60.00 8.00 61.22 11.39 L70.83 38.03 Q72.05 41.42 75.65 41.53 L103.95 42.43 Q107.55 42.55 104.71 44.76 L82.34 62.13 Q79.50 64.33 80.50 67.79 L88.39 94.99 Q89.39 98.45 86.41 96.43 L62.98 80.52 Q60.00 78.50 57.02 80.52 L33.59 96.43 Q30.61 98.45 31.61 94.99 L39.50 67.79 Q40.50 64.33 37.66 62.13 L15.29 44.76 Q12.45 42.55 16.05 42.43 L44.35 41.53 Q47.95 41.42 49.17 38.03 Z';
  var starPath = (typeof Path2D === 'function') ? new Path2D(D) : null;

  var w = 0, h = 0, dpr = 1;
  var estrellas = [];
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rnd(a, b){ return a + Math.random() * (b - a); }

  function medir(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function poblar(){
    var area = w * h;
    var nEstrellas = Math.round(Math.min(70, Math.max(26, area / 21000)));

    estrellas = [];
    for (var j = 0; j < nEstrellas; j++){
      estrellas.push({
        x: rnd(0, w), y: rnd(0, h),
        s: rnd(9, 30),
        v: rnd(0.09, 0.30),
        vaiven: rnd(8, 24),
        fase: rnd(0, Math.PI * 2),
        giro: rnd(0, Math.PI * 2),
        vgiro: rnd(-0.0020, 0.0020),
        alfa: rnd(0.26, 0.55)
      });
    }
  }

  function pintar(t){
    ctx.clearRect(0, 0, w, h);

    if (starPath){
      for (var j = 0; j < estrellas.length; j++){
        var e = estrellas[j];
        var ex = e.x + Math.sin(t / 3200 + e.fase) * e.vaiven;
        ctx.save();
        ctx.translate(ex, e.y);
        ctx.rotate(e.giro);
        var k = e.s / 120;
        ctx.scale(k, k);
        ctx.translate(-60, -58);
        ctx.fillStyle = 'rgba(217,166,43,' + e.alfa + ')';
        ctx.fill(starPath);
        ctx.restore();
      }
    }
  }

  function mover(){
    var i, p;
    for (i = 0; i < estrellas.length; i++){
      p = estrellas[i];
      p.y -= p.v;
      p.giro += p.vgiro;
      if (p.y < -40){ p.y = h + 40; p.x = rnd(0, w); }
    }
  }

  function bucle(t){
    mover();
    pintar(t);
    requestAnimationFrame(bucle);
  }

  function arrancar(){
    medir();
    poblar();
    pintar(0);
    if (!quieto) requestAnimationFrame(bucle);
  }

  var temporizador;
  window.addEventListener('resize', function(){
    clearTimeout(temporizador);
    temporizador = setTimeout(function(){ medir(); poblar(); pintar(0); }, 200);
  });

  arrancar();
})();
