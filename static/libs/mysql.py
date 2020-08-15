from static.libs.base import *
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

HOSTNAME = "localhost"
PORT = "3306"
DATABASE = "chrome"
USERNAME = "chrome"
PASSWORD = "Chrome"
DB_URI = "mysql+mysqldb://{0}:{1}@{2}:{3}/{4}?charset=utf8".format(USERNAME, PASSWORD, HOSTNAME, PORT, DATABASE)
engine = create_engine(DB_URI)
con = engine.connect()
Base = declarative_base(engine)
Session = sessionmaker(engine)()


class Users(Base):
    __tablename__ = "users"
    id = Column(String(16), primary_key=True, default=randStr(16))
    nick = Column(String(64))
    account = Column(String(64))
    passwd = Column(String(64))
    header = Column(String(1024), default="static/img/header/{0}.jpg".format(random.randint(0, 9)))
    wallPaper = Column(String(1024), default="static/img/wall/paper{0}.png".format(random.randint(0, 9)))
    engine = Column(String(32), default="Google, Baidu, Bing, 360, Sogou")
    time = Column(String(64), default=nowTime())
    wallType = Column(Boolean, default=True)  # True for paper, False for color
    wallFilter = Column(Integer, default=1)
    wallColor = Column(String(32), default="rgba(255, 255, 255, 1.0)")
    wordColor = Column(String(32), default="rgba(0, 0, 0, 1.0)")

    def __str__(self):
        return str({
            "id": self.id,
            "nick": self.nick,
            "account": self.account,
            "passwd": self.passwd,
            "header": self.header,
            "engine": self.engine,
            "wallType": self.wallType,
            "wallPaper": self.wallPaper,
            "wallFilter": self.wallFilter,
            "wallColor": self.wallColor,
            "wordColor": self.wordColor
        })


class Sites(Base):
    __tablename__ = "sites"
    id = Column(String(16), primary_key=True)
    user = Column(String(16))
    site = Column(String(1024))
    name = Column(String(32))
    icon = Column(String(1024), default="static/img/sites/icon{0}.png".format(random.randint(0, 9)))
    count = Column(Integer, default=0)

    def __str__(self):
        return str({
            "id": self.id,
            "user": self.user,
            "site": self.site,
            "name": self.name,
            "icon": self.icon,
            "count": self.count
        })


def databasesInit():
    Base.metadata.drop_all()
    Base.metadata.create_all()
    chrome = {
        "id": "TingerChromeSite",
        "nick": "Chrome",
        "account": "public-chrome",
        "passwd": "TingerChromeSite",
        "header": "/static/img/icon/user.png",
        "wallPaper": "/static/img/wall/paper{0}.png".format(random.randint(0, 9))
    }
    Tinger = {
        "id": "TingerMadeThisId",
        "nick": "Tinger",
        "account": "Tinger",
        "passwd": "Tinger-chrome",
        "header": "static/img/header/5.jpg",
        "wallType": False,
        "wallColor": "rgba(101, 37, 32, 0.9)",
        "wallFilter": 2,
        "wordColor": "rgba(255, 0, 0, 1)",
        "wallPaper": "static/img/wall/paper{0}.png".format(random.randint(0, 9))
    }
    addData(Users, [chrome, Tinger])

    site = [
        {
            "id": randStr(16),
            "user": "TingerChromeSite",
            "site": "https://account.aliyun.com/login/login.html",
            "icon": "/icon/https://account.aliyun.com/login/login.html",
            "name": "阿里云"
        }, {
            "id": randStr(16),
            "user": "TingerChromeSite",
            "site": "https://www.iconfont.cn/",
            "icon": "/icon/https://www.iconfont.cn/",
            "name": "IconFont"
        }, {
            "id": randStr(16),
            "user": "TingerChromeSite",
            "site": "https://www.processon.com/diagrams/",
            "icon": "/icon/https://www.processon.com/diagrams/",
            "name": "ProcessOn"
        }, {
            "id": randStr(16),
            "user": "TingerMadeThisId",
            "site": "http://hdu.fanya.chaoxing.com/portal",
            "icon": "/icon/http://hdu.fanya.chaoxing.com/portal",
            "name": "杭电泛雅"
        }, {
            "id": randStr(16),
            "user": "TingerMadeThisId",
            "site": "https://account.aliyun.com/login/login.html",
            "icon": "/icon/https://account.aliyun.com/login/login.html",
            "name": "阿里云"
        }, {
            "id": randStr(16),
            "user": "TingerMadeThisId",
            "site": "https://www.iconfont.cn/",
            "icon": "/icon/https://www.iconfont.cn/",
            "name": "IconFont"
        }, {
            "id": randStr(16),
            "user": "TingerMadeThisId",
            "site": "https://www.processon.com/diagrams/",
            "icon": "/icon/https://www.processon.com/diagrams/",
            "name": "ProcessOn"
        }
    ]
    addData(Sites, site)


def addData(aim, values):
    if isinstance(values, list):
        Session.add_all([aim(**atom) for atom in values])
    else:
        Session.add(aim(**values))
    Session.commit()


def searchDate(aim, **condition):
    ls = Session.query(aim).filter_by(**condition).all()
    return [eval(str(item)) for item in ls]


def modifyData(aim, _id_, **value):
    Session.query(aim).filter(aim.id == _id_).update(value)
    Session.commit()

# databasesInit()
# print(searchDate(Users))
# modifyData(Users, "TingerMadeThisId", id="TingerMadeThisId", wallFilter=1)
