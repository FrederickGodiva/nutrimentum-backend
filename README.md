Run this code by:
1. Installing Dependencies

    ```bash
    npm install
    ```
   
2. Creating .env File and Fill in the Data

    ```bash
    cp .env.example .env
    ```

3. Create and Migrate Prisma Schema
    
    ```bash
    npm run db:migrate && npm run db:psuh
    ```

4. Start Server

    ```bash
    npm run start
    ```