  import mysql from "mysql2/promise";
  import dotenv from "dotenv";

  dotenv.config(); 

  // Create a connection pool
  const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 20,  // Increased from 10 to handle more concurrent requests
    queueLimit: 0,        // No queue limit - monitor in production
  });
  
  if (process.env.NODE_ENV !== "production") {
  }
  export default db;