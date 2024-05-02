# jhp-node

### Steps to configure the project.

#### 1. Clone the project and install the dependencies.
```shell
git clone https://github.com/saunak-shah/jhp-node.git
cd jhp-node
npm i
```

#### 2. Create .env file
```shell
cp .env.example .env
```

#### 3. Configure the variables in env.
```env
# Enter the db url
DATABASE_URL="postgresql://username:password@localhost:5432/jhp?schema=public"

# Enter the port to run the backend
PORT=3000

# Enter the smtp mail id and password
MAIL_ID=""
MAIL_PASSWORD=""

# Enter the encryption key that will be used to encrypt and decrypt the password (you can use the output of openssl rand -hex 32)
ENCRYPTION_SECRET_KEY=a82c5bf356dbe131a4d2a5d58257a84111766b4ec76a49585b895b1972c29917

# Enter the base url to run the backend
BASE_URL=http://localhost:3000
```

#### 4. Migrate the db.
```shell
npm run migrate
```

#### 5. Start the backend server
```shell
npm run prod
```