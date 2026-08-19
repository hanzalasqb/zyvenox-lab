# Comprehensive AWS Deployment Guide for Full-Stack Applications

## Architectural Overview

Deploying a modern full-stack application built with React, Vite, Express, tRPC, Drizzle ORM, and MySQL requires a robust cloud architecture. The application codebase combines a React single-page frontend bundled directly with an Express backend server that manages tRPC endpoints, database sessions, and S3 file operations. Because the server process serves both static assets and dynamic API requests, deploying this application on Amazon Web Services (AWS) involves configuring three core infrastructure layers: compute hosting, managed relational database services, and object storage.

The primary services utilized in a standard production deployment on AWS include Amazon Elastic Container Service (ECS) with AWS Fargate or AWS App Runner for compute, Amazon Relational Database Service (RDS) for MySQL database persistence, and Amazon Simple Storage Service (S3) for user-uploaded assets and media files. Choosing between containerized orchestration and fully managed application platforms depends on operational complexity requirements, scaling preferences, and budget constraints.

---

## Deployment Architecture Options

Evaluating the available AWS hosting patterns ensures that the chosen infrastructure matches the operational capacity and performance expectations of the project. The table below compares the three primary deployment strategies available for containerized Node.js applications on AWS.

| Deployment Strategy | Recommended Use Case | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **AWS App Runner** | Rapid deployment, minimal infrastructure management, continuous delivery from source repositories. | Fully managed scaling, automated TLS certificates, zero server administration, built-in CI/CD integration. | Less granular networking control, fixed platform pricing tiers, limited container customization. |
| **Amazon ECS with Fargate** | Production-grade container workloads requiring load balancing, custom VPC routing, and elastic scaling. | Serverless container execution without EC2 management, native Application Load Balancer support, strict VPC isolation. | Requires initial containerization via Dockerfile and configuration of task definitions and security groups. |
| **Amazon EC2 Instance** | Cost-sensitive or legacy environments requiring direct SSH access, custom Nginx configurations, or specific OS tuning. | Complete root access, fine-grained control over system resources and reverse proxy settings, lower baseline cost. | Manual security patching, manual SSL/TLS certificate renewal, manual backup and scaling management. |

---

## Step-by-Step Implementation Guide: Amazon ECS with Fargate

For production environments requiring high availability, scalability, and robust networking isolation, **Amazon ECS with AWS Fargate** represents the industry-standard architecture.

### 1. Preparing the Dockerfile

Although the default template builds through managed tooling, deploying to ECS requires a standard container image. Create a `Dockerfile` in the root directory of the project. The build process must compile the frontend assets via Vite and bundle the server application using esbuild into the `dist/` directory.

```dockerfile
# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

# Install package manager and dependencies
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build frontend and backend bundle
RUN pnpm build

# Stage 2: Production runtime image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built artifacts and dependencies from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

RUN corepack enable && pnpm install --prod --frozen-lockfile

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### 2. Provisioning Database and Storage Resources

Before launching the container service, establish the persistence layers within your AWS Virtual Private Cloud (VPC).

- **Amazon RDS for MySQL**: Create a managed MySQL database instance within a private subnet. Note the database endpoint, port, username, and password to construct the `DATABASE_URL` connection string: `mysql://username:password@endpoint:3306/dbname`. Run Drizzle migration scripts against this database to initialize schema tables.
- **Amazon S3 Bucket**: Create a dedicated S3 bucket for storing user uploads and static assets. Configure bucket policies and CORS rules to permit secure read and write operations via the AWS SDK.

### 3. Configuring Environment Variables

Production secrets and configuration parameters must be injected securely into the container runtime. Define the following environment variables within your ECS Task Definition:

- `NODE_ENV`: Set to `production`.
- `PORT`: Set to `3000`.
- `DATABASE_URL`: The full connection string pointing to your Amazon RDS MySQL instance.
- `JWT_SECRET`: A secure cryptographic secret used for session cookie signing.
- `AWS_REGION`: The AWS region where your S3 bucket is hosted.
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` (or preferably an IAM Task Role with S3 permissions).

### 4. Deploying to ECS Fargate

1. **Push Container Image**: Build the Docker image locally or via GitHub Actions, tag it, and push it to your **Amazon Elastic Container Registry (ECR)** repository.
2. **Create ECS Cluster**: In the ECS console, create a cluster using the **Networking only (Fargate)** template.
3. **Configure Task Definition**: Define a new task definition specifying the ECR image URI, allocated CPU (e.g., 0.25 vCPU) and memory (0.5 GB), port mappings (port 3000), and environment variables. Attach an IAM execution role granting permissions to pull from ECR and write CloudWatch logs.
4. **Create Service and Load Balancer**: Deploy the task as an ECS service connected to an **Application Load Balancer (ALB)** configured with an HTTPS listener certificate via AWS Certificate Manager (ACM). Ensure security groups allow inbound traffic on port 443 from the internet and forward traffic to port 3000 on the Fargate tasks.

---

## Alternative: AWS App Runner Deployment

For teams seeking a streamlined deployment pipeline without managing task definitions or load balancers, **AWS App Runner** provides a fully managed alternative.

1. Connect your GitHub repository containing the application source code to App Runner.
2. Configure the build settings specifying the runtime as Node.js 22, the build command as `pnpm install && pnpm build`, and the start command as `node dist/index.js`.
3. Provide environment variables through the App Runner console, including `DATABASE_URL`, `JWT_SECRET`, and S3 configuration variables.
4. App Runner automatically provisions an HTTPS endpoint, handles automatic scaling based on incoming request volume, and manages continuous deployments on every git push.

---

## References

- [AWS App Runner Documentation](https://docs.aws.amazon.com/apprunner/) [1]
- [Amazon ECS with Fargate Developer Guide](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html) [2]
- [Amazon RDS MySQL User Guide](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_MySQL.html) [3]

---
*(Document authored by **Manus AI**)*
