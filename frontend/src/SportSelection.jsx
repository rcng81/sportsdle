import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const sports = [
  { name: "NBA", route: "/basketball", icon: "🏀", available: true },
  { name: "NFL", icon: "🏈", available: false },
  { name: "MLS", icon: "⚽", available: false },
  { name: "MLB", icon: "⚾", available: false }
];

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
          Welcome to <span className="text-green-400">Sportsdle</span>
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-xl">
          Guess the mystery player across basketball, football, and more. New games daily. Choose a sport to begin!
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {sports.map((sport, index) => (
          <motion.div
            key={index}
            className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-xl p-6 flex flex-col items-center text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ scale: 1.03 }}
          >
            <div className="text-5xl mb-4">{sport.icon}</div>
            <h2 className="text-2xl font-semibold mb-2">{sport.name}</h2>

            {sport.available ? (
              <Link
                to={sport.route}
                className="mt-3 px-5 py-2.5 bg-green-500 text-white font-medium rounded-full hover:bg-green-600 transition shadow-lg"
              >
                Play Now
              </Link>
            ) : (
              <p className="mt-3 text-sm text-yellow-400">🚧 Under Construction</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
