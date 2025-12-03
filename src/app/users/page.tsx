"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
};

export default function UsersPage() {
  const router = useRouter();
  const [items, setItems] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPage, setLastPage] = useState<number | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) return;
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        if (search.trim()) {
          params.set("search", search.trim());
        }
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/users?${params.toString()}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );
        const data = await res.json();
        if (!res.ok) {
          setError(data?.message || "Failed to load users");
          setItems([]);
          return;
        }
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        setItems(
          list
            .map((u: any) => ({
              id: Number(u.id) || 0,
              firstname: u.firstname ?? u.first_name ?? "",
              lastname: u.lastname ?? u.last_name ?? "",
              email: u.email ?? "",
              phone: u.phone ?? "",
              status: u.status === "inactive" ? "inactive" : "active",
            }))
            .filter((u) => u.id > 0)
        );
        const lp =
          data?.meta?.last_page ??
          data?.last_page ??
          (data?.meta && data.meta.total && data.meta.per_page
            ? Math.ceil(data.meta.total / data.meta.per_page)
            : null);
        setLastPage(lp && Number.isFinite(lp) ? Number(lp) : null);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          setError("Unable to load users");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [page, search]);

  const handleDelete = async (user: User) => {
    if (!user?.id) {
      setError("Invalid user ID");
      return;
    }
    const confirmed = window.confirm(`Delete ${user.firstname} ${user.lastname}?`);
    if (!confirmed) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      router.push("/");
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/users/${user.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data?.message || "Failed to delete user");
        return;
      }
      setItems((prev) => prev.filter((x) => x.id !== user.id));
    } catch (e) {
      setError("Unable to delete user");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(search.trim());
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
          <Link
            href="/users/new"
            className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            New user
          </Link>
        </div>
        <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Search by name, email or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 bg-white"
          />
          <button
            type="submit"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Search
          </button>
        </form>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    No users found
                  </td>
                </tr>
              )}
              {items.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-900">
                    {user.firstname} {user.lastname}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{user.email}</td>
                  <td className="px-4 py-3 text-slate-700">{user.phone}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        user.status === "active"
                          ? "inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                          : "inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                      }
                    >
                      {user.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link
                      href={`/users/${user.id}`}
                      className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-800 hover:bg-slate-50"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(user)}
                      className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <div className="px-4 py-4 text-sm text-slate-500">Loading...</div>
          )}
          {error && !loading && (
            <div className="px-4 py-4 text-sm text-red-600">{error}</div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Page {page}
            {lastPage ? ` of ${lastPage}` : ""}
          </span>
          <div className="space-x-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={lastPage !== null && page >= lastPage}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


