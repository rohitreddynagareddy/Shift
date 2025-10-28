from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Go to the app
    page.goto("http://127.0.0.1:5000")

    # The default view is manager, so we just need to take a screenshot.
    # Add a wait to ensure the page has loaded.
    expect(page.get_by_text("Manager's Command Center")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/manager_home.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
