import db from "../config/db.js";

async function runMigration() {
  try {
    console.log("\n🔄 MIGRATION: Adding Program_Resources table...\n");
    
    // Check if Program_Resources table exists
    const [tables] = await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Program_Resources'
    `);
    
    if (tables.length === 0) {
      console.log("📝 Program_Resources table doesn't exist. Creating it...\n");
      
      await db.query(`
        CREATE TABLE IF NOT EXISTS Program_Resources (
          resource_id INT AUTO_INCREMENT PRIMARY KEY,
          program_id INT NOT NULL,
          resource_type ENUM('image', 'youtube'),
          resource_url VARCHAR(1000),
          caption VARCHAR(255),
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

          INDEX idx_program_resources_program_id (program_id),
          INDEX idx_program_resources_sort_order (sort_order),

          FOREIGN KEY (program_id) REFERENCES Programs(program_id)
            ON UPDATE CASCADE ON DELETE CASCADE
        ) ENGINE=InnoDB
      `);
      
      console.log("✅ Program_Resources table created successfully!\n");
    } else {
      console.log("✅ Program_Resources table already exists!\n");
    }
    
    // Verify the table structure
    const [columns] = await db.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Program_Resources' AND TABLE_SCHEMA = DATABASE()
      ORDER BY ORDINAL_POSITION
    `);
    
    if (columns.length > 0) {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("Program_Resources Table Structure:");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      
      columns.forEach((col) => {
        console.log(`  • ${col.COLUMN_NAME}: ${col.COLUMN_TYPE}`);
      });
      
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ Migration completed successfully!\n");
      process.exit(0);
    } else {
      console.log("❌ Failed to create Program_Resources table\n");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

runMigration();
