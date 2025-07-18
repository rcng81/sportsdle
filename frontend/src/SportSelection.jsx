import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

export default function SportSelection() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white flex flex-col items-center px-6 py-12 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <motion.div
        className="flex flex-col items-center mb-10 text-center"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Welcome to <span className="text-green-400">NBA Wordle</span>
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-xl">
          Guess the mystery NBA player. New challenges daily — start playing now!
        </p>
      </motion.div>

      <motion.div
        className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.03 }}
      >
        <div className="text-5xl mb-4">🏀</div>
        <h2 className="text-2xl font-semibold mb-2">NBA</h2>
        <Link
          to="/basketball"
          className="mt-3 px-5 py-2.5 bg-green-500 text-white font-medium rounded-full hover:bg-green-600 transition shadow-lg"
        >
          Play Now
        </Link>
      </motion.div>
    </div>
  );
}
