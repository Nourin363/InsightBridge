from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
from .models import Issue

import requests


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ai_explain_issue(request, id):

    try:

        # Get issue
        issue = Issue.objects.get(id=id)

        # Gemini API URL (LATEST WORKING)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key={settings.GEMINI_API_KEY}"

        # Prompt
        prompt = f"""
You are a system diagnostic AI.

Issue Title:
{issue.title}

Issue Description:
{issue.description}

Explain:

1. Root Cause
2. Technical Explanation
3. Recommended Fix

Write professionally and clearly.
"""

        headers = {
            "Content-Type": "application/json"
        }

        data = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ]
        }

        # Call Gemini
        response = requests.post(url, headers=headers, json=data)

        result = response.json()

        # DEBUG MODE (shows real Gemini response)
        if "candidates" not in result:
            return Response({
                "error": "Gemini response format unexpected",
                "full_response": result
            })

        # Extract text safely
        explanation = result["candidates"][0]["content"]["parts"][0]["text"]

        return Response({
            "ai_explanation": explanation
        })

    except Exception as e:

        return Response({
            "error": str(e)
        })