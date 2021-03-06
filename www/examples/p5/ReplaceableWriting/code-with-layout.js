
let txt = "Last Wednesday we decided to visit the zoo. We arrived the next morning after we breakfasted, cashed in our passes and entered. We walked toward the first exhibits. I looked up at a giraffe as it stared back at me. I stepped nervously to the next area. One of the lions gazed at me as he lazed in the shade while the others napped. One of my friends first knocked then banged on the tempered glass in front of the monkey cage. They howled and screamed at us as we hurried to another exhibit where we stopped and gawked at plumed birds. After we rested, we headed for the petting zoo where we petted wooly sheep who only glanced at us but the goats butted each other and nipped our clothes when we ventured too near their closed pen. Later, our tired group nudged their way through the crowded paths and exited the turnstiled gate. Our car bumped, jerked and swayed as we dozed during the relaxed ride home.";

let words = [], wx = [], wy = [], selected, fade = 0, spc, next, ts;

function setup() {

  createCanvas(600, 400);
  noStroke();
  textSize(18);
  loadFont('Chaparral.otf', nextWord);
}

function draw() {
  background(20,30,55);
  for (let i = 0; words && i < words.length; i++) {
    if (i === selected) {
      fill(255, 100, 100, fade);
      rect(wx[i] - spc*.8, wy[i] + textDescent() + spc / 2, textWidth(words[i])
         + spc * 1.6, -(textDescent() + textAscent() + spc), 5);
    }
    fill(240);
    text(words[i], wx[i], wy[i]);
  }
  fade = constrain((next ? fade+ 2 : fade-2), 0, 150);
}

// replace one random word in the text
function nextWord() {

  if (words.length) {
    if (next) {
      let word = words[selected];
      words[selected] = next; // make a substitution
      console.log("replace(" + selected + "): " + word + " -> " + next);
      txt = RiTa.untokenize(words);
      next = 0;
    }
    else {
      // loop from a random spot
      let r = floor(random(0, words.length));
      for (let i = r; i < words.length + r; i++) {

        let idx = i % words.length;
        let word = words[idx].toLowerCase();
        if (word.length < 3) continue; // len >= 3

        // find related words
        let pos = RiTa.tagger.allTags(word)[0];
        let rhymes = RiTa.rhymes(word, { pos });
        let sounds = RiTa.soundsLike(word, { pos });
        let spells = RiTa.spellsLike(word, { pos });
        let similars = [...rhymes, ...sounds, ...spells];

        // only words with 2 or more similars
        if (similars.length < 2) continue;

        // pick a random similar
        next = RiTa.random(similars);
        if (next.includes(word) || word.includes(next)) {
          continue;                     // skip substrings
        }
        if (/[A-Z]/.test(words[idx][0])) {
          next = RiTa.capitalize(next); // keep capitals
        }
        selected = idx; // store the index
        fade = 0;
        break;
      }
    }
  }
  layout(txt, 40, 40, 520, 23);
  setTimeout(nextWord, next ? 2000 : 1000);
}

// layout text, word by word
function layout(str, tx, ty, tw, lead) {

  wx[0] = tx; 
  wy[0] = ty;
  spc = textWidth(' ');
  words = RiTa.tokenize(str);
  for (let i = 1; i < words.length; i++) {
    let x = wx[i - 1] + textWidth(words[i - 1]), y = wy[i - 1];
    if (!RiTa.isPunct(words[i])) x += spc;
    if (i < words.length - 1) {
      let nw = textWidth(words[i]);
      if (RiTa.isPunct(words[i + 1])) {
        nw += textWidth(words[i + 1]);
      }
      if (x > (tx + tw) - nw) {
        y += lead;
        x = tx;
      }
    }
    wx[i] = x;
    wy[i] = y;
  }
}