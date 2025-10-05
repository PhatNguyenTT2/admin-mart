# Backend Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
PORT=3001

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ministore
TEST_MONGODB_URI=mongodb://localhost:27017/ministore-test

# JWT Secret Key (IMPORTANT: Change this to a secure random string in production)
JWT_SECRET=your-secret-jwt-key-change-this-in-production-min-32-chars

# Node Environment
NODE_ENV=development
```

## Variable Descriptions

### `PORT`
- **Type**: Number
- **Default**: 3001
- **Description**: Port number where the Express server will run

### `MONGODB_URI`
- **Type**: String (MongoDB connection string)
- **Required**: Yes
- **Description**: MongoDB connection URI for development/production
- **Example**: `mongodb://localhost:27017/ministore`
- **For MongoDB Atlas**: `mongodb+srv://username:password@cluster.mongodb.net/ministore`

### `TEST_MONGODB_URI`
- **Type**: String (MongoDB connection string)
- **Required**: For testing only
- **Description**: Separate MongoDB database for running tests
- **Example**: `mongodb://localhost:27017/ministore-test`

### `JWT_SECRET`
- **Type**: String
- **Required**: Yes
- **Description**: Secret key for signing JWT tokens
- **Important**: 
  - Must be at least 32 characters long
  - Change this in production!
  - Keep it secret and never commit to Git
- **Generate a secure key**:
  ```bash
  # Using Node.js
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  
  # Using OpenSSL
  openssl rand -hex 32
  ```

### `NODE_ENV`
- **Type**: String
- **Options**: `development`, `production`, `test`
- **Default**: `development`
- **Description**: Current environment mode

## Setup Steps

1. **Create .env file**:
   ```bash
   cd backend
   touch .env
   ```

2. **Copy template above** and paste into `.env`

3. **Update values**:
   - Change `JWT_SECRET` to a secure random string
   - Update `MONGODB_URI` if using MongoDB Atlas or different port
   - Adjust `PORT` if 3001 is already in use

4. **Verify setup**:
   ```bash
   npm start
   ```
   
   You should see:
   ```
   connecting to mongodb://localhost:27017/ministore
   connected to MongoDB
   Server running on port 3001
   ```

## Security Notes

⚠️ **IMPORTANT SECURITY WARNINGS**:

1. **Never commit `.env` file to Git**
   - Already included in `.gitignore`
   - Contains sensitive credentials

2. **Use strong JWT_SECRET in production**
   - Minimum 32 characters
   - Use cryptographically secure random strings
   - Rotate periodically

3. **MongoDB Atlas Security**
   - Use strong passwords
   - Whitelist only necessary IP addresses
   - Enable MongoDB authentication

4. **Environment-specific secrets**
   - Use different secrets for dev/staging/production
   - Never share production secrets

## Troubleshooting

### Error: "JWT_SECRET is not defined"
**Solution**: Add `JWT_SECRET` to your `.env` file

### Error: "Cannot connect to MongoDB"
**Solutions**:
- Check if MongoDB is running: `mongod`
- Verify connection string in `MONGODB_URI`
- Check firewall settings
- For Atlas: Verify IP whitelist and credentials

### Error: "Port 3001 already in use"
**Solution**: Change `PORT` in `.env` to another port (e.g., 3002, 8000)

## Production Deployment

For production deployments (Heroku, Railway, Render, etc.):

1. Set environment variables in platform dashboard
2. Use MongoDB Atlas or managed database
3. Generate new secure `JWT_SECRET`
4. Set `NODE_ENV=production`

### Example (Heroku)
```bash
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set JWT_SECRET="your-secure-secret-here"
heroku config:set NODE_ENV=production
```
