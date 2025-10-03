import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1920, 'height': 1080})
    page = context.new_page()

    # Go to the application
    page.goto("http://127.0.0.1:5001")

    # Wait for the initial data to load by waiting for the "Loading..." text to disappear.
    expect(page.get_by_text("Loading...")).to_be_hidden(timeout=10000)

    # Check Manager Dashboard by taking a screenshot for visual verification
    page.screenshot(path="jules-scratch/verification/dashboard_verification.png")

    # Navigate to the Schedule Manager
    page.get_by_role("link", name="Schedule Manager").click()
    expect(page.get_by_role("heading", name=re.compile(r"\w+ \d{4}"))).to_be_visible() # e.g., "October 2025"

    # Check for an employee name in the schedule
    expect(page.get_by_text("Alice")).to_be_visible()

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)