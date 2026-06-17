import { expect, test } from '@playwright/test';
import {
  E2E_EVENT_TYPE,
  createEventType,
  findFirstAvailableSlot,
  formatTimeRange,
  type AvailableSlot,
} from '../helpers/api.js';

test.describe('Guest booking flow', () => {
  let slot: AvailableSlot;

  test.beforeEach(async ({ request }) => {
    await createEventType(request);
    slot = await findFirstAvailableSlot(request, E2E_EVENT_TYPE.id);
  });

  test('guest books an available slot from catalog to my bookings', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Выберите тип встречи' })).toBeVisible();
    await expect(page.getByText(E2E_EVENT_TYPE.name)).toBeVisible();

    await page.getByRole('link', { name: 'Выбрать время' }).click();
    await expect(page).toHaveURL(new RegExp(`/book/${E2E_EVENT_TYPE.id}$`));
    await expect(page.getByRole('heading', { name: E2E_EVENT_TYPE.name })).toBeVisible();

    await page.goto(`/book/${E2E_EVENT_TYPE.id}?date=${slot.date}`);
    await expect(page.getByRole('heading', { name: 'Выберите время' })).toBeVisible();

    const slotLabel = formatTimeRange(slot.startTime, slot.endTime);
    await page.getByRole('button', { name: new RegExp(slotLabel) }).click();
    await page.getByRole('button', { name: 'Записаться' }).click();

    await expect(page.getByRole('heading', { name: 'Запись подтверждена' })).toBeVisible();
    await expect(page.getByText(E2E_EVENT_TYPE.name)).toBeVisible();
    await expect(page.getByText(slotLabel)).toBeVisible();

    await page.getByRole('main').getByRole('link', { name: 'Мои записи' }).click();
    await expect(page).toHaveURL('/my-bookings');
    await expect(page.getByRole('heading', { name: 'Мои записи' })).toBeVisible();
    await expect(page.getByText(E2E_EVENT_TYPE.name)).toBeVisible();
    await expect(page.getByText(slotLabel)).toBeVisible();
  });
});
