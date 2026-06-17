# «Запись на звонок»

MVP сервиса бронирования звонков: владелец настраивает типы встреч, гость выбирает свободный слот в ближайшие 14 дней.

[![Actions Status](https://github.com/plasticfiresam/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/plasticfiresam/ai-for-developers-project-386/actions)

## Стек

| Часть | Технологии |
|-------|------------|
| Frontend | React 19, Vite, Mantine, TanStack Query |
| Backend | Node.js 22+, TypeScript, Fastify, SQLite (`node:sqlite`) |

## Требования

- Node.js **22.5+** (встроенный модуль `node:sqlite`)
- npm

## Быстрый старт

```bash
make install
```

Запуск в двух терминалах:

```bash
make dev-backend   # http://localhost:3000
make dev-frontend  # http://localhost:5173
```

Переменные окружения:

- `frontend/.env` — `VITE_API_URL=http://localhost:3000` (см. `frontend/.env.example`)
- `backend/.env` — `PORT`, `DATABASE_PATH`, `TIMEZONE` (см. `backend/.env.example`)

## Структура репозитория

```
frontend/   — React-клиент (гость + админка)
backend/    — REST API (Fastify + SQLite)
plans/      — контракт API и требования
```

## Проверка API (curl)

Убедитесь, что backend запущен (`make dev-backend`):

```bash
curl -s http://localhost:3000/health

curl -s -X POST http://localhost:3000/event-types \
  -H 'Content-Type: application/json' \
  -d '{"id":"intro-30","name":"Знакомство","description":"Короткий созвон","durationMinutes":30}'

curl -s http://localhost:3000/event-types

curl -s 'http://localhost:3000/calendar?eventTypeId=intro-30'
```

Полный контракт: [plans/api.tsp](plans/api.tsp).

## Документация

- [AGENTS.md](AGENTS.md) — контекст для агентов
- [plans/functional-requirements.md](plans/functional-requirements.md) — функциональные требования
- [plans/user-scenarios.md](plans/user-scenarios.md) — пользовательские сценарии
