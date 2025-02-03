"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { Calendar, Clock, X } from "lucide-react";
import Button from "../ui/Button";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { Call } from "@/lib/types/calls";

interface ScheduleCallbackModalProps {
  call: Call;
  isOpen: boolean;
  onClose: () => void;
  onScheduled: () => void;
}

export default function ScheduleCallbackModal({
  call,
  isOpen,
  onClose,
  onScheduled,
}: ScheduleCallbackModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSchedule = async () => {
    if (!date || !time) return;

    setSaving(true);
    try {
      const scheduledDateTime = new Date(`${date}T${time}`);
      const callRef = doc(db, "calls", call.id);

      await updateDoc(callRef, {
        scheduledCallback: {
          date: Timestamp.fromDate(scheduledDateTime),
          notes: notes.trim() || null,
        },
      });

      onScheduled();
      onClose();
    } catch (error) {
      console.error("Error scheduling callback:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />

        <div className="relative bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>

          <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Schedule Callback
          </Dialog.Title>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                  min={new Date().toISOString().split("T")[0]}
                />
                <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                />
                <Clock className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                rows={3}
                placeholder="Add any notes for the callback..."
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSchedule}
                disabled={!date || !time || saving}
              >
                {saving ? "Scheduling..." : "Schedule Callback"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
