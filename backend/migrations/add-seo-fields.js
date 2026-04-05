/**
 * Migration: Add SEO Fields
 * Date: 2024
 * Description: Adds SEO metadata fields (slug, seo_title, seo_description, seo_keywords) to Activities and Teachers tables
 */

const db = require('../config/db');

const addSeoFields = async () => {
  try {
    console.log('Starting migration: Add SEO Fields...');

    // ======================================
    // 1. Alter Activities Table
    // ======================================
    console.log('Adding SEO fields to activities table...');
    await db.promise().query(`
      ALTER TABLE activities
      ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE AFTER title,
      ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255) AFTER slug,
      ADD COLUMN IF NOT EXISTS seo_description TEXT AFTER seo_title,
      ADD COLUMN IF NOT EXISTS seo_keywords VARCHAR(255) AFTER seo_description
    `);
    console.log('✓ activities table updated');

    // Add index on slug
    await db.promise().query(`
      ALTER TABLE activities
      ADD INDEX IF NOT EXISTS idx_activities_slug (slug)
    `).catch(() => console.log('Index already exists'));

    // ======================================
    // 2. Alter Teachers Table
    // ======================================
    console.log('Adding SEO fields to Teachers table...');
    await db.promise().query(`
      ALTER TABLE Teachers
      ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE AFTER full_name,
      ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255) AFTER specialization,
      ADD COLUMN IF NOT EXISTS seo_description TEXT AFTER seo_title,
      ADD COLUMN IF NOT EXISTS seo_keywords VARCHAR(255) AFTER seo_description
    `);
    console.log('✓ Teachers table updated');

    // Add index on slug
    await db.promise().query(`
      ALTER TABLE Teachers
      ADD INDEX IF NOT EXISTS idx_teachers_slug (slug)
    `).catch(() => console.log('Index already exists'));

    console.log('✓ Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your models to handle the new SEO fields');
    console.log('2. Update your controllers to include CRUD operations for SEO metadata');
    console.log('3. Test SEO metadata retrieval and rendering');

  } catch (error) {
    console.error('Error running migration:', error.message);
    throw error;
  }
};

// Export for manual execution if needed
module.exports = { addSeoFields };

// Run the migration if this file is executed directly
if (require.main === module) {
  addSeoFields()
    .then(() => {
      console.log('\n✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    });
}
