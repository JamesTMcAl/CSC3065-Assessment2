FROM python:3.9-slim

WORKDIR /app

# Copy and install dependencies
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy the application code
COPY app.py .

# Expose the port the service will run on
EXPOSE 5000

# Use Gunicorn to serve the application
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
