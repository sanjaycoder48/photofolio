import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const DATA_FILE = path.join(__dirname, 'data.json');

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Read data
const readData = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
// Write data
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// API: Get all data
app.get('/api/data', (req, res) => {
  try {
    const data = readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// API: Update About section
app.post('/api/about', (req, res) => {
  try {
    const data = readData();
    data.about = { ...data.about, ...req.body };
    writeData(data);
    res.json({ success: true, about: data.about });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update data' });
  }
});

// API: Upload an image file (either gallery or owner portrait)
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const filename = req.file.filename;
  res.json({ success: true, url: `/uploads/${filename}` });
});

// API: Add a new gallery photo
app.post('/api/images', (req, res) => {
  try {
    const data = readData();
    const newImage = {
      id: Date.now(),
      src: req.body.src,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category
    };
    data.images.push(newImage);
    writeData(data);
    res.json({ success: true, images: data.images });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add image' });
  }
});

// API: Delete a gallery photo
app.delete('/api/images/:id', (req, res) => {
  try {
    const data = readData();
    const id = parseInt(req.params.id);
    data.images = data.images.filter((img) => img.id !== id);
    writeData(data);
    res.json({ success: true, images: data.images });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

const PORT = process.env.PORT || 5000;

// Serve the Vite React App in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`CMS Backend running on port ${PORT}`);
});
