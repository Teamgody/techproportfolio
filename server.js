
import express from 'express';
import { google } from 'googleapis';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- STATIC FILES ---
// 1. Serve React App (Frontend)
app.use(express.static(path.join(__dirname, 'dist')));
// 2. Serve Uploaded Files (Images/PDFs)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// --- FILE UPLOAD CONFIG (Multer) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        // Rename file to avoid duplicates: timestamp-random.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext)
    }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // Limit 50MB
});


// --- GOOGLE SHEETS CONFIG ---
const SPREADSHEET_ID = '1SOiu3TxFCgB-YXmR6vMig4Kp5gU-U3IfFAr9aLARgBo'; 
const RANGE = 'DB!A1:B1'; 

// Robust Credential Finding (Handles credentials.json AND credentials.json.json)
let CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
if (!fs.existsSync(CREDENTIALS_PATH)) {
    const doubleExtPath = path.join(__dirname, 'credentials.json.json');
    if (fs.existsSync(doubleExtPath)) {
        CREDENTIALS_PATH = doubleExtPath;
        console.log("Found credentials with double extension (.json.json). Using it.");
    }
}

// Global Data Cache
let globalUsers = [];
let globalProfiles = [];

async function getSheetsClient() {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        if (!global.warnedCredentials) {
             console.warn(`WARNING: credentials.json not found at ${CREDENTIALS_PATH}. Using in-memory storage.`);
             global.warnedCredentials = true;
        }
        return null;
    }
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: CREDENTIALS_PATH,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        return google.sheets({ version: 'v4', auth });
    } catch (e) {
        console.error("Error initializing Google Auth:", e.message);
        return null;
    }
}

// --- API ENDPOINTS ---

// 1. Upload API
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the URL that the frontend can use to access the file
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.originalname });
});

// 2. Read DB
app.get('/api/db/read', async (req, res) => {
    try {
        const sheets = await getSheetsClient();
        if (!sheets) {
            return res.json({ users: globalUsers, profiles: globalProfiles });
        }
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });
        const rows = response.data.values;
        if (rows && rows.length > 0) {
            let users = [];
            let profiles = [];
            try {
                if (rows[0][0]) users = JSON.parse(rows[0][0]);
                if (rows[0][1]) profiles = JSON.parse(rows[0][1]);
            } catch (e) { console.error("Parse error", e); }
            
            globalUsers = users;
            globalProfiles = profiles;
            res.json({ users, profiles });
        } else {
            res.json({ users: [], profiles: [] });
        }
    } catch (error) {
        console.error('Read Error:', error.message);
        res.json({ users: globalUsers, profiles: globalProfiles });
    }
});

// 3. Write DB
app.post('/api/db/write', async (req, res) => {
    const { users, profiles } = req.body;
    globalUsers = users;
    globalProfiles = profiles;

    try {
        const sheets = await getSheetsClient();
        if (!sheets) return res.json({ success: true, mode: 'memory' });

        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
            valueInputOption: 'RAW',
            requestBody: {
                values: [[JSON.stringify(users), JSON.stringify(profiles)]],
            },
        });
        res.json({ success: true, mode: 'sheets' });
    } catch (error) {
        console.error('Write Error:', error.message);
        res.json({ success: false, error: error.message });
    }
});

// React Fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Looking for credentials at: ${CREDENTIALS_PATH}`);
});
