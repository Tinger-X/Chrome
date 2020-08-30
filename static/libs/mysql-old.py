from static.libs.base import *
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, backref

HOSTNAME = "localhost"
PORT = "3306"
DATABASE = "chrome"
USERNAME = "chrome"
PASSWORD = "Chrome"
DB_URI = "mysql+mysqldb://{0}:{1}@{2}:{3}/{4}?charset=utf8".format(USERNAME, PASSWORD, HOSTNAME, PORT, DATABASE)
engine = create_engine(DB_URI)
engine.connect()
Base = declarative_base(engine)
Session = sessionmaker(engine)()


class Users(Base):
    __tablename__ = "users"
    id = Column(String(16), primary_key=True, default=randStr(16))
    nick = Column(String(64), nullable=False)
    account = Column(String(64), nullable=False, unique=True)
    passwd = Column(String(64), nullable=False)
    header = Column(String(1024), default="https://images.tinger.host/avatar-{0}.jpg".format(random.randint(0, 9)))
    wallPaper = Column(String(1024), default="https://images.tinger.host/paper-{0}.png".format(random.randint(0, 9)))
    engine = Column(String(32), default="Google, Baidu, Bing, 360, Sogou")
    time = Column(DateTime, default=datetime.now)
    wallType = Column(Boolean, default=True)  # True for paper, False for color
    wallFilter = Column(Enum("0", "1", "2", "3"), server_default="1")
    wallColor = Column(String(128), default="rgba(255, 255, 255, 1.0)")
    wordColor = Column(String(128), default="rgba(0, 0, 0, 1.0)")

    __table_args__ = {
        "mysql_charset": "utf8"
    }

    def __repr__(self):
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
    uid = Column(ForeignKey("users.id"))
    site = Column(String(1024), nullable=False)
    name = Column(String(32), nullable=False)
    icon = Column(String(1024), default="/static/img/sites/icon{0}.png".format(random.randint(0, 9)))
    count = Column(Integer, default=0)

    user = relationship("Users", backref=backref("site", order_by=count.desc()))

    __table_args__ = {
        "mysql_charset": "utf8"
    }

    def __repr__(self):
        return str({
            "id": self.id,
            "user": self.uid,
            "site": self.site,
            "name": self.name,
            "icon": self.icon,
            "count": self.count
        })


def reconnect():
    global Base, Session
    Session.close()
    engine.dispose()
    engine.connect()
    Base = declarative_base(engine)
    Session = sessionmaker(engine)()


def databasesInit():
    Base.metadata.drop_all()
    Base.metadata.create_all()
    chrome = {
        "id": "TingerChromeSite",
        "nick": "Chrome",
        "account": "public-chrome",
        "passwd": "TingerChromeSite",
        "header": "/static/img/icon/user.png",
        "wallPaper": "https://images.tinger.host/paper-0.png".format(random.randint(0, 9))
    }
    tinger = {
        "id": "TingerMadeThisId",
        "nick": "Tinger",
        "account": "Tinger",
        "passwd": "Tinger-chrome",
        "header": "https://images.tinger.host/avatar-0.jpg",
        "wallType": False,
        "wallColor": "rgba(101, 37, 32, 0.9)",
        "wallFilter": "0",
        "wordColor": "rgba(255, 0, 0, 1)",
        "wallPaper": "https://img.zcool.cn/community/0387f7559bb8f32a801212fb7d965ce.jpg"
    }
    Chrome = Users(**chrome)
    Tinger = Users(**tinger)

    siteC = [
        {
            "id": randStr(16),
            "site": "https://account.aliyun.com/login/login.html",
            "icon": "https://account.aliyun.com/images/favicon.png",
            "name": "阿里云",
            "count": 2
        }, {
            "id": randStr(16),
            "site": "https://www.iconfont.cn/",
            "icon": "https://www.iconfont.cn/favicon.ico",
            "name": "IconFont",
            "count": 1
        }, {
            "id": randStr(16),
            "site": "https://www.processon.com/diagrams/",
            "icon": "https://www.processon.com/favicon.ico",
            "name": "ProcessOn",
            "count": 0
        }
    ]
    siteT = [
        {
            "id": randStr(16),
            "site": "http://hdu.fanya.chaoxing.com/portal",
            "icon": "http://hdu.fanya.chaoxing.com/favicon.ico",
            "name": "杭电泛雅",
            "count": 3
        }, {
            "id": randStr(16),
            "site": "https://account.aliyun.com/login/login.html",
            "icon": "https://account.aliyun.com/images/favicon.png",
            "name": "阿里云",
            "count": 4
        }, {
            "id": randStr(16),
            "site": "https://www.iconfont.cn/",
            "icon": "https://www.iconfont.cn/favicon.ico",
            "name": "IconFont",
            "count": 2
        }, {
            "id": randStr(16),
            "site": "https://www.processon.com/diagrams/",
            "icon": "https://www.processon.com/favicon.ico",
            "name": "ProcessOn",
            "count": 1
        }, {
            "id": randStr(16),
            "site": "https://www.processon.com/diagrams/",
            "icon": "https://www.processon.com/favicon.ico",
            "name": "ProcessOn",
            "count": 1
        }, {
            "id": randStr(16),
            "site": "https://study.163.com/",
            "icon": "https://study.163.com/favicon.ico",
            "name": "网易云课堂",
            "count": 4
        }, {
            "id": randStr(16),
            "site": "https://www.qiniu.com/",
            "icon": "https://www.qiniu.com/favicon.ico",
            "name": "七牛云",
            "count": 1
        }]
    SiteC = [Sites(**item) for item in siteC]
    SiteT = [Sites(**item) for item in siteT]
    Chrome.site = SiteC
    Tinger.site = SiteT

    Session.add_all([Chrome, Tinger])
    Session.commit()


def addData(aim, values):
    reconnect()
    if isinstance(values, list):
        Session.add_all([aim(**atom) for atom in values])
    else:
        Session.add(aim(**values))
    Session.commit()


def searchDate(aim, **condition):
    reconnect()
    ls = Session.query(aim).filter_by(**condition).all()
    return [eval(str(item)) for item in ls]


def modifyData(aim, _id_, **value):
    reconnect()
    Session.query(aim).filter(aim.id == _id_).update(value)
    Session.commit()


def deleteData(aim, _id_):
    reconnect()
    old = Session.query(aim).filter(aim.id == _id_).first()
    Session.delete(old)
    Session.commit()


if __name__ == "__main__":
    # databasesInit()
    # use = Session.query(Users).get("TingerMadeThisId")
    # print(use.site)
    # print(searchDate(Users))
    # modifyData(Users, "TingerMadeThisId", id="TingerMadeThisId", wallFilter=1)
    # deleteData(Sites, _id_="myUAww!c!n")
    pass
