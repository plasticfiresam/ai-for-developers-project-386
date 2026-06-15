.PHONY: help install install-frontend install-backend \
        dev dev-frontend dev-backend \
        build build-frontend build-backend \
        preview-frontend

FRONTEND_DIR := frontend
BACKEND_DIR  := backend

help: ## Показать справку
	@grep -E '^[a-zA-Z0-9_-]+:.*##' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}'

install: install-frontend install-backend ## Установить зависимости

install-frontend: ## npm install в frontend/
	cd $(FRONTEND_DIR) && npm install

install-backend: ## npm install в backend/ (если каталог существует)
	@test -f $(BACKEND_DIR)/package.json || exit 0; \
	cd $(BACKEND_DIR) && npm install

dev: ## Подсказка: запустите make dev-backend и make dev-frontend в разных терминалах
	@echo "Terminal 1: make dev-backend"
	@echo "Terminal 2: make dev-frontend"

dev-frontend: ## Vite dev server (:5173)
	cd $(FRONTEND_DIR) && npm run dev

dev-backend: ## Backend dev server (:3000)
	@test -f $(BACKEND_DIR)/package.json || \
		(echo "backend/ ещё не реализован"; exit 1)
	cd $(BACKEND_DIR) && npm run dev

build: build-frontend build-backend ## Собрать все части

build-frontend: ## Production-сборка frontend → frontend/dist/
	cd $(FRONTEND_DIR) && npm run build

build-backend: ## Сборка backend (если каталог существует)
	@test -f $(BACKEND_DIR)/package.json || exit 0; \
	cd $(BACKEND_DIR) && npm run build

preview-frontend: build-frontend ## Просмотр production-сборки frontend
	cd $(FRONTEND_DIR) && npm run preview

.DEFAULT_GOAL := help
