const express = require('express');
const bodyParser = require('body-parser');
const XLSX = require('xlsx');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = 'data.xlsx';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/reserve', (req, res) => {
  const { name, table, chair } = req.body;
  if (!name || !table || !chair) {
    return res.status(400).json({ error: 'Missing data' });
  }

  let workbook;
  let sheet;

  // Создаём Excel, если его нет
  if (fs.existsSync(DATA_FILE)) {
    workbook = XLSX.readFile(DATA_FILE);
    sheet = workbook.Sheets['Reservations'];
  } else {
    workbook = XLSX.utils.book_new();
    sheet = XLSX.utils.aoa_to_sheet([["Имя", "Стол", "Стул"]]);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Reservations');
  }

  // Добавляем новую запись
  const existingData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  existingData.push([name, table, chair]);

  // Сохраняем файл
  const newSheet = XLSX.utils.aoa_to_sheet(existingData);
  workbook.Sheets['Reservations'] = newSheet;
  XLSX.writeFile(workbook, DATA_FILE);

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
