// components/CSVColumnSelector.jsx
'use client';

import { useEffect, useState } from 'react';

export default function CSVColumnSelector({ csvFile, setSelectedColumns }) {
  const [columns, setColumns] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (csvFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        if (lines.length > 0) {
          const headers = lines[0].split(',');
          setColumns(headers);
          // Standaard alle kolommen selecteren
          setSelected(headers);
          setSelectedColumns(headers);
        }
      };
      reader.readAsText(csvFile);
    }
  }, [csvFile, setSelectedColumns]);

  const handleCheckboxChange = (column) => {
    let newSelected;
    if (selected.includes(column)) {
      newSelected = selected.filter(col => col !== column);
    } else {
      newSelected = [...selected, column];
    }
    setSelected(newSelected);
    setSelectedColumns(newSelected);
  };

  return (
    <div>
      <h4>Selecteer kolommen om te vertalen:</h4>
      {columns.map((col, index) => (
        <div key={index}>
          <label>
            <input 
              type="checkbox" 
              checked={selected.includes(col)}
              onChange={() => handleCheckboxChange(col)}
            />
            {col}
          </label>
        </div>
      ))}
    </div>
  );
}
