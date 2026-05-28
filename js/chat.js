(function () {

  var CALENDAR_URL = 'https://calendly.com/leon-penko';

  const FLOW = {
    start: {
      msg: "Hi! What's the reason for your message?",
      options: [
        { label: "Looking to hire a designer", next: "hire"    },
        { label: "Have a project in mind",     next: "project" },
        { label: "Just exploring",             next: "browse"  }
      ]
    },

    hire: {
      msg: "Full-time role or freelance / contract?",
      options: [
        { label: "Full-time role",       next: "hire_ack", store: { inquiry: "Full-time role" }       },
        { label: "Freelance / Contract", next: "hire_ack", store: { inquiry: "Freelance / Contract" } }
      ]
    },

    hire_ack: {
      msg: "Sounds great — Leon is definitely open to hearing more. How would you like to take this forward?",
      options: [
        { label: "Schedule a call",    action: "calendar"                                  },
        { label: "Send a message",     next: "contact",  store: { intent: "Message" }      },
        { label: "Have Leon call me",  next: "leave_phone"                                 }
      ]
    },

    project: {
      msg: "What kind of project are you working on?",
      options: [
        { label: "Product design",  next: "project_ack", store: { inquiry: "Product design" }  },
        { label: "UX research",     next: "project_ack", store: { inquiry: "UX research" }     },
        { label: "Design system",   next: "project_ack", store: { inquiry: "Design system" }   },
        { label: "Something else",  next: "project_ack", store: { inquiry: "Other" }           }
      ]
    },

    project_ack: {
      msg: "Interesting! What would you like to do about it?",
      options: [
        { label: "Get a quote",        next: "contact",   store: { intent: "Quote request" }  },
        { label: "Schedule a call",    action: "calendar"                                     },
        { label: "Have Leon call me",  next: "leave_phone"                                    }
      ]
    },

    browse: {
      msg: "Happy to have you here! Anything you'd like to know about Leon?",
      options: [
        { label: "His background",    next: "bg"       },
        { label: "How he works",      next: "process"  },
        { label: "Just get in touch", next: "what_next" }
      ]
    },

    bg: {
      msg: "15+ years designing complex B2B and SaaS products — digital health, cybersecurity, enterprise. Always at the intersection of strategy, research, and craft.",
      options: [
        { label: "See his work",   action: "work"     },
        { label: "Get in touch",   next: "what_next"  }
      ]
    },

    process: {
      msg: "Research first, always. Leon maps the problem space before touching Figma — user flows, IA, then high-fidelity. AI is embedded into every stage.",
      options: [
        { label: "See his work",   action: "work"     },
        { label: "Get in touch",   next: "what_next"  }
      ]
    },

    what_next: {
      msg: "How would you like to connect?",
      options: [
        { label: "Schedule a call",    action: "calendar"                                  },
        { label: "Send a message",     next: "contact",  store: { intent: "Message" }      },
        { label: "Have Leon call me",  next: "leave_phone"                                 }
      ]
    },

    leave_phone: {
      msg: "Sure! Leave your number and Leon will call you back.",
      type: "input",
      placeholder: "Your phone number",
      storeAs: "phone",
      next: "contact_phone"
    },

    contact_phone: {
      msg: "Got it. Anything else you'd like to add?",
      type: "input",
      placeholder: "Optional message...",
      storeAs: "extra_msg",
      next: "contact_done"
    },

    contact_done: {
      msg: "Perfect. Leon will call you back as soon as possible.",
      type: "done"
    },

    contact: {
      msg: "Leave your details and Leon will get back to you as soon as possible.",
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
      else if (s.type === 'done')  sendCallbackRequest();
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
    if (opt.store) Object.assign(ctx, opt.store);

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

  // ── Callback request (call me) ─────────────────
  function sendCallbackRequest() {
    var details = 'Callback request\n';
    if (ctx.phone)     details += 'Phone: '   + ctx.phone     + '\n';
    if (ctx.inquiry)   details += 'Inquiry: ' + ctx.inquiry   + '\n';
    if (ctx.extra_msg) details += 'Note: '    + ctx.extra_msg + '\n';
    var subject = encodeURIComponent('Someone left a message in your portfolio');
    var body    = encodeURIComponent(details);
    var foot = document.getElementById('chat-foot');
    var btn = document.createElement('button');
    btn.className = 'chat-form-cal';
    btn.textContent = 'Schedule a call in the meantime ↗';
    btn.addEventListener('click', function () { window.open(CALENDAR_URL, '_blank'); });
    foot.appendChild(btn);
    setTimeout(function () {
      window.location.href = 'mailto:leon.penko@gmail.com?subject=' + subject + '&body=' + body;
    }, 1000);
  }

  // ── Contact form ───────────────────────────────
  function showForm() {
    var foot = document.getElementById('chat-foot');
    var form = document.createElement('div');
    form.className = 'chat-form';
    form.innerHTML =
      '<input id="cf-name"  type="text"  placeholder="Your name" required>' +
      '<input id="cf-email" type="email" placeholder="Email address" required>' +
      '<input id="cf-phone" type="tel"   placeholder="Phone (optional)">' +
      '<textarea id="cf-msg" placeholder="Your message"></textarea>' +
      '<button id="cf-send" class="chat-form-send">Send message</button>' +
      '<button id="cf-cal"  class="chat-form-cal">Schedule a call instead ↗</button>';
    foot.appendChild(form);

    document.getElementById('cf-send').addEventListener('click', function () {
      var name  = document.getElementById('cf-name').value.trim();
      var email = document.getElementById('cf-email').value.trim();
      var phone = document.getElementById('cf-phone').value.trim();
      var msg   = document.getElementById('cf-msg').value.trim();
      if (!email) { document.getElementById('cf-email').focus(); return; }

      var details = 'From: ' + (name || 'Unknown') + '\nEmail: ' + email;
      if (phone)            details += '\nPhone: ' + phone;
      if (ctx.inquiry)      details += '\n\nInquiry: ' + ctx.inquiry;
      if (ctx.intent)       details += '\nIntent: '  + ctx.intent;
      if (msg)              details += '\n\nMessage: ' + msg;

      var subject = encodeURIComponent('Someone left a message in your portfolio');
      var body    = encodeURIComponent(details);

      clearFoot();
      userMsg(email);
      typing(function () {
        botMsg("Message received. Leon will get back to you as soon as possible.");
        setTimeout(function () {
          var foot = document.getElementById('chat-foot');
          var btn = document.createElement('button');
          btn.className = 'chat-form-cal';
          btn.textContent = 'Schedule a call in the meantime ↗';
          btn.addEventListener('click', function () { window.open(CALENDAR_URL, '_blank'); });
          foot.appendChild(btn);
        }, 900);
      });
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
