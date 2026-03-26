import { useEffect, useState } from "react"
import axios from "@/lib/axios"
import { toast } from "sonner"

const API = "/cameras"

const CameraManagement = () => {

  const [cameras, setCameras] = useState([])
  const [loading, setLoading] = useState(true)

  const [editingCamera, setEditingCamera] = useState(null)
  const [deleteCamera, setDeleteCamera] = useState(null)

  const [form, setForm] = useState({
    camera_name: "",
    location_description: "",
    latitude: "",
    longitude: "",
    ip_address: "",
    stream_url: ""
  })

  // ================= FETCH =================

  const fetchCameras = async () => {
    try {

      const res = await axios.get(API)
      setCameras(res.data)

    } catch (err) {

      toast.error("Failed to load cameras")

    } finally {

      setLoading(false)

    }
  }

  useEffect(() => {
    fetchCameras()
  }, [])

  // ================= INPUT =================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  // ================= RESET =================

  const resetForm = () => {

    setEditingCamera(null)

    setForm({
      camera_name: "",
      location_description: "",
      latitude: "",
      longitude: "",
      ip_address: "",
      stream_url: ""
    })
  }

  // ================= CREATE =================

  const handleCreate = async (e) => {

    e.preventDefault()

    try {

      await axios.post(API, form)

      toast.success("Camera added successfully")

      resetForm()
      fetchCameras()

    } catch (err) {

      toast.error("Failed to add camera")

    }
  }

  // ================= UPDATE =================

  const handleUpdate = async (e) => {

    e.preventDefault()

    try {

      await axios.put(`${API}/${editingCamera.id}`, form)

      toast.success("Camera updated successfully")

      resetForm()
      fetchCameras()

    } catch (err) {

      toast.error("Failed to update camera")

    }
  }

  // ================= EDIT =================

  const handleEdit = (camera) => {

    setEditingCamera(camera)

    setForm({
      camera_name: camera.camera_name,
      location_description: camera.location_description,
      latitude: camera.latitude || "",
      longitude: camera.longitude || "",
      ip_address: camera.ip_address,
      stream_url: camera.stream_url
    })
  }

  // ================= DELETE =================

  const confirmDelete = async () => {

    try {

      await axios.delete(`${API}/${deleteCamera.id}`)

      toast.success("Camera deleted")

      setDeleteCamera(null)
      fetchCameras()

    } catch (err) {

      toast.error("Failed to delete camera")

    }
  }

  // ================= STATUS =================

  const toggleStatus = async (camera) => {

    try {

      await axios.patch(`${API}/${camera.id}/status`, {
        status: camera.status === "ACTIVE" ? "DISABLED" : "ACTIVE"
      })

      toast.success("Camera status updated")

      fetchCameras()

    } catch (err) {

      toast.error("Failed to update status")

    }
  }

  return (

    <div className="space-y-10">

      {/* HEADER */}

      <div>

        <h1 className="text-2xl font-semibold">
          Camera Management
        </h1>

        <p className="text-gray-500 text-sm">
          Add, update and manage CCTV cameras connected to the SafeCity AI system
        </p>

      </div>

      {/* ================= FORM ================= */}

      <div className="bg-white border rounded-lg p-6">

        <div className="flex justify-between items-center mb-6">

          <h2 className="font-semibold text-lg">
            {editingCamera ? "Edit Camera" : "Add New Camera"}
          </h2>

          {editingCamera && (
            <button
              onClick={resetForm}
              className="text-sm text-gray-500 hover:text-black cursor-pointer"
            >
              Cancel Edit
            </button>
          )}

        </div>

        <form
          onSubmit={editingCamera ? handleUpdate : handleCreate}
          className="grid grid-cols-3 gap-4"
        >

          <input
            name="camera_name"
            value={form.camera_name}
            onChange={handleChange}
            placeholder="Camera Name"
            className="border px-3 py-2 rounded"
            required
          />

          <input
            name="location_description"
            value={form.location_description}
            onChange={handleChange}
            placeholder="Location Description"
            className="border px-3 py-2 rounded"
            required
          />

          <input
            name="ip_address"
            value={form.ip_address}
            onChange={handleChange}
            placeholder="IP Address"
            className="border px-3 py-2 rounded"
            required
          />

          <input
            name="latitude"
            value={form.latitude}
            onChange={handleChange}
            placeholder="Latitude"
            className="border px-3 py-2 rounded"
          />

          <input
            name="longitude"
            value={form.longitude}
            onChange={handleChange}
            placeholder="Longitude"
            className="border px-3 py-2 rounded"
          />

          <input
            name="stream_url"
            value={form.stream_url}
            onChange={handleChange}
            placeholder="RTSP / Stream URL"
            className="border px-3 py-2 rounded col-span-3"
          />

          <button
            className="col-span-3 bg-black text-white py-2 rounded hover:bg-gray-800 cursor-pointer"
          >
            {editingCamera ? "Update Camera" : "Add Camera"}
          </button>

        </form>

      </div>

      {/* ================= TABLE ================= */}

      <div className="bg-white border rounded-lg overflow-hidden">

        <div className="p-4 border-b font-semibold">
          Installed Cameras
        </div>

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-left">

            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Name</th>
              <th className="p-3">Location</th>
              <th className="p-3">IP</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>

          </thead>

          <tbody>

            {loading && (
              <tr>
                <td colSpan="6" className="p-6 text-center">
                  Loading cameras...
                </td>
              </tr>
            )}

            {!loading && cameras.length === 0 && (
              <tr>
                <td colSpan="6" className="p-6 text-center">
                  No cameras installed
                </td>
              </tr>
            )}

            {cameras.map((camera) => (

              <tr key={camera.id} className="border-t">

                <td className="p-3 font-mono">
                  {camera.camera_code}
                </td>

                <td className="p-3">
                  {camera.camera_name}
                </td>

                <td className="p-3">
                  {camera.location_description}
                </td>

                <td className="p-3 font-mono">
                  {camera.ip_address}
                </td>

                <td className="p-3">

                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      camera.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {camera.status}
                  </span>

                </td>

                <td className="p-3 space-x-3">

                  <button
                    onClick={() => handleEdit(camera)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => toggleStatus(camera)}
                    className="text-yellow-600 hover:underline"
                  >
                    Toggle
                  </button>

                  <button
                    onClick={() => setDeleteCamera(camera)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* ================= DELETE MODAL ================= */}

      {deleteCamera && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

          <div className="bg-white rounded-lg p-6 w-[400px] space-y-4">

            <h2 className="text-lg font-semibold">
              Delete Camera
            </h2>

            <p className="text-sm text-gray-600">
              Are you sure you want to delete camera
              <span className="font-medium"> {deleteCamera.camera_name}</span>?
            </p>

            <div className="flex justify-end space-x-3">

              <button
                onClick={() => setDeleteCamera(null)}
                className="px-4 py-2 border rounded cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer"
              >
                Delete
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}

export default CameraManagement