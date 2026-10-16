
(function(){
  var META = 7;

  // Quiénes tienen su última estrella brillando (lista vacía [] = ninguna).

  // Estrellas de Eagle conseguidas por cada persona (de 0 a 7).
  // brillan: cuantas de las ultimas estrellas palpitan (opcional)
  var EAGLE = window.TEAM_CONTENT.eagle;

  var panel = document.getElementById('eagle-panel');
  if (!panel) return;

  EAGLE.forEach(function(p){
    var n = Math.max(0, Math.min(p.estrellas, META));
    var row = document.createElement('div');
    row.className = 'eagle-row' + (n === META ? ' full' : '');

    var name = document.createElement('span');
    name.className = 'eagle-name';
    name.textContent = p.nombre;

    var stars = document.createElement('div');
    stars.className = 'eagle-stars';
    for (var i = 0; i < META; i++){
      var s = document.createElement('div');
      s.className = 'star' + (i < n ? ' on' : '') +
                    ((p.brillan > 0 && i >= n - p.brillan && i < n) ? ' nueva' : '');
      s.innerHTML = '<svg viewBox="0 0 120 120"><use href="#star-shape"></use></svg>';
      stars.appendChild(s);
    }
    stars.setAttribute('role', 'img');
    stars.setAttribute('aria-label', n + ' de ' + META + ' estrellas');

    var count = document.createElement('span');
    count.className = 'eagle-count';
    count.textContent = n + '/' + META;

    row.appendChild(name);
    row.appendChild(stars);
    row.appendChild(count);
    panel.appendChild(row);
  });
})();
