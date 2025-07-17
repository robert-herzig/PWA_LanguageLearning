const fs = require('fs');
const path = require('path');
const translate = require('@vitalets/google-translate-api');

const levels = ['b1','b2'];
const srcTxt = {
  b1: 'c:\\Users\\robex\\Documents\\PWA_LanguageLearning\\data\\word_lists\\spanish_b1_words.txt',
  b2: 'c:\\Users\\robex\\Documents\\PWA_LanguageLearning\\data\\word_lists\\spanish_b2_words.txt'
};
const langs = [
  { code: 'spanish', tcode: 'es' },
  { code: 'english', tcode: 'en' },
  { code: 'russian', tcode: 'ru' }
];

// simple example generator
function exampleFor(lang, word) {
  if (lang==='spanish') return `La palabra "${word}" es útil.`;
  if (lang==='english') return `The word "${word}" is useful.`;
  if (lang==='russian') return `Слово «${word}» полезно.`;
  return '';
}

// split a .txt into { topicKey: [word,…] }
function parseTxt(text) {
  const lines = text.split('\n').map(l=>l.trim());
  let topic = null;
  const out = {};
  for (let l of lines) {
    if (l.startsWith('##')) {
      const key = l.replace(/##\s*\d*\.?\s*/,'').split(':')[1]||l.replace(/##\s*/,'');
      topic = key.trim().toLowerCase().replace(/\s+/g,'_');
      out[topic] = [];
      continue;
    }
    if (!l || l.startsWith('#')||!topic) continue;
    out[topic].push(l);
  }
  return out;
}

(async () => {
  for (let lvl of levels) {
    const topicsMap = parseTxt(fs.readFileSync(srcTxt[lvl],'utf8'));
    for (let lang of langs) {
      const baseDir = path.join(__dirname,'..','data','word_lists',lang.code,lvl);
      fs.mkdirSync(baseDir,{ recursive:true });
      // write index.json
      fs.writeFileSync(
        path.join(baseDir,'index.json'),
        JSON.stringify(Object.keys(topicsMap),null,2)
      );
      // for each topic
      for (let [key, words] of Object.entries(topicsMap)) {
        const entries = [];
        for (let w of words) {
          let tr = w;
          if (lang.code!=='spanish') {
            try {
              const res = await translate(w, { to: lang.tcode });
              tr = res.text;
            } catch(e) {
              console.warn('translate failed for',w,e);
            }
          }
          entries.push({
            word: w,
            translation: tr,
            example: exampleFor(lang.code, tr)
          });
        }
        fs.writeFileSync(
          path.join(baseDir,`${key}.json`),
          JSON.stringify({ topic: key, words: entries }, null, 2)
        );
        console.log(`Written ${lang.code}/${lvl}/${key}.json (${entries.length} items)`);
      }
    }
  }
  console.log('✅ All word-lists generated.');
})();
