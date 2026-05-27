import { test, expect } from '@playwright/test';

test.describe('ระบบเข้าสู่ระบบ (Login Flow)', () => {

  test('สามารถกด Get Started จากหน้าแรกแล้วเข้ามาล็อกอินได้สำเร็จ', async ({ page }) => {
    // 1. ไปหน้าแรกสุด
    await page.goto('http://localhost:3000');

    // 2. คลิกปุ่ม Get Started เพื่อไปหน้าล็อกอิน (หน้าเว็บจริงใช้ปุ่มนี้)
    const getStartedButton = page.getByRole('button', { name: /get started/i });
    await getStartedButton.click();

    // 3. ตรวจสอบว่ามาถึงหน้า login แล้ว
    await expect(page).toHaveURL(/.*login/);

    // 4. กรอกข้อมูล (ใช้ placeholder เป็นตัวระบุเพราะหน้าเว็บจริงไม่มี id/htmlFor เชื่อม label)
    await page.getByPlaceholder('name@example.com').fill('admin@gmail.com');
    await page.getByPlaceholder('••••••••').fill('admin123');

    // 5. คลิกปุ่ม Sign In (ปุ่มส่งฟอร์ม)
    const submitButton = page.getByRole('button', { name: /^sign in$/i });
    await submitButton.click();

    // 6. ตรวจสอบว่าเข้าระบบและเปลี่ยนหน้าไปยัง Dashboard สำเร็จ
    await page.waitForURL(/.*dashboard/);
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
