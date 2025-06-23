const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Функция чтения JSON-файла
function readData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const content = fs.readFileSync(DATA_FILE, 'utf-8');
  try {
    return JSON.parse(content);
  } catch {
    return [];
  }
}

// Функция записи JSON-файла
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Получение всех броней
app.get('/reservations', (req, res) => {
  const data = readData();
  res.json(data);
});

// Добавление новой брони
app.post('/reserve', (req, res) => {
  const { name, table, chair } = req.body;
  if (!name || !table || !chair) {
    return res.status(400).json({ error: 'Missing data' });
  }

  const data = readData();

  // Проверка, занято ли уже место
  const alreadyBooked = data.find(r => r.table === table && r.chair === chair);
  if (alreadyBooked) {
    return res.status(409).json({ error: 'This seat is already booked' });
  }

  data.push({ name, table, chair });
  writeData(data);

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
