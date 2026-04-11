#!/bin/bash

SERVICE="services/leave-policy-svc"

mkdir -p $SERVICE/src/{controllers,services,repositories,db/migrations,validators,routes,utils,types}

# Core files
touch $SERVICE/src/index.ts
touch $SERVICE/src/db/connection.ts
touch $SERVICE/src/routes/index.ts
touch $SERVICE/src/controllers/leavePolicyController.ts
touch $SERVICE/src/services/leavePolicyEngine.ts
touch $SERVICE/src/repositories/leavePolicyRepository.ts
touch $SERVICE/src/validators/leavePolicyValidator.ts
touch $SERVICE/src/utils/http.ts
touch $SERVICE/src/utils/config.ts
touch $SERVICE/src/types/types.ts

# Root files
touch $SERVICE/package.json
touch $SERVICE/tsconfig.json

echo "Leave Policy Service structure created ✅"
