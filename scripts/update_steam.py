#!/usr/bin/env python3
"""Steam/CS:GO 数据查询脚本"""

import json
import os
import requests
from datetime import datetime, timezone

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
            result["country"] = player.get("loccountrycode", "")
            print(f"  Steam昵称: {result['steamName']}")
            print(f"  头像URL: {result['avatarUrl'][:60]}...")
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

        # 获取游戏时长排行 Top 5
        played_games = [g for g in games if g.get("playtime_forever", 0) > 0]
        played_games.sort(key=lambda g: g.get("playtime_forever", 0), reverse=True)
        top_games = []
        for g in played_games[:5]:
            hours = round(g.get("playtime_forever", 0) / 60)
            top_games.append(f"{g.get('name', '未知')} ({hours}h)")
        result["topGames"] = top_games
        print(f"  Top 5 游戏: {', '.join(top_games)}")
    except Exception as e:
        print(f"  查询游戏库失败: {e}")

    # 查询 CS:GO 成就
    achievements_url = (
        f"https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/"
        f"?key={api_key}&steamid={STEAM_ID}&appid={CSGO_APP_ID}&l=schinese"
    )
    try:
        resp = requests.get(achievements_url, timeout=15)
        if resp.status_code == 200:
            stats = resp.json().get("playerstats", {})
            achievements = stats.get("achievements", [])
            total = len(achievements)
            unlocked = len([a for a in achievements if a.get("achieved") == 1])
            result["csgoAchievements"] = f"{unlocked}/{total}"
            print(f"  CS:GO 成就: {unlocked}/{total}")

            # 获取最近解锁的5个成就
            recent = [a for a in achievements if a.get("achieved") == 1]
            recent_names = [a.get("name", "") for a in recent[-5:]]
            result["csgoRecentAchievements"] = recent_names
            print(f"  最近成就: {', '.join(recent_names)}")
        else:
            print(f"  CS:GO 成就查询失败: {resp.status_code} (可能需要公开游戏详情)")
    except Exception as e:
        print(f"  CS:GO 成就查询失败: {e}")

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
        bindings["steam"]["lastSync"] = datetime.now(timezone.utc).isoformat()
        print("  Steam 数据已更新")

        if "csgo" not in bindings:
            bindings["csgo"] = {}
        bindings["csgo"]["steamId"] = STEAM_ID
        if "csgoHours" in steam_data:
            bindings["csgo"]["csgoHours"] = steam_data["csgoHours"]
        if "csgoAchievements" in steam_data:
            bindings["csgo"]["achievements"] = steam_data["csgoAchievements"]
        if "csgoRecentAchievements" in steam_data:
            bindings["csgo"]["recentAchievements"] = steam_data["csgoRecentAchievements"]
        bindings["csgo"]["lastSync"] = datetime.now(timezone.utc).isoformat()
        print("  CSGO 数据已更新")

    save_bindings(bindings)
    print("=== Steam 更新完成 ===")


if __name__ == "__main__":
    main()
