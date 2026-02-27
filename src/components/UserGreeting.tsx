"use client";

import { useEffect, useState } from "react";

export default function UserGreeting() {
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.firstName) {
          setFirstName(data.firstName);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!firstName) return null;

  return (
    <span className="hidden md:inline text-sm text-white/80 font-medium">
      Bonjour {firstName}
    </span>
  );
}
