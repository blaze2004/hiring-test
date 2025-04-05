const sqlite3 = require("sqlite3").verbose();
const { open } = require("sqlite");

let db;
const initializeDatabase = async () => {
    db = await open({
        filename: __dirname + "/database.sqlite",
        driver: sqlite3.Database,
    });

    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
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

    // CREATE TABLE IF NOT EXISTS audits (
    //   id INTEGER PRIMARY KEY AUTOINCREMENT,
    //   user_id INTEGER NULL,
    //   action TEXT NOT NULL,
    //   entity TEXT NOT NULL,
    //   entity_id INTEGER NULL,
    //   new_state TEXT NULL,
    //   previous_state TEXT NULL,
    //   timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    // );
  `);

    console.log("Database initialized");
};

module.exports = {
    initializeDatabase,
    db,
};
