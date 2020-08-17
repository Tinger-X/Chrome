FROM python:latest
WORKDIR /srv/Chrome/

COPY requirements.txt .

RUN /usr/local/bin/python -m pip install -i https://mirrors.aliyun.com/pypi/simple/ --upgrade pip && pip install -i https://mirrors.aliyun.com/pypi/simple/ -r requirements.txt && pwd && ls

COPY . .

CMD ["gunicorn", "app:app", "-c", "gunicorn.conf.py"]