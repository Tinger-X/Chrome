from flask import Flask, render_template, jsonify, request, Response
import requests
from static.libs.mysql import *

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/login/', methods=['POST'])
def login():
    pra = pramFilter(request.form.to_dict())
    if not listInclude(["account", "passwd"], pra.keys()):
        return jsonify({
            "status": False,
            "msg": "参数缺失"
        })
    if pra["account"] == "public-chrome":
        return jsonify({
            "status": True,
            "msg": "注销成功",
            "user": searchDate(Users, id="TingerChromeSite")[0],
            "site": searchDate(Sites, user="TingerChromeSite")
        })
    usr = searchDate(Users, **pra)
    if not usr:
        return jsonify({
            "status": False,
            "msg": "账户未注册"
        })
    if usr[0]["passwd"] != pra["passwd"]:  # mysql不区分大小写，需要手动区分
        return jsonify({
            "status": False,
            "msg": "密码错误"
        })
    return jsonify({
        "status": True,
        "msg": "登录成功",
        "user": usr[0],
        "site": searchDate(Sites, user=usr[0]["id"])
    })


@app.route('/updateUser/', methods=['POST'])
def updateUser():
    pra = pramFilter(request.form.to_dict())
    if not listInclude(["id", "passwd"], pra.keys()):
        return jsonify({
            "status": False,
            "msg": "参数缺失"
        })
    uid = pra["id"]
    if uid == "TingerChromeSite":
        return jsonify({
            "status": False,
            "msg": "越权操作"
        })
    usr = searchDate(Users, id=pra["id"], passwd=pra["passwd"])
    if not usr:
        return jsonify({
            "status": False,
            "msg": "拒绝恶意操作"
        })
    modifyData(Users, uid, **pra)
    return jsonify({
        "status": True,
        "msg": "更新成功"
    })


@app.route('/updateSite/', methods=['POST'])
def updateSite():
    pra = pramFilter(request.form.to_dict())
    if not listInclude(["user", "passwd", "id"], pra.keys()):
        return jsonify({
            "status": False,
            "msg": "参数缺失"
        })
    if pra["user"] == "TingerChromeSite" and not listInclude(pra.keys(), ["user", "passwd", "id", "count"]):
        return jsonify({
            "status": False,
            "msg": "越权操作，已禁止。"
        })
    usr = searchDate(Users, id=pra["user"], passwd=pra["passwd"])
    if not usr:
        return jsonify({
            "status": False,
            "msg": "拒绝恶意操作"
        })
    del pra["user"]
    del pra["passwd"]
    modifyData(Sites, pra["id"], **pra)
    return jsonify({
        "status": True,
        "msg": "更新成功"
    })


@app.route('/newUser/', methods=['POST'])
def newUser():
    pra = pramFilter(request.form.to_dict())
    if not listInclude(["account", "passwd", "nick"], pra.keys()):
        return jsonify({
            "status": False,
            "msg": "参数缺失"
        })
    aly = searchDate(Users, account=pra["account"])
    if aly:
        return jsonify({
            "status": False,
            "msg": "用户已存在"
        })
    nid = randStr(random.randint(10, 16))
    ext = searchDate(Users, id=nid)
    while ext:
        nid = randStr(random.randint(10, 16))
        ext = searchDate(Users, id=nid)
    addData(Users, {
        "id": nid,
        "account": pra["account"][:64],
        "nick": pra["nick"][:64],
        "passwd": pra["passwd"][:64],
        "header": "static/img/header/{0}.jpg".format(random.randint(0, 9)),
        "wallPaper": "static/img/wall/paper{0}.png".format(random.randint(0, 9))
    })
    return jsonify({
        "status": True,
        "msg": "注册并登录成功",
        "user": searchDate(Users, id=nid)[0],
        "site": []
    })


@app.route('/addSite/', methods=['POST'])
def addSite():
    pra = pramFilter(request.form.to_dict())
    if not listInclude(["id", "passwd", "site", "name", "icon"], pra.keys()):
        return jsonify({
            "status": False,
            "msg": "参数缺失"
        })
    usr = searchDate(Users, id=pra["id"], passwd=pra["passwd"])
    if not usr:
        return jsonify({
            "status": False,
            "msg": "拒绝恶意操作"
        })
    sit = searchDate(Sites, user=pra["id"], site=pra["site"])
    if sit:
        return jsonify({
            "status": False,
            "msg": "重复添加"
        })
    nid = randStr(random.randint(10, 16))
    ext = searchDate(Sites, id=nid)
    while ext:
        nid = randStr(random.randint(10, 16))
        ext = searchDate(Sites, id=nid)
    res = {
        "id": nid,
        "user": pra["id"],
        "site": pra["site"],
        "icon": pra["icon"],
        "name": pra["name"],
        "count": 0
    }
    addData(Sites, res)
    return jsonify({
        "status": True,
        "msg": "添加成功",
        "data": res
    })


@app.route('/icon/<path:url>')
def icon(url):
    # https://favicon.link/
    img = requests.get("https://favicon.link/" + url).content
    return Response(img, mimetype="image/x-png")


if __name__ == '__main__':
    app.run()
