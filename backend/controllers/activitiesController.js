import ActivitiesModel from "../models/activitiesModel.js";
import { logAdminAction } from "../utils/auditLogger.js";

class ActivitiesController {
    static async getAll(req, res, next) {
        try {
            const activities = await ActivitiesModel.getAll();
            res.json(activities);
        } catch (err) {
            next(err);
        }
    }

    static async getById(req, res, next) {
        try {
            const slugOrId = req.params.slug;
            const activity = Number.isFinite(Number(slugOrId))
                ? await ActivitiesModel.getById(slugOrId)
                : await ActivitiesModel.getBySlug(slugOrId);
            if (!activity) {
                return res.status(404).json({ message: "Activity not found" });
            }
            res.json(activity);
        } catch (err) {
            next(err);
        }
    }

    static async create(req, res, next) {
        try {
            const { title, description, video_url, slug, seo_title, seo_description, seo_keywords, display_order } = req.body;

            if (!title || !video_url) {
                return res.status(400).json({ message: "Title and video URL are required." });
            }

            const displayOrderNum = display_order !== undefined && display_order !== null && display_order !== '' 
                ? parseInt(display_order, 10) 
                : 0;

            const id = await ActivitiesModel.create({ 
                title, 
                description, 
                video_url, 
                slug: slug || null,
                seo_title: seo_title || null,
                seo_description: seo_description || null,
                seo_keywords: seo_keywords || null,
                display_order: displayOrderNum 
            });
            
            // Fetch the newly created activity to return complete data
            const newActivity = await ActivitiesModel.getById(id);
            
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "CREATE",
                entity: "ACTIVITY",
                entity_id: id,
                ip: req.ip,
            });

            res.status(201).json({ message: "Activity created", activity: newActivity });
        } catch (err) {
            next(err);
        }
    }

    static async update(req, res, next) {
        try {
            const { title, description, video_url, slug, seo_title, seo_description, seo_keywords, display_order } = req.body;
            const slugOrId = req.params.slug;
            const activityId = Number.isFinite(Number(slugOrId))
                ? slugOrId
                : (await ActivitiesModel.getBySlug(slugOrId))?.activity_id;
            
            const displayOrderNum = display_order !== undefined && display_order !== null && display_order !== '' 
                ? parseInt(display_order, 10) 
                : undefined;
            
            await ActivitiesModel.update(activityId, { 
                title, 
                description, 
                video_url, 
                slug: slug || null,
                seo_title: seo_title || null,
                seo_description: seo_description || null,
                seo_keywords: seo_keywords || null,
                display_order: displayOrderNum 
            });

            // Fetch the updated activity to return complete data
            const updatedActivity = await ActivitiesModel.getById(activityId);

            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "UPDATE",
                entity: "ACTIVITY",
                entity_id: activityId,
                ip: req.ip,
            });

            res.json({ message: "Activity updated", activity: updatedActivity });
        } catch (err) {
            next(err);
        }
    }

    static async delete(req, res, next) {
        try {
            const slugOrId = req.params.slug;
            const activityId = Number.isFinite(Number(slugOrId))
                ? slugOrId
                : (await ActivitiesModel.getBySlug(slugOrId))?.activity_id;
            
            await ActivitiesModel.delete(activityId);

            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "DELETE",
                entity: "ACTIVITY",
                entity_id: activityId,
                ip: req.ip,
            });

            res.json({ message: "Activity deleted" });
        } catch (err) {
            next(err);
        }
    }
}

export default ActivitiesController;
