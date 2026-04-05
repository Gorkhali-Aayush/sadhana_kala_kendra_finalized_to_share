'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle, Shield, User, KeyRound } from 'lucide-react';
import { apiClient } from '@/services/api';

// Password strength meter component
const PasswordStrengthMeter = ({ password }: { password: string }) => {
    const getStrength = () => {
        if (!password) return { level: 0, label: "N/A", color: "bg-gray-200" };
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        if (strength <= 1) return { level: 1, label: "Weak", color: "bg-red-500" };
        if (strength <= 2) return { level: 2, label: "Fair", color: "bg-orange-500" };
        if (strength <= 3) return { level: 3, label: "Good", color: "bg-yellow-500" };
        if (strength <= 4) return { level: 4, label: "Strong", color: "bg-blue-500" };
        return { level: 5, label: "Very Strong", color: "bg-green-500" };
    };
    
    const strength = getStrength();
    
    return (
        <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">Password Strength:</span>
                <span className={`text-xs font-semibold ${strength.color === "bg-red-500" ? "text-red-600" : strength.color === "bg-orange-500" ? "text-orange-600" : strength.color === "bg-yellow-500" ? "text-yellow-600" : strength.color === "bg-blue-500" ? "text-blue-600" : "text-green-600"}`}>
                    {strength.label}
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${(strength.level / 5) * 100}%` }}
                ></div>
            </div>
        </div>
    );
};

// Password input component
const PasswordInput = ({
    field,
    label,
    placeholder,
    value,
    error,
    showPassword,
    onToggleVisibility,
    onChange,
    loading,
    showStrength = false,
}: {
    field: string;
    label: string;
    placeholder: string;
    value: string;
    error?: string;
    showPassword: boolean;
    onToggleVisibility: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    loading: boolean;
    showStrength?: boolean;
}) => (
    <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
        </label>
        <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
                name={field}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition duration-150 pr-12 ${
                    error
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-600"
                }`}
                autoComplete="off"
                disabled={loading}
            />
            <button
                type="button"
                onClick={onToggleVisibility}
                className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 transition"
                disabled={loading}
                tabIndex={-1}
            >
                {showPassword ? (
                    <EyeOff size={18} />
                ) : (
                    <Eye size={18} />
                )}
            </button>
        </div>
        {showStrength && <PasswordStrengthMeter password={value} />}
        {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={16} />
                {error}
            </p>
        )}
    </div>
);

export default function AdminProfilePage() {
    const router = useRouter();
    const [adminUsername, setAdminUsername] = useState("Admin");
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [showPasswords, setShowPasswords] = useState({
        oldPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.oldPassword.trim()) {
            newErrors.oldPassword = "Current password is required";
        } else if (formData.oldPassword.length < 8) {
            newErrors.oldPassword = "Current password must be at least 8 characters";
        }

        if (!formData.newPassword.trim()) {
            newErrors.newPassword = "New password is required";
        } else if (formData.newPassword.length < 12) {
            newErrors.newPassword = "New password must be at least 12 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.newPassword)) {
            newErrors.newPassword = "Password must include uppercase, lowercase, numbers, and special characters (@$!%*?&)";
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = "Confirm password is required";
        } else if (formData.confirmPassword !== formData.newPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (formData.oldPassword === formData.newPassword) {
            newErrors.newPassword = "New password must be different from current password";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field when user starts typing
        setErrors((prev) => {
            if (prev[name]) {
                return {
                    ...prev,
                    [name]: "",
                };
            }
            return prev;
        });
    };

    const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess("");
        setErrors({});

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await apiClient.put("/api/server/update-password", {
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword,
            });

            setSuccess("Password updated successfully! Redirecting to login...");
            
            // Clear form
            setFormData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            // Redirect to admin login after a short delay
            setTimeout(() => {
                router.push("/admin/login");
            }, 2000);
        } catch (err: any) {
            // Get error message - prioritize backend message which is now user-friendly
            let errorMessage = "We couldn't update your password. Please try again.";
            const newErrors: Record<string, string> = {};
            
            if (err.response?.data) {
                const data = err.response.data;
                
                // If there's a specific message (from controller or error handler)
                if (data.message && typeof data.message === 'string') {
                    errorMessage = data.message;
                }
                
                // If there are field-specific validation errors
                if (data.errors && Array.isArray(data.errors)) {
                    data.errors.forEach((validationError: any) => {
                        newErrors[validationError.field] = validationError.message;
                    });
                    // If we found field-specific errors, set them
                    if (Object.keys(newErrors).length > 0) {
                        setErrors(newErrors);
                        return;
                    }
                }
            } else if (err.message) {
                // Use error message if available
                errorMessage = err.message;
            }
            
            setErrors({ submit: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                        Account Settings
                    </h1>
                    <p className="text-gray-600">
                        Manage your admin account and security preferences
                    </p>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Sidebar - Profile Info */}
                    <div className="lg:col-span-1">
                        {/* Profile Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mb-4">
                                    <User className="text-white" size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{adminUsername}</h3>
                                <p className="text-sm text-gray-500 mt-1">Administrator</p>
                                
                                <div className="mt-4 pt-4 border-t border-gray-200 w-full">
                                    <div className="flex items-center justify-center gap-2 text-sm text-red-600 bg-red-50 py-2 px-3 rounded-lg">
                                        <Shield size={16} />
                                        <span>Secure & Protected</span>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3 w-full">
                                    <div className="text-left">
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Account since</p>
                                        <p className="text-sm text-gray-900 font-medium mt-1">March 2026</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Status</p>
                                        <p className="text-sm text-gray-900 font-medium mt-1">Active</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security Tips Card */}
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-6">
                            <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                                <KeyRound size={18} />
                                Security Tips
                            </h4>
                            <ul className="space-y-2 text-sm text-red-800">
                                <li className="flex gap-2">
                                    <span>✓</span>
                                    <span>Use unique, complex passwords</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>✓</span>
                                    <span>Update regularly every 3 months</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>✓</span>
                                    <span>Never share credentials</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Content - Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {/* Form Header */}
                            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 sm:px-8 py-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-red-400 rounded-lg flex items-center justify-center">
                                        <Lock className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">
                                            Change Password
                                        </h2>
                                        <p className="text-red-100 text-sm mt-1">
                                            Update your account password to keep it secure
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="p-6 sm:p-8">
                                {/* Success Message */}
                                {success && (
                                    <div className="mb-6 bg-green-50 border border-green-300 rounded-lg p-4 flex items-start gap-3 animate-in fade-in">
                                        <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <p className="text-green-900 font-semibold">Success</p>
                                            <p className="text-green-800 text-sm mt-1">{success}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Error */}
                                {errors.submit && (
                                    <div className="mb-6 bg-red-50 border border-red-300 rounded-lg p-4 flex items-start gap-3">
                                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <p className="text-red-900 font-semibold">Error</p>
                                            <p className="text-red-800 text-sm mt-1">{errors.submit}</p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Current Password Section */}
                                    <div className="pb-6 border-b border-gray-200">
                                        <PasswordInput
                                            field="oldPassword"
                                            label="Current Password"
                                            placeholder="Enter your current password"
                                            value={formData.oldPassword}
                                            error={errors.oldPassword}
                                            showPassword={showPasswords.oldPassword}
                                            onToggleVisibility={() => togglePasswordVisibility("oldPassword")}
                                            onChange={handleChange}
                                            loading={loading}
                                        />
                                    </div>

                                    {/* New Password Section */}
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <KeyRound size={18} />
                                            New Password
                                        </h3>

                                        <div className="space-y-4">
                                            <PasswordInput
                                                field="newPassword"
                                                label="New Password"
                                                placeholder="Enter your new password"
                                                value={formData.newPassword}
                                                error={errors.newPassword}
                                                showPassword={showPasswords.newPassword}
                                                onToggleVisibility={() => togglePasswordVisibility("newPassword")}
                                                onChange={handleChange}
                                                loading={loading}
                                                showStrength={true}
                                            />

                                            <PasswordInput
                                                field="confirmPassword"
                                                label="Confirm New Password"
                                                placeholder="Confirm your new password"
                                                value={formData.confirmPassword}
                                                error={errors.confirmPassword}
                                                showPassword={showPasswords.confirmPassword}
                                                onToggleVisibility={() => togglePasswordVisibility("confirmPassword")}
                                                onChange={handleChange}
                                                loading={loading}
                                            />
                                        </div>

                                        {/* Requirements Checklist */}
                                        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                            <p className="text-sm font-semibold text-gray-900 mb-3">Requirements:</p>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.newPassword.length >= 12 ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                                                        {formData.newPassword.length >= 12 && <span className="text-white text-xs">✓</span>}
                                                    </div>
                                                    <span className={formData.newPassword.length >= 12 ? "text-green-700 font-medium" : "text-gray-600"}>
                                                        Minimum 12 characters
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${/[a-z]/.test(formData.newPassword) ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                                                        {/[a-z]/.test(formData.newPassword) && <span className="text-white text-xs">✓</span>}
                                                    </div>
                                                    <span className={/[a-z]/.test(formData.newPassword) ? "text-green-700 font-medium" : "text-gray-600"}>
                                                        Lowercase letter (a-z)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${/[A-Z]/.test(formData.newPassword) ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                                                        {/[A-Z]/.test(formData.newPassword) && <span className="text-white text-xs">✓</span>}
                                                    </div>
                                                    <span className={/[A-Z]/.test(formData.newPassword) ? "text-green-700 font-medium" : "text-gray-600"}>
                                                        Uppercase letter (A-Z)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${/[0-9]/.test(formData.newPassword) ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                                                        {/[0-9]/.test(formData.newPassword) && <span className="text-white text-xs">✓</span>}
                                                    </div>
                                                    <span className={/[0-9]/.test(formData.newPassword) ? "text-green-700 font-medium" : "text-gray-600"}>
                                                        Number (0-9)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${/[@$!%*?&]/.test(formData.newPassword) ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                                                        {/[@$!%*?&]/.test(formData.newPassword) && <span className="text-white text-xs">✓</span>}
                                                    </div>
                                                    <span className={/[@$!%*?&]/.test(formData.newPassword) ? "text-green-700 font-medium" : "text-gray-600"}>
                                                        Special character (@$!%*?&)
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.newPassword && formData.newPassword !== formData.oldPassword ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                                                        {formData.newPassword && formData.newPassword !== formData.oldPassword && <span className="text-white text-xs">✓</span>}
                                                    </div>
                                                    <span className={formData.newPassword && formData.newPassword !== formData.oldPassword ? "text-green-700 font-medium" : "text-gray-600"}>
                                                        Different from current password
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                                                        {formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword && <span className="text-white text-xs">✓</span>}
                                                    </div>
                                                    <span className={formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? "text-green-700 font-medium" : "text-gray-600"}>
                                                        Passwords match
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-6 border-t border-gray-200">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition duration-200 flex items-center justify-center gap-2 ${
                                                loading
                                                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                                    : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md"
                                            }`}
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock size={18} />
                                                    Update Password
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setFormData({
                                                    oldPassword: "",
                                                    newPassword: "",
                                                    confirmPassword: "",
                                                })
                                            }
                                            disabled={loading}
                                            className="px-6 py-3 rounded-lg font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition duration-200"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Important Notice */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mt-6">
                            <div className="flex gap-3">
                                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <h4 className="font-semibold text-amber-900">Important Notice</h4>
                                    <p className="text-amber-800 text-sm mt-2">
                                        After changing your password, you will be automatically logged out. You'll need to login again using your new password. This is a security feature to ensure your account remains protected.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
