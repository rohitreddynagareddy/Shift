
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://127.0.0.1:5001/")
    page.get_by_role("button", name="Manager View").click()
    page.get_by_role("link", name="Switch to Engineer").click()
    page.get_by_role("link", name="Gamification").click()
    page.screenshot(path="jules-scratch/verification/engineer_gamification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
