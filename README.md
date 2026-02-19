# Howiya Backend API

Backend server for the Howiya Health Insurance System

## 🚀 Quick Start

### Install Dependencies
```bash
npm install
```

### Configure Environment
Copy `.env.example` to `.env` and update with your settings:
```bash
cp .env.example .env
```

### Start Server
```bash
# Development
npm start

# Or with nodemon (auto-restart)
npm run dev
```

Server will run on: http://localhost:5000

## 📋 API Endpoints

### Health Check
- **GET** `/api/health` - Check server status

### User Management
- **POST** `/api/check-user` - Check if user exists (auto-creates if not)
  ```json
  {
    "identity_number": "1234567890"
  }
  ```

### Formulaire
- **GET** `/api/formulaire/:identity_number` - Get user's form data
- **POST** `/api/formulaire` - Save form data
  ```json
  {
    "identity_number": "1234567890",
    "formData": { ... },
    "dependents": [ ... ]
  }
  ```

## 🔧 Configuration

Edit `.env` file:
- `PORT` - Server port (default: 5000)
- `DB_HOST` - MySQL host
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name
- `ALLOWED_ORIGINS` - CORS allowed origins (comma-separated)

## 📊 Database

Import `database.sql` to your MySQL server:
```bash
mysql -u root -p < ../database.sql
```

## 🔒 Security

- Environment variables for sensitive data
- CORS configured for specific origins
- Input validation and error handling
- Graceful shutdown handling

## 📦 Dependencies

- express - Web framework
- mysql2 - MySQL client
- cors - CORS middleware
- dotenv - Environment variables
- body-parser - Request body parsing

## 🐛 Debugging

Check logs for:
- Database connection status
- API requests
- Errors and warnings

All operations are logged with emoji indicators for easy monitoring.
