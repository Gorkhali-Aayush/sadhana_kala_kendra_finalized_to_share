import EventsModel from "../models/eventsModel.js";
import { logAdminAction } from "../utils/auditLogger.js";
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
            const event = await EventsModel.getById(req.params.id);
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
            const { event_name, description, event_date, event_time, venue, organized_by, category } = req.body;

            if (!event_name) {
                return res.status(400).json({ message: "Event name is required." });
            }

            // Validate category if provided
            if (category && category !== 'upcoming' && category !== 'past') {
                return res.status(400).json({ message: "Category must be either 'upcoming' or 'past'." });
            }

            const id = await EventsModel.create({ 
                event_name, 
                description, 
                event_date, 
                event_time, 
                venue, 
                organized_by,
                category: category || 'upcoming'
            }); 
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "CREATE",
                entity: "EVENT",
                entity_id: id,
                ip: req.ip
            });
            res.status(201).json({ message: "Event created", id });
        } catch (err) {
            console.error("Error creating event:", err);
            next(err); 
        }
    }

    static async update(req, res, next) {
        try {
            const { event_name, description, event_date, event_time, venue, organized_by, category } = req.body;

            // Validate category if provided
            if (category && category !== 'upcoming' && category !== 'past') {
                return res.status(400).json({ message: "Category must be either 'upcoming' or 'past'." });
            }

            await EventsModel.update(req.params.id, { 
                event_name, 
                description, 
                event_date, 
                event_time, 
                venue, 
                organized_by,
                category
            });
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "UPDATE",
                entity: "EVENT",
                entity_id: req.params.id,
                ip: req.ip
            });
            res.json({ message: "Event updated" });
        } catch (err) {
            console.error("Error updating event:", err);
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
}

export default EventsController;