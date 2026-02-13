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

const alterPath = path.join(__dirname, "alter_schema.sql");
const sql = fs.readFileSync(alterPath, "utf8");

pool.connect()
    .then(client => {
        console.log("Connected to database. Applying schema changes...");
        return client.query(sql)
            .then(() => {
                console.log("✅ Schema updated successfully! user_id is now optional.");
                client.release();
                pool.end();
            })
            .catch(err => {
                console.error("❌ Error applying changes:", err);
                client.release();
                pool.end();
            });
    })
    .catch(err => {
        console.error("❌ Connection failed:", err);
        pool.end();
    });
