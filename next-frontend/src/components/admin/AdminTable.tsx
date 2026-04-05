'use client';

import { Edit, Trash2, Eye } from 'lucide-react';

interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function AdminTable<T extends { id?: string | number }>({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  isLoading = false,
  emptyMessage = 'No data found',
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-gray-600 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`px-6 py-4 text-left text-sm font-semibold text-gray-700 ${column.width || ''}`}
              >
                {column.label}
              </th>
            ))}
            {(onEdit || onDelete || onView) && (
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item.id || index}
              className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
            >
              {columns.map((column) => (
                <td key={String(column.key)} className={`px-6 py-4 text-sm text-gray-700 ${column.width || ''}`}>
                  {column.render ? column.render(item[column.key], item) : String(item[column.key] || '-')}
                </td>
              ))}
              {(onEdit || onDelete || onView) && (
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    {onView && (
                      <button
                        onClick={() => onView(item)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors duration-200"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
