var express = require('express');
var app = express();
require('dotenv').config();
const mysql = require('mysql2');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');


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



app.get('/', (req, res) => {
    res.send('Hello World!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.use(cors({
    origin: 'http://localhost:3000', // フロントエンドのURL
    credentials: true // クッキーを許可
}));

app.use(express.json());

app.use(
    session({
        name: "backend_session",
        secret: process.env.SESSION_SECRET || 'default_secret_key',
        resave: true,
        saveUninitialized: true,
        cookie: {
            secure: false, // HTTPSの場合に有効化
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000 // クッキーの有効期限 (1日)
        }
    })
);


const isAuthenticated = (req, res, next) => {
    console.log(req.session);
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
};


//login
app.post('/login', (req, res) => {
    const { User_name, pwd} = req.body;
    console.log(1);
    connection.query(
        'SELECT * FROM User WHERE User_name = ?',
        [User_name],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (results.length > 0) {
                const hashedPassword = results[0].pwd;

                bcrypt.compare(pwd, hashedPassword, (err, isMatch) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: 'Internal server error' });
                    }

                    if (isMatch) {
                        console.log("ok");
                        req.session.userId = results[0].id;
                        req.session.User_name = User_name;
                        req.session.character_id=results[0].character_id;
                        console.log(req.session);

                        res.json({ message: 'Login successful' });
                    } else {
                        res.status(401).json({ message: 'Invalid credentials' });
                    }
                });
            } else {
                res.status(401).json({ message: 'User not found' });
            }
        }
    );
});


app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ message: 'Failed to logout' });
        }

        res.clearCookie('backend_session');
        res.json({ message: 'Logout successful' });
    });
});




app.post('/signup', (req, res) => {
    const {User_name, pwd,nickname} = req.body;

    //console.log(1);

    if (!User_name || !pwd || !nickname) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    //console.log(req.body);

    bcrypt.hash(pwd, 10, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({ error: 'Server error' });
        }

        connection.query(
            'INSERT INTO User (User_name, pwd,Character_id,nickname) VALUES (?, ?,0,?)',
            [User_name, hash,nickname],
            (error, result) => {
                if (error) {
                    console.error('Error inserting data:', error);
                    return res.status(500).json({ error: 'Server error' });
                }
                //console.log(1);
                res.json({ data: result,
                    message: 'Login successful'});
            }
        );
    });
});