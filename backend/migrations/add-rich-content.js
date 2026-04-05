import db from "../config/db.js";

async function runMigration() {
  try {
    console.log("\n🔄 COMPREHENSIVE MIGRATION: Adding rich_content to missing tables...\n");
    
    const tables = [
      { name: 'Events', afterColumn: 'description' },
      { name: 'Programs', afterColumn: 'description' },
    ];
    
    for (const table of tables) {
      console.log(`📋 Checking ${table.name} table...`);
      
      const [columns] = await db.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = ? AND COLUMN_NAME = 'rich_content' AND TABLE_SCHEMA = DATABASE()
      `, [table.name]);
      
      if (columns.length === 0) {
        console.log(`   ❌ rich_content missing in ${table.name}`);
        console.log(`   📝 Adding rich_content column after ${table.afterColumn}...`);
        
        const alterQuery = `
          ALTER TABLE ${table.name} 
          ADD COLUMN rich_content LONGTEXT AFTER ${table.afterColumn}
        `;
        
        await db.query(alterQuery);
        console.log(`   ✅ ${table.name} table updated with rich_content\n`);
      } else {
        console.log(`   ✅ rich_content already exists in ${table.name}\n`);
      }
    }
    
    // Verify News has it (should already exist)
    console.log(`📋 Checking News table...`);
    const [newsColumns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'News' AND COLUMN_NAME = 'rich_content' AND TABLE_SCHEMA = DATABASE()
    `);
    
    if (newsColumns.length > 0) {
      console.log(`   ✅ rich_content already exists in News\n`);
    } else {
      console.log(`   ❌ News missing rich_content, adding it...`);
      await db.query(`
        ALTER TABLE News 
        ADD COLUMN rich_content LONGTEXT AFTER title
      `);
      console.log(`   ✅ News table updated with rich_content\n`);
    }
    
    // Final verification
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("FINAL VERIFICATION:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    const finalTables = ['Events', 'News', 'Programs'];
    let allGood = true;
    
    for (const tableName of finalTables) {
      const [result] = await db.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = ? AND COLUMN_NAME = 'rich_content' AND TABLE_SCHEMA = DATABASE()
      `, [tableName]);
      
      if (result.length > 0) {
        console.log(`✅ ${tableName}.rich_content - OK`);
      } else {
        console.log(`❌ ${tableName}.rich_content - MISSING!`);
        allGood = false;
      }
    }
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    if (allGood) {
      console.log("✅ Migration completed successfully!");
      console.log("✅ All tables have rich_content column!\n");
      process.exit(0);
    } else {
      console.log("❌ Some tables still missing rich_content\n");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

runMigration();
