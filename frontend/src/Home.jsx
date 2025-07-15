import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex items-center justify-center px-4 relative">
      <ThemeToggle />
      <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-700 dark:text-indigo-400 mb-3">
          🏀 NBA Wordle
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-base md:text-lg mb-6">
          Guess the mystery NBA player. Choose a game mode to begin!
        </p>
        <div className="space-y-4">
          <button
            onClick={() => navigate("/daily")}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-lg font-semibold shadow transition transform hover:scale-105"
          >
            🌞 Daily Mode
          </button>
          <button
            onClick={() => navigate("/unlimited")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-lg font-semibold shadow transition transform hover:scale-105"
          >
            ♾️ Unlimited Mode
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-8 dark:text-gray-500">
          Created by Russell • Version 1.0
        </p>
      </div>
    </div>
  );
}

export default Home;
