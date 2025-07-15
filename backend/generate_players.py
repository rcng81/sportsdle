from nba_api.stats.static import players, teams
from nba_api.stats.endpoints import commonplayerinfo
from datetime import datetime
import time
import json

team_conference_map = {
    'ATL': 'East', 'BOS': 'East', 'BKN': 'East', 'CHA': 'East',
    'CHI': 'East', 'CLE': 'East', 'DET': 'East', 'IND': 'East',
    'MIA': 'East', 'MIL': 'East', 'NYK': 'East', 'ORL': 'East',
    'PHI': 'East', 'TOR': 'East', 'WAS': 'East',
    'DAL': 'West', 'DEN': 'West', 'GSW': 'West', 'HOU': 'West',
    'LAC': 'West', 'LAL': 'West', 'MEM': 'West', 'MIN': 'West',
    'NOP': 'West', 'OKC': 'West', 'PHX': 'West', 'POR': 'West',
    'SAC': 'West', 'SAS': 'West', 'UTA': 'West'
}

conference_logo = {
    'East': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Eastern_Conference_%28NBA%29_logo_2018.png/1920px-Eastern_Conference_%28NBA%29_logo_2018.png',
    'West': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Western_Conference_%28NBA%29_logo_2018.png/1920px-Western_Conference_%28NBA%29_logo_2018.png'
}

team_id_map = {team['abbreviation']: team['id'] for team in teams.get_teams()}

def calculate_age(birthdate_str):
    try:
        birthdate = datetime.strptime(birthdate_str, "%Y-%m-%d")
        today = datetime.today()
        return today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))
    except:
        return None

all_players = players.get_active_players()
player_data = []

for i, player in enumerate(all_players):
    player_id = player['id']
    try:
        time.sleep(0.7)
        info = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
        data = info.get_normalized_dict()['CommonPlayerInfo'][0]

        team_abbr = data['TEAM_ABBREVIATION']
        conference = team_conference_map.get(team_abbr, "Unknown")
        age = calculate_age(data['BIRTHDATE'])
        team_id = team_id_map.get(team_abbr)

        player_data.append({
            "id": player_id,
            "name": data['DISPLAY_FIRST_LAST'],
            "team": data['TEAM_NAME'],
            "conference": conference,
            "age": age,
            "birthdate": data['BIRTHDATE'],
            "position": data['POSITION'],
            "jersey": data['JERSEY'],
            "draft_number": data['DRAFT_NUMBER'],
            "draft_year": data['DRAFT_YEAR'],
            "player_image": f"https://cdn.nba.com/headshots/nba/latest/1040x760/{player_id}.png",
            "team_logo": f"https://cdn.nba.com/logos/nba/{team_id}/global/L/logo.svg" if team_id else None,
            "conference_logo": conference_logo.get(conference)
        })

        print(f"Saved {data['DISPLAY_FIRST_LAST']}")

    except Exception as e:
        print(f"Skipping {player['full_name']}: {e}")

with open("players.json", "w") as f:
    json.dump(player_data, f, indent=2)

print(f"\n✅ Saved {len(player_data)} players to players.json")
