
(function(){
  var TOTAL = window.TEAM_CONTENT.progress.total;

  // Estrellas conseguidas. Se encienden de dentro hacia fuera del plato.
  // Admite decimales: la ultima estrella se rellena a medias.
  var CONSEGUIDAS = window.TEAM_CONTENT.progress.achieved;

  // Cuantas de las ultimas conseguidas brillan y palpitan (admite decimales).
  var BRILLAN = window.TEAM_CONTENT.progress.newStars;

  // [cuántas estrellas, radio relativo] — 8+15+21+26 = 70
  var ANILLOS = [[8,0.30],[15,0.52],[21,0.74],[26,0.95]];
  if (TOTAL !== 70){
    var allocated = 0;
    ANILLOS = ANILLOS.map(function(ring, index){
      var count = index === 3 ? TOTAL - allocated : Math.round(ring[0] / 70 * TOTAL);
      allocated += count;
      return [count, ring[1]];
    });
  }
  var RADIO = 36;   // % del plato ocupado por el anillo exterior

  var plate = document.getElementById('stars-plate');
  var leftEl = document.getElementById('star-left');
  var subEl = document.getElementById('star-sub');
  var barEl = document.getElementById('star-bar');
  var heroEl = document.getElementById('stat-estrellas');
  if (!plate) return;

  var n = Math.max(0, Math.min(CONSEGUIDAS, TOTAL));
  var left = TOTAL - n;
  var enteras = Math.floor(n + 1e-9);
  var resto = n - enteras;
  var desdeBrillo = Math.floor(n - BRILLAN + 1e-9);
  var i = 0;

  // 25.8 -> "25,8"  |  20 -> "20"
  function num(v){
    return (Math.round(v * 10) / 10).toString().replace('.', ',');
  }

  ANILLOS.forEach(function(anillo, k){
    var cuantas = anillo[0], r = anillo[1] * RADIO;
    var giro = (k % 2) ? Math.PI / cuantas : 0;
    for (var j = 0; j < cuantas; j++){
      var a = -Math.PI/2 + giro + (j / cuantas) * Math.PI * 2;
      var star = document.createElement('div');
      var media = (i === enteras && resto > 0.02);
      star.className = 'star'
        + (i < enteras ? ' on' : '')
        + (media ? ' media' : '')
        + ((i >= desdeBrillo && i <= enteras && (i < enteras || media)) ? ' nueva' : '');
      star.style.left = (50 + r * Math.cos(a)).toFixed(2) + '%';
      star.style.top  = (50 + r * Math.sin(a)).toFixed(2) + '%';
      star.innerHTML = '<svg viewBox="0 0 120 120"><use href="#star-shape"></use></svg>'
        + (media
            ? '<svg class="relleno" viewBox="0 0 120 120" style="clip-path:inset(0 '
              + ((1 - resto) * 100).toFixed(1) + '% 0 0 0)"><use href="#star-shape"></use></svg>'
            : '');
      plate.appendChild(star);
      i++;
    }
  });

  plate.setAttribute('role', 'img');
  plate.setAttribute('aria-label', num(n) + ' de ' + TOTAL + ' estrellas conseguidas');

  if (leftEl) leftEl.textContent = num(n);
  if (subEl) subEl.textContent = 'Faltan ' + num(left) + ' para las ' + TOTAL;
  if (barEl) barEl.style.width = (n / TOTAL * 100).toFixed(1) + '%';
  if (heroEl) heroEl.textContent = num(left);
})();
