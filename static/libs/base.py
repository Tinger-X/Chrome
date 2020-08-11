import random
from datetime import datetime


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
