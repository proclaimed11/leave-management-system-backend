#!/bin/bash
SERVICE="services/entitlement-svc"

mkdir -p $SERVICE/src/{controllers,services,repositories,db/migrations,validators,routes,utils,types}

touch $SERVICE/src/index.ts
touch $SERVICE/src/db/connection.ts
touch $SERVICE/src/routes/index.ts
touch $SERVICE/src/controllers/entitlementController.ts
touch $SERVICE/src/services/entitlementEngine.ts
touch $SERVICE/src/repositories/entitlementRepository.ts
touch $SERVICE/src/validators/entitlementValidator.ts
touch $SERVICE/src/utils/http.ts
touch $SERVICE/src/utils/config.ts
touch $SERVICE/src/types/types.ts

echo "Entitlement Service structure created ✅"
