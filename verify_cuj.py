import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(record_video_dir="/home/jules/verification/videos/")
        await context.grant_permissions(["clipboard-read", "clipboard-write"])
        page = await context.new_page()

        # Mock the query response to always return successful data so the table renders
        async def handle_route(route):
            await route.fulfill(
                status=200,
                content_type="application/json",
                body='{"question": "test", "sql": "SELECT 1", "rows": [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}], "columns": ["name", "age"], "confidence": "high", "query_id": "123"}'
            )
        await page.route("**/api/query", handle_route)

        await page.goto("http://localhost:4321")

        # Start with sample data if the button exists
        try:
            await page.get_by_role("button", name="Try it with sample data").click(timeout=5000)
            await page.wait_for_timeout(2000)
        except:
            pass

        # Wait for the main input
        await page.wait_for_selector('input[placeholder="Ask anything about your data…"]', timeout=5000)

        # Ask a query
        await page.get_by_placeholder("Ask anything about your data…").fill("Show me some data")

        # Click Ask
        try:
            await page.get_by_role("button", name="Ask").click(timeout=2000)
        except:
            await page.get_by_placeholder("Ask anything about your data…").press("Enter")

        # Wait for the mocked response to render the table and "Copy as CSV" button
        await page.wait_for_selector("text=Copy as CSV", timeout=10000)

        # Take a screenshot before clicking
        await page.screenshot(path="/home/jules/verification/screenshots/before_copy.png")

        # Click the "Copy as CSV" button
        await page.get_by_role("button", name="Copy as CSV").click()

        # The button text should change to "✓ Copied!"
        await page.wait_for_selector("text=✓ Copied!", timeout=5000)

        # Take a screenshot after clicking
        await page.screenshot(path="/home/jules/verification/screenshots/after_copy.png")

        await context.close()
        await browser.close()

asyncio.run(run())
