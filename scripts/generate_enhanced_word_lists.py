#!/usr/bin/env python3
"""
Enhanced script to generate topical word lists with better translations and examples.
This version includes comprehensive translation dictionaries and contextual examples.
"""

import os
import json
import re
from pathlib import Path

# Configuration
LEVELS = ['b1', 'b2']
SRC_TXT = {
    'b1': 'data/word_lists/spanish_b1_words.txt',
    'b2': 'data/word_lists/spanish_b2_words.txt'
}
LANGS = [
    {'code': 'spanish', 'tcode': 'es'},
    {'code': 'english', 'tcode': 'en'},
    {'code': 'russian', 'tcode': 'ru'}
]

def get_contextual_example(lang, word, topic):
    """Generate contextual example sentences based on topic and language."""
    
    # Topic-specific examples for English
    english_examples = {
        'alimentación': {
            'healthy food': 'I try to eat healthy food every day.',
            'vegetables': 'Fresh vegetables are essential for good nutrition.',
            'protein': 'Fish is an excellent source of protein.',
            'vitamins': 'Fruits provide many important vitamins.',
            'recipe': 'This recipe is easy to follow.',
            'cooking': 'I enjoy cooking traditional dishes.',
            'restaurant': 'We went to a nice restaurant yesterday.'
        },
        'trabajo': {
            'work': 'I work in an office downtown.',
            'job': 'She found a new job last month.',
            'salary': 'The salary is competitive for this position.',
            'interview': 'I have a job interview tomorrow.',
            'experience': 'Previous experience is required.',
            'contract': 'Please sign the employment contract.'
        },
        'educación': {
            'study': 'I study Spanish three times a week.',
            'school': 'The school is very well equipped.',
            'student': 'She is an excellent student.',
            'teacher': 'Our teacher is very patient.',
            'exam': 'The final exam is next week.',
            'university': 'He graduated from university last year.'
        },
        'viajes,_alojamiento_y_transporte': {
            'travel': 'I love to travel to new countries.',
            'hotel': 'We booked a hotel near the beach.',
            'ticket': 'I bought a train ticket online.',
            'passport': 'Don\'t forget your passport!',
            'luggage': 'My luggage is quite heavy.',
            'flight': 'The flight was delayed by two hours.'
        }
    }
    
    # Topic-specific examples for Russian
    russian_examples = {
        'alimentación': {
            'здоровая пища': 'Я стараюсь есть здоровую пищу каждый день.',
            'овощи': 'Свежие овощи необходимы для хорошего питания.',
            'белок': 'Рыба - отличный источник белка.',
            'витамины': 'Фрукты содержат много важных витаминов.',
            'рецепт': 'Этому рецепту легко следовать.',
            'готовка': 'Мне нравится готовить традиционные блюда.',
            'ресторан': 'Вчера мы ходили в хороший ресторан.'
        },
        'trabajo': {
            'работа': 'Я работаю в офисе в центре города.',
            'работа': 'Она нашла новую работу в прошлом месяце.',
            'зарплата': 'Зарплата конкурентоспособная для этой должности.',
            'собеседование': 'У меня завтра собеседование.',
            'опыт': 'Требуется предыдущий опыт работы.',
            'контракт': 'Пожалуйста, подпишите трудовой договор.'
        },
        'educación': {
            'изучать': 'Я изучаю испанский три раза в неделю.',
            'школа': 'Школа очень хорошо оборудована.',
            'студент': 'Она отличная студентка.',
            'учитель': 'Наш учитель очень терпеливый.',
            'экзамен': 'Выпускной экзамен на следующей неделе.',
            'университет': 'Он окончил университет в прошлом году.'
        }
    }
    
    # Default examples
    if lang == 'spanish':
        return f'La palabra "{word}" es muy útil en el contexto de {topic.replace("_", " ")}.'
    elif lang == 'english':
        # Try to find topic-specific example
        if topic in english_examples and word.lower() in english_examples[topic]:
            return english_examples[topic][word.lower()]
        return f'The word "{word}" is useful in the context of {topic.replace("_", " ")}.'
    elif lang == 'russian':
        # Try to find topic-specific example
        if topic in russian_examples and word.lower() in russian_examples[topic]:
            return russian_examples[topic][word.lower()]
        return f'Слово «{word}» полезно в контексте {topic.replace("_", " ")}.'
    
    return f'Example: {word}'

def get_comprehensive_translations():
    """Return comprehensive translation dictionaries."""
    
    translations = {
        'en': {
            # Physical dimension
            'músculo': 'muscle', 'hueso': 'bone', 'piel': 'skin', 'corazón': 'heart',
            'pulmón': 'lung', 'cuello': 'neck', 'hombros': 'shoulders', 'pecho': 'chest',
            'cintura': 'waist', 'barriga': 'belly', 'rodilla': 'knee', 'tobillo': 'ankle',
            'codo': 'elbow', 'muñeca': 'wrist', 'frente': 'forehead', 'mejilla': 'cheek',
            'barbilla': 'chin', 'ceja': 'eyebrow', 'pestaña': 'eyelash',
            
            # Physical states
            'ciego': 'blind', 'sordo': 'deaf', 'mudo': 'mute', 'saliva': 'saliva',
            'lágrima': 'tear', 'sudor': 'sweat', 'gesto': 'gesture',
            
            # Character traits
            'optimismo': 'optimism', 'pesimismo': 'pessimism', 'tranquilidad': 'tranquility',
            'paciencia': 'patience', 'sincero': 'sincere', 'paciente': 'patient',
            'introvertido': 'introverted', 'vago': 'lazy', 'travieso': 'mischievous',
            'seguro': 'confident', 'conservador': 'conservative', 'hablador': 'talkative',
            'arrogante': 'arrogant',
            
            # Emotions
            'sentimiento': 'feeling', 'amor': 'love', 'amistad': 'friendship',
            'alegría': 'joy', 'tristeza': 'sadness', 'miedo': 'fear', 'ira': 'anger',
            
            # Food and nutrition
            'alimentación sana': 'healthy eating', 'alimentación equilibrada': 'balanced diet',
            'producto natural': 'natural product', 'alimento pesado': 'heavy food',
            'alimento ligero': 'light food', 'calorías': 'calories', 'vitaminas': 'vitamins',
            'proteínas': 'proteins', 'fibra': 'fiber', 'hierro': 'iron',
            'marisco': 'seafood', 'especias': 'spices', 'embutido': 'cold cuts',
            'lomo': 'loin', 'chorizo': 'chorizo', 'berenjena': 'eggplant',
            'calabacín': 'zucchini', 'espinacas': 'spinach', 'guisantes': 'peas',
            'lentejas': 'lentils', 'garbanzos': 'chickpeas', 'bizcocho': 'sponge cake',
            'cereza': 'cherry', 'piña': 'pineapple', 'kiwi': 'kiwi',
            
            # Beverages
            'infusión': 'herbal tea', 'vino joven': 'young wine', 'reserva': 'reserve wine',
            'refresco': 'soft drink', 'licor': 'liqueur', 'cóctel': 'cocktail',
            
            # Education
            'universidad': 'university', 'colegio': 'school', 'estudiante': 'student',
            'profesor': 'teacher', 'examen': 'exam', 'nota': 'grade', 'curso': 'course',
            'asignatura': 'subject', 'matrícula': 'enrollment', 'beca': 'scholarship',
            'bachillerato': 'high school diploma', 'carrera': 'degree', 'máster': 'master\'s',
            'doctorado': 'doctorate',
            
            # Work
            'trabajo': 'work', 'empleo': 'employment', 'oficina': 'office',
            'empleado': 'employee', 'jefe': 'boss', 'sueldo': 'salary',
            'contrato': 'contract', 'entrevista': 'interview', 'currículum': 'resume',
            'horario': 'schedule', 'vacaciones': 'vacation',
            
            # Travel
            'viaje': 'trip', 'hotel': 'hotel', 'billete': 'ticket', 'pasaporte': 'passport',
            'equipaje': 'luggage', 'vuelo': 'flight', 'aeropuerto': 'airport',
            'estación': 'station', 'turismo': 'tourism',
            
            # Common verbs
            'caminar': 'to walk', 'saltar': 'to jump', 'respirar': 'to breathe',
            'llorar': 'to cry', 'besar': 'to kiss', 'abrazar': 'to hug',
            'freír': 'to fry', 'hervir': 'to boil', 'cocer': 'to cook',
            'estudiar': 'to study', 'aprender': 'to learn', 'enseñar': 'to teach',
            'trabajar': 'to work', 'viajar': 'to travel', 'cocinar': 'to cook'
        },
        
        'ru': {
            # Physical dimension
            'músculo': 'мышца', 'hueso': 'кость', 'piel': 'кожа', 'corazón': 'сердце',
            'pulmón': 'лёгкое', 'cuello': 'шея', 'hombros': 'плечи', 'pecho': 'грудь',
            'cintura': 'талия', 'barriga': 'живот', 'rodilla': 'колено', 'tobillo': 'лодыжка',
            'codo': 'локоть', 'muñeca': 'запястье', 'frente': 'лоб', 'mejilla': 'щека',
            'barbilla': 'подбородок', 'ceja': 'бровь', 'pestaña': 'ресница',
            
            # Physical states
            'ciego': 'слепой', 'sordo': 'глухой', 'mudo': 'немой', 'saliva': 'слюна',
            'lágrima': 'слеза', 'sudor': 'пот', 'gesto': 'жест',
            
            # Character traits
            'optimismo': 'оптимизм', 'pesimismo': 'пессимизм', 'tranquilidad': 'спокойствие',
            'paciencia': 'терпение', 'sincero': 'искренний', 'paciente': 'терпеливый',
            'introvertido': 'интроверт', 'vago': 'ленивый', 'travieso': 'озорной',
            'seguro': 'уверенный', 'conservador': 'консервативный', 'hablador': 'болтливый',
            'arrogante': 'высокомерный',
            
            # Emotions
            'sentimiento': 'чувство', 'amor': 'любовь', 'amistad': 'дружба',
            'alegría': 'радость', 'tristeza': 'грусть', 'miedo': 'страх', 'ira': 'гнев',
            
            # Food and nutrition
            'alimentación sana': 'здоровое питание', 'alimentación equilibrada': 'сбалансированное питание',
            'producto natural': 'натуральный продукт', 'alimento pesado': 'тяжёлая пища',
            'alimento ligero': 'лёгкая пища', 'calorías': 'калории', 'vitaminas': 'витамины',
            'proteínas': 'белки', 'fibra': 'клетчатка', 'hierro': 'железо',
            'marisco': 'морепродукты', 'especias': 'специи', 'embutido': 'колбасные изделия',
            'lomo': 'корейка', 'chorizo': 'чоризо', 'berenjena': 'баклажан',
            'calabacín': 'кабачок', 'espinacas': 'шпинат', 'guisantes': 'горошек',
            'lentejas': 'чечевица', 'garbanzos': 'нут', 'bizcocho': 'бисквит',
            'cereza': 'вишня', 'piña': 'ананас', 'kiwi': 'киви',
            
            # Beverages
            'infusión': 'травяной чай', 'vino joven': 'молодое вино', 'reserva': 'выдержанное вино',
            'refresco': 'прохладительный напиток', 'licor': 'ликёр', 'cóctel': 'коктейль',
            
            # Education
            'universidad': 'университет', 'colegio': 'школа', 'estudiante': 'студент',
            'profesor': 'преподаватель', 'examen': 'экзамен', 'nota': 'оценка', 'curso': 'курс',
            'asignatura': 'предмет', 'matrícula': 'зачисление', 'beca': 'стипендия',
            'bachillerato': 'диплом об окончании школы', 'carrera': 'специальность', 'máster': 'магистратура',
            'doctorado': 'докторантура',
            
            # Work
            'trabajo': 'работа', 'empleo': 'трудоустройство', 'oficina': 'офис',
            'empleado': 'сотрудник', 'jefe': 'начальник', 'sueldo': 'зарплата',
            'contrato': 'контракт', 'entrevista': 'собеседование', 'currículum': 'резюме',
            'horario': 'расписание', 'vacaciones': 'отпуск',
            
            # Travel
            'viaje': 'путешествие', 'hotel': 'отель', 'billete': 'билет', 'pasaporte': 'паспорт',
            'equipaje': 'багаж', 'vuelo': 'рейс', 'aeropuerto': 'аэропорт',
            'estación': 'станция', 'turismo': 'туризм',
            
            # Common verbs
            'caminar': 'ходить', 'saltar': 'прыгать', 'respirar': 'дышать',
            'llorar': 'плакать', 'besar': 'целовать', 'abrazar': 'обнимать',
            'freír': 'жарить', 'hervir': 'кипятить', 'cocer': 'варить',
            'estudiar': 'изучать', 'aprender': 'учиться', 'enseñar': 'преподавать',
            'trabajar': 'работать', 'viajar': 'путешествовать', 'cocinar': 'готовить'
        }
    }
    
    return translations

def translate_word(word, target_lang):
    """Enhanced translation function with comprehensive dictionary."""
    translations = get_comprehensive_translations()
    
    # Clean the word (remove extra spaces, convert to lowercase for lookup)
    clean_word = word.strip().lower()
    
    if target_lang in translations and clean_word in translations[target_lang]:
        return translations[target_lang][clean_word]
    else:
        # If no direct translation found, return the original word
        return word

def parse_txt(text):
    """
    Parse a vocabulary text file into a dictionary of topics and words.
    Returns: {topic_key: [word1, word2, ...]}
    """
    lines = [line.strip() for line in text.split('\n')]
    topic = None
    result = {}
    
    for line in lines:
        if line.startswith('##'):
            # Extract topic name after ##, handling numbered sections
            key_match = re.sub(r'##\s*\d*\.?\s*', '', line)
            if ':' in key_match:
                key = key_match.split(':')[1]
            else:
                key = key_match.replace('##', '').strip()
            
            topic = key.strip().lower().replace(' ', '_')
            result[topic] = []
            continue
        
        # Skip empty lines, comments, or if no topic is set
        if not line or line.startswith('#') or topic is None:
            continue
            
        result[topic].append(line)
    
    return result

def main():
    """Main function to generate all word lists with enhanced translations."""
    base_dir = Path('data/word_lists')
    
    for level in LEVELS:
        src_file = Path(SRC_TXT[level])
        
        if not src_file.exists():
            print(f"Warning: Source file {src_file} not found, skipping {level}")
            continue
            
        print(f"Processing {level.upper()} level vocabulary...")
        
        # Parse the source text file
        with open(src_file, 'r', encoding='utf-8') as f:
            text = f.read()
        
        topics_map = parse_txt(text)
        print(f"Found {len(topics_map)} topics for {level}")
        
        for lang in LANGS:
            lang_dir = base_dir / lang['code'] / level
            lang_dir.mkdir(parents=True, exist_ok=True)
            
            # Write index.json with list of available topics
            index_file = lang_dir / 'index.json'
            with open(index_file, 'w', encoding='utf-8') as f:
                json.dump(list(topics_map.keys()), f, indent=2, ensure_ascii=False)
            
            # Process each topic
            for topic_key, words in topics_map.items():
                entries = []
                
                for word in words:
                    if lang['code'] == 'spanish':
                        translation = word  # Spanish is the source language
                    else:
                        translation = translate_word(word, lang['tcode'])
                    
                    # Generate contextual example
                    example = get_contextual_example(lang['code'], translation, topic_key)
                    
                    entries.append({
                        'word': word,
                        'translation': translation,
                        'example': example
                    })
                
                # Write topic file
                topic_file = lang_dir / f'{topic_key}.json'
                topic_data = {
                    'topic': topic_key.replace('_', ' ').title(),
                    'words': entries
                }
                
                with open(topic_file, 'w', encoding='utf-8') as f:
                    json.dump(topic_data, f, indent=2, ensure_ascii=False)
                
                print(f"Written {lang['code']}/{level}/{topic_key}.json ({len(entries)} items)")
    
    print("✅ All enhanced word-lists generated with better translations and examples.")

if __name__ == '__main__':
    main()
