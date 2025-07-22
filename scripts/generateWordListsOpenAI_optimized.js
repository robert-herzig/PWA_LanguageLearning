const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// Initialize OpenAI with API key
const apiKey = fs.readFileSync(path.join(__dirname, '..', 'openai-key.txt'), 'utf8').trim();
const openai = new OpenAI({
  apiKey: apiKey
});

// Configuration
const levels = ['b1', 'b2'];
const langs = [
  { code: 'spanish', tcode: 'es', name: 'Spanish' },
  { code: 'english', tcode: 'en', name: 'English' },
  { code: 'russian', tcode: 'ru', name: 'Russian' }
];

const srcTxt = {
  b1: path.join(__dirname, '..', 'data', 'word_lists', 'spanish_b1_words.txt'),
  b2: path.join(__dirname, '..', 'data', 'word_lists', 'spanish_b2_words.txt')
};

// Multi-language translation using OpenAI (3x more efficient!)
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

// Helper function to get existing words from a file
function getExistingWords(filePath) {
  const existingWords = new Set();
  if (fs.existsSync(filePath)) {
    try {
      const existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      existingData.forEach(entry => existingWords.add(entry.word));
    } catch (error) {
      console.log(`⚠️  Warning: Could not read ${filePath}: ${error.message}`);
    }
  }
  return existingWords;
}

// Helper function to merge new entries with existing ones
function mergeEntries(existingEntries, newEntries) {
  const existingWordsMap = new Map();
  
  // Add existing entries to map
  existingEntries.forEach(entry => {
    existingWordsMap.set(entry.word, entry);
  });
  
  // Add new entries, replacing any existing duplicates
  newEntries.forEach(entry => {
    existingWordsMap.set(entry.word, entry);
  });
  
  return Array.from(existingWordsMap.values());
}

// Parse vocabulary text file
function parseVocab(text) {
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
  console.log('🚀 Starting optimized multi-language vocabulary translation with OpenAI...');
  
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
    
  // Count already processed words (using Spanish as reference since it's our source)
  for (let topic of Object.keys(topicsMap)) {
    // Check if Spanish file exists and count processed words
    const spanishFilePath = path.join(__dirname, '..', 'data', 'word_lists', 'spanish', lvl, `${topic}.json`);
    if (fs.existsSync(spanishFilePath)) {
      try {
        const existingData = JSON.parse(fs.readFileSync(spanishFilePath, 'utf8'));
        alreadyProcessed += existingData.length;
      } catch (error) {
        // File exists but couldn't read - ignore for counting
        console.log(`⚠️  Warning: Could not read ${spanishFilePath}: ${error.message}`);
      }
    }
  }
  }
  
  const totalProcessingItems = totalWords; // Each Spanish word generates 3 language files
  const remainingItems = totalWords - alreadyProcessed;
  const startTime = Date.now();
  let processedItems = alreadyProcessed;
  
  console.log(`\n📊 Processing Summary:`);
  console.log(`   • Languages: ${langs.length} (${langs.map(l => l.name).join(', ')})`);
  console.log(`   • Levels: ${levels.length} (${levels.join(', ').toUpperCase()})`);
  console.log(`   • Topics: ${totalTopics}`);
  console.log(`   • Words: ${totalWords}`);
  console.log(`   • Already processed: ${alreadyProcessed} (${((alreadyProcessed/totalProcessingItems)*100).toFixed(1)}%)`);
  console.log(`   • Remaining to process: ${remainingItems}`);
  console.log(`\n💡 Optimization: Processing all 3 languages simultaneously (3x more efficient!)`);
  console.log(`\n⏱️  Starting translation process...\n`);
  
  for (let lvl of levels) {
    console.log(`\n📚 Processing level: ${lvl.toUpperCase()} (${levelStats[lvl].topics} topics, ${levelStats[lvl].words} words)`);
    const topicsMap = parseVocab(fs.readFileSync(srcTxt[lvl],'utf8'));
    
    // Process each topic once for all languages simultaneously
    const topicKeys = Object.keys(topicsMap);
    for (let topicIndex = 0; topicIndex < topicKeys.length; topicIndex++) {
      const key = topicKeys[topicIndex];
      const words = topicsMap[key];
      const topicProgress = `${topicIndex + 1}/${topicKeys.length}`;
      
      console.log(`\n📖 Topic: ${key} (${topicProgress}) - ${words.length} words`);
      
      // Prepare data for all languages
      const languageData = {};
      const existingWordSets = {};
      
      // Check existing files for all languages and create directories
      for (let lang of langs) {
        const baseDir = path.join(__dirname, '..', 'data', 'word_lists', lang.code, lvl);
        fs.mkdirSync(baseDir, { recursive: true });
        
        // Write index.json for each language
        fs.writeFileSync(
          path.join(baseDir, 'index.json'),
          JSON.stringify(Object.keys(topicsMap), null, 2)
        );
        
        const outputFilePath = path.join(baseDir, `${key}.json`);
        existingWordSets[lang.code] = getExistingWords(outputFilePath);
        languageData[lang.code] = [];
      }
      
      // Filter words that are already processed in Spanish (our source)
      const spanishExistingWords = existingWordSets['spanish'];
      const wordsToProcess = words.filter(w => !spanishExistingWords.has(w));
      
      const skippedCount = words.length - wordsToProcess.length;
      if (skippedCount > 0) {
        console.log(`   ⏭️  Skipping ${skippedCount} already processed words`);
        processedItems += skippedCount; // Only count once since Spanish is our reference
      }
      
      // Process each word once for all languages
      for (let wordIndex = 0; wordIndex < wordsToProcess.length; wordIndex++) {
        const w = wordsToProcess[wordIndex];
        const wordProgress = `${wordIndex + 1}/${wordsToProcess.length}`;
        
        const overallProgress = ((processedItems / totalProcessingItems) * 100).toFixed(1);
        const elapsed = Date.now() - startTime;
        const avgTimePerItem = elapsed / Math.max(processedItems, 1);
        const remainingItems = totalProcessingItems - processedItems;
        const estimatedTimeRemaining = (remainingItems * avgTimePerItem) / 1000;
        
        const formatTime = (seconds) => {
          if (seconds < 60) return `${seconds.toFixed(0)}s`;
          if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
          return `${(seconds / 3600).toFixed(1)}h`;
        };
        
        console.log(`  Processing [${overallProgress}%]: ${w} (${wordProgress}) - ETA: ${formatTime(estimatedTimeRemaining)}`);
        
        // Single API call for all languages! 🚀
        const multiLangTranslation = await translateWithOpenAI(w);
        
        if (multiLangTranslation) {
          // Process each language result
          for (let lang of langs) {
            const langCode = lang.code;
            const langData = multiLangTranslation[langCode];
            
            if (langData) {
              // Check for duplicates in non-Spanish languages
              if (langCode !== 'spanish' && existingWordSets[langCode].has(langData.word)) {
                console.log(`    ⏭️  ${langCode}: Skipping duplicate "${langData.word}"`);
                continue;
              }
              
              languageData[langCode].push({
                word: langData.word,
                translation: langData.translation,
                example: langData.example,
                example_german: langData.example_german
              });
              
              console.log(`    → ${langCode}: ${langData.word}`);
              console.log(`    → German: ${langData.translation}`);
              console.log(`    → Example: ${langData.example}`);
              console.log(`    → Example (DE): ${langData.example_german}`);
            }
          }
          
          processedItems++; // Count each Spanish word once
          
          // Rate limiting - slightly longer delay since we're processing more in one call
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          console.log(`    ❌ Translation failed for: ${w}`);
          processedItems++; // Still count as processed
        }
      }
      
      // Write files for all languages
      for (let lang of langs) {
        const baseDir = path.join(__dirname, '..', 'data', 'word_lists', lang.code, lvl);
        const outputFilePath = path.join(baseDir, `${key}.json`);
        
        // Merge with existing entries
        const existingEntries = [];
        if (fs.existsSync(outputFilePath)) {
          try {
            const existingData = JSON.parse(fs.readFileSync(outputFilePath, 'utf8'));
            existingEntries.push(...existingData);
          } catch (error) {
            console.log(`    ⚠️  Warning: Could not read existing ${lang.code} file: ${error.message}`);
          }
        }
        
        const mergedEntries = mergeEntries(existingEntries, languageData[lang.code]);
        fs.writeFileSync(outputFilePath, JSON.stringify(mergedEntries, null, 2));
        
        const newCount = languageData[lang.code].length;
        const existingCount = existingEntries.length;
        const totalCount = mergedEntries.length;
        
        console.log(`  ✅ Written ${lang.code}/${lvl}/${key}.json (${newCount} new + ${existingCount} existing = ${totalCount} total)`);
      }
    }
  }
  
  const totalTime = (Date.now() - startTime) / 1000;
  console.log(`\n🎉 Optimized multi-language translation complete!`);
  console.log(`📊 Final Stats:`);
  console.log(`   • Total words processed: ${totalProcessingItems}`);
  console.log(`   • Total time: ${totalTime < 60 ? totalTime.toFixed(1) + 's' : (totalTime / 60).toFixed(1) + 'm'}`);
  console.log(`   • Average time per word: ${(totalTime / totalProcessingItems).toFixed(2)}s`);
  console.log(`   • API calls saved: ~${(totalProcessingItems * 2).toLocaleString()} (3x more efficient!) 💰`);
})().catch(console.error);
