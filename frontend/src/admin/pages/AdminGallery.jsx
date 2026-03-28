import React, { useEffect, useState, useCallback } from "react";
import {
  getAllGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} from "../services/galleryService";
import { SERVER_ROOT_URL } from "../services/api";
import PageLoader from "../../components/PageLoader";

const Alert = ({ message, type, onClose }) => (
  <div className={`flex items-start justify-between p-4 mb-6 rounded-xl border ${type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"}`}>
    <span className="font-medium text-sm">{message}</span>
    <button onClick={onClose} className="ml-4 text-xl leading-none">&times;</button>
  </div>
);

/** * COMPONENT: OrderConflictDialog
 * Handles display order conflicts with user-friendly options
 */
const OrderConflictDialog = ({ conflict, onResolve, onCancel }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [customOrder, setCustomOrder] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in duration-300">
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-start gap-3">
          <div className="text-3xl">⚠️</div>
          <div>
            <h2 className="font-bold text-slate-900">Display Order Conflict</h2>
            <p className="text-sm text-slate-600 mt-1">{conflict?.warning}</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
            <p className="font-semibold mb-2">💡 Suggestion:</p>
            <p>{conflict?.suggestion}</p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
              <input
                type="radio"
                name="order-choice"
                checked={selectedOrder === conflict?.nextAvailable}
                onChange={() => {
                  setSelectedOrder(conflict?.nextAvailable);
                  setCustomOrder("");
                }}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="ml-3 flex-1">
                <span className="font-semibold text-slate-900">Use suggested order: {conflict?.nextAvailable}</span>
                <p className="text-xs text-slate-500">Automatically assign the next available order</p>
              </span>
            </label>

            <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition">
              <input
                type="radio"
                name="order-choice"
                checked={selectedOrder === "custom"}
                onChange={() => setSelectedOrder("custom")}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="ml-3 flex-1">
                <span className="font-semibold text-slate-900">Enter custom order:</span>
                <input
                  type="number"
                  placeholder="Enter order number"
                  value={customOrder}
                  onChange={(e) => setCustomOrder(e.target.value)}
                  onClick={() => setSelectedOrder("custom")}
                  className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  min="1"
                />
              </span>
            </label>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedOrder === "custom") {
                if (!customOrder || customOrder < 1) {
                  alert("Please enter a valid order number");
                  return;
                }
                onResolve(customOrder);
              } else {
                onResolve(selectedOrder);
              }
            }}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

const GalleryForm = ({ item, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    title: item?.title || "",
    display_order: item?.display_order || "",
    image_file: null,
    existing_image_url: item?.image_url || "",
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState(
    item?.image_url ? `${SERVER_ROOT_URL}${item.image_url}` : ""
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, image_file: file, existing_image_url: prev.existing_image_url }));
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6"
    >
      <h2 className="text-2xl font-black text-slate-800">{item?.media_id ? "Edit Gallery Item" : "Add Gallery Item"}</h2>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
          placeholder="Enter image title"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Display Order <span className="text-slate-400 font-normal">(Optional)</span></label>
        <input
          type="number"
          name="display_order"
          value={formData.display_order}
          onChange={handleChange}
          min="1"
          className="w-full border border-slate-300 rounded-lg px-3 py-2"
          placeholder="Enter order number (e.g. 1, 2, 3...)"
        />
        <p className="text-xs text-slate-400 mt-2">Determines the order in which this image appears in the gallery.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-3">Image</label>
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md bg-slate-200">
            {imagePreviewUrl ? (
              <img src={imagePreviewUrl} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Photo</div>
            )}
          </div>
          <label className="cursor-pointer bg-white px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
            {item?.media_id ? "Change Photo" : "Upload Photo"}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              required={!item?.media_id && !formData.existing_image_url}
            />
          </label>
          <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-tighter">JPG, PNG or WebP</p>

          {formData.existing_image_url ? (
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({ ...prev, existing_image_url: "", image_file: null }));
                setImagePreviewUrl("");
              }}
              className="text-sm text-red-600 underline mt-3"
            >
              Remove current image
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-slate-300">
          Cancel
        </button>
        <button disabled={isSaving} className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold disabled:opacity-60">
          {isSaving ? "Saving..." : item?.media_id ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

const AdminGallery = () => {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [orderConflict, setOrderConflict] = useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllGalleryItems();
      setItems(data || []);
    } catch (err) {
      setError(err?.message || "Failed to load gallery items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSubmit = async (formData) => {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      if (editingItem?.media_id) {
        await updateGalleryItem(editingItem.media_id, formData);
        setMessage("Gallery item updated successfully.");
      } else {
        await createGalleryItem(formData);
        setMessage("Gallery item created successfully.");
      }
      setEditingItem(null);
      setOrderConflict(null);
      setPendingFormData(null);
      await fetchItems();
    } catch (err) {
      // Check for display order conflict (409)
      if (err?.response?.status === 409 && err?.response?.data?.warning) {
        setOrderConflict(err.response.data);
        setPendingFormData(formData);
        setIsSaving(false);
        return; // Don't set error, show dialog instead
      }
      setError(err?.data?.message || err?.message || "Failed to save gallery item.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResolveConflict = async (newOrder) => {
    if (!pendingFormData) return;
    
    setIsSaving(true);
    setOrderConflict(null);
    
    try {
      const updatedFormData = { ...pendingFormData, display_order: newOrder };
      
      if (editingItem?.media_id) {
        await updateGalleryItem(editingItem.media_id, updatedFormData);
        setMessage("Gallery item updated successfully.");
      } else {
        await createGalleryItem(updatedFormData);
        setMessage("Gallery item created successfully.");
      }
      
      setEditingItem(null);
      setPendingFormData(null);
      fetchItems();
    } catch (err) {
      setError(err?.message || "Operation failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this gallery item?")) return;

    try {
      await deleteGalleryItem(id);
      setMessage("Gallery item deleted successfully.");
      await fetchItems();
    } catch (err) {
      setError(err?.data?.message || err?.message || "Failed to delete gallery item.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* Conflict Dialog */}
      {orderConflict && (
        <OrderConflictDialog
          conflict={orderConflict}
          onResolve={handleResolveConflict}
          onCancel={() => {
            setOrderConflict(null);
            setPendingFormData(null);
          }}
        />
      )}

      <div className="bg-white border-b border-slate-200 mb-8">
        <div className="container mx-auto px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Gallery Management</h1>
            <p className="text-slate-500">Manage gallery images and titles</p>
          </div>
          {!editingItem ? (
            <button
              onClick={() => setEditingItem({})}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold"
            >
              Add Image
            </button>
          ) : null}
        </div>
      </div>

      <div className="container mx-auto px-6">
        {error ? <Alert message={error} type="error" onClose={() => setError(null)} /> : null}
        {message ? <Alert message={message} type="success" onClose={() => setMessage(null)} /> : null}

        {editingItem ? (
          <GalleryForm
            item={editingItem}
            onSubmit={handleSubmit}
            onCancel={() => setEditingItem(null)}
            isSaving={isSaving}
          />
        ) : loading ? (
          <PageLoader message="Loading gallery items..." />
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">No gallery images yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.media_id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <img src={`${SERVER_ROOT_URL}${item.image_url}`} alt={item.title || "Gallery"} className="w-full h-52 object-cover" />
                <div className="p-4">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-bold text-slate-800 line-clamp-2 flex-1">{item.title || "Untitled"}</h3>
                    {item.display_order && (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs flex-shrink-0">
                        {item.display_order}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{item.created_at ? new Date(item.created_at).toLocaleString() : ""}</p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button onClick={() => setEditingItem(item)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm">Edit</button>
                    <button onClick={() => handleDelete(item.media_id)} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGallery;
