
(function(){
  var upd = document.getElementById('updated');
  if (!upd) return;
  var today = new Date();
  upd.textContent = 'Actualizado ' + today.toLocaleDateString('es-ES', {day:'2-digit', month:'short', year:'numeric'});
})();
