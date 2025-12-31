import React, { useState, useEffect, useCallback } from "react";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../services/eventsService";

// --- Utility Functions (Keep these as they are good) ---

const formatEventDataForForm = (event) => ({
  event_id: event.event_id || null,
  event_name: event.event_name || "",
  description: event.description || "",
  event_date: event.event_date
    ? new Date(event.event_date).toISOString().split("T")[0]
    : "",
  event_time: event.event_time || "18:00",
  venue: event.venue || "",
  organized_by: event.organized_by || "",
  category: event.category || "upcoming", // Ensures default category is set
});

const formatFormDataForAPI = (formData) => {
  const { event_id, ...data } = formData;
  return data;
};

// --- Alert Component (Keep this as is) ---

const Alert = ({ message, type, onClose }) => (
  <div
    className={`p-4 rounded-lg font-roboto mb-4 ${
      type === "error"
        ? "bg-red-100 text-red-800 border border-red-400"
        : type === "success"
        ? "bg-green-100 text-green-800 border border-green-400"
        : "bg-blue-100 text-blue-800 border border-blue-400"
    }`}
  >
    {message}
    <button onClick={onClose} className="float-right font-bold ml-4">
      ×
    </button>
  </div>
);

// --- EventForm Component (Keep this as is) ---

const EventForm = ({ event, onSubmit, onCancel, isSaving }) => {
  const initialData = formatEventDataForForm(event || {});
  const [formData, setFormData] = useState(initialData);

  // Update form data when the 'event' prop changes (e.g., when clicking edit)
  useEffect(() => {
    setFormData(formatEventDataForForm(event || {}));
  }, [event]);

  // Use the same styles as requested in your saved preferences (Tailwind CSS properties)
  const formInputStyle = "mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500";
  const labelStyle = "block text-sm font-medium text-gray-700";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 md:p-8 rounded-lg shadow-xl border border-gray-100 font-roboto"
    >
      <h3 className="text-xl font-playfair font-bold mb-6 text-gray-800">
        {event?.event_id ? "Edit Event" : "Add New Event"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Event Name */}
        <div className="col-span-2">
          <label className={labelStyle}>
            Event Name
          </label>
          <input
            type="text"
            name="event_name"
            value={formData.event_name}
            onChange={handleChange}
            required
            className={formInputStyle}
          />
        </div>

        {/* Date */}
        <div>
          <label className={labelStyle}>
            Date
          </label>
          <input
            type="date"
            name="event_date"
            value={formData.event_date}
            onChange={handleChange}
            required
            className={formInputStyle}
          />
        </div>
        {/* Time */}
        <div>
          <label className={labelStyle}>
            Time
          </label>
          <input
            type="time"
            name="event_time"
            value={formData.event_time}
            onChange={handleChange}
            required
            className={formInputStyle}
          />
        </div>

        {/* Venue */}
        <div className="col-span-1">
          <label className={labelStyle}>
            Venue
          </label>
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            required
            className={formInputStyle}
          />
        </div>

        {/* Organized By */}
        <div className="col-span-1">
          <label className={labelStyle}>
            Organized By (Optional)
          </label>
          <input
            type="text"
            name="organized_by"
            value={formData.organized_by}
            onChange={handleChange}
            className={formInputStyle}
          />
        </div>

        {/* Category (Now using a Select) */}
        <div className="col-span-2">
          <label className={labelStyle}>
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className={formInputStyle + " bg-white appearance-none pr-10"}
          >
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className={labelStyle}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className={formInputStyle}
          ></textarea>
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-3 font-inter">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-150"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className={`px-5 py-2 rounded-md text-white font-semibold transition duration-150 ${
            isSaving ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isSaving
            ? "Saving..."
            : event?.event_id
            ? "Save Changes"
            : "Add Event"}
        </button>
      </div>
    </form>
  );
};

// --- AdminEvents Component (The main component to use) ---

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null); // Used for both creating and editing
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllEvents();
      setEvents(data);
    } catch (err) {
      setError("Failed to fetch events data. Please check connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFormSubmit = async (formData) => {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    const apiPayload = formatFormDataForAPI(formData);

    try {
      if (editingEvent?.event_id) {
        // UPDATE operation
        await updateEvent(editingEvent.event_id, apiPayload);
        setMessage("Event updated successfully!");
      } else {
        // CREATE operation
        await createEvent(apiPayload);
        setMessage("Event created successfully!");
      }

      setEditingEvent(null); // Close the form
      await fetchData(); // Refresh the list
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "An unknown error occurred.";
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    // Delete operation
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await deleteEvent(id);
      setMessage("Event deleted successfully.");
      await fetchData();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to delete event.";
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingEvent(null);
    setError(null);
    setMessage(null);
  };
  
  // Logic to open the form for a NEW event
  const handleAddNewEvent = () => {
    // Set a temporary event object with the correct category based on the active tab
    // The formatEventDataForForm utility will handle setting the rest of the fields to their defaults
    setEditingEvent({ category: activeTab });
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Clear any previous status messages when opening the form
    setError(null); 
    setMessage(null);
  }

  const showForm = editingEvent !== null;

  // Filter events by active tab
  const filteredEvents = events.filter(
    (event) => event.category === activeTab
  ).sort((a, b) => new Date(a.event_date) - new Date(b.event_date)); // Sort by date for better display

  return (
    <div className="container mx-auto p-4 md:p-8 lg:p-12 font-sans">
      <h1 className="text-4xl lg:text-3xl font-playfair font-extrabold text-[#0f0f50] mb-8 border-b-4 border-indigo-300 pb-4 flex items-center">
        Manage Events Content
      </h1>

      {/* Alert Messages */}
      <div className="mb-6">
        {error && (
          <Alert message={error} type="error" onClose={() => setError(null)} />
        )}
        {message && (
          <Alert
            message={message}
            type="success"
            onClose={() => setMessage(null)}
          />
        )}
      </div>

      {/* Event Form (Create/Update Section) */}
      {showForm && (
        <div className="mb-8">
          <EventForm
            // Pass the editingEvent object or an empty object to handle both new and edit modes
            event={editingEvent}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isSaving={isSaving}
          />
        </div>
      )}

      {/* Tabs Navigation and Add Button */}
      {/* Tabs Navigation (First Line) */}
{!showForm && (
  <div className="mb-6 border-b border-gray-200 pb-2">
    <div className="flex space-x-6">
      <button
        onClick={() => setActiveTab("upcoming")}
        className={`pb-2 font-semibold transition-colors ${
          activeTab === "upcoming"
            ? "text-indigo-600 border-b-2 border-indigo-600"
            : "text-gray-600 hover:text-indigo-600"
        }`}
      >
        Upcoming Events
      </button>
      <button
        onClick={() => setActiveTab("past")}
        className={`pb-2 font-semibold transition-colors ${
          activeTab === "past"
            ? "text-indigo-600 border-b-2 border-indigo-600"
            : "text-gray-600 hover:text-indigo-600"
        }`}
      >
        Past Events
      </button>
    </div>
  </div>
)}

{!showForm && (
  <button
    onClick={handleAddNewEvent}
    className="mb-8 px-6 py-3 text-white font-semibold rounded-lg shadow-md transition duration-150 font-inter bg-indigo-600 hover:bg-indigo-700"
  >
    + Add {" "}
    {activeTab === "upcoming" ? "Upcoming Event" : "Past Event"}
  </button>
)}

      {/* Event List (Read Section) */}
      {!showForm && (
        <>
          {loading ? (
            <div className="text-center py-10 font-roboto text-lg text-gray-600">
              Loading events data...
            </div>
          ) : error ? (
             <div className="p-4 rounded-lg font-roboto mb-4 bg-red-100 text-red-800 border border-red-400">
                <p>Error: {error}</p>
             </div>
          ) : filteredEvents.length > 0 ? (
            <div className="overflow-x-auto shadow-md rounded-lg mt-6">
              <table className="min-w-full bg-white font-roboto">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Event
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">
                      Venue
                    </th>
                    {/* Category column is less useful in a filtered list, but keep it for clarity */}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                      Category
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEvents.map((event) => (
                    <tr
                      key={event.event_id}
                      className="hover:bg-gray-50 transition duration-100"
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {event.event_name}
                        <span className="block text-xs font-normal text-gray-500">
                          {event.organized_by || "Internal"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDateDisplay(event.event_date)} at{" "}
                        {event.event_time}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden sm:table-cell">
                        {event.venue}
                      </td>
                      <td className="px-4 py-3 text-sm hidden md:table-cell">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            event.category === "upcoming"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {event.category === "upcoming" ? "Upcoming" : "Past"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium space-x-2">
                        {/* Edit Button: Sets the event to editingEvent, which shows the form */}
                        <button
                          onClick={() => {
                            setEditingEvent(event);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded-md hover:bg-indigo-50"
                        >
                          Edit
                        </button>
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(event.event_id)}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded-md hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-4 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200 font-roboto">
              No **{activeTab}** events found. Click 'Add New Event' above to create one.
            </p>
          )}
        </>
      )}
    </div>
  );
}