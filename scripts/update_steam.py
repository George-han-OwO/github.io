#!/usr/bin/env python3
"""Steam/CS:GO 数据查询脚本"""

import json
import os
import requests
from datetime import datetime

STEAM_ID = "76561199066644628"
CSGO_APP_ID = "730"
BINDINGS_FILE = "bindings.json"


def load_bindings():
    try:
        with open(BINDINGS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_bindings(data):
    with open(BINDINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)


def query_steam(api_key):
    if not api_key:
        print("STEAM_API_KEY not set, skipping Steam update")
        return None

    result = {}

    # 查询玩家资料
    profile_url = (
        f"https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/"
        f"?key={api_key}&steamids={STEAM_ID}"
    )
    try:
        resp = requests.get(profile_url, timeout=15)
        resp.raise_for_status()
        players = resp.json().get("response", {}).get("players", [])
        if players:
            player = players[0]
            result["steamName"] = player.get("personaname", "")
            result["avatarUrl"] = player.get("avatarfull", "")
            result["profileUrl"] = player.get("profileurl", "")
            print(f"  Steam昵称: {result['steamName']}")
    except Exception as e:
        print(f"  查询玩家资料失败: {e}")

    # 查询游戏库
    games_url = (
        f"https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/"
        f"?key={api_key}&steamid={STEAM_ID}"
        f"&include_appinfo=1&include_played_free_games=1&format=json"
    )
    try:
        resp = requests.get(games_url, timeout=15)
        resp.raise_for_status()
        games_data = resp.json().get("response", {})
        games = games_data.get("games", [])
        total_games = games_data.get("game_count", 0)
        result["totalGames"] = str(total_games)
        print(f"  游戏库数量: {total_games}")

        # 查找 CS:GO/CS2
        for game in games:
            if str(game.get("appid")) == CSGO_APP_ID:
                csgo_minutes = game.get("playtime_forever", 0)
                csgo_hours = round(csgo_minutes / 60)
                result["csgoHours"] = str(csgo_hours)
                print(f"  CS:GO/CS2 时长: {csgo_hours} 小时")
                break
    except Exception as e:
        print(f"  查询游戏库失败: {e}")

    return result


def main():
    print("=== 更新 Steam 数据 ===")

    api_key = os.environ.get("STEAM_API_KEY", "")
    bindings = load_bindings()

    steam_data = query_steam(api_key)
    if steam_data:
        if "steam" not in bindings:
            bindings["steam"] = {}
        bindings["steam"].update(steam_data)
        bindings["steam"]["steamId"] = STEAM_ID
        bindings["steam"]["lastSync"] = datetime.utcnow().isoformat() + "Z"
        print("  Steam 数据已更新")

        if "csgo" not in bindings:
            bindings["csgo"] = {}
        bindings["csgo"]["steamId"] = STEAM_ID
        if "csgoHours" in steam_data:
            bindings["csgo"]["csgoHours"] = steam_data["csgoHours"]
        bindings["csgo"]["lastSync"] = datetime.utcnow().isoformat() + "Z"
        print("  CSGO 数据已更新")

    save_bindings(bindings)
    print("=== Steam 更新完成 ===")


if __name__ == "__main__":
    main()
