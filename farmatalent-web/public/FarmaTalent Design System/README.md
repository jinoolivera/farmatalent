# FarmaTalent · Design System

> "El ecosistema operativo del talento farmacéutico del Perú."

Marketplace de talento farmacéutico inspirado en **Uber + Airbnb**. No es bolsa de trabajo — es reputación operacional, matching inteligente, continuidad operativa y crecimiento profesional.

## Filosofía

- **Velocidad · Confianza · Calidad farmacéutica · Continuidad · Crecimiento.**
- La farmacia propone tarifa; el profesional acepta/negocia/rechaza. El sistema NO calcula salarios automáticos.
- Sin contacto (teléfono, dirección exacta) hasta el match. Chat operativo + llamada in-app post-match.
- Perfiles crecen progresivamente: badges, score, **boticas favoritas / profesionales recurrentes**. Cero CVs/PDFs.
- Las boticas también construyen reputación operativa (pago puntual, claridad operativa, ambiente, continuidad).

## Tokens (`colors_and_type.css`)

- **Primario verde:** `#15803D` / `#16A34A` / `#22C55E` — health, growth, freshness.
- **Acción negra (Airbnb-style):** `#0F172A` para CTAs principales.
- **Sage / coral / warning / info** secundarios.
- **Type:** Geist (sans) + Instrument Serif italic (énfasis editorial).

## Pantallas (`ui_kits/`)

| Path | Para qué |
|---|---|
| `marketing/index.html` | Landing pública Perú · actividad en vivo por ciudad |
| `busqueda/index.html` | Map-first · pins de match% (sin precios públicos) · etiquetas de continuidad |
| `dashboard/index.html` | Profesional · nivel + KPIs + feed de turnos · boticas favoritas |
| `dashboard-farmacia/index.html` | Botica · cobertura + postulantes compatibles + frecuentes |
| `perfil/index.html` | Profesional · scores + distinciones + experiencia |
| `perfil-farmacia/index.html` | **Botica · reputación operativa + nivel Top% + red estable** |
| `postulacion/index.html` | **Momento "Me interesa" · compatibilidad + tarifa propuesta** |
| `match/index.html` | Momento del match · contacto desbloqueado |
| `chat/index.html` | Coordinación logística post-match |
| `registro/index.html` | **Selector de rol (profesional vs. botica)** |
| `registro/profesional.html` | Onboarding profesional sin fricción |

## Conceptos visuales clave

### Continuidad / recurrencia
- "★ botica favorita · 48 turnos"
- "Profesional recurrente · 24 turnos con nosotros"
- "Red estable · 22 pros recurrentes"
- "Trabajaron juntos 48 veces"

### Crecimiento profesional (Uber-style)
```
Nuevo → Junior → Senior → Master → Top 1% (Elite)
      ↑ turnos · puntualidad · continuidad · reseñas
```
Master/Top desbloquean prioridad alta + acceso a turnos premium y boticas exclusivas.

### Reputación bilateral
- Profesionales: puntualidad, operación, atención, confiabilidad, ventas (5 scores).
- **Boticas**: pago puntual, claridad operativa, ambiente, continuidad, tarifa justa (5 scores también).

### Privacidad operacional
- DNI, teléfono, dirección exacta **se desbloquean SOLO al confirmar el match**.
- Antes: rol, score, zonas, distancia aproximada.

### Tarifa
- **La botica propone**, el pro acepta/negocia ligeramente/rechaza.
- Pill: `Tarifa propuesta · S/ XXX · pago a 24h del cierre`.
- Postulación permite "Negociar ligeramente" como middle ground.

## Iconografía

Lucide-style line icons (16/22px stroke 2). Emoji solo en chips de filtro/categoría editorial (🌙 nocturno, ⚡ urgente, 📍 zona).
