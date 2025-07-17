// Spanish to German Translation Data for Topical Vocabulary
// This file contains translations organized by topics for better learning experience

const SPANISH_GERMAN_TRANSLATIONS = {
  // 1. Individuo: dimensión física (Physical Dimension)
  'dimensión física': {
    // Body parts
    'músculo': { german: 'der Muskel', example: 'Der Muskel tut weh.' },
    'hueso': { german: 'der Knochen', example: 'Der Knochen ist gebrochen.' },
    'piel': { german: 'die Haut', example: 'Die Haut ist weich.' },
    'corazón': { german: 'das Herz', example: 'Das Herz schlägt schnell.' },
    'pulmón': { german: 'die Lunge', example: 'Die Lunge braucht Luft.' },
    'cuello': { german: 'der Hals', example: 'Der Hals tut weh.' },
    'hombros': { german: 'die Schultern', example: 'Die Schultern sind breit.' },
    'pecho': { german: 'die Brust', example: 'Die Brust ist stark.' },
    'cintura': { german: 'die Taille', example: 'Die Taille ist schmal.' },
    'barriga': { german: 'der Bauch', example: 'Der Bauch ist voll.' },
    'rodilla': { german: 'das Knie', example: 'Das Knie tut weh.' },
    'tobillo': { german: 'der Knöchel', example: 'Der Knöchel ist verstaucht.' },
    'codo': { german: 'der Ellbogen', example: 'Der Ellbogen ist gebeugt.' },
    'muñeca': { german: 'das Handgelenk', example: 'Das Handgelenk ist dünn.' },
    
    // Physical appearance
    'postura': { german: 'die Haltung', example: 'Die Haltung ist wichtig.' },
    'mirada': { german: 'der Blick', example: 'Der Blick ist freundlich.' },
    'parecerse': { german: 'ähneln', example: 'Sie ähnelt ihrer Mutter.' },
    'tener la piel clara': { german: 'helle Haut haben', example: 'Sie hat helle Haut.' },
    'tener la piel oscura': { german: 'dunkle Haut haben', example: 'Er hat dunkle Haut.' },
    'estar moreno': { german: 'braun sein', example: 'Im Sommer bin ich braun.' },
    'ser blanco': { german: 'weiß sein', example: 'Er ist sehr weiß.' },
    'tener buen tipo': { german: 'eine gute Figur haben', example: 'Sie hat eine gute Figur.' },
    
    // Physical actions
    'caminar': { german: 'gehen', example: 'Ich gehe spazieren.' },
    'saltar': { german: 'springen', example: 'Das Kind springt hoch.' },
    'respirar': { german: 'atmen', example: 'Tief atmen ist gesund.' },
    'llorar': { german: 'weinen', example: 'Das Baby weint.' },
    'estar sentado': { german: 'sitzen', example: 'Ich sitze auf einem Stuhl.' },
    'estar de pie': { german: 'stehen', example: 'Wir stehen hier.' }
  },

  // 2. Carácter y personalidad (Character and Personality)
  'carácter y personalidad': {
    'carácter': { german: 'der Charakter', example: 'Er hat einen guten Charakter.' },
    'personalidad': { german: 'die Persönlichkeit', example: 'Sie hat eine starke Persönlichkeit.' },
    'simpático': { german: 'sympathisch', example: 'Er ist sehr sympathisch.' },
    'antipático': { german: 'unsympathisch', example: 'Sie ist unsympathisch.' },
    'amable': { german: 'freundlich', example: 'Die Verkäuferin ist freundlich.' },
    'agradable': { german: 'angenehm', example: 'Das Gespräch war angenehm.' },
    'inteligente': { german: 'intelligent', example: 'Das Kind ist sehr intelligent.' },
    'tonto': { german: 'dumm', example: 'Das war eine dumme Idee.' },
    'listo': { german: 'klug', example: 'Sie ist sehr klug.' },
    'valiente': { german: 'mutig', example: 'Der Soldat ist mutig.' },
    'cobarde': { german: 'feige', example: 'Er ist zu feige.' },
    'generoso': { german: 'großzügig', example: 'Mein Onkel ist großzügig.' },
    'tacaño': { german: 'geizig', example: 'Der Mann ist sehr geizig.' },
    'honesto': { german: 'ehrlich', example: 'Ich bin immer ehrlich.' },
    'mentiroso': { german: 'lügnerisch', example: 'Er ist lügnerisch.' },
    'trabajador': { german: 'fleißig', example: 'Die Studentin ist fleißig.' },
    'perezoso': { german: 'faul', example: 'Mein Bruder ist faul.' }
  },

  // 3. Identidad personal (Personal Identity)
  'identidad personal': {
    'nombre': { german: 'der Name', example: 'Wie ist Ihr Name?' },
    'apellido': { german: 'der Nachname', example: 'Mein Nachname ist Müller.' },
    'edad': { german: 'das Alter', example: 'Wie alt sind Sie?' },
    'nacionalidad': { german: 'die Nationalität', example: 'Meine Nationalität ist deutsch.' },
    'profesión': { german: 'der Beruf', example: 'Was ist Ihr Beruf?' },
    'estado civil': { german: 'der Familienstand', example: 'Wie ist Ihr Familienstand?' },
    'soltero': { german: 'ledig', example: 'Ich bin ledig.' },
    'casado': { german: 'verheiratet', example: 'Sie ist verheiratet.' },
    'divorciado': { german: 'geschieden', example: 'Er ist geschieden.' },
    'viudo': { german: 'verwitwet', example: 'Sie ist verwitwet.' }
  },

  // 4. Relaciones humanas (Human Relationships)
  'relaciones humanas': {
    'familia': { german: 'die Familie', example: 'Meine Familie ist groß.' },
    'padre': { german: 'der Vater', example: 'Mein Vater arbeitet viel.' },
    'madre': { german: 'die Mutter', example: 'Meine Mutter kocht gut.' },
    'hijo': { german: 'der Sohn', example: 'Mein Sohn geht zur Schule.' },
    'hija': { german: 'die Tochter', example: 'Meine Tochter ist klug.' },
    'hermano': { german: 'der Bruder', example: 'Mein Bruder ist älter.' },
    'hermana': { german: 'die Schwester', example: 'Meine Schwester ist jünger.' },
    'abuelo': { german: 'der Großvater', example: 'Mein Großvater ist alt.' },
    'abuela': { german: 'die Großmutter', example: 'Meine Großmutter ist lieb.' },
    'primo': { german: 'der Cousin', example: 'Mein Cousin wohnt hier.' },
    'prima': { german: 'die Cousine', example: 'Meine Cousine studiert.' },
    'amigo': { german: 'der Freund', example: 'Mein Freund ist nett.' },
    'amiga': { german: 'die Freundin', example: 'Meine Freundin ist schön.' },
    'novio': { german: 'der Freund', example: 'Ihr Freund ist Student.' },
    'novia': { german: 'die Freundin', example: 'Seine Freundin ist Ärztin.' },
    'marido': { german: 'der Ehemann', example: 'Ihr Ehemann ist Lehrer.' },
    'mujer': { german: 'die Ehefrau', example: 'Seine Ehefrau ist Krankenschwester.' }
  },

  // 5. Alimentación (Food and Nutrition)
  'alimentación': {
    'comida': { german: 'das Essen', example: 'Das Essen ist lecker.' },
    'desayuno': { german: 'das Frühstück', example: 'Das Frühstück ist wichtig.' },
    'almuerzo': { german: 'das Mittagessen', example: 'Das Mittagessen ist um eins.' },
    'cena': { german: 'das Abendessen', example: 'Das Abendessen ist spät.' },
    'pan': { german: 'das Brot', example: 'Das Brot ist frisch.' },
    'carne': { german: 'das Fleisch', example: 'Das Fleisch ist teuer.' },
    'pescado': { german: 'der Fisch', example: 'Der Fisch ist gesund.' },
    'verduras': { german: 'das Gemüse', example: 'Gemüse ist gesund.' },
    'frutas': { german: 'das Obst', example: 'Obst ist süß.' },
    'leche': { german: 'die Milch', example: 'Die Milch ist kalt.' },
    'agua': { german: 'das Wasser', example: 'Wasser ist wichtig.' },
    'vino': { german: 'der Wein', example: 'Der Wein ist rot.' },
    'cerveza': { german: 'das Bier', example: 'Das Bier ist kalt.' },
    'café': { german: 'der Kaffee', example: 'Der Kaffee ist heiß.' },
    'té': { german: 'der Tee', example: 'Der Tee ist grün.' }
  },

  // 6. Information and Media
  'Information and Media': {
    'medios de comunicación': { german: 'die Medien', example: 'Die Medien berichten über aktuelle Ereignisse.' },
    'medios de información': { german: 'die Informationsmedien', example: 'Die Informationsmedien sind wichtig für die Demokratie.' },
    'noticia': { german: 'die Nachricht', example: 'Die Nachricht war schockierend.' },
    'comentario': { german: 'der Kommentar', example: 'Sein Kommentar war sehr hilfreich.' },
    'opinión': { german: 'die Meinung', example: 'Jeder hat eine eigene Meinung.' },
    'informar': { german: 'informieren', example: 'Die Zeitungen informieren die Bevölkerung.' },
    'dar información': { german: 'Informationen geben', example: 'Der Reporter gibt wichtige Informationen.' },
    'tener información': { german: 'Informationen haben', example: 'Wir haben neue Informationen erhalten.' },
    'dar una noticia': { german: 'eine Nachricht überbringen', example: 'Er muss eine schlechte Nachricht überbringen.' },
    'estar bien informado': { german: 'gut informiert sein', example: 'Es ist wichtig, gut informiert zu sein.' }
  }
};

// Spanish example sentences for vocabulary
const SPANISH_EXAMPLES = {
  'músculo': 'El músculo del brazo es fuerte.',
  'hueso': 'El hueso se rompió en el accidente.',
  'piel': 'La piel necesita protección solar.',
  'corazón': 'El corazón late más rápido cuando corres.',
  'pulmón': 'El pulmón derecho es más grande.',
  'cuello': 'El cuello sostiene la cabeza.',
  'hombros': 'Los hombros cargan el peso.',
  'pecho': 'El pecho se expande al respirar.',
  'cintura': 'La cintura es la parte media del cuerpo.',
  'barriga': 'La barriga está llena después de comer.',
  'rodilla': 'La rodilla se dobla para caminar.',
  'tobillo': 'El tobillo se torció jugando fútbol.',
  'codo': 'El codo conecta el brazo y el antebrazo.',
  'muñeca': 'La muñeca es flexible para mover la mano.',
  'postura': 'Una buena postura es importante para la espalda.',
  'mirada': 'Su mirada era muy intensa.',
  'parecerse': 'Juan se parece mucho a su padre.',
  'caminar': 'Me gusta caminar por el parque.',
  'saltar': 'Los niños saltan en el trampolín.',
  'respirar': 'Es importante respirar profundamente.',
  'llorar': 'El bebé llora cuando tiene hambre.',
  'familia': 'Mi familia es muy unida.',
  'padre': 'Mi padre trabaja en una oficina.',
  'madre': 'Mi madre es profesora.',
  'comida': 'La comida española es deliciosa.',
  'agua': 'Bebo mucha agua todos los días.'
};

// Export for use in the app
if (typeof window !== 'undefined') {
  window.SPANISH_GERMAN_TRANSLATIONS = SPANISH_GERMAN_TRANSLATIONS;
  window.SPANISH_EXAMPLES = SPANISH_EXAMPLES;
}
