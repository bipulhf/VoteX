"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/data";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "USER" | "ADMIN";
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getCookie = (name: string): string | undefined => {
    if (typeof document === "undefined") return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return undefined;
  };

  const getToken = () => getCookie("token");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = getToken();
      const userId = getCookie("id");
      const userRole = getCookie("role");

      if (!token || !userId) {
        setLoading(false);
        return;
      }

      try {
        // Try to get user profile from API
        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
        } else {
          // Fallback: create user object from cookies if API fails
          setUser({
            id: userId,
            email: "", // We don't have email in cookies
            firstName: "User", // Fallback name
            lastName: "",
            role: (userRole as "USER" | "ADMIN") || "USER",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        // Fallback: create user object from cookies
        setUser({
          id: userId,
          email: "",
          firstName: "User",
          lastName: "",
          role: (userRole as "USER" | "ADMIN") || "USER",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return {
    user,
    loading,
    getToken,
    isAuthenticated: !!user && !!getToken(),
  };
}
