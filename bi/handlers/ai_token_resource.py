import os
from flask import request
from flask_restful import abort
import json
from bi.handlers.base import BaseResource, json_response
from bi import settings


class AiTokenResource(BaseResource):  # BaseResource
    def post(self):
        if not settings.DATA_SOURCE_FILE_DIR:
            abort(400, message="需要设置 DATA_SOURCE_FILE_DIR")

        # 获取当前用户 ID
        user_name = self.current_user.name
        user_id = self.current_user.id
        # 禁止 user_name 为 guest 的用户进行 POST 请求
        if user_name == "guest":
            return json_response({'code': 403, 'message': "guest is not allowed to perform this action"})

        try:
            data = request.json
            token_file = os.path.join(settings.DATA_SOURCE_FILE_DIR, ".token_" + str(user_id) + ".json")
            with open(token_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
            return json_response({'code': 200, 'data': []})
        except Exception as e:
            return json_response({'code': 400, 'message': str(e)})

    def get(self):
        if not settings.DATA_SOURCE_FILE_DIR:
            abort(400, message="需要设置 DATA_SOURCE_FILE_DIR")

        user_id = self.current_user.id
        token_file = os.path.join(settings.DATA_SOURCE_FILE_DIR, ".token_" + str(user_id) + ".json")

        if not os.path.exists(token_file):
            return json_response({'code': 200, "data": []})

        try:
            with open(token_file, 'r', encoding='utf-8') as file:
                data = json.load(file)

            # 定义加密函数
            def encrypt_api_key(api_key, key='114514'):
                encrypted_bytes = bytearray()
                for i, char in enumerate(api_key):
                    encrypted_bytes.append(ord(char) ^ ord(key[i % len(key)]))
                return encrypted_bytes.hex()

            # 递归地加密所有 ApiKey 字段
            def encrypt_keys(d):
                if isinstance(d, dict):
                    for key, value in d.items():
                        if key.lower() == "apikey" and isinstance(value, str):
                            d[key] = encrypt_api_key(value)
                        elif isinstance(value, dict):
                            encrypt_keys(value)
                        elif isinstance(value, list):
                            for item in value:
                                encrypt_keys(item)
                return d

            encrypted_data = encrypt_keys(data)

            return json_response({
                "code": 200,
                "data": encrypted_data
            })
        except Exception as e:
            return json_response({'code': 400, 'message': str(e)})
