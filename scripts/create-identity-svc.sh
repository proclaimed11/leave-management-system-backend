#!/bin/bash
SERVICE="services/identity-svc"

mkdir -p $SERVICE/src/{controllers,services,repositories,db/migrations,validators,routes,utils,types}

touch $SERVICE/src/index.ts
touch $SERVICE/src/db/connection.ts
touch $SERVICE/src/routes/index.ts

touch $SERVICE/src/controllers/authController.ts
touch $SERVICE/src/controllers/roleController.ts

touch $SERVICE/src/services/authEngine.ts
touch $SERVICE/src/services/roleEngine.ts

touch $SERVICE/src/repositories/userRepository.ts
touch $SERVICE/src/repositories/roleRepository.ts

touch $SERVICE/src/validators/authValidator.ts
touch $SERVICE/src/validators/roleValidator.ts

touch $SERVICE/src/utils/jwt.ts
touch $SERVICE/src/utils/password.ts
touch $SERVICE/src/utils/config.ts
touch $SERVICE/src/utils/http.ts

touch $SERVICE/src/types/types.ts

echo "Identity Service structure created ✅"
