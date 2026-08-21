FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies (supports build from root or backend)
COPY requirements.txt* backend/requirements.txt* ./
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; \
    elif [ -f backend/requirements.txt ]; then pip install --no-cache-dir -r backend/requirements.txt; fi

# Copy application code
COPY backend/. . 2>/dev/null || COPY . .


# Expose port
EXPOSE 8000

# Start FastAPI with dynamic PORT
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]

