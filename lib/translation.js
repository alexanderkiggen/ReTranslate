// lib/translation.js
import { PROMPTS } from './prompts';

// API keys (vervang dit eventueel met environment variables)
const API_KEY_FREE = "AIzaSyDLeEtNbKi4OPDWAPJqA5PHyOz4jmi7tVA";
const API_KEY_PAID = "AIzaSyBN23la8ZJWtdYuHbbJm0TA3a76w7XuUzM";

/**
 * Pre-processing: Clean up de standaard HTML-output.
 */
export function cleanUpDefaultOutput(content, lang) {
  content = content.replace(/&lt;/g, "<");
  content = content.replace(/&gt;/g, ">");
  content = content.replace(/<\/div><\/div><\/div>/g, "");
  content = content.replace(/<div data-content-type="html" data-appearance="default" data-element="main">/g, "");
  content = content.replace(/<\/div><div data-content-type="row" data-appearance="contained"/g, "");
  content = content.replace(/<\/script><\/div>/g, "</script>");
  content = content.replace(/<\/script>\s*<\/div>/g, "</script>");
  content = content.replace(/<\/div><!--FAQ-->/g, "");

  let url;
  switch(lang.toLowerCase()){
    case 'dutch': url = "https://www.remarkt.nl/"; break;
    case 'german': url = "https://www.123remarkt.de/"; break;
    case 'english':
    case 'engels': url = "https://www.remarkt.co.uk/"; break;
    case 'french': url = "https://www.remarkt.fr/"; break;
    case 'spanish': url = "https://www.remarkt.es/"; break;
    case 'belgian': url = "https://www.remarkt.be/"; break;
    default: url = "/";
  }
  content = content.replace(/https:\/\/www\.remarkt\.nl\//g, url);

  content = content.replace(/<style>#html-body \[data-pb-style=.*?<style>/gs, "<style>");
  content = content.replace(/<div data-element="main"><div data-enable-parallax=.*?data-appearance="default" data-element="main"/gs, "");
  content = content.replace(/#html-body \[data-pb-style=.*?background-attachment:scroll\}<\/style>/gs, "");
  content = content.replace(/<div data-content-type="row".*?data-pb-style=".*?">/gs, "");

  let openDivs = (content.match(/<div(?=\s|>)/g) || []).length;
  let closeDivs = (content.match(/<\/div>/g) || []).length;
  if(openDivs !== closeDivs && closeDivs > 0){
    const lastClose = content.lastIndexOf("</div>");
    if(lastClose !== -1){
      content = content.slice(0, lastClose) + content.slice(lastClose + "</div>".length);
    }
  }

  let openStyles = (content.match(/<style(?=\s|>)/g) || []).length;
  let closeStyles = (content.match(/<\/style>/g) || []).length;
  if(openStyles !== closeStyles && openStyles > closeStyles){
    const firstOpen = content.indexOf("<style");
    if(firstOpen !== -1){
      const tagEnd = content.indexOf(">", firstOpen);
      if(tagEnd !== -1){
        content = content.slice(0, firstOpen) + content.slice(tagEnd + 1);
      }
    }
  }

  return content;
}

/**
 * Pre-processing: Clean up de AI-output (bijv. verwijder codeblokken).
 */
export function cleanUpAIOutput(content) {
  content = content.replace(/```html/g, "");
  content = content.replace(/```css/g, "");
  content = content.replace(/```javascript/g, "");
  content = content.replace(/```Javascript/g, "");
  content = content.replace(/```/g, "");
  return content;
}

/**
 * Pre-processing: Filter blog content.
 */
export function filterBlogContent(content, lang) {
  // Pas eventueel blog-specifieke filters toe
  return content;
}

/**
 * Pre-processing: Filter advies content.
 */
export function filterAdviceContent(content, lang) {
  content = content.replace(/&lt;/g, "<");
  content = content.replace(/&gt;/g, ">");
  content = content.replace(/<\/div><\/div><\/div>/g, "");
  content = content.replace(/<div data-content-type="row" data-appearance="contained" data-element="main">/g, "");
  content = content.replace(/<style>#html-body \[data-pb-style=.*?<style>/gs, "<style>");
  content = content.replace(/<div data-enable-parallax="0".*?<h2 data-content-type="heading"/gs, "<h2 data-content-type=\"heading\"");
  content = content.replace(/<div data-content-type="products" data-appearance="carousel".*?{{widget/gs, "{{widget");
  content = content.replace(/<div data-enable-parallax="0".*?{{widget/gs, "{{widget}");
  let url;
  switch(lang.toLowerCase()){
    case 'dutch': url = "https://www.remarkt.nl/"; break;
    case 'german': url = "https://www.123remarkt.de/"; break;
    case 'english':
    case 'engels': url = "https://www.remarkt.co.uk/"; break;
    case 'french': url = "https://www.remarkt.fr/"; break;
    case 'spanish': url = "https://www.remarkt.es/"; break;
    case 'belgian': url = "https://www.remarkt.be/"; break;
    default: url = "/";
  }
  content = content.replace(/https:\/\/www\.remarkt\.nl\//g, url);
  return content;
}

/**
 * Voert de Gemini API-aanroep uit om de tekst te vertalen.
 */
export async function translateText(text, targetLanguage, prompt, apiKeyOption) {
  const apiKey = apiKeyOption === 'key1' ? API_KEY_FREE : API_KEY_PAID;
  let finalPrompt = "";
  if (prompt.includes("{target_language}")) {
    finalPrompt = prompt.replace("{target_language}", targetLanguage).replace("{}", text);
  } else if (prompt.includes("{}")) {
    finalPrompt = prompt.replace("{}", text);
  } else {
    finalPrompt = prompt + "\n" + text;
  }
  finalPrompt = `Translate to ${targetLanguage}:\n` + finalPrompt;

  try {
    const response = await fetch('https://api.generativeai.googleapis.com/v1/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: finalPrompt,
        temperature: 0.7,
        maxOutputTokens: 1024
      })
    });
    if (!response.ok) {
      throw new Error('API call failed with status ' + response.status);
    }
    const data = await response.json();
    const translatedContent = data.text || "";
    if (!translatedContent.trim()) {
      throw new Error("Empty response from translation API");
    }
    return translatedContent.trim();
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

/**
 * Verwerkt en vertaalt HTML-bestanden.
 */
export async function translateHTMLFiles(formData, selectedLangs, apiKeyOption, specialFileType) {
  const files = formData.getAll('files');
  for (const file of files) {
    const originalText = await file.text();
    for (const lang of selectedLangs) {
      let processedText;
      if (specialFileType === 'blogs') {
        processedText = filterBlogContent(originalText, lang);
      } else if (specialFileType === 'advies') {
        processedText = filterAdviceContent(originalText, lang);
      } else {
        processedText = cleanUpDefaultOutput(originalText, lang);
      }
      const promptTemplate = PROMPTS['html'].replace('{target_language}', lang);
      const translated = await translateText(processedText, lang, promptTemplate, apiKeyOption);
      console.log(`Translated HTML file for ${lang}:`, translated.substring(0, 100));
      // Hier kun je de vertaalde content opslaan of teruggeven via de API-response.
    }
  }
}

/**
 * Verwerkt en vertaalt een CSV-bestand.
 */
export async function translateCSVFile(formData, selectedLangs, apiKeyOption, specialFileType) {
  const file = formData.get('files');
  if (!file) throw new Error('Geen CSV bestand gevonden');

  const csvText = await file.text();
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split(',');
  const rows = lines.slice(1).map(line => line.split(','));

  // Lees de geselecteerde kolommen uit formData
  const selectedColumns = formData.getAll('columns');

  for (const lang of selectedLangs) {
    const translatedRows = [];
    translatedRows.push(headers);
    for (const row of rows) {
      const translatedRow = [];
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        const cell = row[i] || "";
        if (selectedColumns.includes(header)) {
          const promptTemplate = PROMPTS[header] || PROMPTS['default'];
          let processedText;
          if (specialFileType === 'blogs') {
            processedText = filterBlogContent(cell, lang);
          } else if (specialFileType === 'advies') {
            processedText = filterAdviceContent(cell, lang);
          } else {
            processedText = cleanUpDefaultOutput(cell, lang);
          }
          const translatedCell = await translateText(processedText, lang, promptTemplate, apiKeyOption);
          translatedRow.push(translatedCell);
        } else {
          translatedRow.push(cell);
        }
      }
      translatedRows.push(translatedRow);
    }
    console.log(`Translated CSV for ${lang}:`, translatedRows.slice(0, 2));
    // Hier kun je de vertaalde CSV opslaan of teruggeven via de API-response.
  }
}
