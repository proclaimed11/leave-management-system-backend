#!/bin/bash
SERVICE="services/directory-svc"

mkdir -p $SERVICE/src/{controllers,services,repositories,db/migrations,validators,routes,utils,types}

touch $SERVICE/src/index.ts
touch $SERVICE/src/db/connection.ts
touch $SERVICE/src/routes/index.ts
touch $SERVICE/src/controllers/employeeController.ts
touch $SERVICE/src/controllers/managerController.ts
touch $SERVICE/src/controllers/internalController.ts
touch $SERVICE/src/services/employeeEngine.ts
touch $SERVICE/src/services/managerEngine.ts
touch $SERVICE/src/repositories/employeeRepository.ts
touch $SERVICE/src/repositories/managerRepository.ts
touch $SERVICE/src/validators/employeeValidator.ts
touch $SERVICE/src/utils/http.ts
touch $SERVICE/src/utils/config.ts
touch $SERVICE/src/types/types.ts

echo "Directory Service structure created ✅"
