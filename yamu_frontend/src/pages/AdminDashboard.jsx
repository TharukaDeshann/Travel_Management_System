
import React from 'react';
import { useUser } from '../context/UserContext.jsx';


export default function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin dashboard!</p>
        <p>Here you can manage users, view reports, and perform administrative tasks.</p>

    </div>
  );
}