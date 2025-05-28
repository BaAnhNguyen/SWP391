// backend/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const donors = [
  { id: 1, name: 'Nguyễn Văn A', bloodType: 'O+' },
  { id: 2, name: 'Trần Thị B', bloodType: 'A-' }
];

app.get('/api/donors', (req, res) => {
  res.json(donors);
});

app.listen(port, () => {
  console.log(`✅ Backend đang chạy tại http://localhost:${port}`);
});
