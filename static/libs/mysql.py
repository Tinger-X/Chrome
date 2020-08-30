from static.libs.exts import db
from static.libs.base import *
from werkzeug.security import generate_password_hash, check_password_hash


class Users(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String(16), primary_key=True, default=randStr)
    nick = db.Column(db.String(32), nullable=False)
    account = db.Column(db.String(32), nullable=False, unique=True)
    _passwd = db.Column("passwd", db.String(100), nullable=False)
    header = db.Column(db.String(1024),
                       default="https://images.tinger.host/chrome-avatar-{0}.jpg".format(random.randint(0, 9)))
    wallPaper = db.Column(db.String(1024),
                          default="https://images.tinger.host/chrome-paper-{0}.png".format(random.randint(0, 9)))
    engine = db.Column(db.String(32), default="Google, Baidu, Bing, 360, Sogou")
    wallType = db.Column(db.Boolean, default=True)  # True for paper, False for color
    wallFilter = db.Column(db.Enum("0", "1", "2", "3"), default="1")
    wallColor = db.Column(db.String(128), default="rgba(255, 255, 255, 1.0)")
    wordColor = db.Column(db.String(128), default="rgba(0, 0, 0, 1.0)")

    __table_args__ = {
        "mysql_charset": "utf8"
    }

    @property
    def passwd(self):
        return self._passwd

    @passwd.setter
    def passwd(self, raw):
        self._passwd = generate_password_hash(raw)

    def check_passwd(self, raw):
        return check_password_hash(self.passwd, raw)

    def __repr__(self):
        return str({
            "nick": self.nick,
            "header": self.header,
            "engine": self.engine,
            "wallType": self.wallType,
            "wallPaper": self.wallPaper,
            "wallFilter": self.wallFilter,
            "wallColor": self.wallColor,
            "wordColor": self.wordColor
        })


class Sites(db.Model):
    __tablename__ = "sites"
    id = db.Column(db.String(16), primary_key=True, default=randStr)
    uid = db.Column(db.ForeignKey("users.id"))
    site = db.Column(db.String(1024), nullable=False)
    name = db.Column(db.String(32), nullable=False)
    icon = db.Column(db.String(1024), default="/static/img/sites/icon{0}.png".format(random.randint(0, 9)))
    count = db.Column(db.Integer, default=0)
    user = db.relationship("Users", backref=db.backref("site", order_by=count.desc()))

    __table_args__ = {
        "mysql_charset": "utf8"
    }

    def __repr__(self):
        return str({
            "id": self.id,
            "site": self.site,
            "name": self.name,
            "icon": self.icon,
            "count": self.count
        })


def databasesInit():
    db.drop_all()
    db.create_all()

    chrome = {
        "id": "TingerChromeSite",
        "nick": "Chrome",
        "account": "admin",
        "passwd": "TingerChromeSite",
        "header": "/static/img/icon/user.png"
    }
    tinger = {
        "id": "TingerMadeThisId",
        "nick": "Tinger",
        "account": "Tinger",
        "passwd": "Tinger-chrome",
        "header": "https://images.tinger.host/chrome-avatar-0.jpg",
        "wallType": False,
        "wallColor": "rgba(101, 37, 32, 0.9)",
        "wallFilter": "0",
        "wordColor": "rgba(255, 0, 0, 1.0)",
        "wallPaper": "https://img.zcool.cn/community/0387f7559bb8f32a801212fb7d965ce.jpg"
    }
    Chrome = Users(**chrome)
    Tinger = Users(**tinger)

    siteC = [
        {
            "site": "https://account.aliyun.com/login/login.html",
            "icon": "https://account.aliyun.com/images/favicon.png",
            "name": "阿里云",
            "count": 2
        }, {
            "site": "https://www.iconfont.cn/",
            "icon": "https://www.iconfont.cn/favicon.ico",
            "name": "IconFont",
            "count": 1
        }, {
            "site": "https://www.processon.com/diagrams/",
            "icon": "https://www.processon.com/favicon.ico",
            "name": "ProcessOn",
            "count": 0
        }
    ]
    siteT = [
        {
            "site": "http://hdu.fanya.chaoxing.com/portal",
            "icon": "http://hdu.fanya.chaoxing.com/favicon.ico",
            "name": "杭电泛雅",
            "count": 3
        }, {
            "site": "https://account.aliyun.com/login/login.html",
            "icon": "https://account.aliyun.com/images/favicon.png",
            "name": "阿里云",
            "count": 4
        }, {
            "site": "https://www.iconfont.cn/",
            "icon": "https://www.iconfont.cn/favicon.ico",
            "name": "IconFont",
            "count": 2
        }, {
            "site": "https://www.processon.com/diagrams/",
            "icon": "https://www.processon.com/favicon.ico",
            "name": "ProcessOn",
            "count": 1
        }, {
            "site": "https://study.163.com/",
            "icon": "https://study.163.com/favicon.ico",
            "name": "网易云课堂",
            "count": 4
        }, {
            "site": "https://www.qiniu.com/",
            "icon": "https://www.qiniu.com/favicon.ico",
            "name": "七牛云",
            "count": 1
        }]
    SiteC = [Sites(**item) for item in siteC]
    SiteT = [Sites(**item) for item in siteT]
    Chrome.site = SiteC
    Tinger.site = SiteT

    db.session.add_all([Chrome, Tinger])
    db.session.commit()


def addUser(**prams):
    aly = Users.query.filter_by(account=prams["account"]).first()
    if aly:
        return False
    nid = randStr(random.randint(10, 16))
    ext = Users.query.get(nid)
    while ext:
        nid = randStr(random.randint(10, 16))
        ext = Users.query.get(nid)
    usr = Users(**{
        "id": nid,
        "account": prams["account"],
        "nick": prams["nick"],
        "passwd": prams["passwd"]
    })
    db.session.add(usr)
    db.session.commit()
    return nid


def updateUser(**prams):
    pass


def mysqlTest():
    user = Users.query.get(g.uid)
    return table2json(user)
