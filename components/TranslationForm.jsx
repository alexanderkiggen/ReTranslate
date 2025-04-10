// components/TranslationForm.jsx
'use client';

import { useState } from 'react';
import FileUpload from './FileUpload';
import ProgressBar from './ProgressBar';
import LogOutput from './LogOutput';

export default function TranslationForm() {
  const [apiKeyOption, setApiKeyOption] = useState('key1');
  const [fileType, setFileType] = useState('html');
  const [specialFileType, setSpecialFileType] = useState('standaard');
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [logMessages, setLogMessages] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);

  const languages = ["Dutch", "German", "Engels", "French", "Spanish", "Belgian"];

  const handleLanguageChange = (lang) => {
    setSelectedLanguages(prev => {
      if (prev.includes(lang)) {
        return prev.filter(l => l !== lang);
      } else {
        return [...prev, lang];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedLanguages.length === 0) {
      alert('Selecteer ten minste één taal.');
      return;
    }
    if (selectedFiles.length === 0) {
      alert('Selecteer ten minste één bestand.');
      return;
    }

    setIsTranslating(true);
    setLogMessages(prev => [...prev, "Vertaling gestart..."]);

    const formData = new FormData();
    formData.append('apiKeyOption', apiKeyOption);
    formData.append('fileType', fileType);
    formData.append('specialFileType', specialFileType);
    selectedLanguages.forEach(lang => formData.append('selectedLangs', lang));
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        // Ontvang de ZIP als blob en trigger download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = "translated.zip";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setLogMessages(prev => [...prev, "Vertaling voltooid en bestand gedownload."]);
      } else {
        const result = await response.json();
        setLogMessages(prev => [...prev, result.message]);
      }
    } catch (error) {
      setLogMessages(prev => [...prev, "Er is een fout opgetreden: " + error.message]);
    } finally {
      setIsTranslating(false);
      setProgress(100);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <legend>API Key Selectie</legend>
        <label>
          <input 
            type="radio" 
            name="apiKeyOption" 
            value="key1" 
            checked={apiKeyOption === 'key1'} 
            onChange={() => setApiKeyOption('key1')} 
          />
          Gratis test API (beperkt)
        </label>
        <br />
        <label>
          <input 
            type="radio" 
            name="apiKeyOption" 
            value="key2" 
            checked={apiKeyOption === 'key2'} 
            onChange={() => setApiKeyOption('key2')} 
          />
          Betaalde versie (nog niet aangemaakt)
        </label>
      </fieldset>

      <fieldset>
        <legend>Bestandstype</legend>
        <label>
          <input 
            type="radio" 
            name="fileType" 
            value="html" 
            checked={fileType === 'html'} 
            onChange={() => { setFileType('html'); setSelectedFiles([]); }} 
          />
          HTML bestanden
        </label>
        <br />
        <label>
          <input 
            type="radio" 
            name="fileType" 
            value="csv" 
            checked={fileType === 'csv'} 
            onChange={() => { setFileType('csv'); setSelectedFiles([]); }} 
          />
          CSV bestand
        </label>
      </fieldset>

      <fieldset>
        <legend>Speciaal bestandstype</legend>
        <label>
          <input 
            type="radio" 
            name="specialFileType" 
            value="standaard" 
            checked={specialFileType === 'standaard'} 
            onChange={() => setSpecialFileType('standaard')} 
          />
          Standaard
        </label>
        <br />
        <label>
          <input 
            type="radio" 
            name="specialFileType" 
            value="blogs" 
            checked={specialFileType === 'blogs'} 
            onChange={() => setSpecialFileType('blogs')} 
          />
          Bestand bevat blogs
        </label>
        <br />
        <label>
          <input 
            type="radio" 
            name="specialFileType" 
            value="advies" 
            checked={specialFileType === 'advies'} 
            onChange={() => setSpecialFileType('advies')} 
          />
          Bestand bevat adviespagina's
        </label>
      </fieldset>

      <fieldset>
        <legend>Selecteer doeltalen</legend>
        {languages.map(lang => (
          <label key={lang}>
            <input 
              type="checkbox" 
              value={lang} 
              checked={selectedLanguages.includes(lang)}
              onChange={() => handleLanguageChange(lang)}
            />
            {lang}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Bestand(en) selecteren</legend>
        <FileUpload fileType={fileType} setSelectedFiles={setSelectedFiles} />
      </fieldset>

      <button type="submit" disabled={isTranslating}>Vertaal</button>
      <ProgressBar progress={progress} />
      <LogOutput logMessages={logMessages} />
    </form>
  );
}
