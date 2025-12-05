FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create directory for predictions database
RUN mkdir -p /app/data

# Expose port
EXPOSE 7004

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=ml_service.py

# Start the ML service
CMD ["python", "ml_service.py"]
