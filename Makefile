SAIL = ./backend/vendor/bin/sail

.PHONY: up down

up: ## Docker起動
	cd backend && ../$(SAIL) up -d

down: ## Docker停止
	cd backend && ../$(SAIL) down
