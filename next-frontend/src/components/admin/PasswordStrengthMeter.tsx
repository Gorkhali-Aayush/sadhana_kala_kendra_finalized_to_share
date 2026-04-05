'use client';

import { useMemo } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
  label?: string;
}

export default function PasswordStrengthMeter({ password, label = 'Password' }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => {
    if (!password) return { level: 0, text: 'No password', color: 'bg-gray-300' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const levels = [
      { level: 0, text: 'Very Weak', color: 'bg-red-500' },
      { level: 1, text: 'Weak', color: 'bg-orange-500' },
      { level: 2, text: 'Fair', color: 'bg-yellow-500' },
      { level: 3, text: 'Good', color: 'bg-blue-500' },
      { level: 4, text: 'Strong', color: 'bg-green-500' },
      { level: 5, text: 'Very Strong', color: 'bg-emerald-500' },
    ];

    return levels[Math.min(score, 5)];
  }, [password]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="password"
        value={password}
        readOnly
        className="w-full px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-600 bg-gray-50 cursor-not-allowed"
      />
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${strength.color} transition-all duration-300`}
            style={{ width: `${(strength.level / 5) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-semibold text-${strength.color.replace('bg-', '').replace('-500', '')}-600 whitespace-nowrap`}>
          {strength.text}
        </span>
      </div>
      <ul className="text-xs text-gray-600 space-y-1">
        <li>✓ At least 8 characters</li>
        <li>✓ Mix of uppercase, lowercase, numbers, symbols</li>
        <li>✓ Unique password not used elsewhere</li>
      </ul>
    </div>
  );
}
