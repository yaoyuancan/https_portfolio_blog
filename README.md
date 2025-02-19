# Developer Portfolio API Service

A secure HTTPS API service for managing developer portfolios and blog posts.

## Setup Instructions
1. Navigate to the Project Directory
     Open your terminal and move into the main project folder: 
     cd your-project-directory
2. Install Dependencies
     Ensure all required dependencies are installed by running: 
     npm install
3. Start the Server
     Run the server using one of the following commands:
       For development mode:
       npm run dev
       For production mode:
       node src/server.js
4. Access the Secure Endpoints
      Once the server is running, you can access your API via HTTPS:
        Blogs API: https://localhost:3000/api/blogs
        Portfolios API: https://localhost:3000/api/portfolios
Note: If you are using a self-signed SSL certificate, your browser may show a security warning. You can proceed by accepting the certificate in your browser settings.

## SSL Certificate Setup

### 1. Create SSL Directory

```bash
mkdir ssl
cd ssl
```

### 2. Generate SSL Certificate

For development purposes, you can create a self-signed certificate using OpenSSL:

```bash
# Generate private key
openssl genrsa -out private.key 2048

# Generate a Certificate Signing Request (CSR)
openssl req -new -key private.key -out certificate.csr

# Generate self-signed certificate (valid for 365 days)
openssl x509 -req -days 365 -in certificate.csr -signkey private.key -out certificate.pem
```

When generating the CSR, you'll be prompted to enter several pieces of information:

- Country Name (2 letter code)
- State or Province Name
- Locality Name (city)
- Organization Name
- Organizational Unit Name
- Common Name (your domain name)
- Email Address

For local development, you can use:

- Common Name: localhost
- Other fields: you can press Enter to use default values

### 3. Configure SSL in server.js

The SSL certificates are configured in `src/server.js`:

```javascript
const https = require('https')
const fs = require('fs')
const path = require('path')

// SSL certificate configuration
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, '../ssl/private.key')),
  cert: fs.readFileSync(path.join(__dirname, '../ssl/certificate.pem'))
}

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, app)
```

### 4. Trust Self-Signed Certificate (Development Only)

When using a self-signed certificate, your browser will show a security warning. For development purposes, you can:

#### Chrome/Edge:

1. Click "Advanced"
2. Click "Proceed to localhost (unsafe)"

#### Firefox:

1. Click "Advanced"
2. Click "Accept the Risk and Continue"

### 5. Production Deployment

For production deployment, you should:

1. Purchase an SSL certificate from a trusted Certificate Authority (CA)
2. Or use Let's Encrypt for free SSL certificates
3. Replace the self-signed certificate files with your production certificates
4. Update the SSL configuration if needed

### Note

- Keep your private key secure and never commit it to version control
- Add `ssl/*.key` and `ssl/*.pem` to your `.gitignore` file
- For production, use proper SSL certificates from trusted certificate authorities
- Self-signed certificates should only be used for development

## Security Best Practices

1. Keep SSL certificates up to date
2. Use strong keys (2048 bits or higher)
3. Configure secure SSL protocols and ciphers
4. Implement proper certificate renewal process
5. Use HTTP Strict Transport Security (HSTS)
6. Regular security audits

## Additional Resources

- [OpenSSL Documentation](https://www.openssl.org/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)

## Caching Strategies

### Route Caching Policies

The application implements a nuanced caching strategy to optimize performance while maintaining data integrity and security:

#### Blog Routes Caching

1. **GET /blogs (Public Access)**
   - **Purpose**: Retrieve all blog posts efficiently
   - **Caching Policy**:
     - Cache Duration: 5 minutes
     - Scope: Public, read-only content
     - Benefits:
       - Reduces database load
       - Improves response time for frequently accessed blog lists
     - Invalidation: Automatically refreshed after blog creation, update, or deletion

2. **GET /blogs/:id (Public Access)**
   - **Purpose**: Retrieve a specific blog post
   - **Caching Policy**:
     - Cache Duration: 10 minutes
     - Scope: Individual blog post details
     - Benefits:
       - Minimizes redundant database queries
       - Speeds up individual blog page loads
     - Invalidation: Immediately updated upon blog modification

3. **POST /blogs (User Role)**
   - **Purpose**: Create new blog posts
   - **Caching Policy**:
     - No client-side caching
     - Server-side cache invalidation for blog list and individual blog caches
     - Benefits:
       - Ensures immediate reflection of new content
       - Prevents stale data presentation

4. **PUT /blogs/:id (User Role)**
   - **Purpose**: Update existing blog posts
   - **Caching Policy**:
     - Immediate cache invalidation
     - Refresh affected blog post and blog list caches
     - Benefits:
       - Guarantees users see most recent content
       - Maintains data consistency

5. **DELETE /blogs/:id (Admin Role)**
   - **Purpose**: Remove blog posts
   - **Caching Policy**:
     - Immediate cache invalidation
     - Remove cached entries for deleted blog
     - Benefits:
       - Prevents access to deleted content
       - Maintains system integrity

#### Portfolio Routes Caching

1. **GET /portfolios (Public Access)**
   - **Purpose**: Retrieve all portfolios
   - **Caching Policy**:
     - Cache Duration: 10 minutes
     - Scope: Public portfolio list
     - Benefits:
       - Reduces backend load
       - Improves initial page load performance
     - Invalidation: Refreshed after portfolio creation, update, or deletion

2. **GET /portfolios/:id (Public Access)**
   - **Purpose**: Retrieve a specific portfolio
   - **Caching Policy**:
     - Cache Duration: 15 minutes
     - Scope: Individual portfolio details
     - Benefits:
       - Minimizes database queries
       - Enhances user experience with faster loads
     - Invalidation: Immediately updated on portfolio modification

3. **POST /portfolios (User Role)**
   - **Purpose**: Create new portfolios
   - **Caching Policy**:
     - No client-side caching
     - Server-side cache invalidation
     - Benefits:
       - Immediate content reflection
       - Prevents stale data display

4. **PUT /portfolios/:id (Owner Role)**
   - **Purpose**: Update existing portfolios
   - **Caching Policy**:
     - Immediate cache invalidation
     - Refresh affected portfolio and portfolio list caches
     - Benefits:
       - Ensures real-time content updates
       - Maintains data accuracy

5. **DELETE /portfolios/:id (Admin Role)**
   - **Purpose**: Remove portfolios
   - **Caching Policy**:
     - Immediate cache invalidation
     - Remove all cached entries for deleted portfolio
     - Benefits:
       - Prevents access to removed content
       - Maintains system security and integrity

### Caching Implementation Considerations

- Implemented using Redis for distributed caching
- Cache keys designed to be granular and specific
- Automatic cache expiration and manual invalidation mechanisms
- Security-first approach: No caching of sensitive or user-specific data

### Performance and Security Benefits

- Reduced database load
- Faster response times
- Protection against potential cache-related vulnerabilities
- Consistent and up-to-date content presentation

## API Documentation

#### Blog API Examples

The following is an example of testing the blog API using the curl command. Note:
- You need to replace `localhost:3000` with your actual server address
- Use the `-k` parameter to ignore the verification of the self-signed certificate
- Control access permissions via the `x-user-role` header

##### 1. Get all blogs
```bash
# General user access
curl -k -X GET \
  -H "x-user-role: user" \
  https://localhost:3000/api/blogs

# Administrator access (to see more information)
curl -k -X GET \
  -H "x-user-role: admin" \
  https://localhost:3000/api/blogs
```

##### 2. Get a single blog
```bash
curl -k -X GET \
  -H "x-user-role: user" \
  https://localhost:3000/api/blogs/1
```

##### 3. Create a new blog (requires administrator privileges)
```bash
curl -k -X POST \
  -H "Content-Type: application/json" \
  -H "x-user-role: admin" \
  -d '{
    "title": "New Blog Post",
    "content": "This is the content of my new blog post.",
    "author": "John Smith",
    "category": "Technology"
  }' \
  https://localhost:3000/api/blogs
```

##### 4. Update blog (requires administrator privileges)
```bash
curl -k -X PUT \
  -H "Content-Type: application/json" \
  -H "x-user-role: admin" \
  -d '{
    "title": "Updated Blog Title",
    "content": "This is the updated content."
  }' \
  https://localhost:3000/api/blogs/1
```

##### 5. Delete blog (requires administrator privileges)
```bash
curl -k -X DELETE \
  -H "x-user-role: admin" \
  https://localhost:3000/api/blogs/1
```

#### Example Response

##### Successfully get the blog list
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Microservices Architecture Design Patterns",
      "content": "This article explains in detail...",
      "author": "John Smith",
      "category": "Architecture",
      "publishDate": "2025-01-15T08:00:00Z",
      "status": "published"
    }
  ]
}
```

#### Portfolio API Examples

##### 1. Get all portfolios
```bash
# General user access
curl -k -X GET \
  -H "x-user-role: user" \
  https://localhost:3000/api/portfolios

# Administrator access (to see more information)
curl -k -X GET \
  -H "x-user-role: admin" \
  https://localhost:3000/api/portfolios
```

##### 2. Get a single portfolio
```bash
curl -k -X GET \
  -H "x-user-role: user" \
  https://localhost:3000/api/portfolios/1
```

##### 3. Create a new portfolio (requires administrator privileges)
```bash
curl -k -X POST \
  -H "Content-Type: application/json" \
  -H "x-user-role: admin" \
  -d '{
    "name": "John Smith",
    "bio": "Full-stack developer with 5+ years of experience",
    "skills": ["JavaScript", "React", "Node.js", "AWS"],
    "projects": [{
      "title": "E-commerce Platform",
      "description": "Built a scalable e-commerce platform",
      "technologies": ["React", "Node.js", "MongoDB"],
      "githubUrl": "https://github.com/johnsmith/ecommerce",
      "demoUrl": "https://demo.ecommerce.com"
    }],
    "contact": {
      "email": "john.smith@example.com",
      "phone": "+1 (555) 123-4567",
      "location": "San Francisco, CA"
    },
    "socialLinks": {
      "github": "https://github.com/johnsmith",
      "linkedin": "https://linkedin.com/in/johnsmith"
    }
  }' \
  https://localhost:3000/api/portfolios
```

##### 4. Update Portfolio (Administrator privileges required)
```bash
curl -k -X PUT \
  -H "Content-Type: application/json" \
  -H "x-user-role: admin" \
  -d '{
    "bio": "Senior full-stack developer specializing in cloud architecture",
    "skills": ["JavaScript", "React", "Node.js", "AWS", "Kubernetes"],
    "contact": {
      "email": "john.smith.dev@example.com"
    }
  }' \
  https://localhost:3000/api/portfolios/1
```

##### 5. Delete a portfolio (requires administrator privileges)
```bash
curl -k -X DELETE \
  -H "x-user-role: admin" \
  https://localhost:3000/api/portfolios/1
```

#### Example Response

##### Successfully get the portfolio
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Smith",
      "bio": "Full-stack developer passionate about frontend technologies and cloud-native application development.",
      "skills": ["JavaScript", "React", "Node.js", "AWS"],
      "projects": [
        {
          "title": "Enterprise Microservices Platform",
          "description": "A Kubernetes-based microservices management platform",
          "technologies": ["React", "Node.js", "Kubernetes"],
          "githubUrl": "https://github.com/johnsmith/microservice-platform",
          "demoUrl": "https://demo.microservice-platform.com"
        }
      ],
      "contact": {
        "email": "john.smith@example.com",
        "phone": "+1 (555) 123-4567",
        "location": "San Francisco, CA"
      },
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-02-18T18:00:00Z"
    }
  ]
}
```

##### Error response
```json
{
  "success": false,
  "error": "Insufficient permissions. Admin role required."
}
```
## Lessons Learned
While setting up a secure HTTPS server for the Developer Portfolio and Project Showcase, I encountered a few challenges and learned valuable lessons:

1. SSL Certificate Configuration: Setting up HTTPS using OpenSSL required properly configuring the certificate and handling browser security warnings for self-signed certificates. Solution: Carefully followed OpenSSL commands and added the certificate to trusted authorities for local development.
2. Caching Strategy: Balancing performance and security was a challenge. Static assets needed caching for speed, but sensitive data required no-store policies. Solution: Used appropriate cache control headers based on the type of content.

Overall, this process reinforced the importance of securing web applications from the start while ensuring smooth functionality.

