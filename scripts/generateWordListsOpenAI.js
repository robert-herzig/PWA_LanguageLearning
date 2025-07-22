const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Read OpenAI API key
const apiKey = fs.readFileSync(path.join(__dirname, '..', 'openai-key.txt'), 'utf8').trim();

const openai = new OpenAI({
  apiKey: apiKey
});

const levels = ['b1','b2'];
const srcTxt = {
  b1: 'c:\\Users\\robex\\Documents\\PWA_LanguageLearning\\data\\word_lists\\spanish_b1_words.txt',
  b2: 'c:\\Users\\robex\\Documents\\PWA_LanguageLearning\\data\\word_lists\\spanish_b2_words.txt'
};

const langs = [
  { code: 'spanish', tcode: 'es', name: 'Spanish' },
  { code: 'english', tcode: 'en', name: 'English' },
  { code: 'russian', tcode: 'ru', name: 'Russian' }
];

// Translate using OpenAI with multi-language approach for efficiency
async function translateWithOpenAI(spanishWord) {
  try {
    const prompt = `You are a professional language translator and dictionary expert. 

Spanish word/phrase: "${spanishWord}"

Please translate this into English, Russian, and German. For each language provide:
1. The translation in dictionary form (with proper articles for nouns: der/die/das for German, the for English, etc.)
2. A simple, natural example sentence using that language's word
3. The German translation of each example sentence

Rules:
- For nouns: include correct articles (der/die/das for German, the for English, el/la for Spanish)  
- For verbs: provide infinitive forms
- For adjectives: provide base/masculine forms
- Example sentences should be simple, natural, and educational (6-8 words)
- All German translations should use proper articles and natural phrasing

Respond in this EXACT JSON format:
{
  "spanish": {
    "word": "${spanishWord}",
    "translation": "German translation with article",
    "example": "Spanish example sentence",
    "example_german": "German translation of Spanish example"
  },
  "english": {
    "word": "English translation",
    "translation": "German translation with article", 
    "example": "English example sentence",
    "example_german": "German translation of English example"
  },
  "russian": {
    "word": "Russian translation",
    "translation": "German translation with article",
    "example": "Russian example sentence", 
    "example_german": "German translation of Russian example"
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective model
      messages: [
        {
          role: "system", 
          content: "You are a professional translator specializing in dictionary forms and educational example sentences. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent translations
      max_tokens: 600 // Increased for multi-language response
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error(`OpenAI translation failed for "${spanishWord}":`, error.message);
    // Fallback for all languages
    return {
      spanish: {
        word: spanishWord,
        translation: spanishWord,
        example: `La palabra "${spanishWord}" es útil.`,
        example_german: `Das Wort "${spanishWord}" ist nützlich.`
      },
      english: {
        word: spanishWord,
        translation: spanishWord,
        example: `The word "${spanishWord}" is useful.`,
        example_german: `Das Wort "${spanishWord}" ist nützlich.`
      },
      russian: {
        word: spanishWord,
        translation: spanishWord,
        example: `Слово «${spanishWord}» полезно.`,
        example_german: `Das Wort "${spanishWord}" ist nützlich.`
      }
    };
  }
}

// Check if a vocabulary file already exists and get existing words
function getExistingWords(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return new Set(content.words.map(w => w.word)); // Return set of existing words
    }
  } catch (error) {
    console.warn(`Warning: Could not read existing file ${filePath}:`, error.message);
  }
  return new Set(); // Return empty set if file doesn't exist or has issues
}

// Merge new entries with existing ones, avoiding duplicates
function mergeEntries(existingFilePath, newEntries) {
  let existingEntries = [];
  
  try {
    if (fs.existsSync(existingFilePath)) {
      const content = JSON.parse(fs.readFileSync(existingFilePath, 'utf8'));
      existingEntries = content.words || [];
    }
  } catch (error) {
    console.warn(`Warning: Could not read existing file ${existingFilePath}:`, error.message);
  }
  
  // Create a map of existing words to avoid duplicates
  const existingWordsMap = new Map();
  existingEntries.forEach(entry => {
    existingWordsMap.set(entry.word, entry);
  });
  
  // Add new entries, replacing any existing duplicates
  newEntries.forEach(entry => {
    existingWordsMap.set(entry.word, entry);
  });
  
  return Array.from(existingWordsMap.values());
}

function parseVocab(text) {
  const lines = text.split('\n').map(l=>l.trim());
  let topic = null;
  const out = {};
  for (let l of lines) {
    if (l.startsWith('##')) {
      const key = l.replace(/##\\s*\\d*\\.?\\s*/,'').split(':')[1]||l.replace(/##\\s*/,'');
      topic = key.trim().toLowerCase().replace(/\\s+/g,'_');
      out[topic] = [];
      continue;
    }
    if (!l || l.startsWith('#')||!topic) continue;
    out[topic].push(l);
  }
  return out;
}

(async () => {
  console.log('🚀 Starting vocabulary translation with OpenAI...');
  
  // First, count total words to process for progress tracking
  let totalWords = 0;
  let totalTopics = 0;
  let alreadyProcessed = 0;
  const levelStats = {};
  
  for (let lvl of levels) {
    const topicsMap = parseVocab(fs.readFileSync(srcTxt[lvl],'utf8'));
    const wordCount = Object.values(topicsMap).reduce((sum, words) => sum + words.length, 0);
    levelStats[lvl] = {
      topics: Object.keys(topicsMap).length,
      words: wordCount
    };
    totalWords += wordCount;
    totalTopics += Object.keys(topicsMap).length;
    
    // Count already processed words
    for (let lang of langs) {
      const baseDir = path.join(__dirname,'..','data','word_lists',lang.code,lvl);
      for (let [key] of Object.entries(topicsMap)) {
        const outputFilePath = path.join(baseDir, `${key}.json`);
        const existingWords = getExistingWords(outputFilePath);
        alreadyProcessed += existingWords.size;
      }
    }
  }
  
  const totalProcessingItems = totalWords * langs.length; // Each word processed for each language
  const remainingItems = totalProcessingItems - alreadyProcessed;
  let processedItems = alreadyProcessed; // Start with already processed count
  const startTime = Date.now();
  
  console.log(`\n📊 Processing Summary:`);
  console.log(`   • Languages: ${langs.length} (${langs.map(l => l.name).join(', ')})`);
  console.log(`   • Levels: ${levels.length} (${levels.join(', ').toUpperCase()})`);
  console.log(`   • Topics: ${totalTopics}`);
  console.log(`   • Words: ${totalWords}`);
  console.log(`   • Total items to process: ${totalProcessingItems}`);
  console.log(`   • Already processed: ${alreadyProcessed} (${((alreadyProcessed/totalProcessingItems)*100).toFixed(1)}%)`);
  console.log(`   • Remaining to process: ${remainingItems}`);
  console.log(`\n⏱️  Starting translation process...\n`);
  
  for (let lvl of levels) {
    console.log(`\n📚 Processing level: ${lvl.toUpperCase()} (${levelStats[lvl].topics} topics, ${levelStats[lvl].words} words)`);
    const topicsMap = parseVocab(fs.readFileSync(srcTxt[lvl],'utf8'));
    
    for (let langIndex = 0; langIndex < langs.length; langIndex++) {
      const lang = langs[langIndex];
      const langProgress = `${langIndex + 1}/${langs.length}`;
      console.log(`\n🌍 Processing language: ${lang.name} (${langProgress})`);
      const baseDir = path.join(__dirname,'..','data','word_lists',lang.code,lvl);
      fs.mkdirSync(baseDir,{ recursive:true });
      
      // write index.json
      fs.writeFileSync(
        path.join(baseDir,'index.json'),
        JSON.stringify(Object.keys(topicsMap),null,2)
      );
      
      // for each topic
      const topicKeys = Object.keys(topicsMap);
      for (let topicIndex = 0; topicIndex < topicKeys.length; topicIndex++) {
        const key = topicKeys[topicIndex];
        const words = topicsMap[key];
        const topicProgress = `${topicIndex + 1}/${topicKeys.length}`;
        
        console.log(`\n📖 Topic: ${key} (${topicProgress}) - ${words.length} words`);
        
        // Check for existing file and get already processed words
        const outputFilePath = path.join(baseDir, `${key}.json`);
        const existingWords = getExistingWords(outputFilePath);
        
        // Filter out words that already exist
        const wordsToProcess = words.filter(w => {
          // For Spanish, check if Spanish word exists; for others, we need to translate first to check
          if (lang.code === 'spanish') {
            return !existingWords.has(w);
          }
          // For non-Spanish languages, we can't easily check without translating first
          // So we'll process and merge later
          return true;
        });
        
        let skippedCount = 0;
        if (lang.code === 'spanish') {
          skippedCount = words.length - wordsToProcess.length;
          if (skippedCount > 0) {
            console.log(`   ⏭️  Skipping ${skippedCount} already processed words`);
          }
        }
        
        const entries = [];
        
        for (let wordIndex = 0; wordIndex < wordsToProcess.length; wordIndex++) {
          const w = wordsToProcess[wordIndex];
          const wordProgress = `${wordIndex + 1}/${wordsToProcess.length}`;
          
          // Calculate overall progress (account for skipped words in Spanish)
          processedItems++;
          if (lang.code === 'spanish' && skippedCount > 0) {
            // Add skipped words to processed count for accurate progress
            processedItems += skippedCount;
            skippedCount = 0; // Only add once
          }
          
          const overallProgress = ((processedItems / totalProcessingItems) * 100).toFixed(1);
          const elapsed = Date.now() - startTime;
          const avgTimePerItem = elapsed / processedItems;
          const remainingItems = totalProcessingItems - processedItems;
          const estimatedTimeRemaining = (remainingItems * avgTimePerItem) / 1000; // seconds
          
          const formatTime = (seconds) => {
            if (seconds < 60) return `${seconds.toFixed(0)}s`;
            if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
            return `${(seconds / 3600).toFixed(1)}h`;
          };
          
          console.log(`  Processing [${overallProgress}%]: ${w} (${wordProgress}) - ETA: ${formatTime(estimatedTimeRemaining)}`);
          
          const isTargetSpanish = lang.code === 'spanish';
          const translation = await translateWithOpenAI(w, lang.name, isTargetSpanish);
          
          // For non-Spanish languages, check if this translated word already exists
          if (!isTargetSpanish && existingWords.has(translation[lang.code])) {
            console.log(`    ⏭️  Skipping already existing translation: ${translation[lang.code]}`);
            continue;
          }
          
          entries.push({
            word: translation[lang.code],                    // Word in target language
            translation: translation.german,                 // German translation (base language)
            example: translation[`example_${lang.code}`],    // Example in target language
            example_german: translation.example_german       // German translation of example
          });
          
          console.log(`    → ${lang.code}: ${translation[lang.code]}`);
          console.log(`    → German: ${translation.german}`);
          console.log(`    → Example: ${translation[`example_${lang.code}`]}`);
          console.log(`    → Example (DE): ${translation.example_german}`);
          
          // Rate limiting - OpenAI allows more requests than Google Translate
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // Merge with existing entries and write file
        const finalEntries = mergeEntries(outputFilePath, entries);
        fs.writeFileSync(
          outputFilePath,
          JSON.stringify({ topic: key, words: finalEntries }, null, 2)
        );
        
        const newCount = entries.length;
        const totalCount = finalEntries.length;
        const existingCount = totalCount - newCount;
        
        console.log(`  ✅ Written ${lang.code}/${lvl}/${key}.json (${newCount} new + ${existingCount} existing = ${totalCount} total)`);
      }
    }
  }
  
  const totalTime = (Date.now() - startTime) / 1000;
  console.log(`\n🎉 All word-lists generated successfully!`);
  console.log(`📊 Final Stats:`);
  console.log(`   • Total items processed: ${totalProcessingItems}`);
  console.log(`   • Total time: ${totalTime < 60 ? totalTime.toFixed(1) + 's' : (totalTime / 60).toFixed(1) + 'm'}`);
  console.log(`   • Average time per item: ${(totalTime / totalProcessingItems).toFixed(2)}s`);
})().catch(console.error);
