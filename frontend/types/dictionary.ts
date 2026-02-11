export interface Sense{
    parts_of_speech: string[];
    glosses: string[];
}

export interface Word{
    kanji: string | null;
    kana: string;
    is_common: boolean;
    senses: Sense[];
}