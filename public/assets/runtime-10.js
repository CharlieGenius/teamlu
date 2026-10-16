
(function(){
  var caja = document.querySelector('.player.premio');
  if (!caja) return;
  var enlace = caja.querySelector('.player-fallback');
  enlace.addEventListener('click', function(ev){
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;
    ev.preventDefault();
    var marco = document.createElement('iframe');
    marco.src = 'https://www.youtube-nocookie.com/embed/oAJ7TKJkFww?autoplay=1&rel=0';
    marco.title = 'TEAM LU recogiendo el premio';
    marco.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    marco.allowFullscreen = true;
    caja.appendChild(marco);
    enlace.hidden = true;
  });
})();
