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
    connectionLimit: 10,
    queueLimit: 0,
  });
  
  if (process.env.NODE_ENV !== "production") {
  console.log("✅ MySQL pool created successfully");
}
  export default db;