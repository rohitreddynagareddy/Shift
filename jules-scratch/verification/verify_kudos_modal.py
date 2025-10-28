
from playwright.sync_api import sync_playwright, expect

def verify_kudos_modal():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://127.0.0.1:5000/")

        # Wait for the Team Wellness component to be visible
        expect(page.locator("h3:has-text('Team Wellness & Engagement')")).to_be_visible()

        # Click the "Give Kudos" button in the Team Wellness section.
        page.get_by_role("button", name="Give Kudos").click()

        # Verify the modal is visible by checking for its title
        modal_title = page.locator("h2:has-text('Give Kudos')")
        expect(modal_title).to_be_visible()

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/kudos_modal.png")

        browser.close()

if __name__ == "__main__":
    verify_kudos_modal()
