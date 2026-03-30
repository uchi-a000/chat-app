SAIL = ./backend/vendor/bin/sail

.PHONY: up down fresh

up: ## Docker起動
	cd backend && ../$(SAIL) up -d

down: ## Docker停止
	cd backend && ../$(SAIL) down

fresh: ## migrate:fresh --seed
	cd backend && ../$(SAIL) artisan migrate:fresh --seed
