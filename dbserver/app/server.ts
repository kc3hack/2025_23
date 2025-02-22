
var express = require('express');
var app = express();
require('dotenv').config();
const mysql = require('mysql2');
const { Pool } = require("pg");


const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
const test_post_for_llmfront=require("./test/test_post_for_llmfront.ts");


const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

//postgre
const pool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: Number(process.env.PG_PORT),
});



connection.connect(error => {
    if (error) {
        console.error('Database connection failed:', error.stack);
        return;
    }
    console.log('Connected to database.');
});

const query = (text, params) => {
    return pool.query(text, params);
};


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
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({message: 'Not authenticated'});
    }
};


//login
app.post('/login', (req, res) => {
    const {User_name, pwd} = req.body;
    //console.log(1);
    connection.query(
        'SELECT * FROM User WHERE User_name = ?',
        [User_name],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({message: 'Internal server error'});
            }

            if (results.length > 0) {
                const hashedPassword = results[0].pwd;

                bcrypt.compare(pwd, hashedPassword, (err, isMatch) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({message: 'Internal server error'});
                    }

                    if (isMatch) {
                        console.log("ok");
                        req.session.userId = results[0].id;
                        req.session.User_name = results[0].User_name;
                        req.session.character_id = results[0].character_id;
                        console.log(req.session);

                        res.json({message: 'Login successful'});
                    } else {
                        res.status(401).json({message: 'Invalid credentials'});
                    }
                });
            } else {
                res.status(401).json({message: 'User not found'});
            }
        }
    );
});


app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({message: 'Failed to logout'});
        }

        res.clearCookie('backend_session');
        console.log("logout", req.session);
        res.json({message: 'Logout successful'});
    });
});


app.post('/signup', (req, res) => {
    const {User_name, pwd, nickname, character_id} = req.body;

    //console.log(1);

    if (!User_name || !pwd || !nickname) {
        return res.status(400).json({error: 'Missing required fields'});
    }

    //console.log(req.body);

    bcrypt.hash(pwd, 10, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).json({error: 'Server error'});
        }

        connection.query(
            'INSERT INTO User (User_name, pwd,character_id,nickname) VALUES (?, ?,0,?)',
            [User_name, hash, nickname],
            (error, result) => {
                if (error) {
                    console.error('Error inserting data:', error);
                    return res.status(500).json({error: 'Server error'});
                }
                //console.log(1);
                res.json({
                    data: result,
                    message: 'Login successful'
                });
            }
        );
    });
});

app.put('/character_id_put', isAuthenticated, (req, res) => {
    console.log(req.session);

    const {User_name} = req.session;  // セッションからUser_nameを取得
    const {character_id} = req.body;  // リクエストボディからcharacter_idを取得

    console.log('User_name:', User_name);  // セッションのUser_nameを確認
    console.log('character_id:', character_id);  // character_idを確認

    connection.query(
        'UPDATE User set character_id=? WHERE User_name = ?',
        [character_id, User_name],

        (error, result) => {
            if (error) {
                console.error('Error inserting data:', error);
                return res.status(500).json({error: 'Server error'});
            }
            if (result) {
                res.status(200).json({message: 'successful'});
            }
        }
    )
});

app.get('/character_id_get', isAuthenticated, (req, res) => {
    const {User_name} = req.session;
    console.log(req.session);
    console.log("get", User_name);
    connection.query(
        'SELECT * FROM User WHERE User_name = ?',
        [User_name],
        (error, results) => {
            if (error) {
                console.error('Error inserting data:', error);
            }
            if (results) {
                //console.log("ok");
                const character_id = results[0].character_id;
                const nickname = results[0].nickname;
                const id = results[0].id;
                console.log(results);
                return res.status(200).json({
                    message: 'Successful',
                    data: {
                        character_id: character_id,
                        user_id: id,
                        user_name: nickname
                    }
                });
            }
        }
    )
})

//postgres


app.get("/postgres", async (req, res) => {
    const { UserId } = req.session || 1;

    try {
        const result = await query(
            `SELECT 
                message->'data'->>'type' AS type,
                message->'data'->>'content' AS content
            FROM chat_history_0 
            WHERE message->'data'->>'id' = $1
            ORDER BY created_at DESC
            LIMIT 30`,
            [UserId]
        );

        const objectTypeData=result.rows.map(row => row.message_data);
        res.json(objectTypeData);

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Database error" });
    }
});



//ここからtest
test_post_for_llmfront(app);
/*
app.post('/test/post_for_llmfront',(req,res)=>{
    console.log(req.body);
})*/
