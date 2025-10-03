import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1920, 'height': 1080})
    page = context.new_page()

    # Go to the application
    page.goto("http://127.0.0.1:5001")

    # Navigate to the Roster Generator
    page.get_by_role("link", name="AI Roster Generator").click()
    expect(page.get_by_role("heading", name="Automated Roster Generator")).to_be_visible()

    # Create a dummy file to upload
    file_content = b"dummy content"
    page.set_input_files('input[type="file"]', files=[
        {'name': 'test_roster.xlsx', 'mimeType': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'buffer': file_content}
    ])

    # Verify the file name is displayed
    expect(page.get_by_text("test_roster.xlsx")).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)