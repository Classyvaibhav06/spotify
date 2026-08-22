import "dotenv/config";
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_D7XtcTeHgz5C@ep-proud-thunder-ax27amia.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require",
  },
});

