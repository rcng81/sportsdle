from flask import Flask, jsonify, request
from datetime import datetime
from flask_cors import CORS
import json
import random
from hashlib import sha256
import pytz
import os

DAILY_FILE = "daily_cache.json"

app = Flask(__name__)
CORS(app)

if os.path.exists(DAILY_FILE):
    with open(DAILY_FILE, "r") as f:
        daily_mystery_cache = json.load(f)
else:
    daily_mystery_cache = {}

# Load pre-saved player data
with open('players.json', 'r') as f:
    players = json.load(f)

def deterministic_shuffle(players, seed):
    return sorted(players, key=lambda p: sha256((seed + p["name"]).encode()).hexdigest())

players = [p for p in players if p.get("team") and p["team"].lower() != "unknown"]


@app.route('/players', methods=['GET'])
def get_players():
    return jsonify(players)

@app.route('/guess', methods=['POST'])
def guess():
    guess_name = request.json.get("name")
    mystery_data = request.json.get("mysteryPlayer")

    if not mystery_data:
        return jsonify({"error": "Missing mystery player"}), 400

    guess_player = next((p for p in players if p["name"].lower() == guess_name.lower()), None)

    if not guess_player:
        return jsonify({"error": "Player not found"}), 404

    feedback = generate_feedback(guess_player, mystery_data)
    is_correct = guess_player["name"].lower() == mystery_data["name"].lower()
    feedback["isCorrect"] = is_correct
    return jsonify(feedback=feedback, isCorrect=is_correct, mysteryPlayer=mystery_data)



@app.route('/mystery')
def get_mystery():
    mode = request.args.get('mode', 'unlimited')

    if mode == 'daily':
        eastern = pytz.timezone("US/Eastern")
        today = datetime.now(eastern).strftime('%Y-%m-%d')

        shuffled = deterministic_shuffle(players, seed="daily-seed")
        index = int(sha256(today.encode()).hexdigest(), 16) % len(shuffled)
        mystery = shuffled[index]

        print(f"[Daily Mode] {today}: {mystery['name']}")
        return jsonify(mystery)

    # Unlimited mode: random
    mystery = random.choice(players)
    return jsonify(mystery)



@app.route("/hint", methods=["POST"])
def give_hint():
    data = request.json
    mystery = data.get("mysteryPlayer")
    used_fields = set(data.get("used", []))

    # Only allow hints from this approved list (draft_year excluded)
    possible_fields = ["team", "conference", "position", "age", "jersey", "draft_number"]

    # Remove fields that have already been used
    available_fields = [f for f in possible_fields if f not in used_fields]

    # Filter out fields that have no value, are empty, or "Undrafted"
    valid_fields = []
    for field in available_fields:
        value = mystery.get(field)
        if value not in [None, "", "Undrafted"]:
            valid_fields.append((field, value))

    if not valid_fields:
        return jsonify({"field": None, "value": "No more valid hints available."}), 200

    field, value = random.choice(valid_fields)
    return jsonify({"field": field, "value": value})





def calculate_age(birthdate_str):
    try:
        if "T" in birthdate_str:
            birthdate = datetime.strptime(birthdate_str, "%Y-%m-%dT%H:%M:%S")
        else:
            birthdate = datetime.strptime(birthdate_str, "%Y-%m-%d")

        today = datetime.today()
        age = today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))
        return age
    except Exception as e:
        print(f"[DEBUG] calculate_age error: {e}")
        return None


def generate_feedback(guess, target):
    def compare(field):
        return "green" if guess[field] == target[field] else "gray"

    def compare_numeric(field):
        guess_val = guess.get(field)
        target_val = target.get(field)

        if guess_val in (None, "Undrafted", "") or target_val in (None, "Undrafted", ""):
            return {"value": guess_val or "N/A", "arrow": "gray"}

        try:
            guess_val = int(guess_val)
            target_val = int(target_val)
        except (ValueError, TypeError):
            return {"value": guess_val if guess_val is not None else "N/A", "arrow": "gray"}

        if guess_val == target_val:
            return {"value": guess_val, "arrow": "green"}
        else:
            arrow = "⬇️" if guess_val > target_val else "⬆️"
            color = "yellow" if abs(guess_val - target_val) <= 2 else "gray"
            return {"value": guess_val, "arrow": color, "direction": arrow}


    
    def compare_age_from_birthdates(guess_birthdate, target_birthdate):
        guess_age = calculate_age(guess_birthdate)
        target_age = calculate_age(target_birthdate)

        if guess_age is None or target_age is None:
            return {"value": "N/A", "arrow": "gray"}

        if guess_age == target_age:
            return {"value": guess_age, "arrow": "green"}
        else:
            arrow = "⬇️" if guess_age > target_age else "⬆️"
            color = "yellow" if abs(guess_age - target_age) <= 2 else "gray"
            return {"value": guess_age, "arrow": color, "direction": arrow}


    return {
        "name": guess["name"],
        "team": {"value": guess["team"], "arrow": compare("team")},
        "conference": {"value": guess["conference"], "arrow": compare("conference")},
        "position": {"value": guess["position"], "arrow": compare("position")},
        "jersey": compare_numeric("jersey"),
        "draft_year": {"value": guess["draft_year"], "arrow": compare("draft_year")},
        "draft_number": compare_numeric("draft_number"),
        "age": compare_age_from_birthdates(guess.get("birthdate"), target.get("birthdate")),
        "birthdate": guess.get("birthdate", "N/A"),
        "player_image": guess.get("player_image"),
        "team_logo": guess.get("team_logo"),
        "conference_logo": guess.get("conference_logo")
}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

