import os
from datetime import timedelta

DEBUG = True
SECRET_KEY = os.urandom(24)
TEMPLATES_AUTO_RELOAD = True
SQLALCHEMY_TRACK_MODIFICATIONS = False
PERMANENT_SESSION_LIFETIME = timedelta(days=7)

HOSTNAME = "localhost"
PORT = "3306"
DATABASE = "chrome"
USERNAME = "chrome"
PASSWORD = "Chrome"
DB_URI = "mysql+mysqldb://{0}:{1}@{2}:{3}/{4}?charset=utf8".format(USERNAME, PASSWORD, HOSTNAME, PORT, DATABASE)

SQLALCHEMY_DATABASE_URI = DB_URI
