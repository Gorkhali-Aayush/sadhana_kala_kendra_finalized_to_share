'use client';

import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from 'react';
import { eventsService, programsService } from '@/services/eventsService';
import AlertMessage from '@/components/admin/AlertMessage';
import OrderConflictDialog from '@/components/admin/OrderConflictDialog';
import PageLoader from '@/components/PageLoader';
import ProgramForm from '@/components/admin/forms/ProgramForm';

interface Event {
  event_id?: number;
  id?: number;
  event_name?: string;
  title?: string;
  slug?: string;
  description?: string;
  event_date?: string;
  event_time?: string;
  venue?: string;
  organized_by?: string;
  category?: string;
  display_order?: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface Program {
  program_id?: number;
  id?: number;
  title?: string;
  slug?: string;
  rich_content?: string;
  program_date?: string;
  image_url?: string;
  display_order?: number;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface EventFormData {
  event_id: number | null;
  event_name: string;
  slug: string;
  description: string;
  event_date: string;
  event_time: string;
  venue: string;
  organized_by: string;
  category: string;
  display_order: string | number;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

interface OrderConflict {
  warning: string;
  suggestion: string;
  nextAvailable: number;
}

const LucideIcon = ({ children }: { children: React.ReactNode }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    {children}
  </svg>
);

const formatEventDataForForm = (event: Event | null): EventFormData => ({
  event_id: event?.event_id || null,
  event_name: event?.event_name || event?.title || '',
  slug: event?.slug || '',
  description: event?.description || '',
  event_date: event?.event_date ? new Date(event.event_date).toISOString().split('T')[0] : '',
  event_time: event?.event_time || '18:00',
  venue: event?.venue || '',
  organized_by: event?.organized_by || '',
  category: event?.category || 'upcoming',
  display_order: event?.display_order || 0,
  seo_title: event?.seo_title || '',
  seo_description: event?.seo_description || '',
  seo_keywords: event?.seo_keywords || '',
});

const EventForm: React.FC<{
  event: Event | null;
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
  isSaving: boolean;
}> = ({ event, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState<EventFormData>(formatEventDataForForm(event));

  useEffect(() => {
    setFormData(formatEventDataForForm(event));
  }, [event]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
      <h3 className="text-xl font-bold text-slate-800 mb-6">
        {event?.event_id ? 'Edit Event' : 'Create New Event'}
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Event Name</label>
          <input
            type="text"
            name="event_name"
            value={formData.event_name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
          <input
            type="date"
            name="event_date"
            value={formData.event_date}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Time</label>
          <input
            type="time"
            name="event_time"
            value={formData.event_time}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Venue</label>
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Organized By</label>
          <input
            type="text"
            name="organized_by"
            value={formData.organized_by}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            required
          >
            <option value="upcoming">🔜 Upcoming</option>
            <option value="past">✓ Past</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Display Order</label>
          <input
            type="number"
            name="display_order"
            value={formData.display_order}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <input
          type="text"
          name="seo_title"
          placeholder="SEO Title"
          value={formData.seo_title}
          onChange={handleChange}
          className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        />
        <input
          type="text"
          name="seo_description"
          placeholder="SEO Description"
          value={formData.seo_description}
          onChange={handleChange}
          className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        />
        <input
          type="text"
          name="seo_keywords"
          placeholder="SEO Keywords"
          value={formData.seo_keywords}
          onChange={handleChange}
          className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
        />
      </div>

      <div className="flex gap-4 mt-8">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : event?.event_id ? 'Update Event' : 'Create Event'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventData, programData] = await Promise.all([
        eventsService.getAll(),
        programsService.getAll(),
      ]);
      setEvents(Array.isArray(eventData) ? eventData : []);
      setPrograms(Array.isArray(programData) ? programData : []);
    } catch (err: any) {
      setError(err?.message || 'Failed to sync records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleEventFormSubmit = async (formData: EventFormData) => {
    setIsSaving(true);
    setError(null);
    const { event_id, ...apiPayload } = formData;
    const payload = {
      ...apiPayload,
      display_order: apiPayload.display_order ? parseInt(String(apiPayload.display_order)) : 0,
    };
    try {
      if (event_id) {
        await eventsService.update(event_id, payload);
        setMessage('Event successfully updated.');
      } else {
        await eventsService.create(payload);
        setMessage('New event scheduled successfully.');
      }
      setEditingEvent(null);
      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProgramFormSubmit = async (formData: any) => {
    setIsSaving(true);
    setError(null);
    const program_id = editingProgram?.program_id || null;
    
    try {
      if (program_id) {
        await programsService.update(program_id, formData);
        setMessage('Program successfully updated.');
      } else {
        await programsService.create(formData);
        setMessage('Program successfully created.');
      }
      setEditingProgram(null);
      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!window.confirm('Confirm deletion?')) return;
    try {
      await eventsService.delete(id);
      setMessage('Event record deleted.');
      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete record.');
    }
  };

  const handleDeleteProgram = async (id: number) => {
    if (!window.confirm('Confirm deletion?')) return;
    try {
      await programsService.delete(id);
      setMessage('Program deleted successfully.');
      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete program.');
    }
  };

  const filteredEvents = events
    .filter((e: any) => e.category === activeTab)
    .sort((a: any, b: any) => new Date(a.event_date || 0).getTime() - new Date(b.event_date || 0).getTime());

  const sortedPrograms = [...programs].sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0));

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-10 text-slate-900">
      <div className="bg-white border-b border-slate-200 mb-6 md:mb-10">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Events & Programs</h1>
          <p className="text-slate-500 text-sm md:text-base">Manage upcoming events and programs</p>

          {!editingEvent && !editingProgram && (
            <button
              onClick={() => {
                if (activeTab === 'programs') {
                  setEditingProgram({} as Program);
                } else {
                  setEditingEvent({} as Event);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              disabled={loading || isSaving}
              className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 mt-4"
            >
              <LucideIcon><path d="M12 5v14M5 12h14" /></LucideIcon>
              Add {activeTab === 'programs' ? 'Program' : `${activeTab} Event`}
            </button>
          )}

          {!editingEvent && !editingProgram && (
            <div className="flex gap-6 md:gap-10 mt-8 border-b border-slate-100 overflow-x-auto no-scrollbar">
              {['upcoming', 'past', 'programs'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-[11px] md:text-sm font-bold uppercase tracking-[0.15em] transition-all whitespace-nowrap relative ${
                    activeTab === tab 
                      ? tab === 'programs' ? 'text-purple-600' : 'text-indigo-600'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab === 'programs' ? '🎓 Programs' : `${tab} Events`}
                  {activeTab === tab && (
                    <div className={`absolute bottom-0 left-0 w-full h-1 rounded-t-full ${tab === 'programs' ? 'bg-purple-600' : 'bg-indigo-600'}`}></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        {error && <AlertMessage message={error} type="error" onClose={() => setError(null)} />}
        {message && <AlertMessage message={message} type="success" onClose={() => setMessage(null)} />}

        {editingEvent ? (
          <EventForm event={editingEvent} onSubmit={handleEventFormSubmit} onCancel={() => setEditingEvent(null)} isSaving={isSaving} />
        ) : editingProgram !== null ? (
          <ProgramForm program={editingProgram || undefined} onSubmit={handleProgramFormSubmit} onCancel={() => setEditingProgram(null)} isSaving={isSaving} />
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <PageLoader message="Syncing records..." />
            ) : activeTab === 'programs' ? (
              sortedPrograms.length > 0 ? (
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-200">
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Image</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Program Title</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Order</th>
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedPrograms.map(program => (
                        <tr key={program.program_id || program.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-5">
                            {program.image_url ? (
                              <img 
                                src={program.image_url.startsWith('http') ? program.image_url : `${process.env.NEXT_PUBLIC_API_BASE_URL}${program.image_url}`} 
                                alt={program.title} 
                                className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-sm text-slate-400">—</div>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <p className="font-bold text-slate-800 text-sm md:text-base group-hover:text-purple-600 transition-colors">{program.title}</p>
                            <p className="text-[10px] font-medium text-purple-400 uppercase tracking-tighter mt-0.5">Program</p>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-xs md:text-sm font-semibold text-slate-600">
                              {program.program_date ? new Date(program.program_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                              {program.display_order || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button 
                                onClick={() => { setEditingProgram(program); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                                className="p-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                                title="Edit"
                              >
                                <LucideIcon><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></LucideIcon>
                              </button>
                              <button 
                                onClick={() => handleDeleteProgram(program.program_id || program.id || 0)} 
                                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                title="Delete"
                              >
                                <LucideIcon><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></LucideIcon>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-16 md:p-24 text-center">
                  <div className="text-5xl md:text-6xl mb-4 grayscale opacity-50">🎓</div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800">No programs found</h3>
                  <p className="text-slate-400 text-sm mt-1">Create your first program to get started.</p>
                </div>
              )
            ) : filteredEvents.length > 0 ? (
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event Detail</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule & Venue</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Order</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEvents.map(event => (
                      <tr key={event.event_id || event.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-800 text-sm md:text-base group-hover:text-indigo-600 transition-colors">{event.event_name || event.title}</p>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter mt-0.5">{event.organized_by || 'Internal'}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-xs md:text-sm font-semibold text-slate-600 italic">
                              {new Date(event.event_date || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-[11px] md:text-xs text-slate-400 mt-0.5 font-medium">{event.event_time} • {event.venue}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                            {event.display_order || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button 
                              onClick={() => { setEditingEvent(event); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                              className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                              title="Edit"
                            >
                              <LucideIcon><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></LucideIcon>
                            </button>
                            <button 
                              onClick={() => handleDeleteEvent(event.event_id || event.id || 0)} 
                              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete"
                            >
                              <LucideIcon><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></LucideIcon>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 md:p-24 text-center">
                <div className="text-5xl md:text-6xl mb-4 grayscale opacity-50">📅</div>
                <h3 className="text-lg md:text-xl font-bold text-slate-800">No events found</h3>
                <p className="text-slate-400 text-sm mt-1">Create your first event to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
