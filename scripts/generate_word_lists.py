#!/usr/bin/env python3
"""
Generate topical word lists from Spanish B1/B2 vocabulary files.
Converts the vocabulary into JSON files organized by topic and language.
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

def example_for(lang, word):
    """Generate simple example sentences for each language."""
    if lang == 'spanish':
        return f'La palabra "{word}" es útil.'
    elif lang == 'english':
        return f'The word "{word}" is useful.'
    elif lang == 'russian':
        return f'Слово «{word}» полезно.'
    return ''

def get_topic_translations():
    """Return Spanish to English topic name translations."""
    return {
        'dimensión_física': 'physical_dimension',
        'dimensión_perceptiva_y_anímica': 'perception_and_emotions',
        'identidad_personal': 'personal_identity',
        'relaciones_personales': 'personal_relationships',
        'alimentación': 'food_and_nutrition',
        'educación': 'education',
        'trabajo': 'work',
        'ocio': 'leisure',
        'información_y_medios_de_comunicación': 'information_and_media',
        'vivienda': 'housing',
        'servicios': 'services',
        'compras,_tiendas_y_establecimientos': 'shopping_and_stores',
        'salud_e_higiene': 'health_and_hygiene',
        'viajes,_alojamiento_y_transporte': 'travel_and_transport',
        'economía_e_industria': 'economy_and_industry',
        'ciencia_y_tecnología': 'science_and_technology',
        'gobierno,_política_y_sociedad': 'government_and_society',
        'actividades_artísticas': 'arts_and_culture',
        'religión_y_filosofía': 'religion_and_philosophy',
        'geografía_y_naturaleza': 'geography_and_nature'
    }

def get_english_topic_names():
    """Return English display names for topics."""
    return {
        'physical_dimension': 'Physical Dimension',
        'perception_and_emotions': 'Perception and Emotions',
        'personal_identity': 'Personal Identity',
        'personal_relationships': 'Personal Relationships',
        'food_and_nutrition': 'Food and Nutrition',
        'education': 'Education',
        'work': 'Work',
        'leisure': 'Leisure',
        'information_and_media': 'Information and Media',
        'housing': 'Housing',
        'services': 'Services',
        'shopping_and_stores': 'Shopping and Stores',
        'health_and_hygiene': 'Health and Hygiene',
        'travel_and_transport': 'Travel and Transport',
        'economy_and_industry': 'Economy and Industry',
        'science_and_technology': 'Science and Technology',
        'government_and_society': 'Government and Society',
        'arts_and_culture': 'Arts and Culture',
        'religion_and_philosophy': 'Religion and Philosophy',
        'geography_and_nature': 'Geography and Nature'
    }

def parse_txt(text):
    """
    Parse a vocabulary text file into a dictionary of topics and words.
    Returns: {topic_key: [word1, word2, ...]}
    """
    lines = [line.strip() for line in text.split('\n')]
    topic = None
    result = {}
    topic_translations = get_topic_translations()
    
    for line in lines:
        if line.startswith('##'):
            # Extract topic name after ##, handling numbered sections
            key_match = re.sub(r'##\s*\d*\.?\s*', '', line)
            if ':' in key_match:
                key = key_match.split(':')[1]
            else:
                key = key_match.replace('##', '').strip()
            
            spanish_topic = key.strip().lower().replace(' ', '_')
            # Use English translation if available, otherwise use original
            topic = topic_translations.get(spanish_topic, spanish_topic)
            result[topic] = []
            continue
        
        # Skip empty lines, comments, or if no topic is set
        if not line or line.startswith('#') or topic is None:
            continue
            
        result[topic].append(line)
    
    return result

def translate_word(word, target_lang):
    """
    Enhanced translation mapping with comprehensive vocabulary.
    """
    # Comprehensive translation dictionaries
    translations = {
        'en': {
            # Body parts
            'músculo': 'muscle', 'hueso': 'bone', 'piel': 'skin', 'corazón': 'heart',
            'pulmón': 'lung', 'cuello': 'neck', 'hombros': 'shoulders', 'pecho': 'chest',
            'cintura': 'waist', 'barriga': 'belly', 'rodilla': 'knee', 'tobillo': 'ankle',
            'codo': 'elbow', 'muñeca': 'wrist',
            
            # Food and nutrition
            'alimentación sana': 'healthy eating', 'alimentación equilibrada': 'balanced diet',
            'producto natural': 'natural product', 'alimento pesado': 'heavy food',
            'alimento ligero': 'light food', 'calorías': 'calories', 'vitaminas': 'vitamins',
            'proteínas': 'proteins', 'fibra': 'fiber', 'hierro': 'iron',
            'marisco': 'seafood', 'especias': 'spices', 'embutido': 'cold cuts',
            'lomo': 'loin', 'chorizo': 'chorizo', 'berenjena': 'eggplant',
            'calabacín': 'zucchini', 'espinacas': 'spinach', 'guisantes': 'peas',
            'lentejas': 'lentils', 'garbanzos': 'chickpeas', 'bizcocho': 'sponge cake',
            
            # Personal relationships
            'matrimonio homosexual': 'same-sex marriage', 'matrimonio heterosexual': 'heterosexual marriage',
            'pareja de hecho': 'civil partnership', 'madre soltera': 'single mother',
            'niño adoptado': 'adopted child', 'adoptar un niño': 'to adopt a child',
            'educar a un hijo': 'to raise a child', 'convivir con la pareja': 'to live with partner',
            'convivir con el novio': 'to live with boyfriend', 'vivir con la pareja': 'to live with partner',
            'vivir con el novio': 'to live with boyfriend', 'llevar años juntos': 'to be together for years',
            'llevar años en pareja': 'to be in a relationship for years', 'tener novio': 'to have a boyfriend',
            'tener pareja': 'to have a partner', 'tener una aventura': 'to have an affair',
            'tener una relación': 'to have a relationship', 'empezar una relación': 'to start a relationship',
            'acabar una relación': 'to end a relationship', 'terminar una relación': 'to end a relationship',
            'salir con alguien': 'to date someone', 'romper con alguien': 'to break up with someone',
            'caer bien': 'to like someone', 'caer mal': 'to dislike someone',
            'llevarse bien': 'to get along well', 'llevarse mal': 'to not get along',
            'dar la mano': 'to shake hands', 'dar un abrazo': 'to give a hug',
            'dar un beso': 'to give a kiss', 'abrazarse': 'to hug each other',
            'besarse': 'to kiss each other', 'ligar': 'to flirt',
            'fiesta típica': 'traditional party', 'fiesta popular': 'popular festival',
            'fiesta tradicional': 'traditional celebration', 'fiesta de disfraces': 'costume party',
            'comida de Navidad': 'Christmas dinner', 'comida de familia': 'family meal',
            'comida de negocios': 'business lunch', 'fiesta formal': 'formal party',
            'fiesta informal': 'informal party', 'reunión formal': 'formal meeting',
            'reunión informal': 'informal meeting', 'despedida de soltero': 'bachelor party',
            'boda': 'wedding', 'cumplir años': 'to have a birthday',
            'hacer un regalo': 'to give a gift', 'envolver un regalo': 'to wrap a gift',
            'abrir un regalo': 'to open a gift', 'felicitar': 'to congratulate',
            'colega': 'colleague', 'amigo de la infancia': 'childhood friend',
            'amigo de universidad': 'university friend', 'buen amigo': 'good friend',
            'gran amigo': 'great friend',
            
            # Education
            'universidad': 'university', 'colegio': 'school', 'estudiante': 'student',
            'profesor': 'teacher', 'examen': 'exam', 'nota': 'grade',
            'curso': 'course', 'asignatura': 'subject', 'matrícula': 'enrollment',
            'beca': 'scholarship', 'estudiar': 'to study', 'aprender': 'to learn',
            'enseñar': 'to teach',
            
            # Work
            'trabajo': 'work', 'empleo': 'job', 'oficina': 'office',
            'empleado': 'employee', 'jefe': 'boss', 'sueldo': 'salary',
            'contrato': 'contract', 'entrevista': 'interview',
            
            # Common verbs
            'caminar': 'to walk', 'saltar': 'to jump', 'respirar': 'to breathe',
            'llorar': 'to cry', 'besar': 'to kiss', 'abrazar': 'to hug',
            'freír': 'to fry', 'hervir': 'to boil', 'cocer': 'to cook',
            'trabajar': 'to work', 'viajar': 'to travel',
            
            # Attitudes and behavior
            'actitud agradable': 'pleasant attitude', 'actitud positiva': 'positive attitude',
            'actitud extraña': 'strange attitude', 'portarse bien': 'to behave well',
            'portarse mal': 'to behave badly', 'tratar bien a alguien': 'to treat someone well',
            'tratar mal a alguien': 'to treat someone badly', 'tener una buena actitud': 'to have a good attitude',
            'tener una mala actitud': 'to have a bad attitude'
        },
        'ru': {
            # Body parts
            'músculo': 'мышца', 'hueso': 'кость', 'piel': 'кожа', 'corazón': 'сердце',
            'pulmón': 'лёгкое', 'cuello': 'шея', 'hombros': 'плечи', 'pecho': 'грудь',
            'cintura': 'талия', 'barriga': 'живот', 'rodilla': 'колено', 'tobillo': 'лодыжка',
            'codo': 'локоть', 'muñeca': 'запястье',
            
            # Food and nutrition
            'alimentación sana': 'здоровое питание', 'alimentación equilibrada': 'сбалансированное питание',
            'producto natural': 'натуральный продукт', 'alimento pesado': 'тяжёлая пища',
            'alimento ligero': 'лёгкая пища', 'calorías': 'калории', 'vitaminas': 'витамины',
            'proteínas': 'белки', 'fibra': 'клетчатка', 'hierro': 'железо',
            'marisco': 'морепродукты', 'especias': 'специи', 'embutido': 'колбасные изделия',
            'lomo': 'корейка', 'chorizo': 'чоризо', 'berenjena': 'баклажан',
            'calabacín': 'кабачок', 'espinacas': 'шпинат', 'guisantes': 'горошек',
            'lentejas': 'чечевица', 'garbanzos': 'нут', 'bizcocho': 'бисквит',
            
            # Personal relationships
            'matrimonio homosexual': 'однополый брак', 'matrimonio heterosexual': 'гетеросексуальный брак',
            'pareja de hecho': 'гражданский союз', 'madre soltera': 'мать-одиночка',
            'niño adoptado': 'приёмный ребёнок', 'adoptar un niño': 'усыновить ребёнка',
            'educar a un hijo': 'воспитывать ребёнка', 'convivir con la pareja': 'жить с партнёром',
            'convivir con el novio': 'жить с парнем', 'vivir con la pareja': 'жить с партнёром',
            'vivir con el novio': 'жить с парнем', 'llevar años juntos': 'быть вместе годами',
            'llevar años en pareja': 'быть в отношениях годами', 'tener novio': 'иметь парня',
            'tener pareja': 'иметь партнёра', 'tener una aventura': 'иметь роман',
            'tener una relación': 'быть в отношениях', 'empezar una relación': 'начать отношения',
            'acabar una relación': 'закончить отношения', 'terminar una relación': 'завершить отношения',
            'salir con alguien': 'встречаться с кем-то', 'romper con alguien': 'расстаться с кем-то',
            'caer bien': 'нравиться', 'caer mal': 'не нравиться',
            'llevarse bien': 'хорошо ладить', 'llevarse mal': 'плохо ладить',
            'dar la mano': 'пожать руку', 'dar un abrazo': 'обнять',
            'dar un beso': 'поцеловать', 'abrazarse': 'обниматься',
            'besarse': 'целоваться', 'ligar': 'флиртовать',
            'fiesta típica': 'традиционный праздник', 'fiesta popular': 'народный праздник',
            'fiesta tradicional': 'традиционное торжество', 'fiesta de disfraces': 'костюмированная вечеринка',
            'comida de Navidad': 'рождественский ужин', 'comida de familia': 'семейная трапеза',
            'comida de negocios': 'деловой обед', 'fiesta formal': 'официальная вечеринка',
            'fiesta informal': 'неформальная вечеринка', 'reunión formal': 'официальная встреча',
            'reunión informal': 'неформальная встреча', 'despedida de soltero': 'мальчишник',
            'boda': 'свадьба', 'cumplir años': 'отмечать день рождения',
            'hacer un regalo': 'дарить подарок', 'envolver un regalo': 'упаковывать подарок',
            'abrir un regalo': 'открывать подарок', 'felicitar': 'поздравлять',
            'colega': 'коллега', 'amigo de la infancia': 'друг детства',
            'amigo de universidad': 'друг по университету', 'buen amigo': 'хороший друг',
            'gran amigo': 'отличный друг',
            
            # Education
            'universidad': 'университет', 'colegio': 'школа', 'estudiante': 'студент',
            'profesor': 'преподаватель', 'examen': 'экзамен', 'nota': 'оценка',
            'curso': 'курс', 'asignatura': 'предмет', 'matrícula': 'зачисление',
            'beca': 'стипендия', 'estudiar': 'изучать', 'aprender': 'учиться',
            'enseñar': 'преподавать',
            
            # Work
            'trabajo': 'работа', 'empleo': 'работа', 'oficina': 'офис',
            'empleado': 'сотрудник', 'jefe': 'начальник', 'sueldo': 'зарплата',
            'contrato': 'контракт', 'entrevista': 'собеседование',
            
            # Common verbs
            'caminar': 'ходить', 'saltar': 'прыгать', 'respirar': 'дышать',
            'llorar': 'плакать', 'besar': 'целовать', 'abrazar': 'обнимать',
            'freír': 'жарить', 'hervir': 'кипятить', 'cocer': 'варить',
            'trabajar': 'работать', 'viajar': 'путешествовать',
            
            # Attitudes and behavior
            'actitud agradable': 'приятное отношение', 'actitud positiva': 'позитивное отношение',
            'actitud extraña': 'странное отношение', 'portarse bien': 'хорошо себя вести',
            'portarse mal': 'плохо себя вести', 'tratar bien a alguien': 'хорошо относиться к кому-то',
            'tratar mal a alguien': 'плохо относиться к кому-то', 'tener una buena actitud': 'иметь хорошее отношение',
            'tener una mala actitud': 'иметь плохое отношение'
        }
    }
    
    # Return translation if available, otherwise return the original word
    if target_lang in translations and word in translations[target_lang]:
        return translations[target_lang][word]
    else:
        return word  # Return original if no translation found

def main():
    """Main function to generate all word lists."""
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
            
            # Get English topic names for display
            english_names = get_english_topic_names()
            
            # Process each topic
            for topic_key, words in topics_map.items():
                entries = []
                
                for word in words:
                    if lang['code'] == 'spanish':
                        translation = word  # Spanish is the source language
                    else:
                        translation = translate_word(word, lang['tcode'])
                    
                    entries.append({
                        'word': word,
                        'translation': translation,
                        'example': example_for(lang['code'], translation)
                    })
                
                # Write topic file with English display name
                topic_file = lang_dir / f'{topic_key}.json'
                display_name = english_names.get(topic_key, topic_key.replace('_', ' ').title())
                topic_data = {
                    'topic': display_name,
                    'words': entries
                }
                
                with open(topic_file, 'w', encoding='utf-8') as f:
                    json.dump(topic_data, f, indent=2, ensure_ascii=False)
                
                print(f"Written {lang['code']}/{level}/{topic_key}.json ({len(entries)} items)")
    
    print("✅ All word-lists generated.")

if __name__ == '__main__':
    main()
