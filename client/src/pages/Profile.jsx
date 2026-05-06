import { useEffect, useState } from "react";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user: ctxUser } = useAuth();
  const [user, setUser] = useState(ctxUser);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/api/auth/me");
        if (!cancelled) setUser(data.user);
      } catch {
        /* keep context user */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-bgLight px-4 py-10 transition-colors dark:bg-bgDark">
      <div className="mx-auto max-w-lg">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Profile
        </h1>
        <div className="glass mt-8 rounded-2xl p-6">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Name
              </dt>
              <dd className="mt-1 font-semibold text-slate-900 dark:text-[#F5F5F5]">
                {user?.name}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Email
              </dt>
              <dd className="mt-1 font-semibold text-slate-900 dark:text-[#F5F5F5]">
                {user?.email}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Role
              </dt>
              <dd className="mt-1 capitalize font-semibold text-primary">
                {user?.role}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
