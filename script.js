(function(){
  var KEY='carnation-planner-v1';
  var DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var ACCENTS=[['pink','#D6457A','Pink carnation'],['red','#C0243F','Red carnation'],['peach','#CF5E3A','Peach carnation'],['lilac','#8B58BE','Lilac carnation'],['white','#7D6A73','White carnation']];
  var state={title:'My Carnation Planner',accent:'pink',events:[],todos:[]};
  var day=new Date().getDay();
  try{var raw=localStorage.getItem(KEY);if(raw){var s=JSON.parse(raw);if(s&&typeof s==='object'){state.title=s.title||state.title;state.accent=s.accent||state.accent;state.events=Array.isArray(s.events)?s.events:[];state.todos=Array.isArray(s.todos)?s.todos:[];}}}catch(e){}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
  function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
  function $(id){return document.getElementById(id);}
  function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
  function fmt(t){var p=t.split(':'),h=+p[0],m=p[1];return ((h%12)||12)+':'+m+' '+(h<12?'AM':'PM');}

  var title=$('title');
  title.textContent=state.title;
  document.title=state.title;
  title.addEventListener('blur',function(){state.title=title.textContent.trim()||'My Carnation Planner';title.textContent=state.title;document.title=state.title;save();});
  title.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();title.blur();}});

  function applyAccent(){document.documentElement.setAttribute('data-accent',state.accent);[].forEach.call($('themes').children,function(b){b.setAttribute('aria-pressed',b.dataset.a===state.accent);});}
  ACCENTS.forEach(function(a){var b=el('button','sw');b.type='button';b.style.background=a[1];b.dataset.a=a[0];b.title=a[2];b.setAttribute('aria-label',a[2]);b.addEventListener('click',function(){state.accent=a[0];applyAccent();save();});$('themes').appendChild(b);});
  applyAccent();

  var today=new Date().getDay();
  DAYS.forEach(function(d,i){var b=el('button','day',d);b.type='button';b.dataset.d=i;if(i===today){b.appendChild(el('span','n','today'));}b.addEventListener('click',function(){day=i;renderDays();renderEvents();});$('days').appendChild(b);});
  function renderDays(){[].forEach.call($('days').children,function(b){b.setAttribute('aria-pressed',+b.dataset.d===day);});}

  function renderEvents(){
    var list=$('evList');list.textContent='';
    var items=state.events.filter(function(e){return e.day===day;}).sort(function(a,b){return a.time<b.time?-1:a.time>b.time?1:0;});
    if(!items.length){list.appendChild(el('li','empty','Nothing planned for '+DAYS[day]+'. Add the first thing above.'));list.lastChild.style.display='block';return;}
    items.forEach(function(e){
      var li=el('li',e.done?'done':'');
      var cb=el('input');cb.type='checkbox';cb.checked=!!e.done;cb.setAttribute('aria-label','Mark '+e.text+' done');
      cb.addEventListener('change',function(){e.done=cb.checked;save();renderEvents();});
      li.appendChild(cb);li.appendChild(el('span','time',fmt(e.time)));li.appendChild(el('span','txt',e.text));
      var ed=el('button','ic','Edit');ed.type='button';ed.addEventListener('click',function(){var t=prompt('Change this event',e.text);if(t&&t.trim()){e.text=t.trim();save();renderEvents();}});
      var del=el('button','ic','Delete');del.type='button';del.addEventListener('click',function(){state.events=state.events.filter(function(x){return x.id!==e.id;});save();renderEvents();});
      li.appendChild(ed);li.appendChild(del);list.appendChild(li);
    });
  }
  $('evForm').addEventListener('submit',function(ev){ev.preventDefault();var t=$('evText').value.trim(),tm=$('evTime').value;if(!t||!tm)return;state.events.push({id:uid(),day:day,time:tm,text:t,done:false});save();$('evText').value='';renderEvents();});

  function renderTodos(){
    var list=$('tdList');list.textContent='';
    var done=state.todos.filter(function(t){return t.done;}).length,total=state.todos.length;
    $('bar').style.width=(total?Math.round(done/total*100):0)+'%';
    $('count').textContent=total?(done+' of '+total+' done'):'No tasks yet';
    if(!total){var e=el('li','empty','Your list is empty. Add a task to get started.');e.style.display='block';list.appendChild(e);return;}
    state.todos.forEach(function(t){
      var li=el('li',t.done?'done':'');
      var cb=el('input');cb.type='checkbox';cb.checked=!!t.done;cb.setAttribute('aria-label','Mark '+t.text+' done');
      cb.addEventListener('change',function(){t.done=cb.checked;save();renderTodos();});
      li.appendChild(cb);li.appendChild(el('span','txt',t.text));
      var ed=el('button','ic','Edit');ed.type='button';ed.addEventListener('click',function(){var n=prompt('Change this task',t.text);if(n&&n.trim()){t.text=n.trim();save();renderTodos();}});
      var del=el('button','ic','Delete');del.type='button';del.addEventListener('click',function(){state.todos=state.todos.filter(function(x){return x.id!==t.id;});save();renderTodos();});
      li.appendChild(ed);li.appendChild(del);list.appendChild(li);
    });
  }
  $('tdForm').addEventListener('submit',function(ev){ev.preventDefault();var t=$('tdText').value.trim();if(!t)return;state.todos.push({id:uid(),text:t,done:false});save();$('tdText').value='';renderTodos();});
  $('clearDone').addEventListener('click',function(){state.todos=state.todos.filter(function(t){return !t.done;});save();renderTodos();});

  renderDays();renderEvents();renderTodos();
})();