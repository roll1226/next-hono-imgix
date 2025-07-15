build:
	docker-compose up --build -d
up:
	docker-compose up -d
down:
	docker-compose down
restart:
	@make down
	@make up
logs:
	docker-compose logs -f
logs-app:
	docker-compose logs -f app
logs-db:
	docker-compose logs -f db
