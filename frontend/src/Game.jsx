import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { DateTime } from "luxon";
import { Link } from "react-router-dom";


function Game({ mode }) {
  const [players, setPlayers] = useState([]);
  const [guess, setGuess] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const { width, height } = useWindowSize();
  const [hint, setHint] = useState(null);
  const [guessesLeft, setGuessesLeft] = useState(8);
  const [isLoser, setIsLoser] = useState(false);
  const [mysteryPlayer, setMysteryPlayer] = useState(null);
  const [hasUsedHint, setHasUsedHint] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [lockedOut, setLockedOut] = useState(false);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [showLoserPopup, setShowLoserPopup] = useState(false);


  useEffect(() => {
    axios.get("http://localhost:5000/players").then(res => {
      const sortedPlayers = res.data.sort((a, b) => {
        const firstA = a.name.split(" ")[0].toLowerCase();
        const firstB = b.name.split(" ")[0].toLowerCase();
        return firstA.localeCompare(firstB);
      });
      setPlayers(sortedPlayers);
    });
  }, []);


  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
  if (mode !== "daily") {
    axios.get(`http://localhost:5000/mystery?mode=${mode}`)
      .then(res => setMysteryPlayer(res.data));
  } else {
    const todayKey = DateTime.now().toFormat("yyyy-LL-dd");
    const progressKey = `dailyProgress-${todayKey}`;
    const saved = localStorage.getItem(progressKey);

    if (saved) {
      const data = JSON.parse(saved);

      if (data.isWinner) setIsWinner(true);
      if (data.isLoser) setIsLoser(true);
      if (data.isWinner || data.isLoser) setLockedOut(true);

      // 👇 Restore game state
      if (data.mysteryPlayer) setMysteryPlayer(data.mysteryPlayer);
      if (data.results) setResults(data.results);
      if (data.guessesLeft !== undefined) setGuessesLeft(data.guessesLeft);
      if (data.hasUsedHint) setHasUsedHint(data.hasUsedHint);

      return;
    }

    axios.get(`http://localhost:5000/mystery?mode=daily`).then(res => {
      setMysteryPlayer(res.data);
      const data = {
        mysteryPlayer: res.data,
        results: [],
        guessesLeft: 8,
        isWinner: false,
        isLoser: false,
        hasUsedHint: false
      };
      localStorage.setItem(progressKey, JSON.stringify(data));
    });
  }
}, [mode]);


useEffect(() => {
  if (mode !== "daily") return;

  const todayKey = DateTime.now().toFormat("yyyy-LL-dd");
  const progressKey = `dailyProgress-${todayKey}`;
    const data = {
    results,
    guessesLeft,
    isWinner,
    isLoser,
    hasUsedHint,
    mysteryPlayer
  };

  const timeout = setTimeout(() => {
    localStorage.setItem(progressKey, JSON.stringify(data));
    console.log("Saved to localStorage:", progressKey, data);
  }, 100);

  return () => clearTimeout(timeout);
}, [mode, results, guessesLeft, isWinner, isLoser, hasUsedHint]);


useEffect(() => {
  if (mode !== "daily") return;

  const updateCountdown = () => {
    const now = DateTime.now().setZone("America/New_York");
    const nextMidnight = now.plus({ days: 1 }).startOf("day");
    const diff = nextMidnight.diff(now, ["hours", "minutes", "seconds"]).toObject();

    const hours = String(Math.floor(diff.hours)).padStart(2, "0");
    const minutes = String(Math.floor(diff.minutes)).padStart(2, "0");
    const seconds = String(Math.floor(diff.seconds)).padStart(2, "0");

    setCountdown(`${hours}:${minutes}:${seconds}`);
  };

  updateCountdown();
  const interval = setInterval(updateCountdown, 1000);
  return () => clearInterval(interval);
}, [mode]);

  const handleGuess = () => {
  if (guessesLeft <= 0 || lockedOut || isWinner || isLoser) return;

  const validPlayer = players.find(p => p.name.toLowerCase() === guess.toLowerCase());
  if (!validPlayer) {
    alert("Please select a valid NBA player from the list.");
    return;
  }

  const alreadyGuessed = results.some(r => r.name.toLowerCase() === guess.toLowerCase());
  if (alreadyGuessed) {
    alert("You've already guessed this player!");
    return;
  }

  axios.post("http://localhost:5000/guess", {
    name: guess,
    mysteryPlayer: mysteryPlayer,
  })

    .then(res => {
      const { feedback, isCorrect, mysteryPlayer: serverMystery } = res.data;
      const newGuessesLeft = guessesLeft - 1;
      const newResults = [...results, feedback];

      const todayKey = DateTime.now().toFormat("yyyy-LL-dd");
      const progressKey = `dailyProgress-${todayKey}`;

      const didWin = isCorrect;
      const didLose = !isCorrect && newGuessesLeft === 0;

      console.log("Guess result:", {
        guess,
        isCorrect,
        didWin,
        didLose,
        newGuessesLeft,
        serverMystery,
      });

      setMysteryPlayer(serverMystery);
      setResults(newResults);
      setGuessesLeft(newGuessesLeft);
      setGuess("");

      if (didWin) {
        setIsWinner(true);
        setLockedOut(true);
        setShowWinnerPopup(true);
      }

      if (didLose) {
        setIsLoser(true);
        setLockedOut(true);
        setShowLoserPopup(true);
      }


      if (mode === "daily") {
        const saveData = {
          isWinner: didWin,
          isLoser: didLose,
          mysteryPlayer: serverMystery,
          guessesLeft: newGuessesLeft,
          results: newResults,
          hasUsedHint,
        };
        console.log("Saving to localStorage:", saveData);
        localStorage.setItem(progressKey, JSON.stringify(saveData));
      }
    })
    .catch(err => {
      console.error("Guess error:", err);
      setResults(prev => [...prev, { error: "Player not found." }]);
    });
};





const filteredPlayers = players.filter(p =>
  p.name.toLowerCase().includes(guess.toLowerCase())
);

const canShowHintButton = results.length > 0 && guessesLeft > 1 && !isWinner && !isLoser && !hasUsedHint && !lockedOut;

const resetUnlimitedGame = () => {
  axios.get(`http://localhost:5000/mystery?mode=unlimited`).then(res => {
    setMysteryPlayer(res.data);
    setResults([]);
    setGuess("");
    setGuessesLeft(8);
    setIsWinner(false);
    setIsLoser(false);
    setHasUsedHint(false);
    setHint(null);
    setShowWinnerPopup(false);
    setShowLoserPopup(false);
  });
};


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex flex-col items-center p-6">
      {showWinnerPopup && isWinner && (
    <>
      <Confetti width={width} height={height} />
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded shadow-lg border text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-2">🎉 Congratulations! 🎉</h2>
          <p>You correctly guessed the mystery player!</p>
          <button
            onClick={() => setShowWinnerPopup(false)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )}

  {showLoserPopup && isLoser && !isWinner && mysteryPlayer && (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg border text-center max-w-4xl w-full">
        <div className="flex flex-col items-center mb-4">
          {mysteryPlayer.player_image && (
            <img
              src={mysteryPlayer.player_image}
              alt={mysteryPlayer.name}
              className="h-32 w-auto object-contain mb-4"
            />
          )}
          <h2 className="text-2xl font-bold text-red-600 mb-2">😢 You Lost!</h2>
          <p className="mb-2 text-lg">The mystery player was <strong>{mysteryPlayer.name}</strong>:</p>
        </div>
        <div className="flex border border-gray-300 divide-x divide-gray-300 rounded-md overflow-hidden bg-white">
          <StatCell label="Player" data={{ value: mysteryPlayer.name }} image={mysteryPlayer.player_image} />
          <StatCell label="Team" data={{ value: mysteryPlayer.team }} image={mysteryPlayer.team_logo} />
          <StatCell label="Conference" data={{ value: mysteryPlayer.conference }} image={mysteryPlayer.conference_logo} />
          <StatCell label="Age" data={{ value: mysteryPlayer.age }} />
          <StatCell label="Position" data={{ value: mysteryPlayer.position }} />
          <StatCell label="Jersey #" data={{ value: mysteryPlayer.jersey }} />
          <StatCell label="Draft #" data={{ value: mysteryPlayer.draft_number }} />
        </div>
        <button
          onClick={() => setShowLoserPopup(false)}
          className="mt-6 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  )}

  <Link
    to="/"
    className="text-5xl font-extrabold mb-6 text-indigo-700 tracking-tight drop-shadow-md hover:underline"
  >
    🏀 NBA Wordle
  </Link>

  {mode === "daily" && (isWinner || isLoser) && (
    <div className="text-center text-green-700 font-semibold mb-4">
      <div>🏁 Daily complete! Come back tomorrow to play again.</div>
      <div className="text-sm text-gray-600 mt-1">
        ⏳ Next game in: <span className="font-mono">{countdown}</span> (EST)
      </div>
    </div>
  )}

  {mode === "daily" && !(isWinner || isLoser) && (
    <div className="text-lg text-gray-700 mb-4">
      🔄 New mystery player in: <span className="font-mono">{countdown}</span> (EST)
    </div>
  )}


  {mode === "unlimited" && (isWinner || isLoser) && (
    <button
      onClick={resetUnlimitedGame}
      className="mb-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 shadow"
    >
      🔁 Play Again
    </button>
  )}

  {!(mode === "daily" && (isWinner || isLoser)) && (
    <div className="relative w-64 mb-4" ref={dropdownRef}>
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Enter NBA player"
        onFocus={() => setShowDropdown(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleGuess();
        }}
        className="border p-2 rounded-md shadow-md w-full bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400"
      />

      <button
        onClick={() => setShowDropdown((prev) => !prev)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        title="Toggle player list"
      >
        {showDropdown ? "▲" : "▼"}
      </button>

      {showDropdown && (
        <div className="absolute z-50 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 shadow-md border border-gray-300 dark:border-gray-600 rounded-md mt-1 w-full">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((p, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-100"
                onClick={() => {
                  setGuess(p.name);
                  setShowDropdown(false);
                }}
              >
                {p.name}
              </div>
            ))
          ) : (
           <div className="px-4 py-2 text-gray-500 dark:text-gray-400">No matches</div>
          )}
        </div>
      )}

      <button
        onClick={handleGuess}
        className="mt-2 w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 text-base font-bold shadow-md"
      >
        Guess
      </button>

      <div className="flex justify-center items-center gap-1 mt-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="text-xl">
            {i < guessesLeft ? "🏀" : "⚪"}
          </span>
        ))}
      </div>

      {canShowHintButton && (
        <>
          <button
            onClick={() => {
              const lastResult = results[results.length - 1];

              const usedGreenFields = [];
              if (lastResult) {
                if (lastResult.team?.arrow === "green") usedGreenFields.push("team");
                if (lastResult.conference?.arrow === "green") usedGreenFields.push("conference");
                if (lastResult.position?.arrow === "green") usedGreenFields.push("position");
                if (lastResult.draft_year?.arrow === "green") usedGreenFields.push("draft_year");
                if (lastResult.age?.arrow === "green") usedGreenFields.push("age");
                if (lastResult.jersey?.arrow === "green") usedGreenFields.push("jersey");
                if (lastResult.draft_number?.arrow === "green") usedGreenFields.push("draft_number");
              }

              axios.post("http://localhost:5000/hint", {
    used: usedGreenFields,
    mysteryPlayer: mysteryPlayer
  })

              .then(res => {
                setHint(res.data);
                setHasUsedHint(true);
                setGuessesLeft(prev => {
                  const newGuesses = prev - 1;
                  if (newGuesses === 0 && !res.data.isCorrect) {
                    axios.get("http://localhost:5000/mystery").then(response => {
                      setMysteryPlayer(response.data);
                      setIsLoser(true);
                    });
                  }
                  return newGuesses;
                });
              });
          }}
          className="mt-2 w-full bg-transparent text-yellow-500 py-2 rounded-md hover:bg-gray-200 text-sm font-medium border border-transparent"
        >
          Get a Hint
        </button>

        {hint && (
          <div className="mt-2 text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 p-2 rounded-md w-full text-center">
            Hint: The player's <strong>{hint.field}</strong> is <strong>{hint.value}</strong>
          </div>
        )}
      </>
    )}
  </div>
)}


{mode === "daily" && lockedOut && !showWinnerPopup && !showLoserPopup && (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg border border-gray-300 dark:border-gray-600 text-center max-w-md w-full">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">🎯 You've already played today!</h2>
      <p className="text-gray-600 dark:text-gray-300 text-sm">Come back tomorrow at midnight (EST) to play again.</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        ⏳ Next game in: <span className="font-mono">{countdown}</span>
      </p>
      <button
        onClick={() => setLockedOut(false)}
        className="mt-5 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        Close
      </button>
    </div>
  </div>
)}

    <div className="w-full max-w-6xl h-[600px] overflow-y-auto mt-4 space-y-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 p-3">

      {results.map((result, index) => (
        result.error ? (
          <div
            key={index}
            className="bg-red-100 border border-red-300 text-red-700 text-center p-3 rounded-md"
          >
            {result.error}
          </div>
        ) : (
          <div
            key={index}
            className="flex border border-gray-300 divide-x divide-gray-300 rounded-md overflow-hidden bg-white"
          >
            <StatCell
              label="Player"
              data={{ value: result.name }}
              image={result.player_image}
              hint={hint?.field === "name" ? hint : null}
            />
            <StatCell
              label="Team"
              data={result.team}
              image={result.team_logo}
              hint={hint?.field === "team" ? hint : null}
            />
            <StatCell
              label="Conference"
              data={result.conference}
              image={result.conference_logo}
              hint={hint?.field === "conference" ? hint : null}
            />
            <StatCell
              label="Age"
              data={result.age}
              hint={hint?.field === "age" ? hint : null}
            />
            <StatCell
              label="Position"
              data={result.position}
              hint={hint?.field === "position" ? hint : null}
            />
            <StatCell
              label="Jersey #"
              data={result.jersey}
              hint={hint?.field === "jersey" ? hint : null}
            />
            <StatCell
              label="Draft #"
              data={result.draft_number}
              hint={hint?.field === "draft_number" ? hint : null}
            />

          </div>
        )
      ))}
      {isLoser && mysteryPlayer && (
        <div className="mt-6 w-full max-w-6xl border border-red-300 dark:border-red-600 rounded-md bg-red-50 dark:bg-red-900 p-3">
          <h3 className="text-center text-lg font-semibold text-red-700 mb-2">
            The mystery player was: {mysteryPlayer.name}
          </h3>
          <div className="flex border border-gray-300 divide-x divide-gray-300 rounded-md overflow-hidden bg-white">
            <StatCell label="Player" data={{ value: mysteryPlayer.name }} image={mysteryPlayer.player_image} />
            <StatCell label="Team" data={{ value: mysteryPlayer.team }} image={mysteryPlayer.team_logo} />
            <StatCell label="Conference" data={{ value: mysteryPlayer.conference }} image={mysteryPlayer.conference_logo} />
            <StatCell label="Age" data={{ value: mysteryPlayer.age }} />
            <StatCell label="Position" data={{ value: mysteryPlayer.position }} />
            <StatCell label="Jersey #" data={{ value: mysteryPlayer.jersey }} />
            <StatCell label="Draft #" data={{ value: mysteryPlayer.draft_number }} />
          </div>
        </div>
      )}
    </div>
  </div>
);
}

  function StatCell({ label, data = {}, image, hint }) {
    const { value, arrow, direction } = typeof data === "object" ? data : { value: data, arrow: null, direction: null };

    let bgClass = "bg-white dark:bg-gray-800";
    if (arrow === "green") {
        bgClass = "bg-green-100 dark:bg-green-900";
      } else if (arrow === "yellow") {
         bgClass = "bg-yellow-100 dark:bg-yellow-900";
      }

  return (
    <div className={`flex-1 text-center p-4 ${bgClass}`}>
      {image && (
        <div className="flex justify-center mb-2">
          <img src={image} alt={label} className="h-12 w-auto object-contain" />
        </div>
      )}
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-lg font-semibold">
        {value} {direction || ""}
      </p>
      {hint && (
        <p className="mt-2 text-xs text-yellow-700 bg-yellow-100 dark:bg-yellow-800 border border-yellow-300 dark:border-yellow-600 rounded px-2 py-1">
          Hint: {hint.value}
        </p>
      )}
    </div>
  );
}
export default Game;
