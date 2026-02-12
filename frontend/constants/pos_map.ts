// frontend/constants/pos_map.ts

export const POS_MAP: Record<string, string> = {
  // --- Nouns ---
  "n": "Noun",
  "n-adv": "Adverbial noun",
  "n-t": "Temporal noun",
  "pn": "Pronoun",
  "n-suf": "Noun suffix",
  "n-pref": "Noun prefix",

  // --- Adjectives ---
  "adj-i": "I-adjective",        // Adjectives ending in -i (e.g., 高い)
  "adj-na": "Na-adjective",      // Adjectives ending in -na (e.g., 便利な)
  "adj-no": "No-adjective",      // Noun used adjectivally with の (e.g., 普通の)
  "adj-pn": "Pre-noun adjective", // Rentaishi (e.g., この, その)
  "adj-f": "Pre-nominal modifier", // Words modifying nouns (noun/verb-based)

  // --- Verbs ---
  "v1": "Ichidan verb",          // Group 2 verbs (e.g., 食べる)
  "v5u": "Godan verb (u-ending)", // Group 1 verbs ending in -u (e.g., 買う)
  "v5k": "Godan verb (ku-ending)", // e.g., 書く
  "v5g": "Godan verb (gu-ending)", // e.g., 泳ぐ
  "v5s": "Godan verb (su-ending)", // e.g., 話す
  "v5t": "Godan verb (tsu-ending)", // e.g., 立つ
  "v5n": "Godan verb (nu-ending)", // e.g., 死ぬ
  "v5b": "Godan verb (bu-ending)", // e.g., 呼ぶ
  "v5m": "Godan verb (mu-ending)", // e.g., 読む
  "v5r": "Godan verb (ru-ending)", // Exception ru-verbs (e.g., 走る)
  "vk": "Irregular verb (kuru)",  // 来る
  "vs": "Irregular verb (suru)",  // する
  "vz": "Ichidan verb (zuru)",    // Classical zuru verbs

  // --- Transitivity ---
  "vi": "Intransitive verb",      // No direct object
  "vt": "Transitive verb",        // Takes a direct object

  // --- Adverbs & Others ---
  "adv": "Adverb",
  "adv-to": "Adverb (to-form)",   // Adverbs formed with と
  "conj": "Conjunction",
  "prt": "Particle",
  "aux": "Auxiliary verb",
  "exp": "Expression",            // Fixed phrase
  "id": "Idiom",                   // Idiomatic expression
  "int": "Interjection",           // Exclamations (e.g., あっ, ええ)
};
