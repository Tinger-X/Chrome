# 验证post请求的参数是否符合规范
from wtforms import Form, StringField
from wtforms.validators import Length, URL, InputRequired, EqualTo


class LoginForm(Form):
    account = StringField(validators=[Length(3, 32, "账户长度区间: [3,32]")])
    passwd = StringField(validators=[Length(6, 32, "密码长度区间: [6,32]")])


class SinForm(Form):
    nick = StringField(validators=[Length(2, 16, "昵称长度区间: [2,16]")])
    account = StringField(validators=[Length(3, 32, "账户长度区间: [3,32]")])
    passwd = StringField(validators=[Length(6, 32, "密码长度区间: [6,32]")])
    repeat = StringField(validators=[EqualTo("passwd", "两次密码不一样")])


class SiteForm(Form):
    name = StringField(validators=[Length(1, 10, "名称长度区间[1,10]")])
    site = StringField(validators=[URL("好像不是一个网址"), InputRequired("请输入网址")])


class uSiteForm(Form):
    id = StringField(validators=[InputRequired("Bad authentic request.")])
    name = StringField(validators=[Length(1, 10, "名称长度区间[1,10]")])
    site = StringField(validators=[URL("好像不是一个网址"), InputRequired("请输入网址")])
    icon = StringField(validators=[InputRequired("请输入url或选择icon")])
