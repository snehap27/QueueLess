import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import { useAuth } from "../hooks/useAuth";

const initialFormData = {
  name: "",
  email: "",
  password: "",
  role: "customer",
};

function Register() {
  const [formData, setFormData] = useState(initialFormData);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const redirectByRole = (userRole) => {
    navigate(userRole === "owner" ? "/owner/dashboard" : "/customer/join");
  };

  const validateForm = () => {
    const errors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      errors.name = "Name is required.";
    }

    if (!emailPattern.test(formData.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (!formData.role) {
      errors.role = "Role is required.";
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");

    const validationErrors = validateForm();
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });
      redirectByRole(data.user.role);
    } catch (err) {
      setError(err.message || "Unable to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white px-5 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="absolute left-1/2 top-16 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-300/30 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute right-0 top-44 -z-10 h-52 w-52 rounded-full bg-green-200/40 blur-3xl" />

        <section className="w-full max-w-[500px] rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-2xl shadow-emerald-950/10 sm:p-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Create your QueueLess Account
            </h1>
            <p className="mt-4 leading-7 text-slate-600">
              Join QueueLess and start managing or joining virtual queues in
              seconds.
            </p>
          </div>

          {error && (
            <p
              className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-bold text-slate-800"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="mt-2 w-full rounded-full border border-emerald-100 bg-white px-5 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                placeholder="Enter your full name"
              />
              {fieldErrors.name && (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-slate-800"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-2 w-full rounded-full border border-emerald-100 bg-white px-5 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                placeholder="you@example.com"
              />
              {fieldErrors.email && (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-slate-800"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-2 w-full rounded-full border border-emerald-100 bg-white px-5 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                placeholder="Create a password"
              />
              {fieldErrors.password && (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-bold text-slate-800"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-2 w-full rounded-full border border-emerald-100 bg-white px-5 py-3 text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
              >
                <option value="customer">Customer</option>
                <option value="owner">Owner</option>
              </select>
              {fieldErrors.role && (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {fieldErrors.role}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-emerald-600 transition hover:text-emerald-700"
            >
              Login
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default Register;
