npm run typeorm schema:drop
npm run typeorm migration:run
npm run typeorm migration:generate -- -n dbupdate
npm run typeorm migration:run