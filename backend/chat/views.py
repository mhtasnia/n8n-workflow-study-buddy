from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
import requests
import json
import os
# Load environment variables
from dotenv import load_dotenv


load_dotenv()
# Replace this with your actual n8n webhook URL
N8N_WEBHOOK_URL = os.getenv("WEB_HOOK_URL")

def send_to_n8n_webhook(session_id, chat_input):
    payload = {
        "sessionId": session_id,
        "action": "sendMessage",
        "chatInput": chat_input
    }

    try:
        response = requests.post(N8N_WEBHOOK_URL, json=payload)
        response.raise_for_status()
        return response.text  # Expecting plain text from n8n
    except requests.RequestException as e:
        return f"Error communicating with n8n: {str(e)}"

@csrf_exempt
def chatbot_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            session_id = data.get("sessionId", "")
            chat_input = data.get("chatInput", "")

            if not session_id or not chat_input:
                return HttpResponse("Missing sessionId or chatInput", status=400)

            reply = send_to_n8n_webhook(session_id, chat_input)
            return HttpResponse(reply)

        except json.JSONDecodeError:
            return HttpResponse("Invalid JSON", status=400)

    return HttpResponse("Only POST allowed", status=405)
