$(function () {
    const engineMap = {
        Google: "https://www.google.com/search?ie=UTF-8&q=",
        Baidu: "https://www.baidu.com/s?ie=UTF-8&wd=",
        Bing: "https://cn.bing.com/search?FORM=CHROMN&q=",
        360: "https://www.so.com/s?ie=UTF-8&q=",
        Sogou: "https://www.sogou.com/web?ie=UTF-8&query="
    };  // ok
    const Ajax = {
        get: function (args) {
            args["method"] = "get";
            this.run(args);
        },
        post: function (args) {
            args["method"] = "post";
            this.run(args);
        },
        set: function () {
            let token = $('meta[name=csrf-token]').attr('content');
            $.ajaxSetup({
                beforeSend: function (xhr, settings) {
                    if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                        xhr.setRequestHeader("X-CSRFToken", token);
                    }
                }
            });
        },
        run: function (args) {
            this.set();
            $.ajax(args);
        }
    };  // ok
    let _data = {
        user: {
            header: "",
            nick: "",
            wordColor: "",
            wallType: "",
            wallPaper: "",
            wallFilter: "",
            wallColor: "",
            engine: ""
        },
        site: [],
        logged: false
    };  // ok
    getData(function (res) {
        if (res["status"]) {
            _data = res;
            // console.log(_data);
            setData();
            eventListener();
        } else alert("Error!", false);
    });  // ok

    function getData(callback) {
        Ajax.get({
            url: "/getData/",
            success: callback,
            fail: function (err) {
                console.log(err);
                alert("Error", false);
            }
        })
    }  // ok

    function setData() {
        if (_data.logged) {  // 差别渲染
            $("#inout>button").html("注销");
        } else {
            $("#inout>button").html("登录");
        }

        // 无差别渲染
        $("#avatar").attr("src", _data.user.header);  // header
        $("nick").html(_data.user.nick).css("color", _data.user.wordColor);  // nick
        if (_data.user.wallType) $("body").css({  // background
            "backgroundColor": "none",
            "backgroundImage": "url(" + _data.user.wallPaper + ")",
            "backdropFilter": "blur(" + _data.user.wallFilter + "px)"
        });
        else $("body").css({
            "backgroundImage": "none",
            "backgroundColor": _data.user.wallColor,
            "backdropFilter": "blur(" + _data.user.wallFilter + "px)"
        });
        engineChange();
        let ens = _data.user.engine.split(', ');  // engine
        $("#select").attr({
            src: "/static/img/icon/" + ens[0] + ".png",
            alt: ens[0],
            title: ens[0],
            order: 0
        });
        $("#content>img").each(function (i) {
            $(this).attr({
                src: "/static/img/icon/" + ens[i + 1] + ".png",
                alt: ens[i + 1],
                title: ens[i + 1],
                order: i + 1
            });
        });
        showSites(_data.site);
    }  // ok

    function showSites(sites) {
        let box = $("#box");
        box.html("");
        for (let i = 0; i < sites.length; i++) {
            let str = "<div class='link' id='" + sites[i].id + "' ind='" + i + "'><div class='icon'>" +
                "<img src='" + sites[i].icon + "' alt='icon'></div><p>" + sites[i].name + "</p></div>";
            box.append($(str));
        }

        // re-listen: link hover and click:
        $("div.link").click(function () {
            linkClicked($(this).attr("ind"), $(this).attr("id"));
        });
    }  // ok

    function linkClicked(ind, _id) {
        Ajax.post({
            url: "/siteClick/",
            data: {id: _id},
            success: function (res) {
                if (res.status) console.log("res");
                else for (let i = 0; i < res["msgs"].length; i++) alert(res["msgs"][i], false);
            },
            fail: function (err) {
                console.log(err);
                alert("Error", false);
            }
        });
        window.location.href = _data.site[ind].site;
    }  // ok

    function engineChange(num = 0) {
        let old = _data.user.engine.split((", "));
        let show = old[0];
        old[0] = old[num];
        old[num] = show;
        let txt = "在" + old[0] + "上搜索，或输入网址。";
        $("#input").attr("placeholder", txt);
    }  // ok

    function eventListener() {
        //login / logout:
        $("#inout>button").click(() => {
            if (_data.logged) {
                userLogout();
            } else {
                userLogin();
            }
        });

        // engine select:
        let $select = $("#select");
        $("#content>img").click(function () {
            let $this = $(this);
            let tAttr = {
                src: $this.attr("src"),
                alt: $this.attr("alt"),
                title: $this.attr("title")
            };
            let sAttr = {
                src: $select.attr("src"),
                alt: $select.attr("alt"),
                title: $select.attr("title")
            };
            $select.attr(tAttr);
            $this.attr(sAttr);
            engineChange($this.attr("order"));
        });

        // input and search:
        let $input = $("#input");
        $input.keydown(function (even) {
            if (even.which === 13) {
                search();
            }
        });
        $("#search>img").click(search);

        function search() {
            let content = $input.val();
            if (content) {
                let strUrl = isURL(content);
                if (strUrl.judge) {
                    window.location = strUrl.str;
                } else {
                    let eng = engineMap[_data.user.engine.split((", "))[0]];
                    window.location = eng + content;
                }
            }
        }
    }  // ok

    function userLogin() {
        let form = $("<div id='login'><h1>登录</h1>" +
            "<input id='account' type='text' placeholder='账号'>" +
            "<input id='passwd' type='password' placeholder='密码'>" +
            "<div class='btn'><button id='cancel'>取消</button>" +
            "<button id='submit'>登录</button></div></div>");
        $("body").append(form);
        $("#cancel").click(function () {
            form.remove();
        });
        $("#submit").click(function () {
            Ajax.post({
                url: "/login/",
                data: {
                    account: $("#account").val(),
                    passwd: $("#passwd").val()
                },
                success: function (res) {
                    if (res.status) {
                        form.remove();
                        reloadPage(res);
                    } else for (let i = 0; i < res["msgs"].length; i++) alert(res["msgs"][i], false);
                },
                fail: function (err) {
                    console.log(err);
                    alert("Error", false);
                }
            });
        });
    }  // ok

    function userLogout() {
        Ajax.get({
            url: "/logout/",
            success: function (res) {
                if (res.status) reloadPage(res);
                else for (let i = 0; i < res["msgs"].length; i++) alert(res["msgs"][i], false);
            },
            fail: function (err) {
                alert("Error", false);
                console.log(err);
            }
        });
    }  // ok

    function reloadPage(data) {
        _data = data;
        // console.log(_data);
        setData();
    }  // ok

    function isURL(str_url) {
        let strRegex = "^((https|http)://)?"  // 开头- http(s)://
            + "(([0-9]{1,3}\\.){3}[0-9]{1,3}" // IP- 199.194.52.184
            + "|(([0-9A-Za-z-\\._*@\u4e00-\u9fa5]+\\.)*([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\\.[a-z]{2,6}))" // domain- third.second.host
            + "(:[0-9]{1,6})?" // 端口- :80
            + "((/?)|(/[^ ]+)+/?)$";  // 路由- 拒绝空格
        let re = new RegExp(strRegex);
        if (re.test(str_url)) {
            let url = str_url.slice(0, 4) === "http" ? str_url : "http://" + str_url;
            return {
                judge: true,
                str: url
            };
        }
        return {
            judge: false,
            str: str_url
        };
    }  // ok

    function alert(msg, type = true) {
        let one = $("<div class='alert'><p>" + msg + "</p><img src='/static/img/icon/close.png' alt='close'></div>");
        $("#alertBox").append(one);
        let self = setTimeout(function () {
            one.remove();
        }, 1000);
        if (type) one.css({backgroundColor: "rgba(128, 128, 128, 0.9)"});
        else {
            clearTimeout(self);
            one.css({backgroundColor: "rgba(255, 0, 0, 0.9)"});
        }
        $(".alert>img").click(function () {
            self && clearTimeout(self);
            $(this).parent().remove();
        });
    }  // ok
});