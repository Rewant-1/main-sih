"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
            <WifiOff className="w-12 h-12 text-slate-500 dark:text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            You&apos;re Offline
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            It looks like you&apos;ve lost your internet connection. Some features may be unavailable until you&apos;re back online.
          </p>
        </div>

        <div className="space-y-4">
          <Button onClick={handleRetry} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>

          <div className="text-sm text-slate-500 dark:text-slate-400">
            <p>While offline, you can still:</p>
            <ul className="mt-2 space-y-1">
              <li>• View previously loaded content</li>
              <li>• Draft messages (they&apos;ll send when online)</li>
              <li>• Browse cached pages</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-400">
            AlumniConnect will automatically reconnect when your internet is restored.
          </p>
        </div>
      </div>
    </div>
  );
}
