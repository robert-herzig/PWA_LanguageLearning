const fs = require('fs');
const path = require('path');
const translate = require('google-translate-api-x');

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

// simple example generator (examples in target language)
function exampleFor(lang, word) {
  if (lang==='spanish') return `La palabra "${word}" es útil.`;
  if (lang==='english') return `The word "${word}" is useful.`;
  if (lang==='russian') return `Слово «${word}» полезно.`;
  return '';
}

// Clean up translations to get dictionary/base forms
function cleanToBaseForm(translation, langCode) {
  let cleaned = translation.trim();
  
  if (langCode === 'de') {
    // German cleanup - but preserve articles and auxiliary verbs
    // Only remove articles when they appear to be incorrectly attached to verbs
    if (cleaned.match(/^(der|die|das)\s+(gehen|laufen|sprechen|machen)/i)) {
      // Remove articles from regular verbs but keep them for nouns and important verbs
      cleaned = cleaned.replace(/^(der|die|das)\s+/i, '');
    }
    
    // Fix common German translation issues and add proper articles
    const germanFixes = {
      'sehen': 'der Blick', // 'mirada' should be 'der Blick' not 'sehen'
      'klopfen': 'berühren', // 'tocar' should be 'berühren' not 'klopfen'
      'Kuss': 'küssen', // 'besar' should be 'küssen' not 'Kuss'
      'fallen': 'loslassen', // 'soltar' should be 'loslassen' not 'fallen'
      'Geruch': 'riechen', // 'oler' should be 'riechen' not 'Geruch'
      'Stand': 'stehen', // 'estar de pie' should be 'stehen' not 'Stand'
      'Fell': 'die Haut', // 'piel' should be 'die Haut' not 'Fell'
      'Haut': 'die Haut', // Add article to 'Haut'
      'Position': 'die Haltung', // 'postura' should be 'die Haltung' not 'Position'
      'Haltung': 'die Haltung', // Add article to 'Haltung'
      'Puppe': 'das Handgelenk', // 'muñeca' should be 'das Handgelenk' not 'Puppe'
      'Handgelenk': 'das Handgelenk', // Add article to 'Handgelenk'
      'Nacken': 'der Hals', // 'cuello' should be 'der Hals' not 'Nacken'
      'Hals': 'der Hals', // Add article to 'Hals'
      'Blick': 'der Blick', // Add article to 'Blick'
    };
    
    // Apply manual fixes for common mistranslations
    Object.keys(germanFixes).forEach(wrong => {
      if (cleaned === wrong) {
        cleaned = germanFixes[wrong];
      }
    });
    
    // Remove imperative markers and convert to infinitive, but preserve articles for nouns
    if (cleaned.match(/^(Hebe|Senken Sie|Bewegen Sie|Sei|Hab|Habe)\s+/i)) {
      cleaned = cleaned.replace(/^(Hebe|Senken Sie|Bewegen Sie|Sei|Hab|Habe)\s+/i, '');
      if (cleaned.includes('Hände') || cleaned.includes('Arme') || cleaned.includes('Kopf')) {
        if (translation.includes('Hebe')) cleaned = 'heben';
        else if (translation.includes('Senken')) cleaned = 'senken';
        else if (translation.includes('Bewegen')) cleaned = 'bewegen';
      }
    }
    
    // Add articles to common nouns that should have them
    if (!cleaned.match(/^(der|die|das)\s+/i)) {
      const nounsWithArticles = {
        'Muskel': 'der Muskel',
        'Knochen': 'der Knochen', 
        'Herz': 'das Herz',
        'Lunge': 'die Lunge',
        'Brust': 'die Brust',
        'Bauch': 'der Bauch',
        'Knie': 'das Knie',
        'Knöchel': 'der Knöchel',
        'Ellbogen': 'der Ellbogen',
        'Schultern': 'die Schultern',
        'Taille': 'die Taille',
        'Leben': 'das Leben',
        'Tod': 'der Tod',
        'Liebe': 'die Liebe',
        'Freundschaft': 'die Freundschaft'
      };
      
      if (nounsWithArticles[cleaned]) {
        cleaned = nounsWithArticles[cleaned];
      }
    }
    
  } else if (langCode === 'en') {
    // English cleanup - be more conservative about removing articles
    // Only remove "to" from infinitives when it's clearly an infinitive verb
    if (cleaned.match(/^to\s+(be|have|do|go|come|see|get|make|take|give|walk|jump|sit|stand|breathe|cry|smell|touch|kiss|hug)/i)) {
      cleaned = cleaned.replace(/^to\s+/i, '');
    }
    // Keep articles for nouns, only remove unnecessary "be" forms
    cleaned = cleaned.replace(/\s+(being|been)$/i, '');
    
  } else if (langCode === 'es') {
    // Spanish cleanup - preserve articles which indicate gender
    // Add articles to nouns that should have them
    if (!cleaned.match(/^(el|la|los|las)\s+/i)) {
      const spanishNounsWithArticles = {
        'músculo': 'el músculo',
        'hueso': 'el hueso',
        'piel': 'la piel',
        'corazón': 'el corazón',
        'vida': 'la vida',
        'muerte': 'la muerte'
      };
      
      if (spanishNounsWithArticles[cleaned]) {
        cleaned = spanishNounsWithArticles[cleaned];
      }
    }
    
  } else if (langCode === 'ru') {
    // Russian cleanup - remove common auxiliary words but be conservative
    cleaned = cleaned.replace(/\s+(являться)$/i, ''); // Remove "to be" equivalents but keep "быть"
  }
  
  // General cleanup for all languages
  cleaned = cleaned.replace(/\.$/, ''); // Remove trailing periods
  cleaned = cleaned.replace(/^["']|["']$/g, ''); // Remove quotes
  
  return cleaned;
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
          console.log(`Processing: ${w}`);
          
          // First translate Spanish word to German (our base language)
          let germanTranslation = w;
          try {
            const germanRes = await translate(w, { from: 'es', to: 'de' });
            germanTranslation = germanRes.text;
            
            // Post-process to get better dictionary forms
            germanTranslation = cleanToBaseForm(germanTranslation, 'de');
            console.log(`  German: ${germanTranslation}`);
          } catch(e) {
            console.warn('German translation failed for', w, e.message);
          }
          
          // Then translate Spanish word to target language
          let targetTranslation = w;
          if (lang.code !== 'spanish') {
            try {
              const targetRes = await translate(w, { from: 'es', to: lang.tcode });
              targetTranslation = targetRes.text;
              
              // Post-process to get better dictionary forms
              targetTranslation = cleanToBaseForm(targetTranslation, lang.tcode);
              console.log(`  ${lang.code}: ${targetTranslation}`);
            } catch(e) {
              console.warn('Target translation failed for', w, 'to', lang.code, e.message);
            }
          }
          
          entries.push({
            word: targetTranslation,           // Word in target language
            translation: germanTranslation,   // German translation
            example: exampleFor(lang.code, targetTranslation)
          });
          
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
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
