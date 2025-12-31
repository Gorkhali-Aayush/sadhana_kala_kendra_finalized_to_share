import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminLogin = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);  
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const sanitizedUsername = username.trim();
        const sanitizedPassword = password;

        if (!sanitizedUsername || !sanitizedPassword) {
            setError("Username and password cannot be empty.");
            return;
        }

        if (sanitizedPassword.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(sanitizedUsername)) {
            setError("Username can only contain letters, numbers, and underscores.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/admin/login", {
                username: sanitizedUsername,
                password: sanitizedPassword,
            }); 

            const data = response.data;

            if (data?.username) {
                if (onLoginSuccess) onLoginSuccess();

                sessionStorage.setItem("adminUsername", data.username);

                navigate("/admin", { replace: true });
            } else {
                setError("Login failed: Invalid server response.");
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || "Login failed. Check your credentials.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-4 font-sans">
            <div className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-sm transition-all duration-300 transform hover:shadow-3xl">
                <h2 className="text-3xl font-extrabold text-center text-[#cf0408] mb-8 border-b pb-3">
                    🔑 Admin Console
                </h2>

                {error && (
                    <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg mb-6 text-center text-sm font-medium transition-all duration-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#cf0408] focus:border-[#cf0408] transition duration-150"
                            autoComplete="username"
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#cf0408] focus:border-[#cf0408] transition duration-150 pr-12"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 top-6 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 mt-4 rounded-lg font-bold text-lg transition duration-200 transform shadow-md flex items-center justify-center ${
                            loading
                                ? "bg-red-400 cursor-not-allowed"
                                : "bg-[#cf0408] text-white hover:bg-red-700 hover:shadow-lg active:scale-[0.98]"
                        }`}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;