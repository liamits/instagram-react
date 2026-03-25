import { test, expect } from '@playwright/test';
import { LoginPage } from '../../../pages/LoginPage';
import { SidebarPage } from '../../../pages/SidebarPage';
import { PostPage } from '../../../pages/PostPage';
import { StoryPage } from '../../../pages/StoryPage';
import * as path from 'path';

test.describe('Tag Friends Feature', () => {
  let loginPage: LoginPage;
  let sidebar: SidebarPage;
  let postPage: PostPage;
  let storyPage: StoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    sidebar = new SidebarPage(page);
    postPage = new PostPage(page);
    storyPage = new StoryPage(page);

    await page.goto('/');
    await loginPage.login('cuong', '123456');
    await expect(page).toHaveURL('/');
  });

  test('should tag a friend in a new post', async ({ page }) => {
    // Arrange
    const caption = 'Check out this post with my friend!';
    const friendToTag = 'testuser'; // Assume this user exists
    const imagePath = path.resolve(__dirname, '../../../test-assets/test-image.jpg');

    // Act
    await page.click('text=Create'); // Open Create Post Modal
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('.upload-placeholder');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(imagePath);

    await page.fill('textarea[placeholder="Write a caption..."]', caption);
    
    // Select friend to tag
    await page.fill('.tag-input-wrapper input', friendToTag);
    await page.click(`.suggestion-item:has-text("${friendToTag}")`);
    
    await page.click('.share-btn');

    // Assert
    await expect(page.locator('.post-caption').first()).toContainText(`@${friendToTag}`);
    await expect(page.locator(`.tag-link:has-text("@${friendToTag}")`).first()).toBeVisible();
  });

  test('should tag a friend in a comment', async ({ page }) => {
    // Arrange
    const commentText = 'Cool post ';
    const friendToTag = 'testuser';

    // Act
    await page.locator('[data-test-id="post-comment-input"]').first().fill(commentText);
    await page.click('.comment-tag-btn');
    await page.fill('.tag-input-wrapper input', friendToTag);
    await page.click(`.suggestion-item:has-text("${friendToTag}")`);
    await page.click('.done-tag-btn');
    await page.click('[data-test-id="post-comment-submit-btn"]');

    // Assert
    await expect(page.locator('.comment-item').first()).toContainText(`@${friendToTag}`);
    await expect(page.locator(`.comment-tags .tag-link:has-text("@${friendToTag}")`).first()).toBeVisible();
  });
});
