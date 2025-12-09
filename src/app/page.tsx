"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createFirstname, setCreateFirstname] = useState("");
  const [createLastname, setCreateLastname] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createStatus, setCreateStatus] = useState<"active" | "inactive">("active");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data?.message || "Login failed");
        return;
      }

      if (data?.access_token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", data.access_token);
        }
        setStatus("Login successful");
        router.push("/users");
      } else {
        setStatus("Login response did not include access token");
      }
    } catch (err) {
      setStatus("Unable to reach server");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setCreating(true);
    try {
      // Use public registration endpoint so new users can sign up before logging in
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: createFirstname,
          lastname: createLastname,
          email: createEmail,
          phone: createPhone,
          password: createPassword,
          status: createStatus,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data?.message || "Failed to create user");
        return;
      }
      setStatus("User created successfully. You can now sign in with your email and password.");
      setShowCreateForm(false);
      setEmail(createEmail);
      setPassword("");
      setCreateFirstname("");
      setCreateLastname("");
      setCreateEmail("");
      setCreatePhone("");
      setCreatePassword("");
      setCreateStatus("active");
    } catch (err) {
      setStatus("Unable to create user");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 py-10">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 px-8 py-10">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">
          Sign in
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
            />
          </div>
          <div className="space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 text-white py-2.5 text-sm font-medium hover:bg-slate-800 disabled:bg-slate-500"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="w-full rounded-lg border border-slate-300 bg-white text-slate-800 py-2.5 text-sm font-medium hover:bg-slate-50"
            >
              {showCreateForm ? "Cancel" : "Create user"}
            </button>
          </div>
        </form>
        {showCreateForm && (
          <form onSubmit={handleCreateUser} className="mt-6 pt-6 border-t border-slate-200 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Create new user</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  First name
                </label>
                <input
                  type="text"
                  value={createFirstname}
                  onChange={(e) => setCreateFirstname(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Last name
                </label>
                <input
                  type="text"
                  value={createLastname}
                  onChange={(e) => setCreateLastname(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={createPhone}
                onChange={(e) => setCreatePhone(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                value={createStatus}
                onChange={(e) => setCreateStatus(e.target.value as "active" | "inactive")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-lg bg-slate-900 text-white py-2.5 text-sm font-medium hover:bg-slate-800 disabled:bg-slate-500"
            >
              {creating ? "Creating..." : "Create user"}
            </button>
          </form>
        )}
        {status && (
          <div className="mt-4 text-sm text-center text-slate-700">{status}</div>
        )}
      </div>
    </div>
  );
}
