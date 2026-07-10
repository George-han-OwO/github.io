#!/usr/bin/env python3
"""明日方舟终末地 数据查询脚本 (Enka Network API)"""

import json
import requests
from datetime import datetime

ENDFIELD_UID = "1574994927"
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


def query_endfield():
    url = f"https://enka.network/api/uid/{ENDFIELD_UID}"
    headers = {
        "User-Agent": "GeorgeHan-GameBindings/1.0"
    }

    result = {}
    try:
        print(f"  查询 UID: {ENDFIELD_UID}")
        resp = requests.get(url, headers=headers, timeout=20)
        resp.raise_for_status()
        data = resp.json()

        # 玩家信息
        player_info = data.get("playerInfo", {})
        if player_info:
            result["account"] = player_info.get("nickname", "")
            result["level"] = str(player_info.get("level", ""))
            result["uid"] = ENDFIELD_UID
            print(f"  玩家名: {result.get('account', 'N/A')}")
            print(f"  等级: {result.get('level', 'N/A')}")

        # 角色展示
        avatar_list = data.get("avatarInfoList", [])
        if avatar_list:
            chars = []
            for avatar in avatar_list[:5]:  # 只取前5个
                char_name = avatar.get("avatarName", "未知")
                char_level = avatar.get("level", 0)
                chars.append(f"{char_name} Lv.{char_level}")
            result["progress"] = "角色: " + ", ".join(chars)
            print(f"  角色展示: {result['progress']}")

        print("  终末地数据查询成功")

    except requests.exceptions.HTTPError as e:
        if e.response and e.response.status_code == 404:
            print(f"  UID {ENDFIELD_UID} 未找到，请检查是否正确")
        else:
            print(f"  HTTP 错误: {e}")
    except requests.exceptions.Timeout:
        print("  请求超时")
    except Exception as e:
        print(f"  查询失败: {e}")

    return result


def main():
    print("=== 更新终末地数据 ===")

    bindings = load_bindings()

    endfield_data = query_endfield()
    if endfield_data:
        if "endfield" not in bindings:
            bindings["endfield"] = {}
        bindings["endfield"].update(endfield_data)
        bindings["endfield"]["lastSync"] = datetime.utcnow().isoformat() + "Z"
        print("  终末地数据已更新")
    else:
        print("  终末地数据未更新")

    save_bindings(bindings)
    print("=== 终末地更新完成 ===")


if __name__ == "__main__":
    main()
