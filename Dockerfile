# ---- Stage 1: build the React app ----
FROM node:22-alpine AS web
WORKDIR /web
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src
# Same-origin deployment: the API is served by the same container, so no API URL is baked in.
RUN npm run build

# ---- Stage 2: Python API + built frontend ----
FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PIP_NO_CACHE_DIR=1 \
    APP_ENV=production FRONTEND_DIST=/app/dist UPLOAD_DIR=/data/uploads
WORKDIR /app
COPY backend/requirements.txt backend/requirements-prod.txt ./
RUN pip install -r requirements-prod.txt
COPY backend/app ./app
COPY --from=web /web/dist ./dist
RUN useradd -m -u 10001 appuser && mkdir -p /data/uploads && chown -R appuser /data /app
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD python -c "import urllib.request,os;urllib.request.urlopen('http://127.0.0.1:'+os.getenv('PORT','8000')+'/api/health')"
# 2 workers is plenty for a start; raise WEB_CONCURRENCY when traffic grows.
CMD ["sh", "-c", "gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w ${WEB_CONCURRENCY:-2} -b 0.0.0.0:${PORT:-8000} --access-logfile - --timeout 60"]
