import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

export default function BasketballHome() {
  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white flex flex-col items-center px-6 py-12 relative">
      
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Header */}
      <motion.div
        className="flex flex-col items-center mb-8 text-center"
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
        <Link
          to="/basketball"
          className="group mt-6 px-6 py-3 bg-green-500 text-white text-lg font-semibold rounded-full hover:bg-green-600 transition shadow-lg flex items-center gap-2"
        >
          <span className="inline-block transition-transform duration-500 group-hover:rotate-[360deg]">
            🏀
          </span>
          Play Now
        </Link>

      </motion.div>

      {/* How to Play */}
      <motion.div
        className="mt-10 max-w-2xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="text-2xl font-bold mb-4">How to Play</h3>
        <p className="text-md text-gray-700 dark:text-gray-300">
          You have <span className="font-semibold text-green-500">8 attempts</span> to guess the mystery NBA player.
        </p>
        <ul className="mt-4 space-y-2 text-left text-gray-700 dark:text-gray-300">
          <li>🟩 <strong>Green</strong>: Correct value</li>
          <li>🟨 <strong>Yellow</strong>: Close guess (e.g. age or draft number is close)</li>
          <li>⬜ <strong>Gray</strong>: Incorrect value</li>
          <li>💡 You get <strong>1 hint</strong> per game — choose wisely!</li>
        </ul>
      </motion.div>

      {/* Footer */}
      <footer className="mt-auto pt-12 text-sm text-gray-500 dark:text-gray-400">
        Made by Russell Ng
      </footer>
    </div>
  );
}
