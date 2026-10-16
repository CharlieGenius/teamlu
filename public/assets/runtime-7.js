
(function(){
  var META = 14;

  // Aviones conseguidos en el Contest (de 0 a 14).
  // brillan: cuantos de los ultimos aviones palpitan (opcional)
  var CONTEST = window.TEAM_CONTENT.contest;

  var panel = document.getElementById('contest-panel');
  if (!panel) return;

  CONTEST.forEach(function(p){
    var n = Math.max(0, Math.min(p.aviones, META));
    var fila = document.createElement('div');
    fila.className = 'eagle-row' + (n === META ? ' full' : '');

    var nombre = document.createElement('span');
    nombre.className = 'eagle-name';
    nombre.textContent = p.nombre;

    var aviones = document.createElement('div');
    aviones.className = 'eagle-planes';
    for (var i = 0; i < META; i++){
      var a = document.createElement('div');
      a.className = 'plane' + (i < n ? ' on' : '') +
                    ((p.brillan > 0 && i >= n - p.brillan && i < n) ? ' nueva' : '');
      a.innerHTML = '<svg viewBox="0 0 120 120"><use href="#plane-shape"></use></svg>';
      aviones.appendChild(a);
    }
    aviones.setAttribute('role', 'img');
    aviones.setAttribute('aria-label', n + ' de ' + META + ' aviones');

    var cuenta = document.createElement('span');
    cuenta.className = 'eagle-count';
    cuenta.textContent = n + '/' + META;

    fila.appendChild(nombre);
    fila.appendChild(aviones);
    fila.appendChild(cuenta);
    panel.appendChild(fila);
  });
})();
