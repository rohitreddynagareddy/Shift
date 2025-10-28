
from playwright.sync_api import sync_playwright, expect

def verify_page_render():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://127.0.0.1:5000/")

        # Wait for 5 seconds to ensure the page has had time to load
        page.wait_for_timeout(5000)

        # Take a screenshot of the entire page
        page.screenshot(path="jules-scratch/verification/full_page.png")

        browser.close()

if __name__ == "__main__":
    verify_page_render()
