require("dotenv").config();
const { Pool } = require("pg");

console.log("Testing connection to:", process.env.DATABASE_URL ? "Defined" : "Undefined");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.connect()
    .then(client => {
        console.log("✅ Successfully connected to Neon PostgreSQL!");
        client.release();
        pool.end();
    })
    .catch(err => {
        console.error("❌ Connection failed:");
        console.error(err);
        pool.end();
    });
