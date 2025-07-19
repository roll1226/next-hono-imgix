build:
	docker compose up --build -d
up:
	docker compose up -d
down:
	docker compose down
restart:
	@make down
	@make up
logs:
	docker compose logs -f
logs-app:
	docker compose logs -f app
logs-db:
	docker compose logs -f db
logs-studio:
	docker compose logs -f studio

db-generate:
	docker compose exec studio npm run db:generate
db-push:
	docker compose exec studio npm run db:push
db-seed:
	docker compose exec studio npm run db:seed
