from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Go to the app
    page.goto("http://127.0.0.1:5000")

    # --- Verify Manager View ---
    # It starts in manager view, so navigate to gamification
    page.get_by_role("link", name="Gamification").click()
    # Wait for the leaderboard to be visible
    expect(page.get_by_text("Monthly Leaderboard")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/manager_gamification.png")

    # --- Verify Engineer View ---
    # Click the dropdown to switch views
    page.get_by_role("button", name="Manager View").click()
    # Click the link to switch to engineer
    page.get_by_role("link", name="Switch to Engineer").click()

    # Now in engineer view, navigate to gamification
    page.get_by_role("link", name="Gamification").click()
    # Wait for the clock-in button to be visible
    expect(page.get_by_role("button", name="Clock In")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/engineer_gamification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
