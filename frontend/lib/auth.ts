export type User = {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
};

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch(
      "http://localhost:5000/api/auth/me",
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return data.success ? data.user : null;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}