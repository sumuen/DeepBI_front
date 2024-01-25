# -*- coding: utf-8 -*-
"""
info:  Define ZhiPuAI
"""
import json
from zhipuai import ZhipuAI

# define default model
ZHIPU_AI_MODEL = "glm-4"


def object_to_dict(obj):
    if isinstance(obj, (int, float, str, bool, type(None))):
        return obj
    elif isinstance(obj, list):
        return [object_to_dict(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: object_to_dict(value) for key, value in obj.items()}
    elif hasattr(obj, "__dict__"):
        return {key: object_to_dict(value) for key, value in obj.__dict__.items() if not key.startswith("__")}
    else:
        return str(obj)


class ZhiPuAIClient:

    @classmethod
    def run(cls, apiKey, data):
        print("---start---------" * 3)
        print(data)
        print("---over----------" * 3)
        zhipu_data = cls.input_to_openai(data)
        print(zhipu_data)
        print("++++++change data+++++" * 3)
        client = ZhipuAI(api_key=apiKey)
        if "functions" in data:
            tools = zhipu_data["tools"]
            response = client.chat.completions.create(
                model=ZHIPU_AI_MODEL,  # 填写需要调用的模型名称
                messages=zhipu_data["messages"],
                tools=tools,
                tool_choice="auto",
            )
        else:
            print("-------------zhipu-------------input---------")
            print(zhipu_data["messages"])
            print("-------------zhipu-------------input---------")
            response = client.chat.completions.create(
                model=ZHIPU_AI_MODEL,
                messages=zhipu_data["messages"]
            )
        result = cls.output_to_openai(response)
        return result
        pass

    @classmethod
    def input_to_openai(cls, data):
        tools = []
        messages = []
        if "functions" in data:
            for item in data["functions"]:
                new_item = {
                    "type": "function",
                    "function": item
                }
                tools.append(new_item)
        if "messages" in data and data["messages"] is not None and len(data["messages"]) > 0:
            for item in data["messages"]:
                if item.get("content") is None and "function_call" in item:
                    new_item = {
                        "content": None,
                        "tool_calls": {
                            "id": 0,
                            "type": "function",
                            "function": item.get("function_call")
                            }
                        }
                else:
                    new_item = item
                messages.append(new_item)
        return object_to_dict({"tools": tools, "messages": messages})
        pass

    @classmethod
    def output_to_openai(cls, data):
        return cls.parse_function_call(object_to_dict(data))
        pass

    @classmethod
    def parse_function_call(cls, model_response):
        if "tool_calls" in model_response['choices'][0]['message']:
            tool_call = model_response['choices'][0]['message'].pop("tool_calls")
            args = tool_call[0]['function']['arguments']
            open_ai_choices = {
                "function_call": {
                    "name": tool_call[0]["function"]['name'],
                    "arguments": args
                }
            }
            model_response['choices'][0]['index'] = tool_call[0]['index']
            model_response['choices'][0]['logprobs'] = None
            model_response['choices'][0]['message']["content"] = None
            model_response['choices'][0]['message']["function_call"] = open_ai_choices
            model_response['choices'][0]['finish_reason'] = "function_call"
            return model_response
        else:
            return model_response
        pass
        pass
