import EventsModel from "../models/eventsModel.js";
import { logAdminAction } from "../utils/auditLogger.js";
import { slugify } from "../utils/slug.js";
import { validateDisplayOrder } from "../utils/displayOrderValidator.js";
import { ERROR_MESSAGES, createFieldErrors, slugAlreadyExists } from "../utils/errorMessages.js";
class EventsController {
    static async getAll(req, res, next) {
        try {
            const { category } = req.query;
            
            // If category is specified, filter by category
            if (category && (category === 'upcoming' || category === 'past')) {
                const events = await EventsModel.getByCategory(category);
                return res.json(events);
            }
            
            // Otherwise return all events
            const events = await EventsModel.getAll();
            res.json(events);
        } catch (err) {
            next(err);
        }
    }

    static async getById(req, res, next) {
        try {
            const slugOrId = req.params.slug;
            const event = Number.isFinite(Number(slugOrId))
                ? await EventsModel.getById(slugOrId)
                : await EventsModel.getBySlug(slugOrId);
            if (event) {
                res.json(event);
            } else {
                res.status(404).json({ message: "Event not found" });
            }
        } catch (err) {
            next(err);
        }
    }

    static async create(req, res, next) {
        try {
            const { event_name, description, rich_content, event_date, event_time, venue, organized_by, category, slug, seo_title, seo_description, seo_keywords, display_order } = req.body;
            const normalizedSlug = slugify(slug || event_name);

            // Validate required fields with specific error messages
            const fieldErrors = [];

            if (!event_name?.trim()) {
                fieldErrors.push({ field: "event_name", message: ERROR_MESSAGES.EVENT_TITLE_REQUIRED });
            }

            if (fieldErrors.length > 0) {
                return res.status(400).json(createFieldErrors(fieldErrors));
            }

            // Validate category if provided
            if (category && category !== 'upcoming' && category !== 'past') {
                return res.status(400).json({ message: "Category must be either 'upcoming' or 'past'." });
            }

            // Validate display order
            const orderValidation = await validateDisplayOrder(
                'Events',
                display_order,
                null,
                'event_id'
            );

            // If conflict, return warning
            if (!orderValidation.isValid) {
                return res.status(409).json({
                    success: false,
                    message: 'Display order conflict detected',
                    warning: orderValidation.warning,
                    suggestion: orderValidation.suggestion,
                    nextAvailable: orderValidation.nextAvailable,
                    conflictingEventId: orderValidation.conflictData?.event_id,
                });
            }

            const id = await EventsModel.create({ 
                event_name, 
                slug: normalizedSlug,
                description, 
                rich_content,
                event_date, 
                event_time, 
                venue, 
                organized_by,
                category: category || 'upcoming',
                seo_title,
                seo_description,
                seo_keywords,
                display_order: orderValidation.displayOrder,
            }); 
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "CREATE",
                entity: "EVENT",
                entity_id: id,
                ip: req.ip
            });
            res.status(201).json({ 
                success: true,
                message: "Event created", 
                id,
                display_order: orderValidation.displayOrder
            });
        } catch (err) {
            if (err?.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ message: "Slug already exists." });
            }
            next(err); 
        }
    }

    static async update(req, res, next) {
        try {
            const { event_name, description, rich_content, event_date, event_time, venue, organized_by, category, slug, seo_title, seo_description, seo_keywords, display_order } = req.body;
            const normalizedSlug = slugify(slug || event_name);

            // Validate category if provided
            if (category && category !== 'upcoming' && category !== 'past') {
                return res.status(400).json({ message: "Category must be either 'upcoming' or 'past'." });
            }

            // Validate display order if provided
            let finalDisplayOrder = undefined;
            if (display_order !== undefined) {
                const orderValidation = await validateDisplayOrder(
                    'Events',
                    display_order,
                    req.params.id, // Exclude current event from conflict check
                    'event_id'
                );

                if (!orderValidation.isValid) {
                    return res.status(409).json({
                        success: false,
                        message: 'Cannot update display order - conflict detected',
                        warning: orderValidation.warning,
                        suggestion: orderValidation.suggestion,
                        nextAvailable: orderValidation.nextAvailable,
                        conflictingEventId: orderValidation.conflictData?.event_id,
                    });
                }
                finalDisplayOrder = orderValidation.displayOrder;
            }

            await EventsModel.update(req.params.id, { 
                event_name, 
                slug: normalizedSlug,
                description, 
                rich_content,
                event_date, 
                event_time, 
                venue, 
                organized_by,
                category,
                seo_title,
                seo_description,
                seo_keywords,
                display_order: finalDisplayOrder,
            });
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "UPDATE",
                entity: "EVENT",
                entity_id: req.params.id,
                ip: req.ip
            });
            res.json({ success: true, message: "Event updated" });
        } catch (err) {
            if (err?.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ message: "Slug already exists." });
            }
            next(err);
        }
    }

    static async delete(req, res, next) {
        try {
            await EventsModel.delete(req.params.id);
            res.json({ message: "Event deleted" });
        } catch (err) {
            next(err);
        }
    }

    // ================= PROGRAMS CONTROLLERS =================
    static async getAllPrograms(req, res) {
        try {
            const programs = await EventsModel.getAllPrograms();
            res.status(200).json(programs);
        } catch {
            res.status(500).json({ message: "Failed to fetch programs." });
        }
    }

    static async getProgramById(req, res) {
        try {
            const program = await EventsModel.getProgramById(req.params.id);
            if (!program) return res.status(404).json({ message: "Program not found." });
            res.status(200).json(program);
        } catch {
            res.status(500).json({ message: "Failed to fetch program." });
        }
    }

    static async getProgramBySlug(req, res) {
        try {
            const program = await EventsModel.getProgramBySlug(req.params.slug);
            if (!program) return res.status(404).json({ message: "Program not found." });
            res.status(200).json(program);
        } catch {
            res.status(500).json({ message: "Failed to fetch program." });
        }
    }

    static async getProgramResources(req, res) {
        try {
            const resources = await EventsModel.getProgramResources(req.params.id);
            res.status(200).json(resources);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch program resources." });
        }
    }

    static async createProgram(req, res) {
        const displayOrderNum = req.body.display_order !== undefined && req.body.display_order !== null && req.body.display_order !== '' 
            ? parseInt(req.body.display_order, 10) 
            : 0;
        
        // Format program_date to YYYY-MM-DD
        let programDate = req.body.program_date;
        if (programDate && programDate.includes('T')) {
            programDate = programDate.split('T')[0];
        }
        
        // Handle main image upload
        let imageUrl = null;
        if (req.files?.image_url && req.files.image_url.length > 0) {
            imageUrl = `/uploads/${req.files.image_url[0].filename}`;
        }
        
        const programData = {
            ...req.body,
            program_date: programDate,
            slug: slugify(req.body.slug || req.body.title),
            display_order: displayOrderNum,
            ...(imageUrl && { image_url: imageUrl }),
        };
        try {
            const newId = await EventsModel.createProgram(programData);

            // Handle program resources (images, youtube videos)
            const extraImageFiles = req.files?.extraImages || [];
            const ytLinks = req.body.ytLinks ? (typeof req.body.ytLinks === 'string' ? JSON.parse(req.body.ytLinks) : req.body.ytLinks) : [];

            const normalizedResources = [];

            // Parse resources from body
            const bodyResources = req.body.resources ? (typeof req.body.resources === 'string' ? JSON.parse(req.body.resources) : req.body.resources) : [];
            bodyResources.forEach((item, index) => {
              if (
                item &&
                (item.resource_type === "image" || item.resource_type === "youtube") &&
                item.resource_url
              ) {
                normalizedResources.push({
                  resource_type: item.resource_type,
                  resource_url: item.resource_url,
                  caption: item.caption || null,
                  sort_order: item.sort_order ?? index + 1,
                });
              }
            });

            // Add extra image files
            extraImageFiles.forEach((file, index) => {
              normalizedResources.push({
                resource_type: "image",
                resource_url: `/uploads/${file.filename}`,
                sort_order: normalizedResources.length + index + 1,
              });
            });

            // Add youtube links
            ytLinks.filter(Boolean).forEach((url, index) => {
              normalizedResources.push({
                resource_type: "youtube",
                resource_url: url,
                sort_order: normalizedResources.length + index + 1,
              });
            });

            // Save resources if any
            if (normalizedResources.length > 0) {
              await EventsModel.replaceProgramResources(newId, normalizedResources);
            }

            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "CREATE",
                entity: "PROGRAM",
                entity_id: newId,
                ip: req.ip
            });

            res.status(201).json({ message: "Program created successfully.", program_id: newId, ...programData });
        } catch (error) {
            if (error?.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ message: "Slug already exists.", details: "A program with this slug already exists." });
            }
            res.status(500).json({ 
                message: "Failed to create program.",
                details: error?.message || error?.sqlMessage || String(error)
            });
        }
    }

    static async updateProgram(req, res) {
        const { id } = req.params;
        const displayOrderNum = req.body.display_order !== undefined && req.body.display_order !== null && req.body.display_order !== '' 
            ? parseInt(req.body.display_order, 10) 
            : undefined;
        
        // Format program_date to YYYY-MM-DD
        let programDate = req.body.program_date;
        if (programDate && programDate.includes('T')) {
            programDate = programDate.split('T')[0];
        }
        
        // Handle main image upload - only update if new image is uploaded
        let imageUrlUpdate = {};
        if (req.files?.image_url && req.files.image_url.length > 0) {
            imageUrlUpdate = { image_url: `/uploads/${req.files.image_url[0].filename}` };
        }
        
        const updateData = {
            ...req.body,
            ...(programDate && { program_date: programDate }),
            ...(req.body.slug !== undefined || req.body.title !== undefined
                ? { slug: slugify(req.body.slug || req.body.title) }
                : {}),
            ...(displayOrderNum !== undefined && { display_order: displayOrderNum }),
            ...imageUrlUpdate,
        };
        
        // Remove image_url from updateData if it wasn't explicitly provided and no new image was uploaded
        if (!imageUrlUpdate.image_url && updateData.image_url) {
            delete updateData.image_url;
        }
        try {
            await EventsModel.updateProgram(id, updateData);

            // Handle program resources (images, youtube videos)
            const hasResourceInputs =
              req.body.resources !== undefined ||
              req.body.ytLinks !== undefined ||
              (req.files?.extraImages && req.files.extraImages.length > 0);

            if (hasResourceInputs) {
              const normalizedResources = [];

              // Parse resources from body
              const bodyResources = req.body.resources ? (typeof req.body.resources === 'string' ? JSON.parse(req.body.resources) : req.body.resources) : [];
              bodyResources.forEach((item, index) => {
                if (
                  item &&
                  (item.resource_type === "image" || item.resource_type === "youtube") &&
                  item.resource_url
                ) {
                  normalizedResources.push({
                    resource_type: item.resource_type,
                    resource_url: item.resource_url,
                    caption: item.caption || null,
                    sort_order: item.sort_order ?? index + 1,
                  });
                }
              });

              // Add extra image files
              const extraImageFiles = req.files?.extraImages || [];
              extraImageFiles.forEach((file, index) => {
                normalizedResources.push({
                  resource_type: "image",
                  resource_url: `/uploads/${file.filename}`,
                  sort_order: normalizedResources.length + index + 1,
                });
              });

              // Add youtube links
              const ytLinks = req.body.ytLinks ? (typeof req.body.ytLinks === 'string' ? JSON.parse(req.body.ytLinks) : req.body.ytLinks) : [];
              ytLinks.filter(Boolean).forEach((url, index) => {
                normalizedResources.push({
                  resource_type: "youtube",
                  resource_url: url,
                  sort_order: normalizedResources.length + index + 1,
                });
              });

              // Save/replace resources
              await EventsModel.replaceProgramResources(id, normalizedResources);
            }

            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "UPDATE",
                entity: "PROGRAM",
                entity_id: id,
                ip: req.ip
            });

            res.status(200).json({ message: "Program updated successfully." });
        } catch (error) {
            if (error?.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ message: "Slug already exists.", details: "A program with this slug already exists." });
            }
            if (error.message.includes("not found")) return res.status(404).json({ message: error.message });
            res.status(500).json({ 
                message: "Failed to update program.",
                details: error?.message || error?.sqlMessage || String(error)
            });
        }
    }

    static async deleteProgram(req, res) {
        const { id } = req.params;
        try {
            await EventsModel.deleteProgram(id);

            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "DELETE",
                entity: "PROGRAM",
                entity_id: id,
                ip: req.ip
            });

            res.status(200).json({ message: "Program deleted successfully." });
        } catch (error) {
            console.error("Error deleting program:", error);
            res.status(500).json({ 
                message: "Failed to delete program.",
                details: error?.message || error?.sqlMessage || String(error)
            });
        }
    }
}

export default EventsController;