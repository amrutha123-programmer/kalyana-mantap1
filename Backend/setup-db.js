require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const schemaPath = path.join(__dirname, "db_schema.sql");
const sql = fs.readFileSync(schemaPath, "utf8");

pool.connect()
    .then(client => {
        console.log("Connected to database. Running schema script...");
        return client.query(sql)
            .then(() => {
                console.log("✅ Database schema initialized successfully!");
                client.release();
                pool.end();
            })
            .catch(err => {
                console.error("❌ Error applying schema:", err);
                client.release();
                pool.end();
            });
    })
    .catch(err => {
        console.error("❌ Connection failed:", err);
        pool.end();
    });
