FROM python:latest
WORKDIR /srv/Chrome/
COPY . .
RUN pip install -i http://mirrors.aliyun.com/pypi/simple/ -r requirements.txt

CMD ["gunicorn", "app:app", "-c", "gunicorn.conf.py"]