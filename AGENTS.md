# AGENTS.md — «Запись на звонок»

## Суть проекта

MVP сервиса бронирования звонков (аналог упрощённого Cal.com). Две роли без авторизации:

- **Владелец** — один предустановленный профиль в админке: CRUD типов событий (`id`, название, описание, длительность), просмотр предстоящих встреч.
- **Гость** — выбирает тип события, бронирует свободный слот в окне **14 дней**, смотрит «Мои записи». Идентифицируется `guestId` (UUID в `localStorage`).

Ключевые правила: рабочие часы **09:00–19:00**; на одно время — одна запись (конфликт по интервалу, не по типу события); занятость проверяется на сервере.

## Стек

| Часть | Технологии |
|-------|------------|
| Frontend | React 19, Vite 7, Mantine 9, TanStack Query, React Router — каталог `frontend/` |
| Backend | Node.js 22+, TypeScript, Fastify, SQLite (`node:sqlite`) — каталог `backend/` |

## Структура репозитория

```
frontend/src/api/     — HTTP-клиент и типы (ориентир для форматов ответов API)
backend/src/routes/   — REST-эндпоинты
backend/src/domain/   — слоты, конфликты, таймзона, валидация
backend/src/db/       — SQLite-схема и подключение
backend/src/repositories/ — доступ к event_types и bookings
plans/                — контракт и требования
```

## Запуск

```bash
make install
make dev-backend   # :3000
make dev-frontend  # :5173
```

Backend читает `backend/.env` (см. `backend/.env.example`): `PORT`, `DATABASE_PATH`, `TIMEZONE` (по умолчанию `Europe/Moscow`).

## Документация

| Файл | Содержание |
|------|------------|
| [README.md](README.md) | Быстрый старт, curl-примеры |
| [plans/project-description.md](plans/project-description.md) | Краткое описание проекта, роли, правила |
| [plans/functional-requirements.md](plans/functional-requirements.md) | Функциональные требования (2 итерации), флоу, валидация, критерии приёмки |
| [plans/user-scenarios.md](plans/user-scenarios.md) | Пользовательские сценарии гостя, владельца и граничные случаи |
| [plans/api.tsp](plans/api.tsp) | TypeSpec-контракт REST API |
| [backend/.env.example](backend/.env.example) | Переменные окружения backend |

При реализации ориентироваться на `api.tsp` и `functional-requirements.md`; форматы JSON-ответов — на `frontend/src/api/types.ts` (flat JSON, без обёрток `@body`-полей TypeSpec).
