/* Tap & Say — shared app. One file, cached across all topic pages. */
(function () {
  "use strict";

  /* ---------- helpers to keep the data table small ---------- */
  // "Cat 🐱,Dog 🐶" -> [{label:"Cat",glyph:"🐱",say:"Cat"}, ...]
  function pairs(str) {
    return str.split(",").map(function (s) {
      var p = s.trim().split(" ");
      var glyph = p.pop();
      var label = p.join(" ");
      return { label: label, glyph: glyph, say: label };
    });
  }
  function svg(inner) {
    return '<svg class="shape" viewBox="0 0 100 100" aria-hidden="true">' + inner + "</svg>";
  }

  /* ---------- topics ---------- */
  var T = {
    alphabet: {
      name: "Alphabet", glyph: "🅰️", blurb: "All 26 letters, each with a picture word.",
      items: "A Apple 🍎,B Ball ⚽,C Cat 🐱,D Dog 🐶,E Elephant 🐘,F Fish 🐟,G Grapes 🍇,H Hat 🎩,I Ice cream 🍦,J Jug 🫗,K Kite 🪁,L Lion 🦁,M Moon 🌙,N Nest 🪺,O Orange 🍊,P Pig 🐷,Q Queen 👑,R Rainbow 🌈,S Sun ☀️,T Tree 🌳,U Umbrella ☂️,V Violin 🎻,W Watermelon 🍉,X Xylophone 🎹,Y Yarn 🧶,Z Zebra 🦓"
        .split(",").map(function (s) {
          var p = s.split(" "), letter = p.shift(), glyph = p.pop(), word = p.join(" ");
          return { label: letter, sub: word, glyph: glyph, say: letter + ", " + word };
        })
    },
    numbers: {
      name: "Numbers", glyph: "7️⃣", blurb: "One to twenty, with dots to count.",
      items: "one,two,three,four,five,six,seven,eight,nine,ten,eleven,twelve,thirteen,fourteen,fifteen,sixteen,seventeen,eighteen,nineteen,twenty"
        .split(",").map(function (w, i) {
          return { label: String(i + 1), sub: w, say: w, dots: i < 10 ? i + 1 : 0 };
        })
    },
    colours: {
      name: "Colours", glyph: "🎨", blurb: "Twelve colours to name and match.",
      items: [["Red", "#F03E3E"], ["Blue", "#2F6BED"], ["Yellow", "#FFD43B"], ["Green", "#40B865"],
        ["Orange", "#FF8A28"], ["Purple", "#9B5DE5"], ["Pink", "#FF7EB6"], ["Brown", "#96603C"],
        ["Black", "#20202A"], ["White", "#FFFFFF"], ["Grey", "#9AA0AE"], ["Gold", "#D4A017"]]
        .map(function (c) { return { label: c[0], say: c[0], color: c[1] }; })
    },
    shapes: {
      name: "Shapes", glyph: "🔺", blurb: "Circles, squares and ten more.",
      items: [
        ["Circle", '<circle cx="50" cy="50" r="42"/>'],
        ["Square", '<rect x="11" y="11" width="78" height="78" rx="3"/>'],
        ["Triangle", '<polygon points="50,10 92,88 8,88"/>'],
        ["Rectangle", '<rect x="6" y="25" width="88" height="50" rx="3"/>'],
        ["Star", '<polygon points="50,6 61,38 95,38 67,58 78,91 50,71 22,91 33,58 5,38 39,38"/>'],
        ["Heart", '<path d="M50 88C10 60 10 26 32 20c10-3 18 6 18 14 0-8 8-17 18-14 22 6 22 40-18 68z"/>'],
        ["Diamond", '<polygon points="50,6 94,50 50,94 6,50"/>'],
        ["Oval", '<ellipse cx="50" cy="50" rx="44" ry="31"/>'],
        ["Pentagon", '<polygon points="50,7 94,39 77,90 23,90 6,39"/>'],
        ["Hexagon", '<polygon points="50,6 89,28 89,72 50,94 11,72 11,28"/>'],
        ["Cross", '<polygon points="35,8 65,8 65,35 92,35 92,65 65,65 65,92 35,92 35,65 8,65 8,35 35,35"/>'],
        ["Crescent", '<path d="M64 8a44 44 0 100 84 36 36 0 010-84z"/>']
      ].map(function (s) { return { label: s[0], say: s[0], svg: svg(s[1]) }; })
    },
    animals: {
      name: "Animals", glyph: "🐘", blurb: "Farm, jungle and sea animals.",
      items: pairs("Cat 🐱,Dog 🐶,Cow 🐮,Horse 🐴,Sheep 🐑,Goat 🐐,Pig 🐷,Rabbit 🐰,Mouse 🐭,Elephant 🐘,Lion 🦁,Tiger 🐯,Monkey 🐵,Bear 🐻,Panda 🐼,Giraffe 🦒,Zebra 🦓,Camel 🐪,Deer 🦌,Kangaroo 🦘,Frog 🐸,Turtle 🐢,Snake 🐍,Fox 🦊,Wolf 🐺,Fish 🐟,Whale 🐳,Dolphin 🐬,Crab 🦀,Butterfly 🦋,Bee 🐝,Snail 🐌")
    },
    birds: {
      name: "Birds", glyph: "🦜", blurb: "Birds from the garden and the zoo.",
      items: pairs("Hen 🐔,Rooster 🐓,Chick 🐤,Duck 🦆,Goose 🪿,Swan 🦢,Owl 🦉,Eagle 🦅,Parrot 🦜,Peacock 🦚,Dove 🕊️,Sparrow 🐦,Penguin 🐧,Flamingo 🦩,Turkey 🦃,Nest 🪺,Feather 🪶,Egg 🥚")
    },
    fruits: {
      name: "Fruits", glyph: "🍓", blurb: "Sweet fruits to name.",
      items: pairs("Apple 🍎,Banana 🍌,Orange 🍊,Grapes 🍇,Strawberry 🍓,Watermelon 🍉,Pineapple 🍍,Mango 🥭,Peach 🍑,Pear 🍐,Cherry 🍒,Lemon 🍋,Kiwi 🥝,Coconut 🥥,Blueberry 🫐,Melon 🍈")
    },
    vegetables: {
      name: "Vegetables", glyph: "🥕", blurb: "Vegetables from the garden.",
      items: pairs("Carrot 🥕,Potato 🥔,Tomato 🍅,Onion 🧅,Garlic 🧄,Broccoli 🥦,Corn 🌽,Cucumber 🥒,Pepper 🫑,Chilli 🌶️,Aubergine 🍆,Mushroom 🍄,Peas 🫛,Lettuce 🥬,Pumpkin 🎃,Sweet potato 🍠,Beans 🫘,Ginger 🫚")
    },
    body: {
      name: "Body parts", glyph: "👋", blurb: "Point to it, then say it.",
      items: pairs("Eye 👁️,Eyes 👀,Ear 👂,Nose 👃,Mouth 👄,Tongue 👅,Tooth 🦷,Hand ✋,Finger ☝️,Thumb 👍,Arm 💪,Leg 🦵,Foot 🦶,Hair 💇,Brain 🧠,Heart 🫀,Lungs 🫁,Bone 🦴")
    },
    family: {
      name: "Family", glyph: "👨‍👩‍👧", blurb: "The people at home.",
      items: pairs("Mother 👩,Father 👨,Baby 👶,Sister 👧,Brother 👦,Grandmother 👵,Grandfather 👴,Family 👪,Girl 👧,Boy 👦,Woman 👩,Man 👨,Twins 👯,Home 🏠")
    },
    instruments: {
      name: "Instruments", glyph: "🎸", blurb: "Things that make music.",
      items: pairs("Guitar 🎸,Piano 🎹,Drum 🥁,Violin 🎻,Trumpet 🎺,Saxophone 🎷,Flute 🪈,Accordion 🪗,Banjo 🪕,Maracas 🪇,Bell 🔔,Microphone 🎤")
    },
    vehicles: {
      name: "Vehicles", glyph: "🚌", blurb: "Things that go.",
      items: pairs("Car 🚗,Bus 🚌,Truck 🚚,Bicycle 🚲,Motorbike 🏍️,Scooter 🛴,Taxi 🚕,Train 🚂,Tram 🚋,Aeroplane ✈️,Helicopter 🚁,Boat ⛵,Ship 🚢,Rocket 🚀,Tractor 🚜,Fire engine 🚒,Ambulance 🚑,Police car 🚓")
    },
    rhymes: {
      name: "Rhymes", glyph: "🎵", blurb: "Sing-along time.", modes: ["list"],
      items: [["Twinkle Twinkle Little Star", "⭐"], ["Baa Baa Black Sheep", "🐑"],
        ["Humpty Dumpty", "🥚"], ["Mary Had a Little Lamb", "🐑"],
        ["Row Row Row Your Boat", "🚣"], ["The Wheels on the Bus", "🚌"],
        ["Old MacDonald Had a Farm", "🚜"], ["Incy Wincy Spider", "🕷️"],
        ["Head Shoulders Knees and Toes", "🧑"], ["Hickory Dickory Dock", "🐭"],
        ["Jack and Jill", "🪣"], ["Five Little Ducks", "🦆"]]
        .map(function (r) {
          return {
            label: r[0], glyph: r[1], say: r[0],
            audio: "/assets/audio/" + r[0].toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".mp3"
          };
        })
    }
  };

  var PRAISE = ["Yes!", "Well done!", "Great job!", "That's right!", "Perfect!"];
  var rand = function (n) { return Math.floor(Math.random() * n); };
  var shuffle = function (a) {
    return a.map(function (v) { return [Math.random(), v]; })
      .sort(function (x, y) { return x[0] - y[0]; })
      .map(function (p) { return p[1]; });
  };

  /* ---------- speech ---------- */
  var voice = null, canSpeak = "speechSynthesis" in window;
  function pickVoice() {
    var v = speechSynthesis.getVoices().filter(function (x) { return x.lang.indexOf("en") === 0; });
    voice = v.filter(function (x) { return /female|samantha|karen|zira|google us/i.test(x.name); })[0]
      || v.filter(function (x) { return x.localService; })[0] || v[0] || null;
  }
  if (canSpeak) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

  var soundOn = true;
  try { soundOn = localStorage.getItem("ts-sound") !== "0"; } catch (e) {}

  function say(text, rate) {
    if (!soundOn || !canSpeak) return;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.rate = rate || 0.82; u.pitch = 1.12;
    if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = "en-US"; }
    speechSynthesis.speak(u);
  }

  /* ---------- shared chrome ---------- */
  function wireSound() {
    var btn = document.getElementById("sound");
    if (!btn) return;
    function paint() {
      btn.setAttribute("aria-pressed", String(soundOn));
      btn.textContent = soundOn ? "🔊" : "🔇";
      btn.setAttribute("aria-label", soundOn ? "Turn sound off" : "Turn sound on");
    }
    paint();
    btn.onclick = function () {
      soundOn = !soundOn;
      try { localStorage.setItem("ts-sound", soundOn ? "1" : "0"); } catch (e) {}
      paint();
      if (soundOn) say("Sound on"); else if (canSpeak) speechSynthesis.cancel();
    };
  }

  /* ---------- card rendering ---------- */
  function face(item) {
    if (item.color) return '<span class="swatch" style="background:' + item.color + '"></span>';
    if (item.svg) return item.svg;
    if (item.dots !== undefined) {
      var h = '<span class="glyph">' + item.label + "</span>";
      if (item.dots) h += '<span class="dots">' + new Array(item.dots + 1).join("<i></i>") + "</span>";
      return h;
    }
    return '<span class="glyph">' + item.glyph + "</span>";
  }
  function cardHTML(item, i) {
    return '<button class="card" data-i="' + i + '" aria-label="' + item.say + '">' +
      face(item) + '<span class="label">' + item.label + "</span>" +
      (item.sub ? '<span class="sub">' + item.sub + "</span>" : "") + "</button>";
  }

  /* ---------- modes ---------- */
  function learnView(panel, topic) {
    var items = topic.items;
    panel.innerHTML = '<div class="grid">' +
      items.map(function (it, i) { return cardHTML(it, i); }).join("") + "</div>";
    panel.querySelectorAll(".card").forEach(function (b) {
      b.onclick = function () {
        say(items[b.dataset.i].say);
        b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
      };
    });
  }

  function shuffleView(panel, topic) {
    var items = topic.items, current = null;
    panel.innerHTML = '<div class="stage"><button class="big" id="bigcard"></button>' +
      '<button class="next" id="nextbtn">Next →</button></div>';
    var card = document.getElementById("bigcard");
    function draw(speak) {
      var it;
      do { it = items[rand(items.length)]; } while (items.length > 1 && it === current);
      current = it;
      card.innerHTML = face(it) + '<span class="label">' + it.label + "</span>" +
        (it.sub ? '<span class="sub">' + it.sub + "</span>" : "");
      card.setAttribute("aria-label", it.say);
      card.classList.remove("deal"); void card.offsetWidth; card.classList.add("deal");
      if (speak) say(it.say);
    }
    card.onclick = function () { say(current.say); };
    document.getElementById("nextbtn").onclick = function () { draw(true); };
    draw(false);
  }

  function listenView(panel, topic) {
    var items = topic.items;
    panel.innerHTML = '<div class="prompt"><p class="q">Which one is it?</p>' +
      '<button class="replay" id="replay">🔊 Say it again</button></div>' +
      '<div class="grid" id="opts"></div><p class="streak" id="streak"></p>';
    var opts = document.getElementById("opts"),
        streakEl = document.getElementById("streak"),
        target = null, locked = false, streak = 0;

    function round() {
      locked = false;
      var pool = shuffle(items.slice()).slice(0, Math.min(4, items.length));
      target = pool[rand(pool.length)];
      opts.innerHTML = pool.map(function (it, i) { return cardHTML(it, i); }).join("");
      opts.querySelectorAll(".card").forEach(function (b, i) {
        b.onclick = function () { choose(pool[i], b); };
      });
      streakEl.textContent = streak ? "⭐ " + streak + " in a row" : "";
      setTimeout(function () { say(target.say); }, 260);
    }
    function choose(it, btn) {
      if (locked) return;
      if (it === target) {
        locked = true; streak++;
        btn.classList.add("right");
        say(PRAISE[rand(PRAISE.length)], 1);
        setTimeout(round, 1100);
      } else {
        streak = 0; streakEl.textContent = "";
        btn.classList.remove("wrong"); void btn.offsetWidth; btn.classList.add("wrong");
        setTimeout(function () { say(target.say); }, 340);
      }
    }
    document.getElementById("replay").onclick = function () { say(target.say); };
    round();
  }

  // Rhymes: titles + audio slots. Drop your own recordings into /assets/audio/.
  function listView(panel, topic) {
    panel.innerHTML =
      '<p class="note"><b>No recordings yet.</b> Add MP3 files to <code>/assets/audio/</code> ' +
      'using the file names in the browser console, and each card will play.</p>' +
      '<div class="rhymes">' + topic.items.map(function (it, i) {
        return '<button class="rhyme" data-i="' + i + '"><span class="glyph">' + it.glyph +
          '</span><span class="meta"><span class="label">' + it.label +
          '</span><span class="sub">Tap to play</span></span><span class="play">▶</span></button>';
      }).join("") + "</div>";

    if (window.console) {
      console.log("Expected audio files:\n" +
        topic.items.map(function (i) { return i.audio; }).join("\n"));
    }
    var playing = null;
    panel.querySelectorAll(".rhyme").forEach(function (b) {
      b.onclick = function () {
        var it = topic.items[b.dataset.i];
        var sub = b.querySelector(".sub");
        if (playing) { playing.pause(); playing = null; }
        var a = new Audio(it.audio);
        a.onplaying = function () { sub.textContent = "Playing"; };
        a.onended = function () { sub.textContent = "Tap to play"; };
        a.onerror = function () { sub.textContent = "Recording not added yet"; };
        playing = a;
        // play() returns undefined on older Safari, so don't assume a promise.
        var p = a.play();
        if (p && p.catch) {
          p.catch(function () { sub.textContent = "Recording not added yet"; });
        }
      };
    });
  }

  var MODES = {
    learn: { label: "Learn", fn: learnView },
    shuffle: { label: "Shuffle", fn: shuffleView },
    listen: { label: "Listen", fn: listenView },
    list: { label: "Sing along", fn: listView }
  };

  /* ---------- boot ---------- */
  function initTopic(key) {
    var topic = T[key];
    if (!topic) return;
    var view = document.getElementById("view");
    var names = topic.modes || ["learn", "shuffle", "listen"];
    var active = names[0];

    function render() {
      var html = "";
      if (names.length > 1) {
        html += '<div class="modes" role="tablist">';
        names.forEach(function (n) {
          html += '<button class="mode" role="tab" data-mode="' + n + '" aria-selected="' +
            (active === n) + '">' + MODES[n].label + "</button>";
        });
        html += "</div>";
      }
      view.innerHTML = html + '<div id="panel"></div>';
      view.querySelectorAll(".mode").forEach(function (b) {
        b.onclick = function () { active = b.dataset.mode; render(); };
      });
      MODES[active].fn(document.getElementById("panel"), topic);
    }
    render();
  }

  // SPA mode powers the single-file preview: same code, hash routes instead of
  // real URLs. The deployed site uses real URLs so each topic is indexable.
  var SPA = false;
  var href = function (k) { return SPA ? "#" + k : "/" + k + "/"; };

  function tilesHTML() {
    return Object.keys(T).map(function (k) {
      var t = T[k];
      return '<a class="tile" href="' + href(k) + '"><span class="glyph">' + t.glyph +
        '</span><span class="name">' + t.name + '</span><span class="count">' +
        t.items.length + " cards</span></a>";
    }).join("");
  }

  function initHome() {
    var wrap = document.getElementById("tiles");
    if (wrap) wrap.innerHTML = tilesHTML();
  }

  function renderSpaHome(view) {
    view.innerHTML = '<section class="hero"><p class="eyebrow">Ages 2 to 6</p>' +
      '<h1>Tap a picture.<br><em>Hear the word.</em></h1>' +
      '<p>Thirteen little topics, three ways to play. No signup, no timers, ' +
      'nothing to buy.</p></section><div class="tiles">' + tilesHTML() + "</div>";
  }

  function route() {
    var view = document.getElementById("view");
    var back = document.getElementById("back");
    var titleEl = document.querySelector(".bar .t");
    var key = location.hash.replace("#", "");
    if (T[key]) {
      if (back) back.hidden = false;
      if (titleEl) titleEl.textContent = T[key].name;
      initTopic(key);
    } else {
      if (back) back.hidden = true;
      if (titleEl) titleEl.textContent = "Tap & Say";
      renderSpaHome(view);
    }
    window.scrollTo(0, 0);
  }

  document.addEventListener("DOMContentLoaded", function () {
    wireSound();
    SPA = document.body.hasAttribute("data-spa");
    var back = document.getElementById("back");
    if (SPA) {
      if (back) back.onclick = function () { location.hash = ""; };
      window.addEventListener("hashchange", route);
      route();
      return;
    }
    var key = document.body.getAttribute("data-topic");
    if (key) initTopic(key); else initHome();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(function () {});
    }
  });
})();
