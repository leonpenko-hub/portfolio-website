(function () {

  // Update this URL with your Calendly / cal.com booking link
  var CALENDAR_URL = 'https://calendly.com/leon-penko';

  const FLOW = {
    start: {
      msg: "Hey! What brings you here today?",
      options: [
        { label: "Looking to hire a designer", next: "hire"   },
        { label: "Potential collaboration",    next: "collab" },
        { label: "Just browsing",              next: "browse" }
      ]
    },
    hire: {
      msg: "Full-time role or freelance / contract?",
      options: [
        { label: "Full-time role",       next: "hire_ft" },
        { label: "Freelance / Contract", next: "hire_fl" }
      ]
    },
    hire_ft: {
      msg: "Leon is open to senior design roles — ideally with some remote flexibility. How would you like to connect?",
      options: [
        { label: "Send a message",     next:   "contact"  },
        { label: "Schedule a call",    action: "calendar" },
        { label: "Download CV first",  action: "cv"       }
      ]
    },
    hire_fl: {
      msg: "What type of work are you looking for?",
      options: [
        { label: "Product design",  next: "contact" },
        { label: "UX research",     next: "contact" },
        { label: "Design system",   next: "contact" },
        { label: "Something else",  next: "contact" }
      ]
    },
    collab: {
      msg: "Sounds interesting! What are you working on?",
      type: "input",
      placeholder: "Tell me about your project...",
      storeAs: "collab_note",
      next: "contact"
    },
    browse: {
      msg: "Happy to have you here. Anything you'd like to know about Leon?",
      options: [
        { label: "His background",       next: "bg"      },
        { label: "How he works",         next: "process" },
        { label: "Get in touch anyway",  next: "contact" }
      ]
    },
    bg: {
      msg: "15+ years designing complex B2B and SaaS products — digital health, cybersecurity, enterprise. Always at the intersection of strategy, research, and craft.",
      options: [
        { label: "See his work",  action: "work"    },
        { label: "Get in touch",  next:   "contact" }
      ]
    },
    process: {
      msg: "Research first, always. Leon maps the problem space before touching Figma — user flows, IA, then high-fidelity. AI is embedded into every stage.",
      options: [
        { label: "See his work",  action: "work"    },
        { label: "Get in touch",  next:   "contact" }
      ]
    },
    contact: {
      msg: "Drop your email and a quick note — Leon usually replies the same day.",
      type: "form"
    }
  };

  var ctx  = {};
  var open = false;

  // ── Build DOM ──────────────────────────────────
  function init() {
    var w = document.createElement('div');
    w.id = 'chat-widget';
    w.innerHTML =
      '<button id="chat-btn" class="chat-btn" aria-label="Chat">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
        '</svg>' +
      '</button>' +
      '<div id="chat-panel" class="chat-panel">' +
        '<div class="chat-header">' +
          '<div class="chat-header-left">' +
            '<div class="chat-avatar">LP</div>' +
            '<div>' +
              '<p class="chat-hname">Leon Penkovich</p>' +
              '<p class="chat-hsub">Usually replies same day</p>' +
            '</div>' +
          '</div>' +
          '<button id="chat-close" class="chat-close">&#215;</button>' +
        '</div>' +
        '<div id="chat-msgs" class="chat-msgs"></div>' +
        '<div id="chat-foot" class="chat-foot"></div>' +
      '</div>';
    document.body.appendChild(w);

    document.getElementById('chat-btn').addEventListener('click', toggle);
    document.getElementById('chat-close').addEventListener('click', closeChat);
    step('start');
  }

  // ── Open / Close ───────────────────────────────
  function toggle() { open ? closeChat() : openChat(); }
  function openChat() {
    open = true;
    document.getElementById('chat-panel').classList.add('open');
    document.getElementById('chat-btn').classList.add('active');
  }
  function closeChat() {
    open = false;
    document.getElementById('chat-panel').classList.remove('open');
    document.getElementById('chat-btn').classList.remove('active');
  }

  // ── Step ───────────────────────────────────────
  function step(key) {
    var s = FLOW[key];
    if (!s) return;
    clearFoot();
    typing(function () {
      botMsg(s.msg);
      if      (s.type === 'form')  showForm();
      else if (s.type === 'input') showInput(s.placeholder, s.storeAs, s.next);
      else if (s.options)          showOptions(s.options);
    });
  }

  // ── Typing indicator ───────────────────────────
  function typing(cb) {
    var msgs = document.getElementById('chat-msgs');
    var el = document.createElement('div');
    el.className = 'chat-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(el);
    scroll();
    setTimeout(function () { el.remove(); cb(); }, 800);
  }

  // ── Messages ───────────────────────────────────
  function botMsg(txt)  { addMsg(txt, 'bot');  }
  function userMsg(txt) { addMsg(txt, 'user'); }
  function addMsg(txt, who) {
    var msgs = document.getElementById('chat-msgs');
    var el = document.createElement('div');
    el.className = 'chat-bubble ' + who;
    el.textContent = txt;
    msgs.appendChild(el);
    scroll();
  }

  // ── Options ────────────────────────────────────
  function showOptions(opts) {
    var foot = document.getElementById('chat-foot');
    var wrap = document.createElement('div');
    wrap.className = 'chat-opts';
    opts.forEach(function (o) {
      var btn = document.createElement('button');
      btn.className = 'chat-opt';
      btn.textContent = o.label;
      btn.addEventListener('click', function () { pick(o); });
      wrap.appendChild(btn);
    });
    foot.appendChild(wrap);
  }

  function pick(opt) {
    clearFoot();
    userMsg(opt.label);
    if (opt.action === 'cv') {
      window.open('https://tinyurl.com/penkoleon', '_blank');
      typing(function () {
        botMsg("CV opened in a new tab. Anything else?");
        showOptions([{ label: "Get in touch", next: "contact" }]);
      });
    } else if (opt.action === 'calendar') {
      window.open(CALENDAR_URL, '_blank');
      typing(function () {
        botMsg("Calendar opened — pick a time that works for you!");
      });
    } else if (opt.action === 'work') {
      var onHome = window.location.pathname === '/' ||
                   (window.location.pathname.endsWith('index.html') &&
                    window.location.pathname.indexOf('/wizecare') === -1 &&
                    window.location.pathname.indexOf('/totango')   === -1 &&
                    window.location.pathname.indexOf('/about')     === -1);
      if (onHome) {
        var sec = document.getElementById('work');
        if (sec) sec.scrollIntoView({ behavior: 'smooth' });
        closeChat();
      } else {
        window.location.href = '/#work';
      }
    } else if (opt.next) {
      step(opt.next);
    }
  }

  // ── Free-text input ────────────────────────────
  function showInput(placeholder, storeKey, nextStep) {
    var foot = document.getElementById('chat-foot');
    var wrap = document.createElement('div');
    wrap.className = 'chat-input-wrap';

    var inp = document.createElement('input');
    inp.className = 'chat-input-field';
    inp.type = 'text';
    inp.placeholder = placeholder || 'Type here...';

    var btn = document.createElement('button');
    btn.className = 'chat-send-btn';
    btn.innerHTML =
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
        '<line x1="22" y1="2" x2="11" y2="13"/>' +
        '<polygon points="22 2 15 22 11 13 2 9 22 2"/>' +
      '</svg>';

    function submit() {
      var v = inp.value.trim();
      if (!v) return;
      if (storeKey) ctx[storeKey] = v;
      clearFoot();
      userMsg(v);
      step(nextStep);
    }

    btn.addEventListener('click', submit);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); });

    wrap.appendChild(inp);
    wrap.appendChild(btn);
    foot.appendChild(wrap);
    setTimeout(function () { inp.focus(); }, 50);
  }

  // ── Contact form ───────────────────────────────
  function showForm() {
    var foot = document.getElementById('chat-foot');
    var form = document.createElement('div');
    form.className = 'chat-form';
    form.innerHTML =
      '<input id="cf-email" type="email" placeholder="Your email" required>' +
      '<textarea id="cf-msg" placeholder="Your message"></textarea>' +
      '<button id="cf-send" class="chat-form-send">Send message</button>' +
      '<button id="cf-cal"  class="chat-form-cal">Schedule a call instead ↗</button>';
    foot.appendChild(form);

    document.getElementById('cf-send').addEventListener('click', function () {
      var email = document.getElementById('cf-email').value.trim();
      var msg   = document.getElementById('cf-msg').value.trim();
      if (!email) { document.getElementById('cf-email').focus(); return; }
      var extra   = ctx.collab_note ? '\n\nProject note: ' + ctx.collab_note : '';
      var subject = encodeURIComponent('Portfolio inquiry');
      var body    = encodeURIComponent('From: ' + email + '\n\n' + msg + extra);
      clearFoot();
      userMsg(email);
      typing(function () { botMsg("Message sent! Leon will get back to you soon."); });
      setTimeout(function () {
        window.location.href = 'mailto:leon.penko@gmail.com?subject=' + subject + '&body=' + body;
      }, 1000);
    });

    document.getElementById('cf-cal').addEventListener('click', function () {
      window.open(CALENDAR_URL, '_blank');
    });
  }

  // ── Helpers ────────────────────────────────────
  function clearFoot() { document.getElementById('chat-foot').innerHTML = ''; }
  function scroll() {
    var msgs = document.getElementById('chat-msgs');
    msgs.scrollTop = msgs.scrollHeight;
  }

  // ── Boot ───────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
