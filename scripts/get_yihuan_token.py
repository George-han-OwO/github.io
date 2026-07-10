#!/usr/bin/env python3
"""
异环 Token 获取工具
运行此脚本获取塔吉多 access_token，用于 GitHub Actions 自动查询

使用方法:
1. 安装依赖: pip install requests pycryptodome
2. 运行: python scripts/get_yihuan_token.py
3. 按提示输入手机号和验证码
4. 获取 token 后添加到 GitHub Secrets: YIHUAN_TOKEN
"""

import json
import requests
from Crypto.Cipher import AES
import base64
import time

# 老虎平台 API
LAOHU_SMS_URL = "https://user.laohu.com/openApi/sms/new/send"
LAOHU_LOGIN_URL = "https://user.laohu.com/openApi/sms/new/login"

# 塔吉多 API
TAJIDUO_LOGIN_URL = "https://bbs-api.tajiduo.com/usercenter/api/login"

# AES-ECB 加密密钥 (老虎平台使用固定密钥)
AES_KEY = "wG1m3Mj7pRq8vN2x"


def aes_ecb_encrypt(text, key):
    """AES-ECB 加密"""
    cipher = AES.new(key.encode('utf-8'), AES.MODE_ECB)
    padded = text + (16 - len(text) % 16) * chr(16 - len(text) % 16)
    encrypted = cipher.encrypt(padded.encode('utf-8'))
    return base64.b64encode(encrypted).decode('utf-8')


def send_sms(phone):
    """发送短信验证码"""
    encrypted_phone = aes_ecb_encrypt(phone, AES_KEY)
    data = {
        "mobile": encrypted_phone,
        "areaCode": "86"
    }
    try:
        resp = requests.post(LAOHU_SMS_URL, json=data, timeout=10)
        result = resp.json()
        if result.get("code") == 0:
            print(f"验证码已发送到 {phone}")
            return True
        else:
            print(f"发送失败: {result.get('msg', '未知错误')}")
            return False
    except Exception as e:
        print(f"发送失败: {e}")
        return False


def login_with_sms(phone, code):
    """短信验证码登录"""
    encrypted_phone = aes_ecb_encrypt(phone, AES_KEY)
    encrypted_code = aes_ecb_encrypt(code, AES_KEY)
    data = {
        "mobile": encrypted_phone,
        "code": encrypted_code,
        "areaCode": "86"
    }
    try:
        resp = requests.post(LAOHU_LOGIN_URL, json=data, timeout=10)
        result = resp.json()
        if result.get("code") == 0:
            token = result.get("data", {}).get("accessToken", "")
            print(f"老虎登录成功!")
            return token
        else:
            print(f"登录失败: {result.get('msg', '未知错误')}")
            return None
    except Exception as e:
        print(f"登录失败: {e}")
        return None


def exchange_token(laohu_token):
    """用老虎 Token 换取塔吉多 Token"""
    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
    }
    data = {
        "token": laohu_token
    }
    try:
        resp = requests.post(TAJIDUO_LOGIN_URL, json=data, headers=headers, timeout=10)
        result = resp.json()
        if result.get("code") == 0:
            access_token = result.get("data", {}).get("accessToken", "")
            print(f"塔吉多 Token 获取成功!")
            return access_token
        else:
            print(f"换取失败: {result.get('msg', '未知错误')}")
            return None
    except Exception as e:
        print(f"换取失败: {e}")
        return None


def main():
    print("=" * 50)
    print("异环 Token 获取工具")
    print("=" * 50)
    print()

    phone = input("请输入异环绑定手机号: ").strip()
    if not phone:
        print("手机号不能为空")
        return

    # 发送验证码
    print("\n正在发送验证码...")
    if not send_sms(phone):
        return

    # 等待用户输入验证码
    code = input("\n请输入收到的验证码: ").strip()
    if not code:
        print("验证码不能为空")
        return

    # 老虎登录
    print("\n正在登录老虎平台...")
    laohu_token = login_with_sms(phone, code)
    if not laohu_token:
        return

    # 换取塔吉多 Token
    print("\n正在换取塔吉多 Token...")
    tajiduo_token = exchange_token(laohu_token)
    if not tajiduo_token:
        return

    print("\n" + "=" * 50)
    print("Token 获取成功!")
    print("=" * 50)
    print(f"\n你的塔吉多 Token:\n{tajiduo_token}")
    print("\n请将此 Token 添加到 GitHub Secrets:")
    print("1. 打开 https://github.com/George-han-OwO/github.io/settings/secrets/actions")
    print("2. 点击 'New repository secret'")
    print("3. Name: YIHUAN_TOKEN")
    print(f"4. Value: {tajiduo_token}")
    print("5. 点击 'Add secret'")


if __name__ == "__main__":
    main()
