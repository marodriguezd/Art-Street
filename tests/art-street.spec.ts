import { test, expect, Page } from '@playwright/test';

async function resetApp(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    return new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('ArtStreetDB');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    });
  });
  await page.reload();
}

async function enterAsGuest(page: Page) {
  await resetApp(page);
  const guestBtn = page.getByRole('button', { name: /Explorar la Monografía como Invitado/i });
  await expect(guestBtn).toBeVisible({ timeout: 10000 });
  await guestBtn.click();
  await expect(guestBtn).not.toBeVisible({ timeout: 5000 });
    console.log("INNER_TEXT:", (await page.locator("body").innerText()).slice(0, 500).replace(/\n+/g, " "));
  await expect(page.locator('text=Estación 01')).toBeVisible({ timeout: 5000 });
}

test.describe('Art-Street - Initial Load & Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test('1. displays onboarding modal on first launch and allows exploring as guest', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    const guestBtn = page.getByRole('button', { name: /Explorar la Monografía como Invitado/i });
    await expect(guestBtn).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Alex Huneycutt').first()).toBeVisible();

    await guestBtn.click();

    await expect(guestBtn).not.toBeVisible({ timeout: 5000 });
    console.log("INNER_TEXT:", (await page.locator("body").innerText()).slice(0, 500).replace(/\n+/g, " "));
    await expect(page.locator('text=Estación 01')).toBeVisible();
    await expect(page.locator('text=Estación 09')).toBeVisible();

    expect(consoleErrors).toHaveLength(0);
  });

  test('2. allows full user profile onboarding registration with baseline artwork', async ({ page }) => {
    const nameInput = page.getByPlaceholder(/ej. Clara, Alex, Dibujante99/i);
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await nameInput.fill('Leonardo Da Vinci');

    const traditionalBtn = page.getByRole('button', { name: /Tradicional/i });
    await traditionalBtn.click();

    const nextBtn = page.getByRole('button', { name: /Continuar al Punto de Partida/i });
    await nextBtn.click();

    await expect(page.locator('text=Tu Punto de Partida')).toBeVisible();

    const drawBtn = page.getByRole('button', { name: /Trazar en Bloc Digital/i });
    await drawBtn.click();

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 50, box.y + 50);
      await page.mouse.down();
      await page.mouse.move(box.x + 100, box.y + 100);
      await page.mouse.move(box.x + 150, box.y + 80);
      await page.mouse.up();
    }

    const saveSketchBtn = page.getByRole('button', { name: /Guardar Dibujo/i });
    await saveSketchBtn.click();

    await expect(page.locator('text=Cambiar dibujo')).toBeVisible();

    const startJourneyBtn = page.getByRole('button', { name: /¡Comenzar el Viaje!/i });
    await startJourneyBtn.click();

    await expect(page.locator('text=Leonardo Da Vinci')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Art-Street - Core Features & Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await enterAsGuest(page);
  });

  test('3. verifies all 9 terms cards and search filtering', async ({ page }) => {
    for (let i = 1; i <= 9; i++) {
      const termTitle = page.locator(`text=Estación 0${i}`);
      await expect(termTitle).toBeVisible();
    }

    const searchInput = page.getByPlaceholder(/Buscar temas, conceptos o ejercicios/i);
    await searchInput.fill('Anatomía');

    await expect(page.locator('text=Estación 03')).toBeVisible();
    await searchInput.clear();
  });

  test('4. navigates into Term detail / UnitView and returns to roadmap', async ({ page }) => {
    const term1Card = page.locator('text=Fundamentos del Trazo, Perspectiva y Composición').first();
    await term1Card.click();

    await expect(page.locator('text=Contenido de la Estación')).toBeVisible();
    await expect(page.locator('text=Unidad 1.1')).toBeVisible();

    const unit12Tab = page.getByRole('button', { name: /1.2/i }).first();
    if (await unit12Tab.isVisible()) {
      await unit12Tab.click();
      await expect(page.locator('text=Unidad 1.2')).toBeVisible();
    }

    const backBtn = page.getByRole('button', { name: /Volver al Camino/i });
    await backBtn.click();

    await expect(page.locator('text=Estación 01')).toBeVisible();
  });

  test('5. toggles check items and opens sketchpad modal', async ({ page }) => {
    await page.locator('text=Fundamentos del Trazo, Perspectiva y Composición').first().click();

    const toggle = page.locator('button[title*="Marcar como"]').first();
    await expect(toggle).toBeVisible();

    const initialTitle = await toggle.getAttribute('title');
    await toggle.click();
    const flippedTitle = initialTitle?.includes('pendiente')
      ? 'Marcar como completado'
      : 'Marcar como pendiente';
    await expect(toggle).toHaveAttribute('title', flippedTitle);

    const sketchBtn = page.locator('button[title*="Lienzo"], button[title*="Dibujar"]').first();
    if (await sketchBtn.isVisible()) {
      await sketchBtn.click();

      await expect(page.locator('canvas')).toBeVisible();

      const brushBtn = page.getByRole('button', { name: /Pincel/i });
      if (await brushBtn.isVisible()) {
        await brushBtn.click();
      }

      const closeBtn = page.getByRole('button', { name: /Cancelar/i });
      await closeBtn.click();
    }
  });

  test('6. opens and controls Gesture Practice Timer', async ({ page }) => {
    const timerNavBtn = page.getByRole('button', { name: /GESTOS/i });
    await timerNavBtn.click();

    await expect(page.locator('text=Temporizador de Práctica Gestual')).toBeVisible();

    const preset30s = page.getByRole('button', { name: '30s' });
    await preset30s.click();
    await expect(page.locator('text=00:30')).toBeVisible();

    const startBtn = page.getByRole('button', { name: /Iniciar Sesión|Play/i });
    await startBtn.click();

    await page.waitForTimeout(1000);

    const pauseBtn = page.getByRole('button', { name: /Pausar/i });
    if (await pauseBtn.isVisible()) {
      await pauseBtn.click();
    }

    const closeBtn = page.locator('button:has(svg.lucide-x)').last();
    await closeBtn.click();
  });

  test('7. verifies Evolution Studio views and modes', async ({ page }) => {
    const evolutionNavBtn = page.getByRole('button', { name: /EVOLUCIÓN/i });
    await evolutionNavBtn.click();

    await expect(page.locator('text=Estudio de Evolución Artística')).toBeVisible();

    await expect(page.getByRole('button', { name: /Cortinilla/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Lado a Lado/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Línea de Tiempo/i })).toBeVisible();

    await page.getByRole('button', { name: /Lado a Lado/i }).click();
    await expect(page.locator('text=Punto de Partida').first()).toBeVisible();

    await page.getByRole('button', { name: /Línea de Tiempo/i }).click();
    await expect(page.locator('text=Cronología de Hitos').first()).toBeVisible();
  });

  test('8. verifies Settings and Backup modal functionality', async ({ page }) => {
    const backupBtn = page.locator('button[title*="Sincronización y Respaldo"]').first();
    await backupBtn.click();

    await expect(page.locator('text=Copia de Seguridad y Sincronización')).toBeVisible();

    const exportTabBtn = page.getByRole('button', { name: /Exportar/i });
    await exportTabBtn.click();

    await expect(page.locator('text=Descargar Archivo JSON').first()).toBeVisible();

    const closeBtn = page.locator('button:has(svg.lucide-x)').last();
    await closeBtn.click();
  });
});
