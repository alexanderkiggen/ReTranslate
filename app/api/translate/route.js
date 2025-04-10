// app/api/translate/route.js
import { NextResponse } from 'next/server';
import { translateHTMLFiles, translateCSVFile } from '../../../lib/translation';
import archiver from 'archiver';
import streamBuffers from 'stream-buffers';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const fileType = formData.get('fileType'); // 'html' of 'csv'
    const specialFileType = formData.get('specialFileType'); // 'standaard', 'blogs', 'advies'
    const apiKeyOption = formData.get('apiKeyOption'); // API-sleutel
    const selectedLangs = formData.getAll('selectedLangs');

    let outputFiles = [];
    if (fileType === 'html') {
      outputFiles = await translateHTMLFiles(formData, selectedLangs, apiKeyOption, specialFileType);
    } else if (fileType === 'csv') {
      outputFiles = await translateCSVFile(formData, selectedLangs, apiKeyOption, specialFileType);
    }
    
    // Maak een ZIP-bestand in het geheugen aan
    const buffer = await createZipBuffer(outputFiles);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="translated.zip"'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Er is een fout opgetreden: ' + error.message },
      { status: 500 }
    );
  }
}

function createZipBuffer(files) {
  return new Promise((resolve, reject) => {
    const outputBuffer = new streamBuffers.WritableStreamBuffer();
    const archive = archiver('zip', { zlib: { level: 9 }});
    archive.on('error', err => reject(err));
    outputBuffer.on('finish', () => {
      resolve(outputBuffer.getContents());
    });
    archive.pipe(outputBuffer);
    files.forEach(file => {
      archive.append(file.content, { name: file.filename });
    });
    archive.finalize();
  });
}
