// components/FileUpload.jsx
'use client';

export default function FileUpload({ fileType, setSelectedFiles }) {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  return (
    <div>
      <input 
        type="file" 
        accept={fileType === 'html' ? '.html' : '.csv'} 
        multiple={fileType === 'html'} 
        onChange={handleFileChange} 
      />
    </div>
  );
}
