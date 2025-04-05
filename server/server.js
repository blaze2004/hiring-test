const express=require('express');
const cors=require('cors');
const dotenv=require('dotenv');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const sqlite3=require('sqlite3').verbose();
const { open }=require('sqlite');

dotenv.config();

const app=express();
app.use(cors());
app.use(express.json());

let db;
const initializeDatabase=async () => {
    db=await open({
        filename: __dirname+'/database.sqlite',
        driver: sqlite3.Database
    });


    await db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        todo_id INTEGER,
        before_data TEXT,
        after_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT 0,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );
  `);

    console.log('Database initialized');
};

const authenticateToken=(req, res, next) => {
    // const authHeader=req.headers['authorization'];
    // const token=authHeader&&authHeader.split(' ')[1];

    const token = req.cookies?.token||req.headers['authorization']; // added cookies access

    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const verified=jwt.verify(token, process.env.JWT_SECRET);
        req.user=verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

const requireAdmin = (req, res, next) => { // here i have created a middleware that checks whethere the given user is admin or not
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access only' });
    }
    next();
};

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password , role }=req.body;


        const existingUser=await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }


        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password, salt);


        const result=await db.run(
            'INSERT INTO users (email, password, role) VALUES (?, ?,?)',
            [email, hashedPassword, role||'user']
        );

        const userId=result.lastID;
        const newUser={ id: userId, email , role:role||'user' };


        const token=jwt.sign({ id: userId, role: role || 'user'}, process.env.JWT_SECRET); // i have added roles for selective logs for admin only so that only admin can see logs
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
          }).status(201).json({ token, user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password }=req.body;


        const user=await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }


        const validPassword=await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }


        const token=jwt.sign({ id: user.id , role: user.role }, process.env.JWT_SECRET);
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 
        }).status(200).json({ token, user: { id: user.id, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/todos', authenticateToken, async (req, res) => {
    try {
        const todos=await db.all('SELECT * FROM todos WHERE user_id = ?', [req.user.id]);
        res.status(200).json(todos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/todos', authenticateToken, async (req, res) => {
    try {
        const { title, description }=req.body;

        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        } // added some checks to make the system more robust


        const newTodo={
            title,
            description,
            completed: 0,
            user_id: req.user.id
        };

        const result=await db.run(
            `INSERT INTO todos (title, description, completed, user_id)
            VALUES (?, ?, ?, ?)`,
            [newTodo.title, newTodo.description, newTodo.completed, newTodo.user_id]
        );

        const todoId=result.lastID;
        const createdTodo=await db.get('SELECT * FROM todos WHERE id = ?', [todoId]);

        await db.run(
            `INSERT INTO audit_logs (user_id, action, details)
             VALUES (?, ?, ?,?)`,
            [req.user.id, 'CREATE_TODO',todoId,  JSON.stringify(createdTodo)]
        );


        res.status(201).json(createdTodo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/todos/:id', authenticateToken, async (req, res) => {
    try {
        const { id }=req.params;
        const { title, description, completed }=req.body;


        const currentTodo=await db.get(
            'SELECT * FROM todos WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (!currentTodo) {
            return res.status(404).json({ error: 'Todo not found' });
        }


        const updatedTodo={
            title: title!==undefined? title:currentTodo.title,
            description: description!==undefined? description:currentTodo.description,
            completed: completed!==undefined? (completed? 1:0):currentTodo.completed
        };


        await db.run(
            `UPDATE todos SET title = ?, description = ?, completed = ?
            WHERE id = ? AND user_id = ?`,
            [updatedTodo.title, updatedTodo.description, updatedTodo.completed, id, req.user.id]
        );

        const result=await db.get('SELECT * FROM todos WHERE id = ?', [id]);



        // now I am adding difference to the logs
        await db.run(
            `INSERT INTO audit_logs (user_id, action, details)
             VALUES (?, ?, ?,?)`,
            [req.user.id, 'UPDATE_TODO',id,, JSON.stringify(currentTodo), JSON.stringify(updatedTodo)]
        );


        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/todos/:id', authenticateToken, async (req, res) => {
    try {
        const { id }=req.params;


        const currentTodo=await db.get(
            'SELECT * FROM todos WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (!currentTodo) {
            return res.status(404).json({ error: 'Todo not found' });
        }


        await db.run(
            'DELETE FROM todos WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        // Audit log
        await db.run(
            `INSERT INTO audit_logs (user_id, action, details)
            VALUES (?, ?, ?,?)`,
            [req.user.id, 'DELETE_TODO', id,JSON.stringify(currentTodo)]
        );

        res.status(200).json({ message: 'Todo deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/audits', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { user, action } = req.query;
        let query = 'SELECT * FROM audit_logs WHERE 1=1';
        const params = [];

        if (user) {
            query += ' AND user_id = ?';
            params.push(user);
        }
        if (action) {
            query += ' AND action = ?';
            params.push(action);
        }

        query += ' ORDER BY created_at DESC';

        const logs = await db.all(query, params);
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});


const PORT=process.env.PORT||5000;
const startServer=async () => {
    await initializeDatabase();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});