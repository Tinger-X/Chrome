from flask import Flask, render_template, jsonify, Response, request, session
from flask_wtf import CSRFProtect
from static.libs.verify import LoginForm, SinForm, SiteForm, uSiteForm
from static.libs.mysql import *
from static.libs.exts import db

app = Flask(__name__)
app.config.from_pyfile("static/libs/config.py")
CSRFProtect(app)
db.init_app(app)


@app.before_request
def before():
    g.mobile = request.user_agent.platform in ["android", "iphone", "ipad"]
    if "auth" in session and session.get("auth") != "Anybody":
        g.logged = True
        g.uid = session.get("auth")
    else:
        g.logged = False
        g.uid = "TingerChromeSite"


@app.errorhandler(500)
def serverError(err):
    return render_template("error.html", err=err)


@app.errorhandler(404)
def pageLost(err):
    return render_template("lost.html", err=err)


@app.route('/')
def index():
    if g.mobile:
        return render_template("m-index.html")
    return render_template("p-index.html")


@app.route("/getData/")
def getData():
    usr = Users.query.get(g.uid)
    return jsonify({
        "status": True,
        "logged": g.logged,
        "user": table2json(usr),
        "site": table2json(usr.site)
    })


@app.route('/newUser/', methods=['POST'])
def newUser():
    form = SinForm(request.form)
    if form.validate():
        nid = addUser(nick=form.nick.data, account=form.account.data, passwd=form.passwd.data)
        if not nid:
            return jsonify({
                "status": False,
                "msgs": ["账户已注册"]
            })
        session["auth"] = nid
        session.permanent = True
        g.logged = True
        g.uid = nid
        usr = Users.query.get(nid)
        return jsonify({
            "status": True,
            "logged": True,
            "user": table2json(usr),
            "site": []
        })
    # 验证失败
    Errs = []
    for err in form.errors:
        Errs += form.errors[err]
    return jsonify({
        "status": False,
        "msgs": Errs
    })


@app.route('/login/', methods=['POST'])
def login():
    # 登录验证
    form = LoginForm(request.form)
    if form.validate():
        account = form.account.data
        passwd = form.passwd.data
        usr = Users.query.filter_by(account=account).first()
        if not usr:
            return jsonify({
                "status": False,
                "msgs": ["账户未注册"]
            })
        if not usr.check_passwd(passwd):
            return jsonify({
                "status": False,
                "msgs": ["密码错误"]
            })
        session["auth"] = usr.id
        session.permanent = True
        g.logged = True
        g.uid = usr.id
        return jsonify({
            "status": True,
            "logged": True,
            "user": table2json(usr),
            "site": table2json(usr.site)
        })
    # 验证失败
    Errs = []
    for err in form.errors:
        Errs += form.errors[err]
    return jsonify({
        "status": False,
        "msgs": Errs
    })


@app.route("/logout/")
def logout():
    session["auth"] = "Anybody"
    session.permanent = False
    g.logged = False
    g.uid = "TingerChromeSite"
    usr = Users.query.get(g.uid)
    return jsonify({
        "status": True,
        "logged": False,
        "user": table2json(usr),
        "site": table2json(usr.site)
    })


@app.route('/updateUser/', methods=['POST'])
@login_required
def updateUser():
    pra = pramFilter(request.form.to_dict())
    if "wallType" in pra.keys():
        pra["wallType"] = pra["wallType"] == "true"
    db.session.query(Users).filter(Users.id == g.uid).update(pra)
    db.session.commit()
    return jsonify({
        "status": True,
        "msgs": ["更新成功"]
    })


@app.route('/addSite/', methods=['POST'])
@login_required
def addSite():
    form = SiteForm(request.form)
    if form.validate():
        name = form.name.data
        site = form.site.data
        sit = Sites.query.filter_by(uid=g.uid, site=site).first()
        if sit:
            return jsonify({
                "status": False,
                "msgs": ["重复添加"]
            })

        nid = randStr(random.randint(10, 16))
        ext = Sites.query.get(nid)
        while ext:
            nid = randStr(random.randint(10, 16))
            ext = Sites.query.get(nid)
        ste = Sites(**{
            "id": nid,
            "uid": g.uid,
            "site": site,
            "icon": iconGet(site),
            "name": name,
            "count": 0
        })
        db.session.add(ste)
        db.session.commit()
        return jsonify({
            "status": True,
            "data": table2json(Sites.query.get(nid))
        })
    # 验证失败
    Errs = []
    for err in form.errors:
        Errs += form.errors[err]
    return jsonify({
        "status": False,
        "msgs": Errs
    })


@app.route("/siteClick/", methods=["POST"])
def siteClick():
    sid = request.form.get("id")
    site = Sites.query.get(sid)
    site.count += 1
    db.session.commit()
    return jsonify({
        "status": True
    })


@app.route('/updateSite/', methods=['POST'])
@login_required
def updateSite():
    form = uSiteForm(request.form)
    if form.validate():
        sit = Sites.query.get(form.id.data)
        if sit.uid != g.uid:
            return jsonify({
                "status": False,
                "msgs": ["Bad authentic request."]
            })
        sit.name = form.name.data
        sit.site = form.site.data
        sit.icon = form.icon.data
        db.session.commit()
        return jsonify({
            "status": True
        })
    # 验证失败
    Errs = []
    for err in form.errors:
        Errs += form.errors[err]
    return jsonify({
        "status": False,
        "msgs": Errs
    })


@app.route("/deleteSite/", methods=["POST"])
@login_required
def deleteSite():
    sid = request.form.get("id") or False
    if not sid:
        return jsonify({
            "status": False,
            "msgs": ['Bad authentic request!']
        })
    sit = Sites.query.get(sid)
    if sit.uid != g.uid:
        return jsonify({
            "status": False,
            "msgs": ["Bad authentic request."]
        })
    db.session.delete(sit)
    db.session.commit()
    return jsonify({
        "status": True,
        "msgs": ["删除成功"]
    })


@app.route('/icon/<path:url>')
def icon(url):
    # https://favicon.link/
    img = requests.get("https://favicon.link/" + url).content
    return Response(img, mimetype="image/x-png")


@app.route("/serviceInit/")
def appInit():
    con = {}
    if session.get("auth") == "TingerChromeSite":
        databasesInit()
        session.clear()
        usr = mysqlTest()
        con["status"] = True
        con["msg"] = "Initialize success!"
        con["nick"] = usr["nick"]
        con["wColor"] = usr["wordColor"]
        con["bColor"] = usr["wallColor"]
    else:
        con["status"] = False
        con["msg"] = "Bad authentic!"
        con["wColor"] = "red"
        con["bColor"] = "skyblue"
    return render_template("init.html", **con)


if __name__ == '__main__':
    app.run()
