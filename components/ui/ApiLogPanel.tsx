"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearApiLog } from "@/store/slices/ui/appSlice";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

export default function ApiLogPanel() {
  const apiLog = useAppSelector((s) => s.app.apiLog);
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium"
      >
        <span>API İstekleri ({apiLog.length})</span>
        <span className="flex items-center gap-2">
          {apiLog.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(clearApiLog());
              }}
              className="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-600"
              title="Logu temizle"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>
      {open && (
        <div className="max-h-64 overflow-y-auto border-t border-gray-200 dark:border-gray-700">
          {apiLog.length === 0 ? (
            <p className="p-3 text-sm text-gray-500 dark:text-gray-400">
              Henüz istek yok. Transkript, analiz vb. kullandıkça burada listelenir.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {apiLog.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-mono"
                >
                  <span
                    className={`rounded px-1.5 py-0.5 font-semibold ${
                      entry.method === "POST"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {entry.method}
                  </span>
                  <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
                    {entry.url}
                  </span>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 ${
                      entry.status === "fulfilled"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : entry.status === "rejected"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                    }`}
                  >
                    {entry.status ?? "pending"}
                  </span>
                  {entry.error && (
                    <span className="max-w-[120px] truncate text-red-600 dark:text-red-400" title={entry.error}>
                      {entry.error}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
