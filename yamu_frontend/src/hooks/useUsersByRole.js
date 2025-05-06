// hooks/useUsersByRole.js
import { useState, useEffect, useCallback } from 'react';
import { fetchUsersByRole } from '../services/userService';

export const useUsersByRole = (role) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUsers = useCallback(async () => {
    // Don't fetch if no role is selected
    if (!role) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchUsersByRole(role);
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  // Load users when role changes
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Allow manual refetching
  const refetch = useCallback(() => {
    loadUsers();
  }, [loadUsers]);

  return { users, loading, error, refetch };
};