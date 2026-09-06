FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for build and document processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install UV package manager for fast, deterministic installs
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy dependency specifications
COPY pyproject.toml .

# Install dependencies using UV into system python
RUN uv pip install --system --no-cache -e .

# Copy backend source code
COPY . /app/backend

# Set environment variables
ENV PYTHONPATH="/app/backend"
ENV PYTHONUNBUFFERED=1
ENV HOST=0.0.0.0
ENV PORT=8000

EXPOSE 8000

# Run FastAPI backend using uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
