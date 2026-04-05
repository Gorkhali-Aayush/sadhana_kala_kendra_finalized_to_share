'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { bodService, teamMembersService } from '@/services/aboutService';
import AlertMessage from '@/components/admin/AlertMessage';
import PageLoader from '@/components/PageLoader';
import BODForm from '@/components/admin/forms/BODForm';
import TeamMemberForm from '@/components/admin/forms/TeamMemberForm';

interface BODMember {
  id: number;
  firstname: string;
  lastname: string;
  designation: string;
  profile_image?: string;
  display_order?: number;
  slug?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

interface TeamMember {
  id: number;
  name: string;
  designation: string;
  image_url?: string;
  display_order?: number;
}

type ActiveTab = 'bod' | 'team';

export default function AdminAboutPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('bod');
  const [bodMembers, setBodMembers] = useState<BODMember[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<BODMember | TeamMember | null>(null);
  const [showForm, setShowForm] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL environment variable is not configured');
  }

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bodData, teamData] = await Promise.all([
        bodService.getAll().catch(err => {
          return [];
        }),
        teamMembersService.getAll().catch(err => {
          return [];
        }),
      ]);

      setBodMembers(Array.isArray(bodData) ? bodData : []);
      setTeamMembers(Array.isArray(teamData) ? teamData : []);
    } catch (err) {
      setError('Failed to load data');
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

  // Handle Add Button
  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Form Submit
  const handleFormSubmit = async (formData: any) => {
    setIsSaving(true);
    setError(null);
    try {
      if (activeTab === 'bod') {
        if (editingItem?.id) {
          await bodService.update(editingItem.id, formData);
          setMessage('BOD member updated successfully!');
        } else {
          await bodService.create(formData);
          setMessage('BOD member created successfully!');
        }
      } else if (activeTab === 'team') {
        if (editingItem?.id) {
          await teamMembersService.update(editingItem.id, formData);
          setMessage('Team member updated successfully!');
        } else {
          await teamMembersService.create(formData);
          setMessage('Team member created successfully!');
        }
      }

      setShowForm(false);
      setEditingItem(null);
      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    setError(null);
    try {
      if (activeTab === 'bod') {
        await bodService.delete(id);
        setMessage('BOD member deleted successfully!');
      } else if (activeTab === 'team') {
        await teamMembersService.delete(id);
        setMessage('Team member deleted successfully!');
      }

      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete');
    }
  };

  // Handle Edit
  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    setError(null);
  };

  if (loading && !showForm) {
    return <PageLoader message="Loading about data..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 mb-6 md:mb-10">
        <div className="container mx-auto px-4 sm:px-6 py-6 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">About Console</h1>
              <p className="text-slate-500 text-sm md:text-base mt-1">Manage Board Members and Team Members</p>
            </div>
            {!showForm && (
              <button
                onClick={handleAdd}
                className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
              >
                <span className="mr-2">+</span>
                Add {activeTab === 'bod' ? 'BOD Member' : 'Team Member'}
              </button>
            )}
          </div>

          {/* Tabs */}
          {!showForm && (
            <div className="flex gap-6 md:gap-10 mt-8 border-b border-slate-100 overflow-x-auto">
              {[
                { key: 'bod' as ActiveTab, label: 'BOD Members' },
                { key: 'team' as ActiveTab, label: 'Team' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap relative ${
                    activeTab === tab.key 
                      ? 'text-indigo-600' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full"></div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6">
        {error && <AlertMessage message={error} type="error" onClose={() => setError(null)} />}
        {message && <AlertMessage message={message} type="success" onClose={() => setMessage(null)} />}

        {showForm ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-10 max-w-4xl mx-auto">
            {activeTab === 'bod' && (
              <BODForm
                member={editingItem as BODMember | undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                isSaving={isSaving}
              />
            )}
            {activeTab === 'team' && (
              <TeamMemberForm
                member={editingItem as TeamMember | undefined}
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                isSaving={isSaving}
              />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* BOD Members Table */}
            {activeTab === 'bod' && (
              <>
                {bodMembers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Image</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase hidden sm:table-cell">Designation</th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Order</th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {bodMembers.map((member, index) => (
                          <tr key={`bod-${member.id}-${index}`} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4">
                              {member.profile_image ? (
                                <img
                                  src={`${API_BASE_URL}${member.profile_image}`}
                                  alt={member.firstname}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-500">—</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                              {member.firstname} {member.lastname}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">{member.designation}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                                {member.display_order || '—'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center space-x-2">
                              <button
                                onClick={() => handleEdit(member)}
                                className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50 text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(member.id)}
                                className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 text-sm font-medium"
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
                  <div className="p-16 text-center">
                    <div className="text-5xl mb-4 opacity-50">👤</div>
                    <h3 className="text-lg font-bold text-slate-800">No BOD Members</h3>
                    <p className="text-slate-500 text-sm mt-1">No Board Members found. Add one to get started.</p>
                  </div>
                )}
              </>
            )}


            {/* Team Members Table */}
            {activeTab === 'team' && (
              <>
                {teamMembers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Image</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase hidden sm:table-cell">Designation</th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Order</th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {teamMembers.map((member, index) => (
                          <tr key={`team-${member.id}-${index}`} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4">
                              {member.image_url ? (
                                <img
                                  src={`${API_BASE_URL}${member.image_url}`}
                                  alt={member.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-500">—</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-slate-900">{member.name}</td>
                            <td className="px-6 py-4 text-sm text-slate-600 hidden sm:table-cell">{member.designation}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                                {member.display_order || '—'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center space-x-2">
                              <button
                                onClick={() => handleEdit(member)}
                                className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50 text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(member.id)}
                                className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 text-sm font-medium"
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
                  <div className="p-16 text-center">
                    <div className="text-5xl mb-4 opacity-50">👥</div>
                    <h3 className="text-lg font-bold text-slate-800">No Team Members</h3>
                    <p className="text-slate-500 text-sm mt-1">No Team Members found. Add one to get started.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
