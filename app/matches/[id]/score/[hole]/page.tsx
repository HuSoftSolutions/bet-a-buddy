"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function HoleRedirect() {
  const { id, hole } = useParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main score page
    router.replace(`/matches/${id}/score`);
  }, [id, hole, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>
  );
}
