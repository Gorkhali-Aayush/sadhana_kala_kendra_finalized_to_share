"use client";
import React, { useState, useEffect } from "react";
import { getCourses } from "../../services/coursesService";
import { getApiUrl } from "../../config/api";
import { sanitizeInput } from "../../utils/helpers";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    course_id: "",
    address: "",
    age: "",
    occupation: "",
  });
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (err) {
        setCourses([]);
      }
    }
    fetchCourses();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage("");
    setMessageType("");
  };

  const validateForm = () => {
    const { full_name, email, phone, course_id, address, age, occupation } = formData;
    if (!full_name || !email || !phone || !course_id || !address || !age || !occupation) {
      setMessage("Please fill in all fields. All information is required.");
      setMessageType("error");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return false;
    }
    const phoneRegex = /^\d{7,15}$/;
    if (!phoneRegex.test(phone.replace(/[^0-9]/g, ""))) {
      setMessage("Please enter a valid phone number (digits only, 7-15 length).");
      setMessageType("error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(getApiUrl("/api/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: sanitizeInput(formData.full_name),
          email: sanitizeInput(formData.email),
          phone: sanitizeInput(formData.phone),
          address: sanitizeInput(formData.address),
          age: formData.age ? parseInt(formData.age, 10) : null,
          occupation: sanitizeInput(formData.occupation),
          course_id: parseInt(formData.course_id, 10),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const result = await response.json();
      setMessage("Registration completed successfully! We will contact you soon.");
      setMessageType("success");
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        course_id: "",
        address: "",
        age: "",
        occupation: "",
      });
    } catch (error: any) {
      setMessage(error.message || "An error occurred during registration. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-['Roboto']">
      <div className="container mx-auto max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#0f0f50] mb-4 font-['Inter']">
          Student <span className="text-red-600">Enrollment Form</span>
        </h2>
        <p className="text-center text-gray-600 mb-8 text-lg">
          Join our community! Please provide your details and select your desired course to begin your musical journey.
        </p>
        {message && (
          <div
            className={`p-4 mb-6 rounded-lg text-sm font-medium transition duration-300 ${
              messageType === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 md:p-12 rounded-2xl shadow-2xl shadow-gray-200 space-y-8 border border-gray-100"
        >
          <h2 className="text-xl font-semibold text-[#0f0f50] border-b border-teal-100 pb-3">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                id="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition duration-150 text-black"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition duration-150 text-black"
              />
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition duration-150 text-black"
            />
          </div>
          <div>
            <label htmlFor="course_id" className="block text-sm font-medium text-gray-700">
              Select Course <span className="text-red-500">*</span>
            </label>
            <select
              name="course_id"
              id="course_id"
              value={formData.course_id}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition duration-150 bg-white text-black"
            >
              <option value="">-- Choose a Course --</option>
              {courses.map((course: any) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                  {course.duration ? ` (${course.duration})` : ""}
                </option>
              ))}
            </select>
          </div>
          <h2 className="text-xl font-semibold text-[#0f0f50] border-b border-teal-100 pb-3 mt-8">Additional Information</h2>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              id="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition duration-150 text-black"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="age"
                id="age"
                value={formData.age}
                onChange={handleChange}
                min="1"
                max="100"
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition duration-150 text-black"
              />
            </div>
            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
                Occupation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="occupation"
                id="occupation"
                value={formData.occupation}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-teal-500 focus:border-teal-500 transition duration-150 text-black"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-md text-lg font-semibold text-white transition duration-300 transform hover:scale-[1.01] ${
              loading
                ? "bg-teal-400 cursor-not-allowed"
                : "bg-blue-800 hover:bg-blue-950 focus:ring-4 focus:ring-teal-200"
            }`}
          >
            {loading ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Submit Registration"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
