// lib/translation.js
import { PROMPTS } from './prompts';

/**
 * Voert standaard opschoning uit op de HTML/text content.
 */
function cleanUpDefaultOutput(content, lang) {
  content = content.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  content = content.replace(/<\/div><\/div><\/div>/g, "");
  content = content.replace(/<div data-content-type="html" data-appearance="default" data-element="main">/g, "");
  content = content.replace(/<\/div><div data-content-type="row" data-appearance="contained"/g, "");
  content = content.replace(/<\/script><\/div>/g, "</script>");
  content = content.replace(/<\/script>\s*<\/div>/g, "</script>");
  content = content.replace(/<\/div><!--FAQ-->/g, "");

  let url = "/";
  switch (lang.toLowerCase()) {
    case "dutch":
      url = "https://www.remarkt.nl/"; break;
    case "german":
      url = "https://www.123remarkt.de/"; break;
    case "english":
    case "engels":
      url = "https://www.remarkt.co.uk/"; break;
    case "french":
      url = "https://www.remarkt.fr/"; break;
    case "spanish":
      url = "https://www.remarkt.es/"; break;
    case "belgian":
      url = "https://www.remarkt.be/"; break;
    default:
      url = "/";
  }
  content = content.replace(/https:\/\/www\.remarkt\.nl\//g, url);
  content = content.replace(/<style>#html-body \[data-pb-style=.*?<style>/gs, "<style>");
  content = content.replace(/<div data-element="main"><div data-enable-parallax=.*?data-appearance="default" data-element="main"/gs, "");
  content = content.replace(/#html-body \[data-pb-style=.*?background-attachment:scroll\}<\/style>/gs, "");
  content = content.replace(/<div data-content-type="row".*?data-pb-style=".*?">/gs, "");
  return content;
}

/**
 * Voert blogspecifieke filtering uit.
 */
function filterBlogContent(content, lang) {
  // Voeg eventueel blogspecifieke logica toe
  return content;
}

/**
 * Past specifieke vervangingen toe voor adviespagina's.
 */
function filterAdviceContent(content, lang) {
  content = content.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  content = content.replace(/<\/div><\/div><\/div>/g, "");
  content = content.replace(/<div data-content-type="row" data-appearance="contained" data-element="main">/g, "");
  content = content.replace(/<style>#html-body \[data-pb-style=.*?<style>/gs, "<style>");
  content = content.replace(/<div data-enable-parallax="0".*?<h2 data-content-type="heading"/gs, '<h2 data-content-type="heading"');
  content = content.replace(/<div data-content-type="products" data-appearance="carousel".*?{{widget/gs, "{{widget");
  content = content.replace(/<div data-enable-parallax="0".*?{{widget/gs, "{{widget");
  
  let url = "/";
  switch (lang.toLowerCase()) {
    case "dutch":
      url = "https://www.remarkt.nl/"; break;
    case "german":
      url = "https://www.123remarkt.de/"; break;
    case "english":
    case "engels":
      url = "https://www.remarkt.co.uk/"; break;
    case "french":
      url = "https://www.remarkt.fr/"; break;
    case "spanish":
      url = "https://www.remarkt.es/"; break;
    case "belgian":
      url = "https://www.remarkt.be/"; break;
    default:
      url = "/";
  }
  content = content.replace(/https:\/\/www\.remarkt\.nl\//g, url);
  return content;
}

/**
 * Roept de Gemini API aan om de gegeven tekst te vertalen.
 * Er wordt een retry-mechanisme toegepast met exponentiële backoff.
 *
 * @param {string} text - De originele tekst.
 * @param {string} targetLanguage - De doeltaal.
 * @param {string} prompt - Het prompt template.
 * @param {string} apiKey - Een geldige API-sleutel of access token.
 * @param {function} log_callback - Callback voor logberichten (optioneel).
 * @returns {Promise<string>} - De vertaalde tekst.
 */
export async function translateText(text, targetLanguage, prompt, apiKey, log_callback = console.log) {
  let finalPrompt = "";
  if (prompt.includes("{target_language}")) {
    finalPrompt = prompt.replace("{target_language}", targetLanguage).replace("{}", text);
  } else if (prompt.includes("{}")) {
    finalPrompt = prompt.replace("{}", text);
  } else {
    finalPrompt = prompt + "\n" + text;
  }
  finalPrompt = `Translate to ${targetLanguage}:\n` + finalPrompt;

  const retries = 5;
  const initialCoolDown = 5000; // 5 seconden in ms

  for (let attempt = 0; attempt < retries; attempt++) {
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
        throw new Error("Empty response from Gemini API");
      }
      return translatedContent.trim();
    } catch (error) {
      log_callback(`Fout tijdens vertalen (poging ${attempt + 1}/${retries}): ${error.stack || error.message}`);
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, initialCoolDown * Math.pow(2, attempt)));
      } else {
        log_callback("Te vaak fouten, geef originele tekst terug.");
        return text;
      }
    }
  }
}

/**
 * Verwerkt en vertaalt HTML-bestanden.
 * Voor elk bestand en elke doeltaal wordt een nieuw bestand aangemaakt.
 * Retourneert een array met objecten: { filename, content }
 */
export async function translateHTMLFiles(formData, selectedLangs, apiKeyOption, specialFileType) {
  const files = formData.getAll('files');
  let outputFiles = [];
  for (const file of files) {
    const originalText = await file.text();
    const originalFilename = file.name;
    for (const lang of selectedLangs) {
      let processedText = originalText;
      if (specialFileType === 'blogs') {
        processedText = filterBlogContent(processedText, lang);
      } else if (specialFileType === 'advies') {
        processedText = filterAdviceContent(processedText, lang);
      } else {
        processedText = cleanUpDefaultOutput(processedText, lang);
      }
      const promptTemplate = PROMPTS['html'].replace('{target_language}', lang);
      const translated = await translateText(processedText, lang, promptTemplate, apiKeyOption, console.log);
      const newFilename = originalFilename.replace(/(\.[^\.]+)$/, `_${lang}$1`);
      outputFiles.push({ filename: newFilename, content: translated });
    }
  }
  return outputFiles;
}

/**
 * Verwerkt en vertaalt een CSV-bestand.
 * Gaat ervan uit dat het CSV-bestand komma-gescheiden is.
 * Voor elke doeltaal wordt de gehele CSV met vertaalde cellen aangemaakt.
 * Retourneert een array met objecten: { filename, content }
 */
export async function translateCSVFile(formData, selectedLangs, apiKeyOption, specialFileType) {
  const file = formData.get('files');
  if (!file) throw new Error('Geen CSV bestand gevonden');
  const originalFilename = file.name;
  const csvText = await file.text();
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split(',');
  const rows = lines.slice(1).map(line => line.split(','));
  let outputFiles = [];
  for (const lang of selectedLangs) {
    const translatedRows = [];
    translatedRows.push(headers);
    for (const row of rows) {
      const translatedRow = await Promise.all(row.map(async (cell) => {
        let processedCell = cell;
        if (specialFileType === 'blogs') {
          processedCell = filterBlogContent(processedCell, lang);
        } else if (specialFileType === 'advies') {
          processedCell = filterAdviceContent(processedCell, lang);
        } else {
          processedCell = cleanUpDefaultOutput(processedCell, lang);
        }
        const prompt = PROMPTS['default'];
        const translatedCell = await translateText(processedCell, lang, prompt, apiKeyOption, console.log);
        return translatedCell;
      }));
      translatedRows.push(translatedRow);
    }
    const csvOutput = translatedRows.map(row => row.join(',')).join('\n');
    const newFilename = originalFilename.replace(/(\.[^\.]+)$/, `_${lang}$1`);
    outputFiles.push({ filename: newFilename, content: csvOutput });
  }
  return outputFiles;
}
