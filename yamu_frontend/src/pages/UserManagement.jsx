import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", role: "" });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData(user);
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`/api/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        await axios.put(`/api/users/${selectedUser.id}`, formData);
      } else {
        await axios.post("/api/users", formData);
      }
      fetchUsers();
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving user", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">User Management</h2>
      <Button onClick={() => { setSelectedUser(null); setIsOpen(true); }}>Add User</Button>
      <Card className="mt-4">
        <CardContent>
          <table className="w-full border-collapse border border-gray-200 mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">ID</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border">
                  <td className="border p-2">{user.id}</td>
                  <td className="border p-2">{user.firstName} {user.lastName}</td>
                  <td className="border p-2">{user.email}</td>
                  <td className="border p-2">{user.role}</td>
                  <td className="border p-2">
                    <Button onClick={() => handleEdit(user)}>Edit</Button>
                    <Button onClick={() => handleDelete(user.id)} className="ml-2 bg-red-500">Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <h3 className="text-lg font-semibold">{selectedUser ? "Edit User" : "Add User"}</h3>
          <form onSubmit={handleSubmit} className="space-y-2">
            <input type="text" placeholder="First Name" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="border p-2 w-full" />
            <input type="text" placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="border p-2 w-full" />
            <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="border p-2 w-full" />
            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="border p-2 w-full">
              <option value="">Select Role</option>
              <option value="TRAVELER">Traveler</option>
              <option value="GUIDE">Guide</option>
              <option value="ADMIN">Admin</option>
            </select>
            <Button type="submit">Save</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

