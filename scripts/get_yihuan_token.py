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
import time
import uuid
import hashlib
import requests
from base64 import b64encode
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

# 老虎平台配置
LAOHU_BASE_URL = "https://user.laohu.com"
LAOHU_APP_ID = 10550
LAOHU_APP_KEY = "89155cc4e8634ec5b1b6364013b23e3e"
LAOHU_SDK_VERSION = "4.273.0"
LAOHU_USER_AGENT = "okhttp/4.9.0"
LAOHU_DEFAULT_PACKAGE = "com.pwrd.htassistant"
LAOHU_DEFAULT_VERSION_CODE = 12

# 塔吉多配置
TAJIDUO_BASE_URL = "https://bbs-api.tajiduo.com"
TAJIDUO_USER_CENTER_APP_ID = "10551"
TAJIDUO_USER_AGENT = "okhttp/4.12.0"
TAJIDUO_APP_VERSION = "1.2.2"

# AES 密钥 (老虎 app_key 最后16位)
AES_KEY = LAOHU_APP_KEY[-16:]


def aes_ecb_encrypt(text):
    """AES-ECB 加密"""
    cipher = AES.new(AES_KEY.encode('utf-8'), AES.MODE_ECB)
    padded = text + (16 - len(text) % 16) * chr(16 - len(text) % 16)
    encrypted = cipher.encrypt(padded.encode('utf-8'))
    return b64encode(encrypted).decode('utf-8')


def generate_device_id():
    """生成设备 ID"""
    return "HT" + uuid.uuid4().hex[:14].upper()


def sign_params(params):
    """MD5 签名"""
    raw = "".join(params[key] for key in sorted(params)) + LAOHU_APP_KEY
    return hashlib.md5(raw.encode()).hexdigest()


def get_common_fields(device_id, use_millis=False):
    """获取通用参数"""
    ts = int(time.time() * 1000) if use_millis else int(time.time())
    base = {
        "appId": str(LAOHU_APP_ID),
        "channelId": "1",
        "deviceId": device_id,
        "deviceType": "Pixel 6",
        "deviceModel": "Pixel 6",
        "deviceName": "Pixel 6",
        "deviceSys": "Android 14",
        "adm": device_id,
        "idfa": "",
        "sdkVersion": LAOHU_SDK_VERSION,
        "bid": LAOHU_DEFAULT_PACKAGE,
        "t": str(ts),
    }
    if use_millis:
        base["version"] = str(LAOHU_DEFAULT_VERSION_CODE)
        base["mac"] = ""
    else:
        base["versionCode"] = str(LAOHU_DEFAULT_VERSION_CODE)
        base["imei"] = ""
    return base


def send_sms(phone, device_id):
    """发送短信验证码"""
    params = get_common_fields(device_id, use_millis=False)
    params["cellphone"] = phone
    params["areaCodeId"] = "1"
    params["type"] = "16"
    params["sign"] = sign_params(params)

    headers = {"User-Agent": LAOHU_USER_AGENT}
    try:
        resp = requests.post(
            f"{LAOHU_BASE_URL}/m/newApi/sendPhoneCaptchaWithOutLogin",
            data=params,
            headers=headers,
            timeout=15
        )
        result = resp.json()
        if result.get("code") == 0:
            print(f"验证码已发送到 {phone}")
            return True
        else:
            print(f"发送失败: {result.get('message', '未知错误')}")
            return False
    except Exception as e:
        print(f"发送失败: {e}")
        return False


def login_with_sms(phone, code, device_id):
    """短信验证码登录"""
    params = get_common_fields(device_id, use_millis=True)
    params["cellphone"] = aes_ecb_encrypt(phone)
    params["captcha"] = aes_ecb_encrypt(code)
    params["areaCodeId"] = "1"
    params["type"] = "16"
    params["sign"] = sign_params(params)

    headers = {"User-Agent": LAOHU_USER_AGENT}
    try:
        resp = requests.post(
            f"{LAOHU_BASE_URL}/openApi/sms/new/login",
            data=params,
            headers=headers,
            timeout=15
        )
        result = resp.json()
        if result.get("code") == 0:
            token = result.get("result", {}).get("token", "")
            user_id = result.get("result", {}).get("userId", "")
            print(f"老虎登录成功!")
            return token, str(user_id)
        else:
            print(f"登录失败: {result.get('message', '未知错误')}")
            return None, None
    except Exception as e:
        print(f"登录失败: {e}")
        return None, None


def exchange_token(laohu_token, laohu_user_id, device_id):
    """用老虎 Token 换取塔吉多 Token"""
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": TAJIDUO_USER_AGENT,
        "platform": "android",
        "deviceid": device_id,
        "appversion": TAJIDUO_APP_VERSION,
        "uid": "0",
        "authorization": "",
    }

    data = {
        "token": laohu_token,
        "userIdentity": laohu_user_id,
        "appId": TAJIDUO_USER_CENTER_APP_ID,
    }

    try:
        resp = requests.post(
            f"{TAJIDUO_BASE_URL}/usercenter/api/login",
            data=data,
            headers=headers,
            timeout=15
        )
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

    device_id = generate_device_id()
    print(f"设备 ID: {device_id}")

    # 发送验证码
    print("\n正在发送验证码...")
    if not send_sms(phone, device_id):
        return

    # 等待用户输入验证码
    code = input("\n请输入收到的验证码: ").strip()
    if not code:
        print("验证码不能为空")
        return

    # 老虎登录
    print("\n正在登录老虎平台...")
    laohu_token, laohu_user_id = login_with_sms(phone, code, device_id)
    if not laohu_token:
        return

    # 换取塔吉多 Token
    print("\n正在换取塔吉多 Token...")
    tajiduo_token = exchange_token(laohu_token, laohu_user_id, device_id)
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
