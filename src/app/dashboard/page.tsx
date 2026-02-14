"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Competitor {
  id: string;
  name: string;
  url: string;
  type: string;
  status: string;
  lastScrapedAt: string | null;
  createdAt: string;
  _count: {
    snapshots: number;
    changes: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState({
    name: "",
    url: "",
    type: "website",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchCompetitors();
    }
  }, [status]);

  const fetchCompetitors = async () => {
    try {
      const response = await fetch("/api/competitors", {
        headers: {
          "x-user-id": session?.user?.id || "",
        },
      });
      const data = await response.json();
      if (data.success) {
        setCompetitors(data.data);
      }
    } catch (error) {
      console.error("Error fetching competitors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/competitors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": session?.user?.id || "",
        },
        body: JSON.stringify(newCompetitor),
      });

      const data = await response.json();
      if (data.success) {
        setCompetitors([data.data, ...competitors]);
        setShowAddForm(false);
        setNewCompetitor({ name: "", url: "", type: "website" });
      } else {
        alert(data.error?.message || "Failed to add competitor");
      }
    } catch (error) {
      console.error("Error adding competitor:", error);
      alert("Failed to add competitor");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your competitors and view reports
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            {showAddForm ? "Cancel" : "Add Competitor"}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New Competitor</h3>
            <form onSubmit={handleAddCompetitor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={newCompetitor.name}
                  onChange={(e) =>
                    setNewCompetitor({ ...newCompetitor, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  URL
                </label>
                <input
                  type="url"
                  required
                  value={newCompetitor.url}
                  onChange={(e) =>
                    setNewCompetitor({ ...newCompetitor, url: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={newCompetitor.type}
                  onChange={(e) =>
                    setNewCompetitor({ ...newCompetitor, type: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                >
                  <option value="website">Website</option>
                  <option value="twitter">Twitter/X</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Add Competitor
              </button>
            </form>
          </div>
        )}

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Your Competitors</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {competitors.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No competitors added yet. Click "Add Competitor" to get started.
              </div>
            ) : (
              competitors.map((competitor) => (
                <div key={competitor.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {competitor.name}
                      </h3>
                      <p className="text-sm text-gray-500">{competitor.url}</p>
                      <div className="mt-2 flex gap-4 text-sm text-gray-600">
                        <span>Type: {competitor.type}</span>
                        <span>Status: {competitor.status}</span>
                        <span>Snapshots: {competitor._count.snapshots}</span>
                        <span>Changes: {competitor._count.changes}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm">
                        View
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
