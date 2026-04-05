'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Trash2,
  Eye,
  Mail,
  MailOpen,
  Users,
  CheckSquare,
} from 'lucide-react';
import { registrationsService } from '@/services/registrationsService';
import AlertMessage from '@/components/admin/AlertMessage';

interface Registration {
  registration_id?: string | number;
  id?: string | number;
  student_name: string;
  email: string;
  phone: string;
  course_name: string;
  age?: number;
  occupation?: string;
  address?: string;
  registration_date: string;
  status: 'Read' | 'Unread';
}

interface TableRegistration extends Registration {
  id: string | number;
}

// Metric Card Component
function MetricCard({
  icon: Icon,
  title,
  value,
  color,
  bg,
  isAttention = false,
}: {
  icon: any;
  title: string;
  value: number;
  color: string;
  bg: string;
  isAttention?: boolean;
}) {
  return (
    <div
      className={`p-6 rounded-xl shadow-md flex items-center justify-between transition-all duration-200 ${bg} border ${
        isAttention ? 'border-red-300 ring-2 ring-red-400' : 'border-gray-200'
      }`}
    >
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-3xl font-extrabold mt-2 ${color}`}>{value}</p>
      </div>
      <Icon className={`w-10 h-10 ${color} opacity-60`} />
    </div>
  );
}

// Tab Navigation Component
function TabNavigation({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const tabs = [
    { name: 'Unread', label: '🔴 New Submissions' },
    { name: 'Read', label: '✅ Reviewed' },
  ];

  return (
    <div className="flex border-b border-gray-200 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => setActiveTab(tab.name)}
          className={`py-3 px-6 text-base font-semibold transition-all duration-200 ${
            activeTab === tab.name
              ? 'border-b-4 border-red-600 text-red-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// Detail Item Component
function DetailItem({
  label,
  value,
  isLink = false,
  prefix = '',
  fullWidth = false,
}: {
  label: string;
  value: string | number | undefined;
  isLink?: boolean;
  prefix?: string;
  fullWidth?: boolean;
}) {
  return (
    <p className={fullWidth ? 'col-span-2' : ''}>
      <strong className="text-gray-700 block text-sm mb-1">{label}</strong>
      {isLink && value ? (
        <a
          href={`${prefix}${value}`}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {value}
        </a>
      ) : (
        <span className="text-gray-800 font-medium">{value || 'N/A'}</span>
      )}
    </p>
  );
}

// Registration Details Modal
function RegistrationModal({
  isOpen,
  onClose,
  data,
  onStatusToggle,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: Registration | null;
  onStatusToggle: (id: string | number, status: 'Read' | 'Unread') => void;
}) {
  if (!isOpen || !data) return null;

  const statusBadge = data.status === 'Read' ? (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-teal-100 text-teal-800 border border-teal-200">
      ✓ Reviewed
    </span>
  ) : (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-200 animate-pulse">
      ⚠️ New Submission
    </span>
  );

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-y-auto transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h3 className="text-2xl font-bold text-gray-900">
            Registration #{data.registration_id}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Status & Badge */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">Status:</span>
            {statusBadge}
          </div>

          {/* Student Details */}
          <div className="p-6 bg-gray-50 rounded-xl grid grid-cols-2 gap-x-6 gap-y-4 border border-gray-200">
            <h4 className="col-span-2 font-bold text-lg text-teal-700 mb-2">
              Student Information
            </h4>
            <DetailItem label="Name" value={data.student_name} />
            <DetailItem label="Age" value={data.age} />
            <DetailItem label="Course" value={data.course_name} />
            <DetailItem label="Email" value={data.email} isLink prefix="mailto:" />
            <DetailItem label="Phone" value={data.phone} isLink prefix="tel:" />
            <DetailItem label="Occupation" value={data.occupation} />
            <DetailItem
              label="Date"
              value={new Date(data.registration_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            />
            <DetailItem label="Address" value={data.address} fullWidth />
          </div>

          {/* Mark as Unread Button */}
          {data.status === 'Read' && (
            <button
              onClick={() => {
                onStatusToggle(data.registration_id || data.id || '', 'Read');
                onClose();
              }}
              className="w-full bg-yellow-100 text-yellow-700 py-3 px-4 rounded-xl hover:bg-yellow-200 transition font-medium flex items-center justify-center gap-2 border border-yellow-300"
            >
              <Mail className="w-5 h-5" />
              Mark as Unread (Re-review)
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition border border-gray-200"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}

// Registration Table Component
function RegistrationTable({
  data,
  onEdit,
  onDelete,
  onStatusToggle,
}: {
  data: TableRegistration[];
  onEdit: (registration: TableRegistration) => void;
  onDelete: (id: string | number) => void;
  onStatusToggle: (id: string | number, status: 'Read' | 'Unread') => void;
}) {
  if (data.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed">
        <MailOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-lg font-medium">No submissions found in this category.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Student Name
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Course
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((reg) => {
            const isUnread = reg.status === 'Unread';
            return (
              <tr
                key={reg.id}
                className={`${isUnread ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'} transition duration-150`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onStatusToggle(reg.id, reg.status)}
                    className={`p-2 rounded-lg transition ${
                      isUnread
                        ? 'text-red-600 bg-red-100 hover:bg-red-200'
                        : 'text-teal-600 bg-teal-100 hover:bg-teal-200'
                    }`}
                    title={isUnread ? 'Mark as Read' : 'Mark as Unread'}
                  >
                    {isUnread ? (
                      <Mail className="w-5 h-5" />
                    ) : (
                      <MailOpen className="w-5 h-5" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {reg.student_name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {reg.course_name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {reg.email || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(reg.registration_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2 flex justify-end">
                  <button
                    onClick={() => onEdit(reg)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(reg.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                    title="Delete Registration"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Main Page Component
export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<TableRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('Unread');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<Registration | null>(null);

  // Fetch registrations
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await registrationsService.getAll();
      const formatted = data.map((reg) => ({
        ...reg,
        id: reg.registration_id || reg.id || Math.random(),
      }));
      setRegistrations(formatted);
    } catch (err) {
      setError('Failed to load registration data. Please try again.');
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
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle status toggle
  const handleStatusToggle = async (id: string | number, currentStatus: 'Read' | 'Unread') => {
    const newStatus = currentStatus === 'Read' ? 'Unread' : 'Read';
    try {
      await registrationsService.updateStatus(id, newStatus);

      setRegistrations((prev) =>
        prev.map((reg) => (reg.id === id ? { ...reg, status: newStatus } : reg))
      );

      if (modalData && (modalData.registration_id === id || modalData.id === id)) {
        setModalData((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      setMessage(`Status updated to "${newStatus}"`);
      setError('');
    } catch (err) {
      setError(`Failed to update status. Please try again.`);
    }
  };

  // Handle delete
  const handleDelete = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this registration? This action cannot be undone.')) {
      return;
    }

    try {
      await registrationsService.delete(id);
      setRegistrations((prev) => prev.filter((reg) => reg.id !== id));
      setMessage('Registration deleted successfully');
      setError('');
    } catch (err) {
      setError('Failed to delete registration.');
    }
  };

  // Open modal with details
  const openEditModal = (data: TableRegistration) => {
    setModalData(data);
    setIsModalOpen(true);

    // Automatically mark as Read when opening details
    if (data.status === 'Unread') {
      handleStatusToggle(data.id, 'Unread');
    }
  };

  // Filter registrations
  const unreadRegistrations = registrations.filter((reg) => reg.status === 'Unread');
  const readRegistrations = registrations.filter((reg) => reg.status === 'Read');
  const totalRegistrations = registrations.length;

  const displayData = activeTab === 'Unread' ? unreadRegistrations : readRegistrations;

  return (
    <div className="space-y-8 font-sans pb-10">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CheckSquare className="w-8 h-8 text-red-600" />
            Registration Console
          </h1>
          <p className="text-gray-600 mt-1">Manage and review all student registrations</p>
        </div>
      </div>

      {/* Alerts */}
      {error && <AlertMessage type="error" message={error} onClose={() => setError('')} />}
      {message && <AlertMessage type="success" message={message} onClose={() => setMessage('')} />}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading registrations...</p>
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              icon={Users}
              title="Total Registrations"
              value={totalRegistrations}
              color="text-teal-700"
              bg="bg-white"
            />
            <MetricCard
              icon={Mail}
              title="New Submissions"
              value={unreadRegistrations.length}
              color="text-red-700"
              bg="bg-red-50"
              isAttention={true}
            />
            <MetricCard
              icon={MailOpen}
              title="Reviewed Submissions"
              value={readRegistrations.length}
              color="text-gray-700"
              bg="bg-white"
            />
          </div>

          {/* Tabbed Table Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
            <RegistrationTable
              data={displayData}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onStatusToggle={handleStatusToggle}
            />
          </div>
        </>
      )}

      {/* Details Modal */}
      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={modalData}
        onStatusToggle={handleStatusToggle}
      />
    </div>
  );
}
