import random
import requests
from datetime import datetime
from urllib.parse import urlparse
from bs4 import BeautifulSoup as BS


def randStr(num, _map_=None):
    """
    make a random string follow '_map_'
    :param num: length
    :param _map_: base
    :type num: int
    :type _map_: list
    :return: str
    """
    if not _map_:
        _map_ = list('abcdefghijklmnopqrstuvwxyz-_~/+|!@#*1234567890MNBVCXZASDFGHJKLPOIUYTREWQ')
    res = ''
    total = len(_map_)
    for i in range(num):
        res += _map_[(random.randint(0, int(total / 3) + 1) * 1553647) % total]
    return res[:num]


def nowTime():
    return datetime.now()


def listInclude(small, big):
    for item in small:
        if item not in big:
            return False
    return True


def pramFilter(pram):
    """
    :param pram: dict of post
    :type pram: dict
    """
    _all_ = [
        "id", "nick", "account", "passwd", "header", "wallPaper", "engine", "wallType",
        "wallFilter", "wallColor", "wordColor", "user", "site", "icon", "name", "count"
    ]
    res = {}
    for key in pram.keys():
        if key in _all_:
            res[key] = pram[key]
    return res


def iconGet(url):
    default = "/static/img/sites/icon{0}.png".format(random.randint(0, 9))
    try:  # 尝试解码
        decode = urlparse(url)
    except:
        return default

    try:  # 尝试 host + /favicon.ico
        most = decode[0] + "://" + decode[1] + "/favicon.ico"
        trp = requests.get(most)
        if trp.status_code == 200:
            return most
        else:
            try:  # 尝试 HTML head内link
                link_resp = requests.get(url)
                text = BS(link_resp.text, 'html.parser')
                link = text.select('link[rel~=icon]')
                if len(link):
                    res = link[0].get('href')
                    if "//" in res:
                        return res
                    if res[0] == "/":
                        return decode[0] + "://" + decode[1] + res
                    else:
                        return decode[0] + "://" + decode[1] + "/" + res
                else:
                    return default
            except:
                return default
    except:
        return default
