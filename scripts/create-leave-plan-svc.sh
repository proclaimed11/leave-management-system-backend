#!/bin/bash

SERVICE="services/leave-plan-svc"

mkdir -p $SERVICE/src/{controllers,services,repositories,db/migrations,validators,routes,utils,types}

# Core files
touch $SERVICE/src/index.ts
touch $SERVICE/src/db/connection.ts
touch $SERVICE/src/routes/index.ts
touch $SERVICE/src/controllers/leavePlanController.ts
touch $SERVICE/src/services/leavePlanEngine.ts
touch $SERVICE/src/repositories/leavePlanRepository.ts
touch $SERVICE/src/validators/dateValidator.ts
touch $SERVICE/src/types/types.ts
touch $SERVICE/package.json
touch $SERVICE/tsconfig.json

echo "Leave Plan Service structure created successfully"
