import { useEffect, useState } from "react";
import api from "@/lib/axios";

const MissingPersons = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    try {
      const res = await api.get("/case-persons/active-persons", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch persons", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  if (!data.length) {
    return (
      <p className="text-gray-500">
        No active missing or wanted persons.
      </p>
    );
  }

  return (
    <div>
        <h1 className="text-2xl font-semibold mb-6">
            Missing / Wanted Persons
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.map((person) => (
            <div
                key={person.person_id}
                className="bg-white border rounded-lg shadow-sm overflow-hidden"
            >
                {/* IMAGE */}
                <div className="h-44 bg-gray-200">
                {person.photo ? (
                    <img
                    src={person.photo}
                    alt={person.full_name}
                    className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    No Image
                    </div>
                )}
                </div>

                {/* INFO */}
                <div className="p-3 space-y-1.5">
                <h2 className="text-sm font-semibold truncate">
                    {person.full_name || "Unknown"}
                </h2>

                <p className="text-xs text-gray-500 truncate">
                    {person.case_title || "No case title"}
                </p>

                {/* CATEGORY */}
                <span
                    className={`inline-block px-2 py-0.5 text-[10px] rounded ${
                    person.category === "WANTED"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                >
                    {person.category}
                </span>

                {/* ADMIN */}
                {person.admin_name && (
                    <p className="text-[11px] text-gray-600 truncate">
                    {person.admin_name}
                    </p>
                )}

                {/* ACTIONS */}
                {person.admin_phone ? (
                    <div className="mt-2 space-y-1">
                    <a
                        href={`tel:${person.admin_phone}`}
                        className="block text-center text-xs bg-black text-white py-1.5 rounded hover:bg-zinc-800"
                    >
                        Call
                    </a>

                    <a
                        href={`https://wa.me/${person.admin_phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-xs bg-green-600 text-white py-1.5 rounded hover:bg-green-700"
                    >
                        WhatsApp
                    </a>
                    </div>
                ) : (
                    <p className="text-[11px] text-gray-400 mt-2">
                    No contact
                    </p>
                )}
                </div>
            </div>
            ))}
        </div>
        </div>
  );
};

export default MissingPersons;