# 🎨 Art Street — El Camino del Artista

> **Tu academia de arte autodidacta y registro de evolución técnica.**  
> Basada en el aclamado **Curriculum for the Solo Artist** de Reddit creado por **Alex Huneycutt (@RadioRunner)**, inspirado en la estructura universitaria de ARTSchool de Marc Brunet.

---

## 🌟 Visión del Proyecto

Aprender a dibujar y pintar de forma autodidacta suele frustrarse por la dispersión y la falta de dirección. **Art Street** organiza más de dos años de estudio estructurado en **9 Términos** y **27 Unidades** con ejercicios concretos, recursos curados (Drawabox, Proko, Loomis, Marco Bucci, ModernDayJames), temporizador de gestos, lienzo digital integrado y un **estudio de evolución con comparador interactivo (antes y después)**.

---

## ✨ Características Principales

1. **⭐ Registro de Línea Base (Nivel 0 / Punto de Partida):**
   - Al iniciar la app por primera vez, te pide registrar tu dibujo más reciente o esbozar uno en el lienzo digital con tus autocríticas iniciales.
2. **🗺️ 9 Términos Estructurados (27 Unidades):**
   - **T1:** Gesto, Proporciones, Perspectiva 1 y 2 puntos (Drawabox), Composición y Notan.
   - **T2:** Método Loomis, planos de Asaro, torso (bean shape), perspectiva de cilindros y esferas.
   - **T3:** Extremidades superiores, mecánica del brazo, manos y dedos, 7 tipos de pliegues (ropaje), perspectiva de 3 puntos.
   - **T4:** Piernas y pies, física de la luz (terminador, luces directas, rebotes), teoría del color y valores.
   - **T5:** Anatomía animal comparada (cuadrúpedos), lentes fotográficas (ojo de pez, angular, teleobjetivo), dispersión subsuperficial (SSS) y materiales.
   - **T6:** Diseño de personajes (lenguaje de formas, silueta), hojas de modelo (turnaround), puesta en escena narrativa e interiores habitados.
   - **T7:** Anatomía desde la imaginación (giros 360°, escorzo extremo), diseño de entornos (thumbnails, 3 planos de profundidad) y megaestructuras.
   - **T8:** Entornos atmosféricos (lluvia, niebla, hora dorada), entintado y modulación de línea, caricatura y estilización.
   - **T9:** Pintura digital (control de bordes duros/suaves/perdidos), estudios de grandes maestros y Proyecto Capstone Final.
3. **✅ Checklist de Ejercicios Verificables con Adjuntos de Dibujo:**
   - Cada check permite adjuntar fotos/escaneos de tus prácticas o dibujar directamente en el lienzo.
   - Galería de miniaturas y visor de zoom para cada ejercicio.
4. **⏱️ Temporizador de Gestos Integrado:**
   - Intervalos de 30s, 45s, 60s, 90s, 2m, 5m y 10m.
   - Campana de sonido sintetizada mediante Web Audio API al cambiar de pose.
   - Contador de poses y tiempo invertido con enlaces directos a Croquis Cafe y Line of Action.
5. **🖌️ Lienzo de Bocetos Digital (Touch & Desktop):**
   - Lápiz fino, pincel suave, goma de borrar, grosor ajustable, paleta de colores, deshacer e historial.
   - Guarda el boceto como prueba directa de cualquier ejercicio o como obra inicial.
6. **🏆 Graduación por Término y Celebración:**
   - Al terminar los ejercicios de cada término, se desbloquea el hito de graduación con su brief técnico.
   - Al entregar tu obra, se festeja con fanfarria y confeti (`canvas-confetti`).
7. **⚔️ Estudio de Evolución (Comparador Antes / Después):**
   - **Deslizador Divisor:** Barra interactiva arrastrable con ratón o pantalla táctil para ver el salto cualitativo entre tu dibujo de Nivel 0 y tus obras recientes.
   - **Vista Lado a Lado:** Comparativa directa en dos columnas.
   - **Galería Cronológica:** Línea de tiempo con notas de reflexión, estrellas y horas dedicadas.
8. **💾 Local-First & Privacidad Total (IndexedDB):**
   - Almacenamiento local de alta capacidad para imágenes en alta resolución.
   - Exportación e importación completa en formato JSON para respaldos seguros.

---

## 🚀 Arquitectura Multi-Plataforma

| Plataforma | Soporte | Configuración |
| :--- | :--- | :--- |
| **Web / GitHub Pages** | SPA estática | `vite.config.ts` (`base: './'`) |
| **Android** | Capacitor 7 | `capacitor.config.ts` (`androidScheme: 'https'`) |
| **Desktop (Win/Mac/Linux)** | Electron | `electron/main.cjs`, `electron-builder.json` |

---

## ⚙️ Despliegue y CI/CD (GitHub Actions)

Los flujos de trabajo están configurados con **`workflow_dispatch`** para compilarse y desplegarse únicamente cuando tú lo decidas:

1. **GitHub Pages (`.github/workflows/pages.yml`):**
   - Compila la web y la publica en GitHub Pages.
   - Desencadenar vía GitHub CLI:
     ```bash
     gh workflow run pages.yml
     ```
2. **Android APK (`.github/workflows/android.yml`):**
   - Compila la app en Capacitor y genera el APK de depuración listo para instalar.
   - Desencadenar vía GitHub CLI:
     ```bash
     gh workflow run android.yml
     ```
3. **Desktop Releases (`.github/workflows/desktop.yml`):**
   - Compila ejecutables de Windows (`.exe`), Linux (`.AppImage`, `.deb`) y macOS (`.dmg`).
   - Desencadenar vía GitHub CLI:
     ```bash
     gh workflow run desktop.yml
     ```

---

## 🛠️ Ejecución Local

```bash
# 1. Instalar dependencias
pnpm install

# 2. Iniciar servidor de desarrollo Vite
pnpm run dev

# 3. Compilar para producción
pnpm run build

# 4. Probar en Capacitor
pnpm run cap:sync
```

---

## 💜 Créditos y Reconocimientos

- **Alex Huneycutt (@RadioRunner):** Creador del *Curriculum for the Solo Artist*.
- **Brendan Meachen:** Creador de la versión web comunitaria en *soloartcurriculum.com*.
- **Educadores:** Stan Prokopenko (Proko), Uncomfortable (Drawabox), Andrew Loomis, Marco Bucci, Aaron Blaise, ModernDayJames.
