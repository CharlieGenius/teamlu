
(function(){
  var CATS = {
    ssa:     { color:'var(--cat-ssa)',    soft:'var(--cat-ssa-soft)' },
    genius:  { color:'var(--cat-genius)', soft:'var(--cat-genius-soft)' },
    oneshot: { color:'var(--cat-online)', soft:'var(--cat-online-soft)' },
    hito:    { color:'var(--cat-hito)',   soft:'var(--cat-hito-soft)' },
    master:  { color:'var(--cat-master)', soft:'var(--cat-master-soft)' },
    salida:  { color:'var(--cat-salida)', soft:'var(--cat-salida-soft)' },
    cierre:  { color:'var(--cat-cierre)', soft:'var(--cat-cierre-soft)' }
  };

  var EVENTS = window.TEAM_CONTENT.events;

  var MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  var titleEl = document.getElementById('cal-title');
  var daysEl = document.getElementById('cal-days');
  if (!titleEl || !daysEl) return;

  var now = new Date();
  var todayKey = key(now.getFullYear(), now.getMonth(), now.getDate());
  var view = new Date(now.getFullYear(), now.getMonth(), 1);

  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function key(y, m, d){ return y + '-' + pad(m+1) + '-' + pad(d); }
  function parse(s){ var p = s.split('-'); return new Date(+p[0], +p[1]-1, +p[2]); }

  function eventsOn(k){
    var d = parse(k);
    return EVENTS.filter(function(e){
      var s = parse(e.start);
      var en = parse(e.end || e.start);
      return d >= s && d <= en;
    });
  }

  function render(){
    var y = view.getFullYear(), m = view.getMonth();
    titleEl.textContent = MONTHS[m] + ' ' + y;

    var first = new Date(y, m, 1);
    var offset = (first.getDay() + 6) % 7;          // lunes = 0
    var daysInMonth = new Date(y, m+1, 0).getDate();
    var prevDays = new Date(y, m, 0).getDate();

    daysEl.innerHTML = '';
    var cells = Math.ceil((offset + daysInMonth) / 7) * 7;

    for (var i = 0; i < cells; i++){
      var cell = document.createElement('div');
      var dayNum, inMonth = true, cy = y, cm = m;
      if (i < offset){ dayNum = prevDays - offset + 1 + i; inMonth = false; cm = m-1; }
      else if (i >= offset + daysInMonth){ dayNum = i - offset - daysInMonth + 1; inMonth = false; cm = m+1; }
      else { dayNum = i - offset + 1; }

      cell.className = 'day' + (inMonth ? '' : ' out');
      var num = document.createElement('span');
      num.className = 'num';
      num.textContent = dayNum;
      cell.appendChild(num);

      if (inMonth){
        var k = key(cy, cm, dayNum);
        var evs = eventsOn(k);
        if (k === todayKey) cell.classList.add('today');
        if (evs.length){
          var box = document.createElement('div');
          box.className = 'evs';
          evs.forEach(function(e){
            var cat = CATS[e.type] || { color:'var(--sky-deep)', soft:'var(--sky-soft)' };
            var pill = document.createElement('span');
            pill.className = 'ev';

            var dot = document.createElement('i');
            dot.style.background = cat.color;
            pill.appendChild(dot);

            var label = document.createElement('b');
            label.textContent = e.short || e.title;
            pill.appendChild(label);

            if (e.time && e.time.indexOf(':') > -1){
              var t = document.createElement('small');
              t.textContent = e.time.split('–')[0].trim();
              pill.appendChild(t);
            }
            pill.title = e.title + (e.time ? ' · ' + e.time : '');
            box.appendChild(pill);
          });
          cell.appendChild(box);
        }
      }
      daysEl.appendChild(cell);
    }

  }

  document.getElementById('cal-prev').addEventListener('click', function(){
    view = new Date(view.getFullYear(), view.getMonth()-1, 1); render();
  });
  document.getElementById('cal-next').addEventListener('click', function(){
    view = new Date(view.getFullYear(), view.getMonth()+1, 1); render();
  });

  render();
})();
