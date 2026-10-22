// Royal scroll intro: the seal breaks and the card unrolls from the middle
(function(){
  var d = document.documentElement;
  var intro = document.getElementById('scroll-intro');
  if(!intro) return;
  if(!d.classList.contains('intro')){ intro.remove(); return; }
  var frame = document.querySelector('.page-frame');
  var top = intro.querySelector('.si-top'), bot = intro.querySelector('.si-bottom');
  var R = 12; // half the rod height
  if('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  function place(p){
    var C = window.innerHeight / 2, open = (C - R) * p;
    var y1 = C - open - R - R * (1 - p), y2 = C + open - R + R * (1 - p);
    top.style.transform = 'translateY(' + y1 + 'px)';
    bot.style.transform = 'translateY(' + y2 + 'px)';
    var f = frame.getBoundingClientRect();
    var a = Math.max(0, (C - open) - f.top), b = Math.max(0, f.height - ((C + open) - f.top));
    frame.style.clipPath = 'inset(' + a + 'px 0 ' + b + 'px 0)';
  }
  place(0);
  window.addEventListener('resize', function(){ if(!opened) place(0); });

  var opened = false, auto = setTimeout(open, 1500);
  function ease(t){ return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2; }
  function open(){
    if(opened) return; opened = true; clearTimeout(auto);
    intro.classList.add('opening');
    shower();
    setTimeout(function(){
      var t0 = null, dur = 2200;
      requestAnimationFrame(function step(ts){
        if(t0 === null) t0 = ts;
        var t = Math.min(1, (ts - t0) / dur);
        place(ease(t));
        if(t < 1) return requestAnimationFrame(step);
        bot.style.transition = 'opacity .5s'; bot.style.opacity = '0';
        setTimeout(finish, 450);
      });
    }, 420);
  }
  // Small flowers: a burst when the seal breaks, then a gentle shower while it unrolls
  var FLOWERS = [['#C19A5B','#7E2A33'],['#B4664A','#F0D9B5'],['#E3C27E','#B4664A'],['#C9727C','#F3E1AE'],['#FFF6E6','#C19A5B']];
  var layer = null;
  function flower(){
    var c = FLOWERS[Math.floor(Math.random()*FLOWERS.length)];
    var el = document.createElement('span');
    el.className = 'si-flower';
    var size = 10 + Math.random()*12;
    el.style.width = el.style.height = size + 'px';
    if(Math.random() < .3){ // a single loose petal
      el.innerHTML = '<svg viewBox="-10 -10 20 20"><ellipse rx="4.5" ry="8.5" fill="' + c[0] + '"/></svg>';
    } else {
      var petals = '';
      for(var k = 0; k < 5; k++) petals += '<ellipse cy="-5" rx="3.6" ry="5.2" fill="' + c[0] + '" transform="rotate(' + (k*72) + ')"/>';
      el.innerHTML = '<svg viewBox="-10 -10 20 20">' + petals + '<circle r="2.4" fill="' + c[1] + '"/></svg>';
    }
    layer.appendChild(el);
    return el;
  }
  function fly(el, x0, y0, x1, y1, dur, delay){
    var spin = (Math.random() < .5 ? -1 : 1) * (180 + Math.random()*360);
    var sway = (Math.random()*2 - 1) * 40;
    var a = el.animate([
      { transform: 'translate(' + x0 + 'px,' + y0 + 'px) rotate(0deg)', opacity: 0 },
      { opacity: 1, offset: .08 },
      { transform: 'translate(' + ((x0+x1)/2 + sway) + 'px,' + ((y0+y1)/2) + 'px) rotate(' + spin/2 + 'deg)', offset: .5 },
      { opacity: 1, offset: .8 },
      { transform: 'translate(' + x1 + 'px,' + y1 + 'px) rotate(' + spin + 'deg)', opacity: 0 }
    ], { duration: dur, delay: delay, easing: 'ease-in', fill: 'both' });
    a.onfinish = function(){ el.remove(); };
  }
  function shower(){
    if(!document.body.animate) return;
    layer = document.createElement('div');
    layer.className = 'si-flowers';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    var W = window.innerWidth, H = window.innerHeight, cx = W/2, cy = H/2, i;
    for(i = 0; i < 14; i++){ // burst from the seal
      var ang = Math.random()*Math.PI*2, r = 70 + Math.random()*110;
      fly(flower(), cx, cy, cx + Math.cos(ang)*r, cy + Math.abs(Math.sin(ang))*r + 160, 1300 + Math.random()*600, Math.random()*120);
    }
    for(i = 0; i < 26; i++){ // shower from the top while the scroll opens
      var x = Math.random()*W;
      fly(flower(), x, -30, x + (Math.random()*2 - 1)*80, H + 30, 3200 + Math.random()*1800, 300 + Math.random()*2600);
    }
    setTimeout(function(){ if(layer) layer.remove(); }, 8000);
  }

  function finish(){
    d.classList.remove('intro');
    frame.style.clipPath = '';
    intro.remove();
    if('scrollRestoration' in history) history.scrollRestoration = 'auto';
  }
  intro.addEventListener('click', open);
  document.addEventListener('keydown', function(e){
    if(!opened && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')){ e.preventDefault(); open(); }
  });
})();

// Countdown to the Sangeet & Engagement (target set in data/story.yaml -> wedding.countdown)
(function(){
  var box = document.getElementById('countdown');
  var target = new Date((box && box.getAttribute('data-target')) || '2026-12-10T17:30:00+05:30').getTime();
  function el(id){return document.getElementById(id)}
  function pad(n){return String(n).padStart(2,'0')}
  function tick(){
    var diff = target - Date.now();
    if(diff <= 0){
      var t = el('countdown-title');
      if(t){t.textContent = 'The celebrations have begun'}
      ['cd-d','cd-h','cd-m','cd-s'].forEach(function(id){var e=el(id);if(e)e.textContent='\u2014'});
      return;
    }
    var s = Math.floor(diff/1000);
    if(el('cd-d'))el('cd-d').textContent = Math.floor(s/86400);
    if(el('cd-h'))el('cd-h').textContent = pad(Math.floor(s%86400/3600));
    if(el('cd-m'))el('cd-m').textContent = pad(Math.floor(s%3600/60));
    if(el('cd-s'))el('cd-s').textContent = pad(s%60);
  }
  tick(); setInterval(tick, 1000);
})();

// Gentle scroll reveal
if('IntersectionObserver' in window){
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
    });
  },{threshold:.15});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
}else{
  document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in')});
}

// Typewriter: "A Note From Us"
(function(){
  var el = document.getElementById('note-text');
  if(!el) return;
  var full = el.getAttribute('data-text') || '';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){ el.textContent = full; return; }
  var started = false;
  function type(){
    if(started) return; started = true;
    var i = 0;
    var caret = document.createElement('span'); caret.className = 'caret';
    el.textContent = ''; el.appendChild(caret);
    var timer = setInterval(function(){
      i++;
      el.textContent = full.slice(0, i);
      el.appendChild(caret);
      if(i >= full.length){ clearInterval(timer); setTimeout(function(){ caret.remove(); }, 2500); }
    }, 26);
  }
  if('IntersectionObserver' in window){
    var nio = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ type(); nio.disconnect(); } });
    },{threshold:.4});
    nio.observe(el);
  } else { type(); }
})();

// Wish suggestion chips -> fill textarea
(function(){
  var ta = document.getElementById('rsvp-msg');
  if(!ta) return;
  document.querySelectorAll('.wish-chip').forEach(function(chip){
    chip.addEventListener('click', function(){
      var prompt = chip.getAttribute('data-prompt') || chip.textContent.trim();
      ta.value = prompt + ' ';
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
    });
  });
})();

// Blessings: send without leaving the card, then say thank you
(function(){
  var form = document.getElementById('blessings-form');
  var thanks = document.getElementById('blessing-thanks');
  if(!form || !thanks || !window.fetch || !window.FormData) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var btn = form.querySelector('button[type=submit]');
    var label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Sending…';
    // Local testing: pretend to send, so test blessings never reach the real inbox
    var send = form.getAttribute('data-simulate')
      ? function(){ console.info('[LOCAL TEST] Blessing not sent:', Object.fromEntries(new FormData(form))); return new Promise(function(r){ setTimeout(function(){ r({ ok: true }); }, 600); }); }
      : function(){ return fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } }); };
    send().then(function(r){
      if(!r.ok) throw new Error(r.status);
      form.hidden = true;
      thanks.hidden = false;
      thanks.focus({ preventScroll: true });
    }).catch(function(){
      btn.disabled = false; btn.textContent = label;
      alert('Sorry, your blessing could not be sent. Please check your internet connection and try again.');
    });
  });
})();

// Quiz: the reflection section (title and questions in data/story.yaml -> quiz)
(function(){
  var dataEl = document.getElementById('quiz-data');
  var box = document.getElementById('quiz');
  if(!dataEl || !box) return;
  var quiz;
  try{ quiz = JSON.parse(dataEl.textContent); }catch(e){ return; }
  var qs = quiz.questions || [];
  if(!qs.length) return;
  var fb = quiz.feedback || {};
  var hashtag = box.getAttribute('data-hashtag') || '';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var idx, score, marks, answered;

  function h(tag, cls, text){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(text != null) e.textContent = text;
    return e;
  }
  function pick(list, fallback){ return (list && list.length) ? list[Math.floor(Math.random()*list.length)] : fallback; }

  // Petal progress: gold = right, terra = wrong, outlined = current
  function petals(){
    var row = h('div', 'q-petals');
    row.setAttribute('aria-hidden', 'true');
    qs.forEach(function(_, i){
      var cls = 'q-petal';
      if(marks[i] === true) cls += ' right';
      else if(marks[i] === false) cls += ' wrong';
      else if(i === idx) cls += ' current';
      row.appendChild(h('span', cls));
    });
    return row;
  }

  // Fade the card out, swap contents, fade back in
  function swap(build){
    if(reduce){ box.innerHTML = ''; build(); return; }
    box.classList.add('q-fade');
    setTimeout(function(){
      box.innerHTML = ''; build();
      box.classList.remove('q-fade');
    }, 220);
  }

  function choose(i){
    if(answered) return;
    answered = true;
    var q = qs[idx];
    var correct = (i === q.answer);
    if(correct) score++;
    marks[idx] = correct;
    var opts = box.querySelectorAll('.q-opt');
    Array.prototype.forEach.call(opts, function(b, j){
      b.disabled = true;
      if(j === q.answer) b.classList.add('correct');
      else if(j === i) b.classList.add('wrong');
      else b.classList.add('dim');
    });
    var old = box.querySelector('.q-petals');
    old.parentNode.replaceChild(petals(), old);
    var why = box.querySelector('.q-why');
    why.innerHTML = '';
    why.appendChild(h('strong', 'q-verdict', correct ? pick(fb.right, 'Lovely.') : pick(fb.wrong, 'Not quite —')));
    why.appendChild(document.createTextNode(' ' + q.why));
    why.classList.add('show');
    var next = box.querySelector('.q-next');
    next.style.display = 'inline-block';
    next.focus({preventScroll:true});
  }

  function question(){
    var q = qs[idx];
    answered = false;
    box.className = 'quiz-card';
    var top = h('div', 'q-top');
    top.appendChild(h('p', 'q-progress', 'Question ' + (idx+1) + ' of ' + qs.length));
    top.appendChild(petals());
    box.appendChild(top);
    box.appendChild(h('p', 'q-text', q.q));
    var opts = h('div', 'q-opts');
    q.options.forEach(function(opt, i){
      var b = h('button', 'q-opt');
      b.type = 'button';
      b.appendChild(h('span', 'q-key', String.fromCharCode(65+i)));
      b.appendChild(h('span', 'q-label', opt));
      b.addEventListener('click', function(){ choose(i); });
      opts.appendChild(b);
    });
    box.appendChild(opts);
    box.appendChild(h('div', 'q-why'));
    var next = h('button', 'btn q-next', idx === qs.length - 1 ? 'See My Reflection' : 'Next Question →');
    next.type = 'button'; next.style.display = 'none';
    next.addEventListener('click', function(){ idx++; swap(idx < qs.length ? question : result); });
    box.appendChild(next);
  }

  function result(){
    var ratio = score / qs.length;
    var r = quiz.results || {};
    var tier = ratio >= 0.8 ? r.high : (ratio >= 0.4 ? r.mid : r.low);
    if(typeof tier === 'string') tier = {text: tier};
    tier = tier || {};
    box.className = 'quiz-card q-final';
    box.appendChild(h('p', 'q-progress', 'Reflection complete'));
    box.appendChild(petals());
    var num = h('div', 'q-score', (reduce ? score : 0) + ' / ' + qs.length);
    box.appendChild(num);
    if(tier.title) box.appendChild(h('h3', 'q-title', tier.title));
    if(tier.text) box.appendChild(h('p', 'q-result', tier.text));
    if(!reduce){
      var n = 0;
      var t = setInterval(function(){
        if(n >= score){ clearInterval(t); return; }
        n++; num.textContent = n + ' / ' + qs.length;
      }, 180);
    }

    // Closing: the guest's own answer, carried into the blessings box
    var c = quiz.closing;
    var ta = document.getElementById('rsvp-msg');
    if(c && c.prompt){
      var wrap = h('div', 'q-closing');
      var lid = 'q-closing-input';
      var lab = h('label', 'q-closing-prompt', c.prompt);
      lab.setAttribute('for', lid);
      var input = h('textarea');
      input.id = lid; input.rows = 2; input.placeholder = c.placeholder || '';
      wrap.appendChild(lab); wrap.appendChild(input);
      if(ta){
        var add = h('button', 'btn btn-ghost', c.button || 'Add to My Blessings');
        add.type = 'button';
        add.addEventListener('click', function(){
          var v = input.value.trim();
          if(!v){ input.focus(); return; }
          ta.value = ta.value.trim() ? ta.value.trim() + '\n' + v : v;
          add.textContent = 'Added ✓ — see you below';
          add.disabled = true;
          setTimeout(function(){ document.getElementById('rsvp').scrollIntoView({behavior: reduce ? 'auto' : 'smooth'}); }, 500);
        });
        wrap.appendChild(add);
      }
      box.appendChild(wrap);
    }

    var actions = h('div', 'q-actions');
    if(quiz.share){
      var msg = quiz.share.replace('{score}', score).replace('{total}', qs.length).replace('{hashtag}', hashtag).replace('{title}', quiz.title || '');
      var link = location.href.split('#')[0] + '#quiz-section';
      var wa = h('a', 'q-link', 'Challenge a Friend on WhatsApp');
      wa.href = 'https://wa.me/?text=' + encodeURIComponent(msg + '\n' + link);
      wa.target = '_blank'; wa.rel = 'noopener';
      actions.appendChild(wa);
    }
    var again = h('button', 'q-link', 'Reflect Again ↺');
    again.type = 'button';
    again.addEventListener('click', function(){ start(); });
    actions.appendChild(again);
    box.appendChild(actions);

    var rsvp = h('a', 'btn', 'Now, Send Your Blessings ↓');
    rsvp.href = '#rsvp';
    box.appendChild(rsvp);
  }

  function start(){
    idx = 0; score = 0; marks = []; answered = false;
    swap(question);
  }

  // Keyboard: A–D or 1–4 to answer, Enter for next (only while the quiz is on screen)
  document.addEventListener('keydown', function(e){
    if(e.metaKey || e.ctrlKey || e.altKey) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if(tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if(!box.querySelector('.q-opt')) return;
    var rect = box.getBoundingClientRect();
    if(rect.bottom < 0 || rect.top > window.innerHeight) return;
    var k = e.key.toLowerCase();
    var i = 'abcd'.indexOf(k); if(i < 0) i = '1234'.indexOf(k);
    if(i >= 0 && i < qs[idx].options.length && !answered){ e.preventDefault(); choose(i); }
  });

  var begin = document.getElementById('q-begin');
  if(begin) begin.addEventListener('click', start);
})();
