declare module 'dictionary-en' {
  interface DictionaryData {
    aff: Buffer;
    dic: Buffer;
  }
  const dictionary: (callback: (err: Error | null, dict: DictionaryData) => void) => void;
  export default dictionary;
} 