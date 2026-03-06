"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

type UserInfo = { firstName: string; email: string } | null;

export default function AccountDropdown() {
  const [user, setUser] = useState<UserInfo>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) {
          if (data?.firstName) {
            setUser({ firstName: data.firstName, email: data.email || "" });
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  function handleEnter() {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setOpen(true);
  }

  function handleLeave() {
    closeTimeout.current = setTimeout(() => setOpen(false), 200);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={ref}
      className="relative hidden md:block"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Trigger */}
      <button
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Mon compte"
        onClick={() => setOpen(!open)}
      >
        {/* User icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
        {/* Connection indicator dot */}
        {!loading && user && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-primary" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-border py-2 z-50 text-text-primary">
          {loading ? (
            <div className="px-4 py-3 text-sm text-text-secondary">Chargement...</div>
          ) : user ? (
            <>
              {/* Connected state */}
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Connecté</span>
                </div>
                <p className="font-semibold text-sm truncate">Bonjour {user.firstName.toUpperCase()}</p>
                {user.email && (
                  <p className="text-xs text-text-secondary truncate">{user.email}</p>
                )}
              </div>
              <div className="py-1">
                <Link
                  href="/compte"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                  Mon compte
                </Link>
                <Link
                  href="/compte/commandes"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
                  </svg>
                  Mes commandes
                </Link>
                <Link
                  href="/documents"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-surface transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  Documents
                </Link>
              </div>
              <div className="border-t border-border pt-1">
                <Link
                  href="/auth/logout"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                  Se déconnecter
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Not connected state */}
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Non connecté</span>
                </div>
                <p className="text-sm text-text-secondary">Accédez à votre espace pro</p>
              </div>
              <div className="p-3 space-y-2">
                <Link
                  href="/auth/login"
                  className="block w-full text-center py-2.5 px-4 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Se connecter
                </Link>
                <Link
                  href="/auth/register"
                  className="block w-full text-center py-2.5 px-4 text-sm font-semibold border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Créer un compte
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
