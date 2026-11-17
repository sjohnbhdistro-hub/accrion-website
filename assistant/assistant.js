/* =====================================================================
   Accrion assistant

   A floating help button that opens a chat window. Visitors can type or
   speak a question, hear the reply read aloud, and send an enquiry.

   - What it says comes from assistant/knowledge.js. Edit that file to
     change its answers; nothing in this file needs touching for that.
   - It never invents an answer. If nothing in the knowledge file fits,
     it says so and offers to pass the question to the team.
   - What a visitor types stays in their own browser (kept for the tab
     so the conversation survives a page change) and is not sent
     anywhere. The enquiry form opens the visitor's own email app or
     WhatsApp, the same way the main enquiry form on the site does.
   ===================================================================== */
(function () {
  "use strict";

  var KB = window.ACCRION_KNOWLEDGE;
  if (!KB || !KB.topics || !document.body || document.getElementById("aa-root")) { return; }

  /* ---------- Practice details: the page's SITE block wins, the knowledge file fills any gap ---------- */
  var SITE = window.SITE || {}, PRACTICE = KB.practice || {};
  function first(a, b) { a = String(a || "").trim(); return a || String(b || "").trim(); }
  var DETAILS = {
    name: first(PRACTICE.name, "Accrion Accountants"),
    phone: first(SITE.phone, PRACTICE.phone),
    whatsapp: first(SITE.whatsapp, PRACTICE.whatsapp),
    email: first(SITE.email, PRACTICE.email),
    licence: first(SITE.aatLicence, PRACTICE.aatLicence)
  };
  function telHref(n) { return "tel:" + n.replace(/[^\d+]/g, "").replace(/^0/, "+44"); }
  function waHref(n, text) {
    var d = n.replace(/\D/g, "");
    if (d.indexOf("00") === 0) { d = d.slice(2); } else if (d.charAt(0) === "0") { d = "44" + d.slice(1); }
    return "https://wa.me/" + d + "?text=" + encodeURIComponent(text || "Hello " + DETAILS.name + ", I would like to ask about your services.");
  }
  /* Links to a section of the home page work from any page: the site's root is where this script lives */
  var SITE_ROOT = ((document.currentScript && document.currentScript.src) || "").replace(/assistant\/assistant\.js.*$/, "");
  function sectionHref(id) { return document.getElementById(id) ? "#" + id : (SITE_ROOT ? SITE_ROOT + "index.html" : "/") + "#" + id; }

  /* =====================================================================
     1. Understanding a question
     ===================================================================== */
  function makeSet(list) { var s = {}; list.forEach(function (w) { s[w] = true; }); return s; }
  var STOP = makeSet(("a an the is are am was were be been being do does did doing i im ive id ill me my mine we us our ours you your yours he she they them their it its " +
    "this that these those to of in on for and or nor but if so as at by from with about into over under up down out off than then there here what whats which who whom whose " +
    "when where why how can could would should will shall may might must have has had having not no yes any some all each every more most other such only own same too very " +
    "just also please thanks thank need want like get got go going make made tell know think say said ok okay hi hello hey").split(" "));
  var SHORTHAND = { ltd: "limited company", sa: "self assessment", ct: "corporation tax", mtd: "making tax digital", ni: "national insurance", accs: "accounts",
    u: "you", ur: "your", r: "are", pls: "please", plz: "please", thx: "thanks", ty: "thanks", info: "information", biz: "business", wen: "when", wat: "what" };

  function plain(text) {
    return String(text).toLowerCase().replace(/[‘’`']/g, "").replace(/&/g, " and ").replace(/[^a-z0-9£ ]+/g, " ").replace(/\s+/g, " ").trim();
  }
  function stem(w) {
    if (STOP[w]) { return w; }
    if (w.length > 5 && /ies$/.test(w)) { return w.slice(0, -3) + "y"; }
    if (w.length > 6 && /ing$/.test(w)) { return w.slice(0, -3); }
    if (w.length > 3 && /[^s]s$/.test(w)) { return w.slice(0, -1); }
    return w;
  }
  /* Edit distance that counts a swapped pair of letters as one slip */
  function distance(a, b) {
    var i, j, rows = [];
    for (i = 0; i <= a.length; i++) { rows[i] = [i]; }
    for (j = 1; j <= b.length; j++) { rows[0][j] = j; }
    for (i = 1; i <= a.length; i++) {
      for (j = 1; j <= b.length; j++) {
        var cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) { rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1); }
      }
    }
    return rows[a.length][b.length];
  }

  /* Every word the assistant knows, used to put right a misspelt word */
  var VOCAB = {};
  function learn(text) { plain(text).split(" ").forEach(function (w) { if (w.length > 3) { VOCAB[w] = true; } }); }
  KB.topics.forEach(function (t) { (t.keywords || []).concat([t.title]).forEach(learn); });
  learn("deadline deadlines quotation quote estimate consultation appointment meeting callback enquiry enquire inquiry request arrange started paperwork documents " +
    "expensive cheaper thanks goodbye morning afternoon evening question accountant accountants someone person threshold allowance advise advice claim expenses circumstances");
  var VOCAB_LIST = Object.keys(VOCAB);
  function correct(w) {
    if (w.length < 5 || VOCAB[w] || STOP[w] || /\d/.test(w)) { return w; }
    var allowed = w.length >= 9 ? 2 : 1, best = w, bestD = allowed + 1;
    for (var i = 0; i < VOCAB_LIST.length; i++) {
      var v = VOCAB_LIST[i];
      if (v.charAt(0) !== w.charAt(0) || Math.abs(v.length - w.length) > allowed) { continue; }
      var d = distance(w, v);
      if (d < bestD) { bestD = d; best = v; }
    }
    return best;
  }
  function prepare(text) {
    var words = [];
    plain(text).split(" ").forEach(function (w) {
      if (!w) { return; }
      (SHORTHAND[w] || correct(w)).split(" ").forEach(function (x) { words.push(x); });
    });
    return { words: words, text: words.join(" "), stems: words.map(stem) };
  }

  /* Each topic's keywords, reduced to the same word stems */
  var TOPICS = KB.topics.map(function (t) {
    return { topic: t, keys: (t.keywords || []).concat([t.title]).map(function (k) {
      var stems = plain(k).split(" ").filter(Boolean).map(stem);
      var seen = {}, content = stems.filter(function (w) { if (STOP[w] || seen[w]) { return false; } seen[w] = true; return true; });
      return { stems: stems, content: content };
    }) };
  });
  var SPREAD = {};   // how many topics use each word: rarer words say more about what is being asked
  TOPICS.forEach(function (entry) {
    var seen = {};
    entry.keys.forEach(function (k) { k.content.forEach(function (w) { if (!seen[w]) { seen[w] = true; SPREAD[w] = (SPREAD[w] || 0) + 1; } }); });
  });
  function weight(w) { return Math.log(1 + TOPICS.length / (SPREAD[w] || TOPICS.length)); }
  function inOrder(hay, needle) {
    outer: for (var i = 0; i + needle.length <= hay.length; i++) {
      for (var j = 0; j < needle.length; j++) { if (hay[i + j] !== needle[j]) { continue outer; } }
      return true;
    }
    return false;
  }
  /* Scores every topic against the question.
     - a keyword made of one word scores by how rare that word is
     - a phrase scores when all its meaningful words are present, and more when it appears word for word
     - a phrase of four or more words found word for word is taken as the question being asked (span)
     - a phrase made only of small words ("what do you do") counts only when nothing more specific fits (frame)
     - one or two matching words out of a longer phrase give a hint, used to ask "did you mean..." */
  function rank(stems) {
    var have = makeSet(stems);
    return TOPICS.map(function (entry) {
      var scores = [], frame = 0, span = 0, hint = 0, seen = {};
      entry.keys.forEach(function (k) {
        var id = k.stems.join(" ");
        if (seen[id]) { return; }
        seen[id] = true;
        var n = k.stems.length, exact = n > 1 && inOrder(stems, k.stems);
        if (!k.content.length) { if (exact) { frame = Math.max(frame, 2 + 0.25 * n); } return; }
        var found = k.content.filter(function (w) { return have[w]; }), total = 0;
        found.forEach(function (w) { total += weight(w); });
        if (found.length < k.content.length || (n > 1 && k.content.length === 1 && !exact)) {
          if (found.length && k.content.length > 1) { hint = Math.max(hint, Math.min(1.5, (found.length / k.content.length) * (total / found.length))); }
          return;
        }
        var s = k.content.length === 1 ? total + (exact ? 0.5 * (n - 1) : 0) : (total / found.length) * (1 + 0.6 * (found.length - 1)) * (exact ? 1.3 : 1);
        if (exact) { span = Math.max(span, n); }
        scores.push(s);
      });
      scores.sort(function (a, b) { return b - a; });
      var score = scores.length ? scores[0] + 0.4 * (scores[1] || 0) + 0.2 * (scores[2] || 0) : frame || hint;
      return { topic: entry.topic, score: score, span: span, frame: !scores.length && frame > 0, hint: !scores.length && !frame };
    }).filter(function (r) { return r.score > 0; }).sort(function (a, b) {
      return ((b.span >= 4) - (a.span >= 4)) || (a.hint - b.hint) || (a.frame - b.frame) || (b.score - a.score);
    });
  }
  var STRONG = 1.9, WEAK = 0.5;
  function byId(id) { for (var i = 0; i < KB.topics.length; i++) { if (KB.topics[i].id === id) { return KB.topics[i]; } } return null; }
  function facetTopic(facet) { for (var i = 0; i < KB.topics.length; i++) { if (KB.topics[i].facet === facet) { return KB.topics[i]; } } return null; }

  /* The angle of a question: when, how much, what is needed, how to begin */
  var FACET = {
    deadlines: /\b(when|deadline|deadlines|due|date|dates|late|cut off|how long (do|have) i)\b/,
    cost: /\b(cost|costs|price|prices|pricing|priced|fee|fees|charge|charges|how much|expensive|cheap|cheaper|afford|affordable)\b/,
    need: /\b(what (do|will|would) (you|i) need(?! to)|need from me|documents?|paperwork|what information|what should i (send|bring|provide)|what to (send|bring|provide))\b/,
    start: /\b(get started|getting started|sign up|signing up|become a client|next steps?|how do i (start|begin|join|proceed)|how to (start|begin|join)|start with you|onboard|onboarding)\b/
  };
  var FACET_WORDS = {
    deadlines: makeSet("deadline due date late cut long".split(" ")),
    cost: makeSet("cost price pricing pric priced fee charge much expensive cheap cheaper afford affordable".split(" ")),
    need: makeSet("document paperwork information send bring provide".split(" ")),
    start: makeSet("started start sign signing become client next step begin join proceed onboard".split(" "))
  };
  function facetOf(q) { for (var f in FACET) { if (FACET[f].test(q.text)) { return f; } } return null; }

  var GREET = /^(hi|hello|hey|hiya|good (morning|afternoon|evening)|greetings)\b/;
  var THANKS = /\b(thanks|thank you|thankyou|cheers|much appreciated)\b/;
  var BYE = /\b(bye|goodbye|good bye|see you later|thats all|that is all|nothing else)\b/;
  var YES = /^(yes|yeah|yep|yup|sure|ok|okay|please|go ahead|sounds good|definitely|of course|absolutely|that would be (great|good|helpful)|why not)\b/;
  var NO = /^(no|nope|nah|not now|not yet|maybe later)\b/;
  var MORE = /^(tell me more|more|go on|continue|carry on|what else|anything else|explain|elaborate|and)\b/;
  var OTHER = /^(something else|none of (these|those|them)|neither|other)\b/;
  var PRONOUN = /\b(it|that|this|those|them|they)\b/;

  /* Figures that change, and questions about someone's own position, always go to a person */
  /* the GOV.UK page that publishes the figure asked about, where there is one we have checked */
  function ratesSource(text) {
    var t = String(text || "").toLowerCase();
    if (/\bvat\b/.test(t)) { return { text: "GOV.UK, Register for VAT", href: "https://www.gov.uk/register-for-vat", checked: "November 2026" }; }
    if (/income tax|personal allowance|tax band|tax bands|higher rate|basic rate|additional rate/.test(t)) { return { text: "GOV.UK, Income Tax rates and Personal Allowances", href: "https://www.gov.uk/income-tax-rates", checked: "November 2026" }; }
    return null;
  }
  var RATES = /\b((tax|vat|national insurance|corporation tax|income tax|dividend|capital gains) (rate|rates|band|bands|allowance|allowances|threshold|thresholds)|(rate|rates|threshold|thresholds|allowance|allowances) (of|for|on) (vat|tax|corporation|income|national|dividend)|how much (is|are) (the )?(vat|tax|corporation tax|income tax|national insurance)|personal allowance|tax code|what percentage|what percent)\b/;
  var ADVICE = /\b(should i|shall i|ought i|can i claim|could i claim|what can i claim|am i allowed|am i entitled|is it (better|worth|best)|which is better|what is best for me|how (do|can|could) i (reduce|avoid|save|lower|cut|minimise|minimize)|pay less tax|how much (tax|vat|national insurance) (will|would|do|should|must) i|will i (have to )?pay|do i owe|do i (need|have) to (file|register|pay|submit|charge|complete|declare|do a)|what (would|do) you (advise|recommend|suggest)|advise me|your advice|tax efficient|tax saving|save tax|loophole|my (situation|circumstances|case)|in my case|what expenses|allowable expenses|claim back|write off|tax relief|apply to me|affect me|am i affected|do i qualify|am i eligible)\b/;

  /* Asking for something to happen: a quotation, a consultation, a call back, an enquiry, a person */
  var FORM_KINDS = { general: "General enquiry", quote: "Request a quotation", consultation: "Arrange an initial consultation", callback: "Request a call back", team: "Speak to a member of the practice" };
  var ACTIONS = [
    ["quote", /\b(quote|quotes|quotation|estimate)\b/],
    ["consultation", /\b(consultation|appointment|meeting)\b/],
    ["callback", /\b(call ?back|call me|ring me|phone me|give me a call)\b/],
    ["team", /\b((speak|talk|chat) (to|with) (a |an |the )?(someone|somebody|person|human|team|accountant|adviser|advisor|member)|real person)\b/],
    ["general", /\b(enquiry|enquire|inquiry|inquire|leave a message|send a message|contact form|enquiry form)\b/]
  ];
  var ASK_STRONG = /\b(id like|i would like|i want|i need|please|request|arrange|book|call me|ring me|phone me|give me a call)\b/;
  var ASK_SOFT = /\b(can i|could i|may i|can you|could you|get a|send|give me|let me)\b/;
  var ASK_INFO = /^(how much|how long|how does|how do you|what|when|where|why|who|which|do you|does|is |are |tell me about|can you tell|could you tell)/;
  function actionOf(q) {
    for (var i = 0; i < ACTIONS.length; i++) {
      if (ACTIONS[i][1].test(q.text) && (ASK_STRONG.test(q.text) || q.words.length <= 4 || (ASK_SOFT.test(q.text) && !ASK_INFO.test(q.text)))) { return ACTIONS[i][0]; }
    }
    return null;
  }

  /* =====================================================================
     2. Choosing the reply
     ===================================================================== */
  var NOTE = "General information, not advice on your own circumstances.";
  var state = { messages: [], ctx: { last: null, given: {}, pending: null, businessType: "", misses: 0 }, voiceOn: false, voiceSet: false, open: false, micNoted: false, remoteFails: 0 };

  function formReply(kind) {
    if (!DETAILS.email && !DETAILS.whatsapp) { return { text: "The enquiry form is not available at the moment. Please call or message us on {phone}." }; }
    return { text: "Certainly. I have opened the enquiry form for you. Nothing is sent until you choose to send it.", form: kind };
  }
  function topicReply(t, facet) {
    var ctx = state.ctx, reply = { text: t.answer, chips: t.chips ? t.chips.slice() : [], link: t.link || null, pending: t.offer || null, note: "", source: t.source || null };
    if (!t.facet) {
      if (ctx.last !== t.id) { ctx.last = t.id; ctx.given = {}; }
      ctx.given[facet || "answer"] = true;
    }
    if (t.businessType) { ctx.businessType = t.businessType; }
    if (facet === "deadlines" && t.deadlines) { reply.text = t.deadlines; reply.note = NOTE; reply.source = t.deadlinesSource === undefined ? (t.source || null) : t.deadlinesSource; }
    else if (facet === "cost" && t.id !== "fees" && !t.offer) {
      reply.text = (t.service ? t.title + ": the fee depends on the work involved. " : "Our fee depends on the work involved. ") +
        "We do not publish a price list. Tell us what you need and we will give you a fee in writing before we start.\n\nWould you like to request a quotation?";
      reply.chips = ["Request a quotation"]; reply.pending = "quote"; reply.link = null; reply.source = null;
    }
    else if (facet === "need" && t.id !== "need") { var n = byId("need"); reply.text = t.need || (n ? n.answer : t.answer); reply.chips = ["How does it work?", "Send an enquiry"]; reply.link = null; reply.source = null; }
    else if (facet === "start" && t.id !== "how-it-works") { var h = byId("how-it-works"); if (h) { reply.text = h.answer; reply.chips = (h.chips || []).slice(); reply.link = h.link || null; reply.source = null; } }
    else if (t.general) { reply.note = NOTE; }
    return reply;
  }
  function moreReply(t) {
    var given = state.ctx.given || {}, order = ["deadlines", "need"];
    for (var i = 0; i < order.length; i++) { if (t[order[i]] && !given[order[i]]) { return topicReply(t, order[i]); } }
    return { text: "That is everything I have on this. We can tell you more.\n\nWould you like to send us an enquiry?", chips: ["Send an enquiry", "Request a call back"], link: t.link || null, pending: "general" };
  }

  /* Short replies that need no looking up: yes or no to an offer, a greeting, a request for the form */
  function quick(q) {
    var ctx = state.ctx, pending = ctx.pending;
    ctx.pending = null;
    if (pending && q.words.length <= 6 && YES.test(q.text)) { return formReply(pending); }
    if (pending && q.words.length <= 5 && NO.test(q.text)) { return { text: "No problem. Is there anything else I can help with?" }; }
    if (q.words.length <= 4 && GREET.test(q.text)) { return { text: "Hello. How can I help you today?", chips: (KB.starters || []).slice() }; }
    if (q.words.length <= 6 && BYE.test(q.text)) { return { text: "Thank you for getting in touch. Goodbye." }; }
    if (q.words.length <= 6 && THANKS.test(q.text)) { return { text: "You are welcome. Is there anything else I can help with?" }; }
    if (OTHER.test(q.text)) { return { text: "Please tell me a little more about what you need. If I cannot answer it, I will pass your question to the practice.", pending: "general" }; }
    var kind = actionOf(q);
    if (kind === "team") { var person = byId("human"); return person ? topicReply(person, null) : formReply("callback"); }
    if (kind) { return formReply(kind); }
    return null;
  }
  function full(q) {
    var ctx = state.ctx, ranked = rank(q.stems), best = ranked[0], strong = !!best && !best.hint && best.score >= STRONG, facet = facetOf(q), main = null, i;
    /* Which subject is the question about? In order: something that must go to a person, a question
       listed word for word, a named service, then the best remaining match. */
    var firm = ranked.filter(function (r) { return !r.hint && r.score >= STRONG && !r.topic.facet; });
    var pickFrom = [function (r) { return r.topic.handoff; }, function (r) { return r.span >= 4; }, function (r) { return r.topic.service && !r.frame && r.score >= 0.4 * firm[0].score; }, function () { return true; }];
    for (i = 0; i < pickFrom.length && !main; i++) { var hit = firm.filter(pickFrom[i])[0]; if (hit) { main = hit.topic; } }
    firm.some(function (r) { if (r.topic.businessType) { ctx.businessType = r.topic.businessType; return true; } return false; });

    if (RATES.test(q.text) && !(main && main.id === "mtd")) {
      ctx.misses = 0;
      return { text: "I do not quote tax rates, thresholds or allowances here, because they change and what applies depends on your circumstances. GOV.UK publishes the current figures, and we can confirm what applies to you.\n\nWould you like to send us your question?", chips: ["Send an enquiry", "Request a call back"], pending: "general", source: ratesSource(q.text) };
    }
    if (ADVICE.test(q.text)) {
      ctx.misses = 0;
      var general = "";
      if (main) {
        general = main.deadlines && /\b(apply|affect|affected|qualify|eligible|when)\b/.test(q.text) ? main.deadlines : main.answer.length <= 420 ? main.answer : main.answer.split("\n\n")[0];
        ctx.last = main.id; ctx.given = { answer: true };
      }
      return { text: "That depends on your own circumstances, so it needs a member of the practice rather than a general answer from me." + (general ? "\n\nIn general terms: " + general.replace(/\n\nWhich[^\n]*\?$|\n\nWould you[^\n]*\?$/, "") : "") + "\n\nWould you like us to contact you?",
        chips: ["Request a call back", "Send an enquiry"], pending: "callback", note: general ? NOTE : "" };
    }
    if (main) { ctx.misses = 0; return topicReply(main, facet); }
    if (facet) {
      var extra = q.stems.filter(function (w) { return !STOP[w] && !FACET_WORDS[facet][w]; });
      var last = ctx.last && byId(ctx.last);
      if (last && (extra.length === 0 || PRONOUN.test(q.text))) { ctx.misses = 0; return topicReply(last, facet); }
      var overview = extra.length === 0 ? facetTopic(facet) : null;
      if (overview) { ctx.misses = 0; return topicReply(overview, null); }
    }
    if (strong) { ctx.misses = 0; return topicReply(best.topic, null); }
    if (ctx.last && MORE.test(q.text) && q.words.length <= 6) { var t = byId(ctx.last); if (t) { return moreReply(t); } }
    if (best && best.score >= WEAK) {
      var options = ranked.filter(function (r) { return r.score >= WEAK; }).slice(0, 3).map(function (r) { return r.topic.title; });
      return { text: "I want to be sure I point you the right way. Is your question about one of these?", chips: options.concat(["Something else"]) };
    }
    ctx.misses += 1;
    if (ctx.misses > 1) {
      return { text: "I still cannot answer that, I am afraid. The quickest route is to speak to us on {phone}, or send us an enquiry.", chips: ["Send an enquiry", "Request a call back"], pending: "general" };
    }
    return { text: "I am sorry, I do not have an answer to that. I only answer from the information on our website, and I would rather not guess.\n\nWould you like to send your question to the practice?", chips: ["Send an enquiry", "Request a call back", "What services do you offer?"], pending: "general" };
  }

  /* Optional: a server-side AI service. Off unless aiEndpoint is set in the knowledge file.
     If it is slow, fails or returns nothing, the built-in answers above are used instead. */
  function remote() {
    var url = String(KB.aiEndpoint || "").trim();
    if (!url || state.remoteFails >= 2 || !window.fetch) { return Promise.resolve(null); }
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) { ctl.abort(); } }, 10000);
    var history = state.messages.filter(function (m) { return m.from === "user" || m.from === "bot"; }).slice(-10)
      .map(function (m) { return { role: m.from === "user" ? "user" : "assistant", content: fill(m.text) }; });
    return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history }), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { if (!r.ok) { throw new Error("status " + r.status); } return r.json(); })
      .then(function (data) {
        clearTimeout(timer);
        var reply = data && typeof data.reply === "string" ? data.reply.trim() : "";
        if (!reply) { throw new Error("empty reply"); }
        state.remoteFails = 0;
        return reply.slice(0, 1500);
      })
      .catch(function () { clearTimeout(timer); state.remoteFails += 1; return null; });
  }
  function answer(q) {
    var fast = quick(q);
    if (fast) { return Promise.resolve(fast); }
    return remote().then(function (text) { return text ? { text: text, chips: ["Send an enquiry"] } : full(q); });
  }

  /* =====================================================================
     3. The window
     ===================================================================== */
  var ICONS = {
    chat: '<path d="M5 6.5h14A1.5 1.5 0 0 1 20.5 8v7a1.5 1.5 0 0 1-1.5 1.5H12L7.5 20v-3.5H5A1.5 1.5 0 0 1 3.5 15V8A1.5 1.5 0 0 1 5 6.5z"/><path d="M8 10.5h8M8 13.2h5"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    send: '<path d="M4.5 12 20 4.5 15.5 20l-3.2-6.3z"/><path d="M12.3 13.7 20 4.5"/>',
    mic: '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5M8.5 20.5h7"/>',
    sound: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
    mute: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
    phone: '<path d="M7.5 4h3L12 7.8 10 9a8.6 8.6 0 0 0 5 5l1.2-2 3.8 1.5v3a1.5 1.5 0 0 1-1.6 1.5C11.6 17.3 6.7 12.4 6 5.6A1.5 1.5 0 0 1 7.5 4z"/>',
    mail: '<rect x="3.5" y="6" width="17" height="12" rx="1.5"/><path d="m4 7 8 6 8-6"/>',
    again: '<path d="M5 12a7 7 0 0 1 12-4.9L19 9M19 4.5V9h-4.5"/><path d="M19 12a7 7 0 0 1-12 4.9L5 15M5 19.5V15h4.5"/>',
    back: '<path d="M14.5 6 8.5 12l6 6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  function icon(name) { return '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">' + ICONS[name] + "</svg>"; }
  function el(tag, props, kids) {
    var node = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === "class") { node.className = props[k]; }
      else if (k === "text") { node.textContent = props[k]; }
      else if (k === "html") { node.innerHTML = props[k]; }
      else { node.setAttribute(k, props[k]); }
    });
    (kids || []).forEach(function (kid) { if (kid) { node.appendChild(kid); } });
    return node;
  }
  function fill(text) {
    return String(text).replace(/\{phone\}/g, DETAILS.phone || "the number on our website").replace(/\{whatsapp\}/g, DETAILS.whatsapp || DETAILS.phone || "the number on our website")
      .replace(/\{email\}/g, DETAILS.email || "the address on our website").replace(/\{licence\}/g, DETAILS.licence || "shown on our website");
  }
  /* Writes an answer as paragraphs; {phone}, {whatsapp} and {email} become links */
  function write(box, text) {
    String(text).split(/\n{2,}/).forEach(function (para) {
      var p = el("p"), re = /\{(phone|whatsapp|email)\}/g, at = 0, m;
      while ((m = re.exec(para))) {
        p.appendChild(document.createTextNode(fill(para.slice(at, m.index))));
        var value = DETAILS[m[1]] || (m[1] === "whatsapp" ? DETAILS.phone : "");
        if (value) {
          var a = el("a", { href: m[1] === "email" ? "mailto:" + value : m[1] === "whatsapp" ? waHref(value) : telHref(value), text: value });
          if (m[1] === "whatsapp") { a.target = "_blank"; a.rel = "noopener"; }
          p.appendChild(a);
        } else { p.appendChild(document.createTextNode(fill(m[0]))); }
        at = re.lastIndex;
      }
      p.appendChild(document.createTextNode(fill(para.slice(at))));
      box.appendChild(p);
    });
  }

  var small = window.matchMedia ? window.matchMedia("(max-width:640px)") : { matches: false };
  var hadSession = false;
  try {
    var saved = JSON.parse(sessionStorage.getItem("accrion-assistant") || "null");
    if (saved && Array.isArray(saved.messages)) {
      hadSession = true;
      state.messages = saved.messages; state.ctx = saved.ctx || state.ctx; state.voiceOn = !!saved.voiceOn; state.voiceSet = !!saved.voiceSet; state.open = !!saved.open; state.micNoted = !!saved.micNoted;
    }
  } catch (e) { /* storage unavailable: the conversation simply starts fresh on each page */ }
  function save() {
    try {
      sessionStorage.setItem("accrion-assistant", JSON.stringify({ messages: state.messages.slice(-60), ctx: state.ctx, voiceOn: state.voiceOn, voiceSet: state.voiceSet, open: state.open, micNoted: state.micNoted }));
    } catch (e) { /* ignore */ }
  }

  /* ----- Build ----- */
  var launch = el("button", { "class": "aa-launch", id: "aa-launch", type: "button", "aria-haspopup": "dialog", "aria-expanded": "false", "aria-controls": "aa-panel", html: icon("chat") + "<span>Ask a question</span>" });
  var voiceBtn = el("button", { "class": "aa-tool", id: "aa-voice", type: "button", "aria-pressed": "false", "aria-label": "Read replies aloud", title: "Read replies aloud", html: icon("mute") });
  var clearBtn = el("button", { "class": "aa-tool", id: "aa-clear", type: "button", "aria-label": "Start a new conversation", title: "Start a new conversation", html: icon("again") });
  var closeBtn = el("button", { "class": "aa-tool", id: "aa-close", type: "button", "aria-label": "Close the assistant", title: "Close", html: icon("close") });
  var contactRow = el("nav", { "class": "aa-contact", "aria-label": "Contact the practice directly" });
  if (DETAILS.phone) { contactRow.appendChild(el("a", { href: telHref(DETAILS.phone), html: icon("phone") + "<span>Call</span>" })); }
  if (DETAILS.whatsapp) { contactRow.appendChild(el("a", { href: waHref(DETAILS.whatsapp), target: "_blank", rel: "noopener", html: icon("chat") + "<span>WhatsApp</span>" })); }
  if (DETAILS.email) { contactRow.appendChild(el("a", { href: "mailto:" + DETAILS.email, html: icon("mail") + "<span>Email</span>" })); }

  var log = el("div", { "class": "aa-log", id: "aa-log", role: "log", "aria-live": "polite", "aria-label": "Conversation", tabindex: "0" });
  var statusText = el("span", { id: "aa-status-text" });
  var statusBars = el("i", { "class": "aa-bars", "aria-hidden": "true", html: "<i></i><i></i><i></i><i></i>" });
  var statusBtn = el("button", { type: "button", id: "aa-status-stop" });
  var statusBar = el("div", { "class": "aa-status", id: "aa-status", role: "status" }, [statusBars, statusText, statusBtn]);
  statusBar.hidden = true;
  var input = el("input", { type: "text", id: "aa-input", autocomplete: "off", maxlength: "500", placeholder: "Type your question", "aria-label": "Type your question", enterkeyhint: "send" });
  var micBtn = el("button", { "class": "aa-round aa-mic", id: "aa-mic", type: "button", "aria-pressed": "false", "aria-label": "Speak your question", title: "Speak your question", html: icon("mic") });
  var sendBtn = el("button", { "class": "aa-round aa-send", id: "aa-send", type: "submit", "aria-label": "Send", title: "Send", html: icon("send") });
  var compose = el("form", { "class": "aa-compose", id: "aa-compose", novalidate: "" }, [micBtn, input, sendBtn]);
  var foot = el("p", { "class": "aa-foot" });
  foot.appendChild(document.createTextNode("Automated assistant. General information only, not advice. "));
  var footLink = el("a", { href: sectionHref("privacy"), text: "Privacy" });
  foot.appendChild(footLink);
  var chatView = el("div", { "class": "aa-view", id: "aa-chat" }, [log, statusBar, compose, foot]);
  var formView = el("div", { "class": "aa-view aa-formview", id: "aa-formview" });
  formView.hidden = true;
  var panel = el("section", { "class": "aa-panel", id: "aa-panel", role: "dialog", "aria-label": DETAILS.name + " assistant" }, [
    el("div", { "class": "aa-head" }, [
      el("div", { "class": "aa-title", html: "<strong>Accrion assistant</strong><span>Automated answers from our website</span>" }),
      el("div", { "class": "aa-tools" }, [voiceBtn, clearBtn, closeBtn])
    ]),
    contactRow.children.length ? contactRow : null, chatView, formView
  ]);
  panel.hidden = true;
  var root = el("div", { "class": "aa" + (hadSession ? "" : " aa-fresh"), id: "aa-root" }, [launch, panel]);
  document.body.appendChild(root);

  /* ----- Messages ----- */
  function scrollTo(node) {
    if (!node) { log.scrollTop = log.scrollHeight; return; }
    log.scrollTop += node.getBoundingClientRect().top - log.getBoundingClientRect().top - 12;
  }
  function show(m) {
    var old = log.querySelector(".aa-chips");
    if (old) { old.parentNode.removeChild(old); }
    var bubble = el("div", { "class": "aa-msg " + (m.from === "user" ? "aa-user" : m.from === "sys" ? "aa-sys" : "aa-bot") });
    write(bubble, m.text);
    if (m.note) { bubble.appendChild(el("p", { "class": "aa-note", text: m.note })); }
    if (m.link && m.link.to) {
      var more = el("a", { "class": "aa-more", href: sectionHref(m.link.to), html: icon("arrow") });
      more.insertBefore(document.createTextNode(m.link.text || "See this on the website"), more.firstChild);
      more.addEventListener("click", function () { if (small.matches) { closePanel(true); } });
      bubble.appendChild(more);
    }
    if (m.source && /^https:\/\/www\.gov\.uk\//.test(m.source.href || "")) {
      var src = el("p", { "class": "aa-source" });
      src.appendChild(document.createTextNode("Source: "));
      src.appendChild(el("a", { href: m.source.href, target: "_blank", rel: "noopener", text: m.source.text }));
      if (m.source.checked) { src.appendChild(document.createTextNode(", checked " + m.source.checked)); }
      bubble.appendChild(src);
    }
    log.appendChild(bubble);
    if (m.chips && m.chips.length) {
      var chips = el("div", { "class": "aa-chips" });
      m.chips.forEach(function (label) {
        var chip = el("button", { "class": "aa-chip", type: "button", text: label });
        chip.addEventListener("click", function () { ask(label, false); if (!small.matches) { input.focus({ preventScroll: true }); } });
        chips.appendChild(chip);
      });
      log.appendChild(chips);
    }
    return bubble;
  }
  function add(m) {
    state.messages.push(m);
    var bubble = show(m), before = bubble.previousElementSibling;
    scrollTo(m.from === "bot" && before && /aa-user/.test(before.className) ? before : m.from === "bot" ? bubble : null);
    save();
    return bubble;
  }
  function note(text) { add({ from: "sys", text: text }); }
  function welcome() { add({ from: "bot", text: KB.welcome || "Hello. How can I help you today?", chips: (KB.starters || []).slice() }); }

  var queue = Promise.resolve();
  function ask(text, spokenQuestion) {
    text = String(text || "").replace(/\s+/g, " ").trim().slice(0, 500);
    if (!text) { return; }
    stopSpeaking();
    if (spokenQuestion && canSpeak && !state.voiceSet) { setVoice(true, true); }
    add({ from: "user", text: text });
    var typing = el("div", { "class": "aa-msg aa-bot", "aria-hidden": "true", html: '<span class="aa-typing"><i></i><i></i><i></i></span>' });
    queue = queue.then(function () {
      log.appendChild(typing); scrollTo(null);
      var pause = new Promise(function (done) { setTimeout(done, 450); });
      return Promise.all([answer(prepare(text)), pause]);
    }).then(function (got) {
      if (typing.parentNode) { typing.parentNode.removeChild(typing); }
      var reply = got[0];
      if (reply.pending) { state.ctx.pending = reply.pending; }
      add({ from: "bot", text: reply.text, note: reply.note || "", chips: reply.chips || [], link: reply.link || null, source: reply.source || null });
      speak(reply.text);
      if (reply.form) { setTimeout(function () { openForm(reply.form); }, 350); }
    }).catch(function () {
      if (typing.parentNode) { typing.parentNode.removeChild(typing); }
      add({ from: "bot", text: "Something went wrong on my side. Please try again, or contact us on {phone}.", chips: ["Send an enquiry"] });
    });
  }
  compose.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value;
    input.value = "";
    if (listening) { stopListening(); }
    ask(text, false);
  });

  /* =====================================================================
     4. Voice: spoken replies and the microphone
     ===================================================================== */
  var synth = window.speechSynthesis;
  var canSpeak = KB.voice !== false && !!synth && typeof window.SpeechSynthesisUtterance === "function";
  var Recogniser = window.SpeechRecognition || window.webkitSpeechRecognition;
  var canListen = KB.voice !== false && !!Recogniser;
  var voice = null, speakRun = 0, speaking = false, listening = false, recogniser = null, heard = false, micError = "";

  function pickVoice() {
    var all = [];
    try { all = synth.getVoices() || []; } catch (e) { return; }
    var british = all.filter(function (v) { return /^en[-_]GB/i.test(v.lang); });
    var pool = british.length ? british : all.filter(function (v) { return /^en/i.test(v.lang); });
    voice = pool.filter(function (v) { return /female|sonia|libby|serena|kate|martha|google uk english female/i.test(v.name); })[0] || pool[0] || null;
  }
  if (canSpeak) { pickVoice(); if (synth.addEventListener) { synth.addEventListener("voiceschanged", pickVoice); } }

  var SAY = [[/\bCIS\b/g, "C I S"], [/\bPAYE\b/g, "P A Y E"], [/\bHMRC\b/g, "H M R C"], [/\bAAT\b/g, "A A T"], [/\bSMEs\b/g, "S M Es"], [/GOV\.UK/g, "gov dot U K"], [/\bP60s?\b/g, "P 60"], [/\bP45s?\b/g, "P 45"], [/BL9 9SW/g, "B L 9, 9 S W"]];
  function forSpeech(text) {
    var digits = function (n) { return n.replace(/\s+/g, "").split("").join(" "); };
    var out = String(text).replace(/\{phone\}/g, digits(DETAILS.phone)).replace(/\{whatsapp\}/g, digits(DETAILS.whatsapp || DETAILS.phone))
      .replace(/\{email\}/g, DETAILS.email.replace(/@/g, " at ").replace(/\./g, " dot "));
    out = fill(out);
    SAY.forEach(function (pair) { out = out.replace(pair[0], pair[1]); });
    return out;
  }
  function showStatus() {
    if (listening) { statusText.textContent = "Listening. Speak now."; statusBtn.textContent = "Stop"; statusBars.hidden = false; statusBar.hidden = false; }
    else if (speaking) { statusText.textContent = "Reading the reply aloud."; statusBtn.textContent = "Stop speaking"; statusBars.hidden = true; statusBar.hidden = false; }
    else { statusBar.hidden = true; }
  }
  function speak(text) {
    if (!canSpeak || !state.voiceOn) { return; }
    stopSpeaking();
    var run = ++speakRun, parts = (forSpeech(text).match(/[^.!?\n]+[.!?]*/g) || []).map(function (p) { return p.trim(); }).filter(Boolean);
    if (!parts.length) { return; }
    speaking = true; showStatus();
    parts.forEach(function (part, i) {
      var u = new window.SpeechSynthesisUtterance(part);
      u.lang = "en-GB";
      if (voice) { u.voice = voice; }
      if (i === parts.length - 1) { u.onend = u.onerror = function () { if (run === speakRun) { speaking = false; showStatus(); } }; }
      try { synth.speak(u); } catch (e) { speaking = false; showStatus(); }
    });
  }
  function stopSpeaking() {
    speakRun += 1;
    if (canSpeak) { try { synth.cancel(); } catch (e) { /* ignore */ } }
    if (speaking) { speaking = false; showStatus(); }
  }
  function setVoice(on, quiet) {
    state.voiceOn = !!on && canSpeak; state.voiceSet = true;
    voiceBtn.setAttribute("aria-pressed", state.voiceOn ? "true" : "false");
    voiceBtn.innerHTML = icon(state.voiceOn ? "sound" : "mute");
    if (!state.voiceOn) { stopSpeaking(); }
    if (!quiet) { note(state.voiceOn ? "Replies will be read aloud." : "Replies will no longer be read aloud."); if (state.voiceOn) { speak("Replies will be read aloud."); } }
    save();
  }
  if (!canSpeak) { voiceBtn.hidden = true; }
  else {
    voiceBtn.setAttribute("aria-pressed", state.voiceOn ? "true" : "false");
    voiceBtn.innerHTML = icon(state.voiceOn ? "sound" : "mute");
    voiceBtn.addEventListener("click", function () { setVoice(!state.voiceOn, false); });
  }
  if (KB.voice === false) { micBtn.hidden = true; }

  var MIC_ERRORS = {
    "not-allowed": "The microphone is blocked for this site. You can allow it in your browser's site settings and try again, or type your question below.",
    "service-not-allowed": "The microphone is blocked for this site. You can allow it in your browser's site settings and try again, or type your question below.",
    "audio-capture": "I could not find a microphone. Please check one is connected, or type your question below.",
    "network": "Voice input could not reach your browser's speech service. Please type your question below.",
    "no-speech": "I did not hear anything. Press the microphone to try again, or type your question below."
  };
  function setListening(on) {
    listening = on;
    micBtn.setAttribute("aria-pressed", on ? "true" : "false");
    micBtn.setAttribute("aria-label", on ? "Stop listening" : "Speak your question");
    showStatus();
  }
  function stopListening() { if (recogniser) { try { recogniser.stop(); } catch (e) { /* ignore */ } } }
  function startListening() {
    if (!canListen) { note("Voice input is not available in this browser, so please type your question below. It works in Chrome, Edge and Safari."); input.focus(); return; }
    stopSpeaking();
    if (!state.micNoted) { state.micNoted = true; note("Voice input uses your browser's own speech service to turn what you say into text. This website does not record or keep your voice."); }
    heard = false; micError = "";
    try {
      recogniser = new Recogniser();
      recogniser.lang = "en-GB"; recogniser.interimResults = true; recogniser.continuous = false; recogniser.maxAlternatives = 1;
      recogniser.onstart = function () { setListening(true); };
      recogniser.onresult = function (ev) {
        var done = "", interim = "";
        for (var i = ev.resultIndex || 0; i < ev.results.length; i++) {
          if (ev.results[i].isFinal) { done += ev.results[i][0].transcript; } else { interim += ev.results[i][0].transcript; }
        }
        if (interim) { input.value = interim; }
        if (done.trim()) { heard = true; input.value = ""; stopListening(); ask(done, true); }
      };
      recogniser.onerror = function (ev) { micError = ev && ev.error ? ev.error : "failed"; };
      recogniser.onend = function () {
        setListening(false); recogniser = null;
        if (micError && micError !== "aborted") { input.value = ""; note(MIC_ERRORS[micError] || "Voice input stopped unexpectedly. Please try again, or type your question below."); }
        else if (!heard && !micError) { input.value = ""; note(MIC_ERRORS["no-speech"]); }
      };
      recogniser.start();
    } catch (e) {
      setListening(false); recogniser = null;
      note("Voice input could not start. Please type your question below.");
    }
  }
  micBtn.addEventListener("click", function () { if (listening) { stopListening(); } else { startListening(); } });
  statusBtn.addEventListener("click", function () { if (listening) { stopListening(); } else { stopSpeaking(); } });

  /* =====================================================================
     5. The enquiry form
     Uses the site's existing enquiry routes: it writes the message for
     the visitor and opens their own email app or WhatsApp, whichever
     they choose. Nothing leaves the browser until the visitor presses
     send there.
     ===================================================================== */
  var SERVICES = ["Accounts and tax returns", "Bookkeeping and VAT", "Payroll", "Management accounts and business support", "Not sure yet"];
  var BUSINESS_TYPES = ["Sole trader or self-employed", "Limited company", "Partnership", "Landlord or property owner", "Start-up", "Individual", "Other"];
  function field(id, label, control, optional) {
    var lab = el("label", { "for": id });
    lab.appendChild(document.createTextNode(label));
    if (optional) { lab.appendChild(el("span", { "class": "aa-opt", text: " (optional)" })); }
    control.id = id;
    control.setAttribute("aria-describedby", id + "-err");
    return el("div", { "class": "aa-f" }, [lab, control, el("span", { "class": "aa-err", id: id + "-err" })]);
  }
  function options(select, list, blank) {
    if (blank) { select.appendChild(el("option", { value: "", text: blank })); }
    list.forEach(function (item) { select.appendChild(el("option", { value: item, text: item })); });
    return select;
  }
  function openForm(kind) {
    stopSpeaking(); if (listening) { stopListening(); }
    formView.textContent = "";
    var back = el("button", { "class": "aa-back", type: "button", html: icon("back") + "<span>Back to the conversation</span>" });
    back.addEventListener("click", function () { closeForm(false); });
    var title = el("h3", { id: "aa-form-title", tabindex: "-1", text: "Send an enquiry" });
    var intro = el("p", { text: "Tell us a little about what you need and we will come back to you." });

    var fKind = options(el("select"), Object.keys(FORM_KINDS).map(function (k) { return FORM_KINDS[k]; }));
    fKind.value = FORM_KINDS[kind] || FORM_KINDS.general;
    var fName = el("input", { type: "text", autocomplete: "name" });
    var fBusiness = el("input", { type: "text", autocomplete: "organization" });
    var fEmail = el("input", { type: "email", autocomplete: "email", inputmode: "email" });
    var fPhone = el("input", { type: "tel", autocomplete: "tel", inputmode: "tel" });
    var fType = options(el("select"), BUSINESS_TYPES, "Choose one");
    if (state.ctx.businessType && BUSINESS_TYPES.indexOf(state.ctx.businessType) >= 0) { fType.value = state.ctx.businessType; }
    var fMessage = el("textarea", { rows: "4" });
    var services = el("fieldset", { "class": "aa-f" }, [el("legend", { text: "Services required" })]);
    var serviceBoxes = SERVICES.map(function (name, i) {
      var box = el("input", { type: "checkbox", id: "aa-f-service-" + i, value: name });
      services.appendChild(el("label", { "class": "aa-check", "for": "aa-f-service-" + i }, [box, el("span", { text: name })]));
      return box;
    });
    var fConsent = el("input", { type: "checkbox", id: "aa-f-consent", "aria-describedby": "aa-f-consent-err" });
    var consentText = el("span");
    consentText.appendChild(document.createTextNode("I agree to " + DETAILS.name + " using these details to reply to my enquiry. See the "));
    consentText.appendChild(el("a", { href: sectionHref("privacy"), target: "_blank", rel: "noopener", text: "privacy notice" }));
    consentText.appendChild(document.createTextNode("."));
    var consent = el("div", { "class": "aa-f" }, [el("label", { "class": "aa-check", "for": "aa-f-consent" }, [fConsent, consentText]), el("span", { "class": "aa-err", id: "aa-f-consent-err" })]);
    var formNote = el("p", { "class": "aa-formnote", role: "alert" });
    /* Two ways to send. Pressing Enter in a field counts as the first button. */
    var via = "", senders = [];
    if (DETAILS.email) { senders.push(el("button", { "class": "aa-btn", type: "submit", id: "aa-send-email", html: icon("mail") + "<span>Send by email</span>" })); }
    if (DETAILS.whatsapp) { senders.push(el("button", { "class": "aa-btn" + (DETAILS.email ? " aa-btn-quiet" : ""), type: "submit", id: "aa-send-wa", html: icon("chat") + "<span>Send by WhatsApp</span>" })); }
    senders.forEach(function (b) { b.addEventListener("click", function () { via = b.id === "aa-send-wa" ? "whatsapp" : "email"; }); });
    var cancel = el("button", { "class": "aa-btn aa-btn-plain", type: "button", text: "Cancel" });
    cancel.addEventListener("click", function () { closeForm(false); });
    var how = DETAILS.email && DETAILS.whatsapp ? "Email opens your own email app and WhatsApp opens a chat with us, each with the enquiry written out."
      : DETAILS.whatsapp ? "This opens WhatsApp with the enquiry written out." : "This opens your own email app with the enquiry written out.";
    var phoneField = field("aa-f-phone", "Contact number", fPhone, true);
    var form = el("form", { id: "aa-form", novalidate: "" }, [
      field("aa-f-kind", "What would you like?", fKind),
      field("aa-f-name", "Full name", fName),
      field("aa-f-business", "Business name", fBusiness, true),
      field("aa-f-email", "Email address", fEmail),
      phoneField,
      field("aa-f-type", "Type of business", fType, true),
      services,
      field("aa-f-message", "Brief description of your enquiry", fMessage),
      consent, formNote,
      el("p", { text: how + " Press send there and it reaches us. Nothing is sent or stored by this website." }),
      el("div", { "class": "aa-actions" }, senders.concat([cancel]))
    ]);

    function mark(control, message) {
      var err = document.getElementById(control.id + "-err");
      if (err) { err.textContent = message; }
      if (message) { control.setAttribute("aria-invalid", "true"); } else { control.removeAttribute("aria-invalid"); }
      return !message;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var wantsCall = fKind.value === FORM_KINDS.callback, phone = fPhone.value.trim(), problems = [];
      var channel = (via === "whatsapp" || !DETAILS.email) && DETAILS.whatsapp ? "whatsapp" : "email", address = fEmail.value.trim();
      via = "";
      if (!mark(fName, fName.value.trim() ? "" : "Enter your full name.")) { problems.push(fName); }
      /* By WhatsApp we can reply in the same chat, so an email address is only checked if one is given */
      var addressOk = !address && channel === "whatsapp" ? true : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(address);
      if (!mark(fEmail, addressOk ? "" : "Enter an email address, such as name@example.co.uk.")) { problems.push(fEmail); }
      var phoneMessage = !phone ? (wantsCall ? "Enter a phone number so we can call you back." : "") : (/^[\d\s()+.-]{7,20}$/.test(phone) && phone.replace(/\D/g, "").length >= 7 ? "" : "Enter a phone number, such as 0161 000 0000, or leave this empty.");
      if (!mark(fPhone, phoneMessage)) { problems.push(fPhone); }
      if (!mark(fMessage, fMessage.value.trim() ? "" : "Tell us briefly what you need.")) { problems.push(fMessage); }
      if (!mark(fConsent, fConsent.checked ? "" : "Tick the box so we can reply to you.")) { problems.push(fConsent); }
      if (problems.length) { formNote.textContent = "Check the highlighted fields, then try again."; problems[0].focus(); return; }
      formNote.textContent = "";
      var chosen = serviceBoxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; });
      var lines = ["Request: " + fKind.value, "Name: " + fName.value.trim()];
      if (fBusiness.value.trim()) { lines.push("Business name: " + fBusiness.value.trim()); }
      if (address) { lines.push("Email: " + address); }
      if (phone) { lines.push("Phone: " + phone); }
      if (fType.value) { lines.push("Type of business: " + fType.value); }
      if (chosen.length) { lines.push("Services required: " + chosen.join(", ")); }
      lines.push("", "Enquiry:", fMessage.value.trim(), "", "Sent from the assistant on the " + DETAILS.name + " website.");
      var subject = "Website enquiry: " + fKind.value, body = lines.join("\n");
      var go = channel === "whatsapp"
        ? el("a", { href: waHref(DETAILS.whatsapp, subject + "\n\n" + body), target: "_blank", rel: "noopener" })
        : el("a", { href: "mailto:" + DETAILS.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body) });
      showDone(channel, channel === "whatsapp" ? subject + "\n\n" + body : body, go.href);
      go.style.display = "none"; root.appendChild(go); go.click(); root.removeChild(go);
    });
    fKind.addEventListener("change", function () {
      var opt = phoneField.querySelector(".aa-opt");
      if (opt) { opt.hidden = fKind.value === FORM_KINDS.callback; }
    });
    formView.appendChild(back); formView.appendChild(title); formView.appendChild(intro); formView.appendChild(form);
    var optional = phoneField.querySelector(".aa-opt");
    if (optional) { optional.hidden = fKind.value === FORM_KINDS.callback; }
    chatView.hidden = true; formView.hidden = false; formView.scrollTop = 0;
    title.focus();
  }
  function showDone(channel, body, href) {
    formView.textContent = "";
    var byChat = channel === "whatsapp";
    var title = el("h3", { id: "aa-done-title", tabindex: "-1", text: byChat ? "Your WhatsApp message is ready to send" : "Your email is ready to send" });
    var copyNote = el("p", { "class": "aa-formnote", role: "status" });
    var message = el("textarea", { readonly: "", rows: "8", "aria-label": "Your enquiry" });
    message.value = body;
    var copy = el("button", { "class": "aa-btn", type: "button", text: "Copy my message" });
    copy.addEventListener("click", function () {
      var target = byChat ? "a WhatsApp message to " + DETAILS.whatsapp : "an email to " + DETAILS.email;
      var ok = function () { copyNote.textContent = "Copied. Paste it into " + target + "."; };
      var manual = function () { message.focus(); message.select(); copyNote.textContent = "Select the message above and copy it, then paste it into " + target + "."; };
      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(body).then(ok, manual); } else { manual(); }
    });
    var back = el("button", { "class": "aa-btn aa-btn-quiet", type: "button", text: "Back to the conversation" });
    back.addEventListener("click", function () { closeForm(true, channel); });
    var where = el("p");
    if (byChat) {
      where.appendChild(document.createTextNode("If nothing opened, "));
      where.appendChild(el("a", { href: href, target: "_blank", rel: "noopener", text: "open WhatsApp" }));
      where.appendChild(document.createTextNode(", or copy the message and send it to " + DETAILS.whatsapp + " on WhatsApp."));
    } else {
      where.appendChild(document.createTextNode("If nothing opened, copy the message and send it to "));
      where.appendChild(el("a", { href: "mailto:" + DETAILS.email, text: DETAILS.email }));
      where.appendChild(document.createTextNode(" from any email account."));
    }
    formView.appendChild(el("div", { "class": "aa-done" }, [title,
      el("p", { text: (byChat ? "WhatsApp" : "Your email app") + " should have opened with your enquiry written out. Press send there and it will reach us." }),
      where, message, copyNote, el("div", { "class": "aa-actions" }, [copy, back])]));
    formView.scrollTop = 0;
    title.focus();
  }
  function closeForm(prepared, channel) {
    formView.hidden = true; formView.textContent = ""; chatView.hidden = false;
    if (prepared) { add({ from: "bot", text: channel === "whatsapp" ? "Thank you. Your enquiry is written out in WhatsApp, ready for you to send to {whatsapp}. Is there anything else I can help with?" : "Thank you. Your enquiry is written out in your email app, ready for you to send to {email}. Is there anything else I can help with?" }); }
    if (small.matches) { log.focus({ preventScroll: true }); } else { input.focus({ preventScroll: true }); }
  }

  /* =====================================================================
     6. Opening, closing and starting again
     ===================================================================== */
  function openPanel(quiet) {
    state.open = true;
    root.classList.remove("aa-fresh");
    panel.hidden = false; launch.hidden = true; launch.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("aa-lock");
    if (!state.messages.length) { welcome(); } else { scrollTo(null); }
    if (!quiet) { if (small.matches) { log.focus({ preventScroll: true }); } else { input.focus({ preventScroll: true }); } }
    save();
  }
  function closePanel(quiet) {
    state.open = false;
    stopSpeaking(); if (listening) { stopListening(); }
    panel.hidden = true; launch.hidden = false; launch.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("aa-lock");
    if (!quiet) { launch.focus({ preventScroll: true }); }
    save();
  }
  launch.addEventListener("click", function () { openPanel(false); });
  closeBtn.addEventListener("click", function () { closePanel(false); });
  clearBtn.addEventListener("click", function () {
    stopSpeaking(); if (listening) { stopListening(); }
    state.messages = []; state.ctx = { last: null, given: {}, pending: null, businessType: "", misses: 0 }; state.remoteFails = 0;
    log.textContent = ""; formView.hidden = true; formView.textContent = ""; chatView.hidden = false;
    welcome(); input.focus({ preventScroll: true });
  });
  document.addEventListener("keydown", function (e) {
    if (panel.hidden) { return; }
    if (e.key === "Escape") { e.preventDefault(); closePanel(false); return; }
    if (e.key === "Tab" && small.matches) {   // on a phone the window fills the screen, so focus stays inside it
      var items = Array.prototype.filter.call(panel.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]'), function (n) { return !n.disabled && n.offsetParent !== null; });
      if (!items.length) { return; }
      var firstItem = items[0], lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) { e.preventDefault(); lastItem.focus(); }
      else if (!e.shiftKey && document.activeElement === lastItem) { e.preventDefault(); firstItem.focus(); }
    }
  });
  footLink.addEventListener("click", function () { if (small.matches) { closePanel(true); } });
  /* On a phone, keep the button clear of a form the visitor is filling in */
  function tuck() {
    var el = document.activeElement, field = el && el.matches && el.matches("input,textarea,select") && !root.contains(el);
    root.classList.toggle("aa-tuck", !!field && small.matches);
  }
  document.addEventListener("focusin", tuck);
  document.addEventListener("focusout", function () { setTimeout(tuck, 0); });

  /* Pick up a conversation started on another page in this tab */
  state.messages.forEach(show);
  if (state.open && !small.matches) { openPanel(true); } else { state.open = false; }

  window.AccrionAssistant = { open: function () { openPanel(false); }, close: function () { closePanel(false); }, ask: function (text) { openPanel(false); ask(text, false); } };
})();
