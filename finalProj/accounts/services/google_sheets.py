import gspread
from google.oauth2.service_account import Credentials
from django.conf import settings

CLIENT = None
SPREADSHEET = None


def get_client():
    global CLIENT
    if CLIENT:
        return CLIENT

    scope = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ]

    creds = Credentials.from_service_account_file(
        settings.GOOGLE_CREDS_FILE,
        scopes=scope
    )

    CLIENT = gspread.authorize(creds)
    return CLIENT


def get_spreadsheet():
    global SPREADSHEET
    if SPREADSHEET:
        return SPREADSHEET

    client = get_client()
    SPREADSHEET = client.open(settings.GOOGLE_SHEET_NAME)
    return SPREADSHEET


def get_or_create_user_tab(user):
    spreadsheet = get_spreadsheet()
    tab_name = f"user_{user.id}"

    try:
        return spreadsheet.worksheet(tab_name)
    except gspread.exceptions.WorksheetNotFound:
        worksheet = spreadsheet.add_worksheet(
            title=tab_name,
            rows="1000",
            cols="100"
        )
        worksheet.append_row(["Task", "Day 1"])
        return worksheet