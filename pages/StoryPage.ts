import { Page, expect } from '@playwright/test';

export class StoryPage {
  constructor(private page: Page) {}

  async createStory(filePath: string, text?: string, tags: string[] = []) {
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    await this.page.click('.story-item.user');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);

    if (text) {
      await this.page.click('button[title="Add text"]');
      await this.page.fill('.story-text-input', text);
      await this.page.click('.done-text-btn');
    }

    if (tags.length > 0) {
      await this.page.click('button[title="Tag friends"]');
      for (const username of tags) {
        await this.page.fill('.tag-input-wrapper input', username);
        await this.page.click(`.suggestion-item:has-text("${username}")`);
      }
      await this.page.click('.story-tag-panel .done-text-btn');
    }

    await this.page.click('.story-publish-btn');
    await expect(this.page.locator('.story-uploading')).not.toBeVisible();
  }

  async viewStory(username: string) {
    await this.page.click(`.story-item:has-text("${username}")`);
    await expect(this.page.locator('.story-modal-inner')).toBeVisible();
  }
}
