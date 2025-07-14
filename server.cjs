const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect('mongodb://localhost:27017/nana2025', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define schemas
const Message = mongoose.model('Message', new mongoose.Schema({
  text: String,
  author: String,
  timestamp: { type: Date, default: Date.now },
}));

const Image = mongoose.model('Image', new mongoose.Schema({
  filename: String,
  originalname: String,
  timestamp: { type: Date, default: Date.now },
}));

// --- ADD THIS: Score model ---
const Score = mongoose.model('Score', new mongoose.Schema({
  gameId: String,
  name: String,
  score: Number,
  timestamp: { type: Date, default: Date.now }
}));

// API endpoints
app.post('/api/messages', async (req, res) => {
  const { text, author } = req.body;
  const message = new Message({ text, author });
  await message.save();
  res.status(201).json(message);
});

app.get('/api/messages', async (req, res) => {
  const messages = await Message.find().sort({ timestamp: 1 });
  res.json(messages);
});

app.post('/api/images', upload.single('image'), async (req, res) => {
  const { filename, originalname } = req.file;
  const image = new Image({ filename, originalname });
  await image.save();
  res.status(201).json(image);
});

app.get('/api/images', async (req, res) => {
  const images = await Image.find().sort({ timestamp: 1 });
  res.json(images);
});

// --- ADD THIS: Game scores endpoints ---
app.post('/api/scores/:gameId', async (req, res) => {
  const { name, score } = req.body;
  const { gameId } = req.params;
  const newScore = new Score({ gameId, name, score });
  await newScore.save();
  res.status(201).json(newScore);
});

app.get('/api/scores/:gameId', async (req, res) => {
  const { gameId } = req.params;
  const scores = await Score.find({ gameId }).sort({ score: -1, timestamp: 1 });
  res.json(scores);
});

app.listen(3001, () => console.log('Server running on port 3001'));