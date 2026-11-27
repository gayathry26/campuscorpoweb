# ==============================================================================
# CampusCorp Master REST API - Production Docker Container
# Multi-Stage Build with Compiler Toolchains (Python, C/C++, Java) for Assessment Engine
# ==============================================================================

FROM node:20-bookworm-slim AS base

# Install system dependencies & compilers required for assessment sandboxed execution
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    default-jdk-headless \
    python3 \
    python3-pip \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV PYTHON_PATH=python3
ENV COMPILER_GCC_PATH=gcc
ENV COMPILER_GXX_PATH=g++
ENV COMPILER_JAVAC_PATH=javac
ENV COMPILER_JAVA_PATH=java

# Copy dependency definitions
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application source code
COPY src/ ./src/
COPY public/ ./public/

# Create required runtime directories and set ownership
RUN mkdir -p uploads/policies uploads/resumes uploads/lms/materials uploads/lms/assignments && \
    chown -R node:node /app

# Switch to unprivileged user for security
USER node

# Healthcheck targeting unified health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

EXPOSE 5000

CMD ["node", "src/server.js"]
