require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration for production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000'];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL connection with environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'howiya_db',
    port: process.env.DB_PORT || 3306,
    connectTimeout: 10000
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err);
        return;
    }
    console.log('✅ Connected to MySQL database');
});

// Check if user exists
app.post('/api/check-user', (req, res) => {
    const { identity_number } = req.body;
    console.log('🔍 Checking user with ID:', identity_number);

    const query = 'SELECT * FROM employees WHERE identity_number = ?';
    db.query(query, [identity_number], (err, results) => {
        if (err) {
            console.error('❌ Error checking user:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            console.log('✅ User exists:', identity_number);
            res.json({ exists: true, user: results[0] });
        } else {
            console.log('➕ User does not exist, will be added:', identity_number);
            // Add new employee
            const insertQuery = 'INSERT INTO employees (identity_number) VALUES (?)';
            db.query(insertQuery, [identity_number], (err, result) => {
                if (err) {
                    console.error('❌ Error adding user:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                console.log('✅ New user added:', identity_number);
                res.json({ exists: false, user: { id: result.insertId, identity_number } });
            });
        }
    });
});

// Get formulaire data for a user
app.get('/api/formulaire/:identity_number', (req, res) => {
    const { identity_number } = req.params;
    console.log('📄 Getting formulaire for ID:', identity_number);

    const query = 'SELECT * FROM formulaire WHERE identity_number = ?';
    db.query(query, [identity_number], (err, results) => {
        if (err) {
            console.error('❌ Error getting formulaire:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            console.log('✅ Formulaire found for:', identity_number);
            const formulaireId = results[0].id;
            
            // Get dependents
            const depQuery = 'SELECT * FROM dependents WHERE formulaire_id = ?';
            db.query(depQuery, [formulaireId], (err, dependents) => {
                if (err) {
                    console.error('❌ Error getting dependents:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                console.log('✅ Found', dependents.length, 'dependents');
                res.json({ formulaire: results[0], dependents });
            });
        } else {
            console.log('ℹ️ No formulaire found for:', identity_number);
            res.json({ formulaire: null, dependents: [] });
        }
    });
});

// Save formulaire
app.post('/api/formulaire', (req, res) => {
    const { identity_number, formData, dependents } = req.body;
    console.log('💾 Saving formulaire for ID:', identity_number);
    console.log('📝 Form data:', formData);
    console.log('👨‍👩‍👧‍👦 Dependents count:', dependents ? dependents.length : 0);

    const query = `
        INSERT INTO formulaire (
            identity_number, name, identity_expiry_date, mobile_number, 
            birth_date, agency, administration, job_title, 
            gender, marital_status, city
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            identity_expiry_date = VALUES(identity_expiry_date),
            mobile_number = VALUES(mobile_number),
            birth_date = VALUES(birth_date),
            agency = VALUES(agency),
            administration = VALUES(administration),
            job_title = VALUES(job_title),
            gender = VALUES(gender),
            marital_status = VALUES(marital_status),
            city = VALUES(city)
    `;

    const values = [
        identity_number,
        formData.name,
        formData.identity_expiry_date || null,
        formData.mobile_number || null,
        formData.birth_date || null,
        formData.agency || null,
        formData.administration || null,
        formData.job_title || null,
        formData.gender || 'male',
        formData.marital_status || 'single',
        formData.city || null
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('❌ Error saving formulaire:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        console.log('✅ Formulaire saved successfully');
        const formulaireId = result.insertId || result.lastInsertId;

        // Save dependents
        if (dependents && dependents.length > 0) {
            // Delete existing dependents first
            const deleteQuery = 'DELETE FROM dependents WHERE formulaire_id = ?';
            db.query(deleteQuery, [formulaireId], (err) => {
                if (err) {
                    console.error('❌ Error deleting old dependents:', err);
                }

                // Insert new dependents
                const depQuery = 'INSERT INTO dependents (formulaire_id, name, identity_number, birth_date, relationship) VALUES ?';
                const depValues = dependents.map(dep => [
                    formulaireId,
                    dep.name,
                    dep.identity_number || null,
                    dep.birth_date || null,
                    dep.relationship || null
                ]);

                db.query(depQuery, [depValues], (err) => {
                    if (err) {
                        console.error('❌ Error saving dependents:', err);
                        return res.status(500).json({ error: 'Database error' });
                    }
                    console.log('✅ Dependents saved:', dependents.length);
                    res.json({ success: true, message: 'Data saved successfully' });
                });
            });
        } else {
            res.json({ success: true, message: 'Data saved successfully' });
        }
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message 
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('⚠️ SIGTERM signal received: closing HTTP server');
    db.end(() => {
        console.log('✅ Database connection closed');
        process.exit(0);
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 CORS enabled for: ${allowedOrigins.join(', ')}`);
});
