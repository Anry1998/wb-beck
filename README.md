npm run start:dev
npm run seeders seed-all

npm run test role.service.spec
npm run test:watch

docker compose -f docker-compose-dev.yml up --build -d
docker compose -f docker-compose-adminer.yml up --build -d
docker compose -f docker-compose-second-db.yml up --build -d

docker compose -f docker-compose-mongoose.yml up --build -d

docker compose up  -d
 
-----CLI-----
nest g mo users
nest g co users
nest g s users


 