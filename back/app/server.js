var express = require('express');
var app = express();
require('dotenv').config();
const mysql = require('mysql');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');

// データベース接続の設定
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect(error => {
    if (error) {
        console.error('Database connection failed:', error.stack);
        return;
    }
    console.log('Connected to database.');
});

// デフォルトのルート
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// サーバーのポート設定
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
