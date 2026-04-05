// models/aboutModel.js
import db from "../config/db.js";

const AboutModel = {
  // ===== BOD =====
  getAllBOD: async () => {
    const [rows] = await db.query("SELECT * FROM BOD ORDER BY display_order ASC, bod_id ASC");
    return rows;
  },

  getBODById: async (id) => {
    const [rows] = await db.query("SELECT * FROM BOD WHERE bod_id = ?", [id]);
    return rows[0];
  },

  getBODBySlug: async (slug) => {
    const [rows] = await db.query("SELECT * FROM BOD WHERE slug = ?", [slug]);
    return rows[0];
  },

  createBOD: async (data) => {
    const { name, designation, bio, details_content, profile_image, slug, seo_title, seo_description, seo_keywords, display_order } = data;
    const [result] = await db.query(
      "INSERT INTO BOD (name, designation, bio, details_content, profile_image, slug, seo_title, seo_description, seo_keywords, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [name, designation, bio || null, details_content || null, profile_image || null, slug || null, seo_title || null, seo_description || null, seo_keywords || null, display_order ?? 0]
    );
    return result.insertId;
  },

  updateBOD: async (id, data) => {
    const { name, designation, bio, details_content, profile_image, slug, seo_title, seo_description, seo_keywords, display_order } = data;
    
    // Build update query dynamically to only update fields that are provided
    const updates = [];
    const values = [];
    
    updates.push('name = ?');
    values.push(name);
    updates.push('designation = ?');
    values.push(designation);
    updates.push('bio = ?');
    values.push(bio || null);
    
    if (details_content !== undefined) {
      updates.push('details_content = ?');
      values.push(details_content || null);
    }
    
    if (slug !== undefined) {
      updates.push('slug = ?');
      values.push(slug || null);
    }
    
    if (seo_title !== undefined) {
      updates.push('seo_title = ?');
      values.push(seo_title || null);
    }
    
    if (seo_description !== undefined) {
      updates.push('seo_description = ?');
      values.push(seo_description || null);
    }
    
    if (seo_keywords !== undefined) {
      updates.push('seo_keywords = ?');
      values.push(seo_keywords || null);
    }
    
    // Only update profile_image if a new one is provided
    if (profile_image !== undefined) {
        updates.push('profile_image = ?');
        values.push(profile_image || null);
    }

    if (display_order !== undefined) {
      updates.push('display_order = ?');
      values.push(display_order);
    }
    
    values.push(id);
    
    const [result] = await db.query(
        `UPDATE BOD SET ${updates.join(', ')} WHERE bod_id = ?`,
        values
    );
    
    if (result.affectedRows === 0) throw new Error("BOD member not found.");
},

  deleteBOD: async (id) => {
    const [result] = await db.query("DELETE FROM BOD WHERE bod_id = ?", [id]);
    if (result.affectedRows === 0) throw new Error("BOD member not found.");
  },

  // ===== TEAM MEMBERS =====
  getAllTeamMembers: async () => {
    const [rows] = await db.query("SELECT * FROM team_members ORDER BY display_order ASC, id ASC");
    return rows;
  },

  getTeamMemberById: async (id) => {
    const [rows] = await db.query("SELECT * FROM team_members WHERE id = ?", [
      id,
    ]);
    return rows[0];
  },

  createTeamMember: async (data) => {
    const { name, subtitle, image_url, description, display_order } = data;

    const [result] = await db.query(
      "INSERT INTO team_members (name, subtitle, description, image_url, display_order) VALUES (?, ?, ?, ?, ?)",
      [name, subtitle || null, description || null, image_url || null, display_order ?? 0]
    );

    return result.insertId;
  },

  updateTeamMember: async (id, data) => {
    const { name, subtitle, description, image_url, display_order } = data;
    
    const updates = [];
    const values = [];
    
    updates.push('name = ?');
    values.push(name);
    updates.push('subtitle = ?');
    values.push(subtitle || null);
    
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description || null);
    }
    
    // Only update image_url if a new one is provided
    if (image_url !== undefined) {
        updates.push('image_url = ?');
        values.push(image_url || null);
    }

    if (display_order !== undefined) {
      updates.push('display_order = ?');
      values.push(display_order);
    }
    
    values.push(id);

    const [result] = await db.query(
        `UPDATE team_members SET ${updates.join(', ')} WHERE id = ?`,
        values
    );

    if (result.affectedRows === 0) throw new Error("Team Member not found.");
},

  deleteTeamMember: async (id) => {
    const [result] = await db.query("DELETE FROM team_members WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) throw new Error("Team Member not found.");
  },
};

export default AboutModel;
