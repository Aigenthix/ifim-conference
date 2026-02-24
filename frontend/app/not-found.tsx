"use client";

import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-extrabold text-[var(--color-text-muted)] mb-4">404</h1>
        <h2 className="text-xl font-semibold mb-3">Page Not Found</h2>
        <p className="text-[var(--color-text-muted)] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white
                     bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </main>
  );
}
