from django.shortcuts import render
from django.http import JsonResponse
import requests
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

# Contest Home Page
def contest_home(request):
    return render(request, "contest_home.html")

# Start Contest Page
def start_contest(request):
    return render(request, "start_contest.html")

# Contest Page
def contest_page(request, contest_id):
    context = {"contest_id": contest_id}
    return render(request, "contest_page.html", context)

# Submit Code (placeholder)
def submit_code(request):
    return render(request, "submit.html")

# Contest Result Page
def contest_result(request, contest_id):
    context = {"contest_id": contest_id}
    return render(request, "result.html", context)

# Run Code using Judge0
@csrf_exempt
def run_code(request):
    if request.method == "POST":
        code = request.POST.get("code")
        language_id = int(request.POST.get("language_id", 71))  # Python3 default

        payload = {
            "source_code": code,
            "language_id": language_id,
            "stdin": ""
        }

        headers = {
            "X-RapidAPI-Key": settings.JUDGE0_API_KEY,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            "Content-Type": "application/json"
        }

        response = requests.post(
            "https://judge0-ce.p.rapidapi.com/submissions?wait=true",
            json=payload,
            headers=headers
        )

        result = response.json()
        return JsonResponse({
            "stdout": result.get("stdout"),
            "stderr": result.get("stderr"),
            "compile_output": result.get("compile_output"),
            "status": result.get("status", {}).get("description"),
        })