"use client";

import { useState, useRef } from "react";
import {
  Calendar as CalendarIcon,
  Phone,
  Bot,
  X,
  Settings,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/hooks/useAuth";
import CallHistory from "@/components/calls/CallHistory";
import CalendarPage from "@/app/calendar/page";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<
    "calls" | "calendar" | null
  >(null);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const callsRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  function handleSectionToggle(section: "calls" | "calendar") {
    if (activeSection === section) {
      setActiveSection(null);
      return;
    }

    setActiveSection(section);

    // Wait 2 frames so AnimatePresence can mount the content
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const ref =
          section === "calls" ? callsRef.current : calendarRef.current;
        if (ref) {
          const rect = ref.getBoundingClientRect();
          const offset = rect.top + window.scrollY - 20;
          window.scrollTo({ top: offset, behavior: "smooth" });
        }
      });
    });
  }

  const handleNavigation = async (path: string) => {
    setIsLoading(true);
    router.push(path);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Bot className="w-12 h-12 text-primary-500" />
        </motion.div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1) Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white relative overflow-hidden"
      >
        <div className="flex justify-between items-start relative z-10">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.displayName || "User"}!
            </h1>
            <p className="mt-2 text-primary-100">Mia is ready to help you</p>
          </div>

          <motion.button
            onClick={() => setIsTooltipOpen(!isTooltipOpen)}
            className="relative p-4 bg-white/10 rounded-full hover:bg-white/20 transition-colors group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bot className="w-8 h-8 relative z-10" />
            {/* Ripple effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-white/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [0.8, 1.05, 1],
                opacity: [0, 0.4, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Hover ring effect */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/30"
              initial={{ scale: 0.8, opacity: 0 }}
              whileHover={{
                scale: 1.1,
                opacity: 1,
                transition: { duration: 0.3 },
              }}
            />
          </motion.button>
        </div>

        <AnimatePresence>
          {isTooltipOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 bg-white/10 rounded-xl p-6 relative"
            >
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                  <h3 className="font-semibold text-lg">
                    Mobile Intelligence Assistant (MIA)
                  </h3>
                  <p className="text-primary-100 mt-2">
                    Your intelligent companion that effortlessly handles calls
                    and appointments, keeping everything organized in one place.
                  </p>
                </div>

                {/* Settings/Profile buttons with loading state */}
                <div className="flex flex-col justify-end space-y-4">
                  <button
                    onClick={() => handleNavigation("/settings")}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl flex justify-center"
                  >
                    <Settings className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => handleNavigation("/profile")}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-xl flex justify-center"
                  >
                    <User className="w-6 h-6" />
                  </button>
                </div>

                <button
                  onClick={() => setIsTooltipOpen(false)}
                  className="absolute top-3 right-3 p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8">
          <div className="w-32 h-32 bg-white/10 rounded-full" />
        </div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8">
          <div className="w-24 h-24 bg-white/5 rounded-full" />
        </div>
      </motion.div>

      {/* 2) Buttons */}
      <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto action-cards-grid">
        {/* History Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSectionToggle("calls")}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 transition-all h-48 flex flex-col items-center justify-center"
        >
          <div className="p-4 bg-primary-500/10 dark:bg-primary-500/20 rounded-full mb-3">
            <Phone className="w-10 h-10 text-primary-500 dark:text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            History
          </h2>
        </motion.div>

        {/* Appointments Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSectionToggle("calendar")}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 transition-all h-48 flex flex-col items-center justify-center"
        >
          <div className="p-4 bg-primary-500/10 dark:bg-primary-500/20 rounded-full mb-3">
            <CalendarIcon className="w-10 h-10 text-primary-500 dark:text-primary-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Appointments
          </h2>
        </motion.div>
      </div>

      {/* 3) Call History Section */}
      <div className="mt-8" ref={callsRef}>
        <AnimatePresence>
          {activeSection === "calls" && (
            <motion.div
              key="calls"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CallHistory />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4) Calendar Section */}
      <div className="mt-8" ref={calendarRef}>
        <AnimatePresence>
          {activeSection === "calendar" && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CalendarPage />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
