// Admin Design System - Tailwind classes for consistent styling

export const AdminDesign = {
  // Colors
  colors: {
    primary: '#cf0408',      // Red
    dark: '#191938',         // Dark blue
    light: '#0f0f50',        // Light blue
    text: {
      primary: '#191938',
      secondary: '#6b7280',
      light: '#d1d5db',
    },
    bg: {
      white: '#ffffff',
      gray: '#f9fafb',
      light: '#f3f4f6',
    },
  },

  // Button Styles
  buttons: {
    primary: 'bg-[#cf0408] text-white px-6 py-3 rounded-lg font-["Inter"] font-semibold hover:bg-red-700 transition duration-200 active:scale-95 shadow-md',
    secondary: 'bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-["Inter"] font-semibold hover:bg-gray-300 transition duration-200',
    danger: 'bg-red-100 text-red-600 px-6 py-3 rounded-lg font-["Inter"] font-semibold hover:bg-red-200 transition',
    success: 'bg-emerald-100 text-emerald-600 px-6 py-3 rounded-lg font-["Inter"] font-semibold hover:bg-emerald-200 transition',
  },

  // Card Styles
  cards: {
    base: 'bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition duration-300 p-6',
    hover: 'bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:border-[#cf0408] transition duration-300 p-6',
  },

  // Table Styles
  tables: {
    container: 'bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm',
    header: 'bg-gray-50 border-b border-gray-200',
    headerCell: 'px-6 py-4 text-left text-sm font-semibold text-gray-900 font-["Roboto"]',
    row: 'hover:bg-gray-50 transition duration-150 border-b border-gray-100 last:border-b-0',
    cell: 'px-6 py-4 font-["Inter"] text-gray-900',
    cellSecondary: 'px-6 py-4 font-["Inter"] text-gray-600',
  },

  // Alert Styles
  alerts: {
    error: 'bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg flex justify-between items-center font-["Inter"]',
    success: 'bg-emerald-50 border border-emerald-300 text-emerald-700 p-4 rounded-lg flex justify-between items-center font-["Inter"]',
    info: 'bg-blue-50 border border-blue-300 text-blue-700 p-4 rounded-lg flex justify-between items-center font-["Inter"]',
    warning: 'bg-yellow-50 border border-yellow-300 text-yellow-700 p-4 rounded-lg flex justify-between items-center font-["Inter"]',
  },

  // Header Styles
  headers: {
    pageTitle: 'text-3xl font-["Playfair Display"] font-bold text-[#191938]',
    pageSubtitle: 'text-gray-600 font-["Inter"] mt-1',
    sectionTitle: 'text-2xl font-["Playfair Display"] font-bold text-[#191938]',
  },

  // Form Styles
  forms: {
    input: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cf0408] focus:border-[#cf0408] transition font-["Inter"]',
    label: 'block text-sm font-semibold text-gray-700 mb-2 font-["Inter"]',
    group: 'mb-6',
  },

  // Loading Spinner
  spinner: 'w-8 h-8 border-4 border-[#cf0408] border-t-transparent rounded-full animate-spin',

  // Empty State
  emptyState: 'p-8 text-center bg-gray-50 rounded-lg',
  emptyStateText: 'text-gray-600 font-["Inter"] text-lg',
  emptyStateIcon: 'text-4xl mb-3',
};

export default AdminDesign;
