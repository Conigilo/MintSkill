# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: example.spec.ts >> test/v2/signUp
- Location: tests\example.spec.ts:13:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /login/i
Received string:  "http://localhost:3000/signup"

Call log:
  - Expect "toHaveURL" with timeout 150000ms
    32 × unexpected value "http://localhost:3000/signup"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Back to Home" [ref=e3] [cursor=pointer]:
      - /url: /
      - img [ref=e4]
      - text: Back to Home
    - generic [ref=e6]:
      - img "Logo" [ref=e8]
      - generic [ref=e9]:
        - heading "CREATE ACCOUNT" [level=1] [ref=e10]
        - paragraph [ref=e11]: Join the verified developer community.
      - generic [ref=e13]:
        - generic [ref=e14]: ❌
        - paragraph [ref=e16]: อีเมลนี้ถูกใช้งานไปแล้ว
        - button "×" [ref=e17]
      - generic [ref=e18]:
        - generic [ref=e19]:
          - text: Full Name
          - textbox "John Doe" [ref=e20]: test
        - generic [ref=e21]:
          - text: Email Address
          - textbox "name@example.com" [ref=e22]: test1@gmail.com
        - generic [ref=e23]:
          - text: Password
          - textbox "••••••••" [ref=e24]: "11223344"
        - button "Create Account" [ref=e25]
      - generic [ref=e28]: Or
      - generic [ref=e30]:
        - button "GitHub" [ref=e31]:
          - img [ref=e32]
          - text: GitHub
        - button "Google" [ref=e34]:
          - img [ref=e35]
          - text: Google
      - generic [ref=e40]:
        - text: Already have an account?
        - link "Sign in" [ref=e41] [cursor=pointer]:
          - /url: /login
  - generic [ref=e46] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e47]:
      - img [ref=e48]
    - generic [ref=e51]:
      - button "Open issues overlay" [ref=e52]:
        - generic [ref=e53]:
          - generic [ref=e54]: "0"
          - generic [ref=e55]: "1"
        - generic [ref=e56]: Issue
      - button "Collapse issues badge" [ref=e57]:
        - img [ref=e58]
  - alert [ref=e60]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('Test/v1/signIn', async ({ page }) => {
  4  |   await page.goto("http://localhost:3000/login");
  5  | 
  6  |   // แก้ตรงนี้: เอา ' ' ออกจากรอบๆ /Sign In/i
  7  |   const signInButton = page.getByRole('button', { name: /Sign In/i });
  8  | 
  9  |   await expect(signInButton).toBeVisible();
  10 |   await signInButton.click();
  11 | });
  12 | 
  13 | test('test/v2/signUp', async ({ page }) => {
  14 |   await page.goto("http://localhost:3000/signup");
  15 | 
  16 |   await page.getByPlaceholder(/john/i).fill("test");
  17 |   await page.getByPlaceholder(/example/i).fill('test1@gmail.com');
  18 |   await page.getByPlaceholder(/•••••••/i).fill('11223344');
  19 | 
  20 |   const signUpButton = page.getByRole('button', { name: /Create Account/i });
  21 |   await expect(signUpButton).toBeVisible();
  22 |   await signUpButton.click();
  23 | 
> 24 |   await expect(page).toHaveURL(/login/i, { timeout: 150000 });
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  25 | });
```