FROM python:3

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

ENV PYTHONPATH "${PYTHONPATH}:/app/src/"

EXPOSE 8080

ENV GOOGLE_APPLICATION_CREDENTIALS /googleauth/sdp14key

# CMD ["python3", "src/app.py"]

CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--worker-class", "gevent", "--workers", "1", "--threads", "8", "--timeout", "0", "src.app:app" ]

