FROM python:3

WORKDIR /app

COPY requirements.txt .


RUN pip install -r requirements.txt

RUN pip install gunicorn

COPY . .

ENV PYTHONPATH "${PYTHONPATH}:/app/src/"

EXPOSE 5000

ENV GOOGLE_APPLICATION_CREDENTIALS /googleauth/sdp14key

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "1", "--threads", "8", "--timeout", "0", "src.app:app" ]