import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]); // To store events
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("users"); // 'users' or 'events'

  const token = localStorage.getItem("token");
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Users
      const userRes = await axios.get("http://localhost:5001/api/users/admin/users", authConfig);
      setUsers(userRes.data.users);

      // 2. Fetch All Events (Re-using the public events route)
      const eventRes = await axios.get("http://localhost:5001/api/events", authConfig);
      setEvents(eventRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if(!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5001/api/users/${id}`, authConfig);
      setUsers(users.filter(u => u.user_id !== id)); // Remove from UI
      alert("✅ User deleted");
    } catch(err) { alert("Failed to delete user"); }
  };

  const handleDeleteEvent = async (id) => {
    if(!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`http://localhost:5001/api/events/${id}`, authConfig);
      setEvents(events.filter(e => e.event_id !== id)); // Remove from UI
      alert("✅ Event deleted");
    } catch(err) { alert("Failed to delete event"); }
  };

  if (loading) return <div className="text-center mt-5"><p>Loading Admin Dashboard...</p></div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">👑 Admin Dashboard</h2>

      {/* --- STATS CARDS --- */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary mb-3">
            <div className="card-body">
              <h5 className="card-title">Total Users</h5>
              <p className="card-text fs-3">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success mb-3">
            <div className="card-body">
              <h5 className="card-title">Total Events</h5>
              <p className="card-text fs-3">{events.length}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-warning mb-3">
            <div className="card-body">
              <h5 className="card-title">Pending Reports</h5>
              <p className="card-text fs-3">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- TABS --- */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
            Manage Users
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>
            Manage Events
          </button>
        </li>
      </ul>

      {/* --- USERS TABLE --- */}
      {tab === 'users' && (
        <div className="table-responsive">
          <table className="table table-striped table-hover border">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id}>
                  <td>{u.user_id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'bg-danger' : u.role === 'organizer' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {u.role !== 'admin' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u.user_id)}>
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- EVENTS TABLE --- */}
      {tab === 'events' && (
        <div className="table-responsive">
          <table className="table table-striped table-hover border">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Event Title</th>
                <th>Date</th>
                <th>Location</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.event_id}>
                  <td>{ev.event_id}</td>
                  <td>{ev.title}</td>
                  <td>{new Date(ev.date).toLocaleDateString()}</td>
                  <td>{ev.location}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteEvent(ev.event_id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}