import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "hr_manager" | "employee";

export const useUserRole = () => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        // Query the user_roles table (cast to any until types are regenerated)
        const { data, error } = await (supabase as any)
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching user roles:", error);
          setRoles([]);
        } else {
          setRoles((data || []).map((r: any) => r.role as AppRole));
        }
      } catch (error) {
        console.error("Error fetching user roles:", error);
        setRoles([]);
      }
      
      setLoading(false);
    };

    fetchRoles();
  }, []);

  const hasRole = (role: AppRole) => roles.includes(role);
  const isAdmin = hasRole("admin");
  const isHRManager = hasRole("hr_manager");
  const isEmployee = hasRole("employee");
  const canManageEmployees = isAdmin || isHRManager;

  return {
    roles,
    loading,
    hasRole,
    isAdmin,
    isHRManager,
    isEmployee,
    canManageEmployees,
  };
};
