#!/usr/bin/env python3
"""异环 数据查询脚本 (塔吉多 API)"""

import json
import os
import requests
from datetime import datetime

BINDINGS_FILE = "bindings.json"
TAJIDUO_BASE = "https://bbs-api.tajiduo.com"


def load_bindings():
    try:
        with open(BINDINGS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_bindings(data):
    with open(BINDINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)


def tajiduo_headers(token):
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "User-Agent": "GeorgeHan-GameBindings/1.0"
    }


def get_game_roles(token):
    url = f"{TAJIDUO_BASE}/usercenter/api/v2/getGameRoles"
    try:
        resp = requests.get(url, headers=tajiduo_headers(token), timeout=15)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"  获取游戏角色失败: {e}")
        return None


def get_yihuan_profile(token):
    url = f"{TAJIDUO_BASE}/apihub/awapi/yh/profile"
    try:
        resp = requests.get(url, headers=tajiduo_headers(token), timeout=15)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"  获取异环档案失败: {e}")
        return None


def query_yihuan(token):
    if not token:
        print("YIHUAN_TOKEN not set, skipping Yi Huan update")
        return None

    result = {}

    # 获取游戏角色
    print("  查询游戏角色...")
    roles_data = get_game_roles(token)
    if roles_data and roles_data.get("code") == 0:
        roles = roles_data.get("data", [])
        if roles:
            role = roles[0]  # 取第一个角色
            result["account"] = role.get("name", "")
            result["uid"] = str(role.get("uid", ""))
            result["server"] = role.get("server", "")
            result["level"] = str(role.get("level", ""))
            print(f"  角色名: {result.get('account', 'N/A')}")
            print(f"  UID: {result.get('uid', 'N/A')}")
            print(f"  等级: {result.get('level', 'N/A')}")
    else:
        print("  未找到游戏角色或 token 已过期")

    # 获取异环档案
    print("  查询异环档案...")
    profile_data = get_yihuan_profile(token)
    if profile_data and profile_data.get("code") == 0:
        profile = profile_data.get("data", {})
        if profile:
            if not result.get("account"):
                result["account"] = profile.get("nickname", "")
            if not result.get("level"):
                result["level"] = str(profile.get("level", ""))
            result["progress"] = profile.get("chapter", "")
            print(f"  进度: {result.get('progress', 'N/A')}")

    return result if result else None


def main():
    print("=== 更新异环数据 ===")

    token = os.environ.get("YIHUAN_TOKEN", "")
    bindings = load_bindings()

    yihuan_data = query_yihuan(token)
    if yihuan_data:
        if "yihuan" not in bindings:
            bindings["yihuan"] = {}
        bindings["yihuan"].update(yihuan_data)
        bindings["yihuan"]["lastSync"] = datetime.utcnow().isoformat() + "Z"
        print("  异环数据已更新")
    else:
        print("  异环数据未更新")

    save_bindings(bindings)
    print("=== 异环更新完成 ===")


if __name__ == "__main__":
    main()
