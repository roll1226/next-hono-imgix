# Help表示
.PHONY: help
help: ## ヘルプを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "} {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Docker環境をビルド
	docker compose up --build -d
up: ## Docker環境を起動
	docker compose up -d
down: ## Docker環境を停止
	docker compose down
restart: ## Docker環境を再起動
	@make down
	@make up

logs: ## Dockerコンテナのログを表示
	docker compose logs -f
logs-app: ## アプリのログを表示
	docker compose logs -f app
logs-db: ## データベースのログを表示
	docker compose logs -f db
logs-studio: ## Studioのログを表示
	docker compose logs -f studio

db-generate: ## データベースのマイグレーションを生成
	docker compose exec studio npm run db:generate
db-push: ## データベースのマイグレーションを適用
	docker compose exec studio npm run db:push
db-seed: ## データベースに初期データを投入
	docker compose exec studio npm run db:seed
