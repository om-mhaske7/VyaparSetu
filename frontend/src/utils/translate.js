export async function translateText(text, targetLang) {
    const res = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetLang,
        format: 'text',
      }),
    });
  
    const data = await res.json();
    return data.translatedText;
  }
  