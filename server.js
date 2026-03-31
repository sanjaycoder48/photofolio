import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_849204';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.status(401).json({ error: 'Not authorized' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalid or expired' });
    req.user = user;
    next();
  });
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());


// Ensure uploads directory exists (use /tmp on Vercel)
const UPLOADS_DIR = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, 'public/uploads');
const DATA_FILE = process.env.VERCEL ? '/tmp/data.json' : path.join(process.cwd(), 'data.json');

// Copy initial data to /tmp if on vercel and it doesn't exist yet
if (process.env.VERCEL && !fs.existsSync('/tmp/data.json')) {
  try {
    fs.copyFileSync(path.join(process.cwd(), 'data.json'), '/tmp/data.json');
  } catch (e) {
    console.error(e);
  }
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

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

// API: Login verification
app.post('/api/login', (req, res) => {
  if (req.body.password === ADMIN_PASS) {
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Incorrect password' });
  }
});

// API: Update About section
app.post('/api/about', authenticateToken, (req, res) => {
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
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const filename = req.file.filename;
  res.json({ success: true, url: `/uploads/${filename}` });
});

// API: Add a new gallery photo
app.post('/api/images', authenticateToken, (req, res) => {
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
app.delete('/api/images/:id', authenticateToken, (req, res) => {
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

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`CMS Backend running on port ${PORT}`);
  });
}

export default app;
