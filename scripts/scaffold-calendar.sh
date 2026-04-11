#!/bin/bash

SERVICE="services/calendar-svc"

mkdir -p $SERVICE/src/{controllers,services,repositories,db/migrations,validators,routes,utils,types}

# Core files
touch $SERVICE/src/index.ts
touch $SERVICE/src/db/connection.ts
touch $SERVICE/src/routes/index.ts

touch $SERVICE/src/controllers/calendarController.ts
touch $SERVICE/src/services/calendarEngine.ts
touch $SERVICE/src/repositories/calendarRepository.ts

touch $SERVICE/src/validators/dateValidator.ts
touch $SERVICE/src/types/types.ts

# package.json
cat > $SERVICE/package.json <<EOF
{
  "name": "calendar-svc",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5.2.0",
    "ts-node": "^10.9.1",
    "@types/express": "^4.17.17",
    "@types/node": "^20.0.0"
  }
}
EOF

# tsconfig.json
cat > $SERVICE/tsconfig.json <<EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
EOF

echo "Calendar Service structure created successfully!"
