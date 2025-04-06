// app/api/translate/route.js
import { NextResponse } from 'next/server';
import { translateHTMLFiles, translateCSVFile } from '../../../lib/translation';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const fileType = formData.get('fileType'); // 'html' of 'csv'
    const specialFileType = formData.get('specialFileType'); // 'standaard', 'blogs', 'advies'
    const apiKeyOption = formData.get('apiKeyOption'); // "key1" of "key2"
    const selectedLangs = formData.getAll('selectedLangs');
    
    if (fileType === 'html') {
      await translateHTMLFiles(formData, selectedLangs, apiKeyOption, specialFileType);
    } else if (fileType === 'csv') {
      await translateCSVFile(formData, selectedLangs, apiKeyOption, specialFileType);
    }
    
    return NextResponse.json({ status: 'success', message: 'Vertaling voltooid' });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Er is een fout opgetreden: ' + error.message },
      { status: 500 }
    );
  }
}
