$(document).ready(function () {
    let DATA = {
        user: {
            id: "",
            passwd: "",
            header: "",
            nick: "",
            wordColor: "",
            wallType: "",
            wallPaper: "",
            wallFilter: "",
            wallColor: "",
            engine: ""
        },
        site: []
    };
    const engineMap = {
        Google: "https://www.google.com/search?ie=UTF-8&q=",
        Baidu: "https://www.baidu.com/s?ie=UTF-8&wd=",
        Bing: "https://cn.bing.com/search?FORM=CHROMN&q=",
        360: "https://www.so.com/s?ie=UTF-8&q=",
        Sogou: "https://www.sogou.com/web?ie=UTF-8&query="
    };
    const block = {width: 112, height: 128};
    main().then();

    async function main() {
        DATA = await getData();
        console.log(DATA);
        setData(DATA);
        eventListener();
    }

    function getData() {
        return new Promise((resolve => {
            let judge = JSON.parse(localStorage.getItem("Tinger")) || false;
            if (judge && judge.user.id !== 'TingerChromeSite') resolve(judge);
            else {
                $.post("/login/", {account: "public-chrome", passwd: ""}, function (res) {
                    res.site = res.site.sort((a, b) => {
                        return b.count - a.count;
                    });
                    localStorage.setItem("Tinger", JSON.stringify(res));
                    resolve(res);
                });
            }
        }));
        /* TingerChromeSite
        Tinger: {
            user: {
                id: 'xxx', other: '', ...
            },
            site: [
                {},{},{}...
            ]
        }
        */
    }

    function isLogged() {
        return DATA.user.id !== "TingerChromeSite";
    }

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
    }

    function distribute(num) {
        let col = Math.ceil(Math.sqrt(block.height / block.width * (num + 1)));
        let row = Math.ceil((num + 1) / col);
        $("#box").css({width: col * block.width + "px", height: row * block.height + "px"});
        return {
            row: row,
            col: col
        }
    }

    function engineChange(num = 0) {
        let old = DATA.user.engine.split((", "));
        let show = old[0];
        old[0] = old[num];
        old[num] = show;
        let txt = "在" + old[0] + "上搜索，或输入网址。[回车结束]";
        $("#input").attr("placeholder", txt);
        if (num) updateUser({engine: old.join(", ")});
    }

    function updateUser(attrs) {
        for (let key in attrs) DATA.user[key] = attrs[key];
        localStorage.setItem("Tinger", JSON.stringify(DATA));
        if (isLogged()) {
            attrs.id = DATA.user.id;
            attrs.passwd = DATA.user.passwd;
            $.post("/updateUser/", attrs, (res) => {
                console.log(res);
            });
        }
    }

    function updateSite(attrs) {
        attrs.user = DATA.user.id;
        attrs.passwd = DATA.user.passwd;
        localStorage.setItem("Tinger", JSON.stringify(DATA));
        $.post("/updateSite/", attrs, (res) => {
            console.log(res);
        });
    }

    function userLogin() {
        maskChange();
        let str = "<div id='formBox'><h2>登录</h2><div class='form-selector'><p id='to-login' class='form-this'>登录</p>" +
            "<p id='to-sin'>注册</p></div><form id='login-form'>" +
            "<div class='input-box'><input type='text' maxlength='64' id='login-account' required><label>账号</label></div>" +
            "<div class='input-box'><input type='password' maxlength='64' id='login-passwd' required><label>密码</label></div>" +
            "<div class='btn-box'><div class='false'>取消</div><div class='true'><span>登录</span></div></div>" +
            "</form></div>";
        $("#mask").append($(str));
        atLogin();
        $("#to-login").click(function () {
            let the = $(this);
            if (!the.hasClass("form-this")) {
                $("#to-sin").removeClass("form-this");
                $("#sin-form").remove();

                let form = "<form id='login-form'>" +
                    "<div class='input-box'><input type='text' maxlength='64' id='login-account' required><label>账号</label></div>" +
                    "<div class='input-box'><input type='password' maxlength='64' id='login-passwd' required><label>密码</label></div>" +
                    "<div class='btn-box'><div class='false'>取消</div><div class='true'><span>登录</span></div></div>" +
                    "</form>";
                $("#formBox>h2").html("登录");
                the.addClass("form-this");
                $("#formBox").append($(form));
                atLogin();
            }
        });
        $("#to-sin").click(function () {
            let the = $(this);
            if (!the.hasClass("form-this")) {
                $("#to-login").removeClass("form-this");
                $("#login-form").remove();

                let form = "<form id='sin-form'>" +
                    "<div class='input-box'><input type='text' maxlength='64' id='sin-account' required><label>账号</label></div>" +
                    "<div class='input-box'><input type='text' maxlength='64' id='sin-nick' required><label>昵称</label></div>" +
                    "<div class='input-box'><input type='password' maxlength='64' id='sin-passwd' required><label>密码</label></div>" +
                    "<div class='input-box'><input type='password' maxlength='64' id='sin-repeat' required><label>确认密码</label></div>" +
                    "<div id='sin-verify'></div>" +
                    "<div class='btn-box'><div class='false'>取消</div><div class='true'><span>注册</span></div></div>" +
                    "</form>";
                $("#formBox>h2").html("注册");
                the.addClass("form-this");
                $("#formBox").append($(form));
                atSin();
            }
        });
    }

    function atLogin() {
        $("#login-form div.false").click(function () {
            $("#login-account, #login-passwd").val("");
            $("#formBox").remove();
            maskChange(false);
        });
        $("#login-form div.true").click(function () {
            let acc = $("#login-account");
            let pwd = $("#login-passwd");
            let pra = {
                account: acc.val(),
                passwd: pwd.val()
            };
            let can = true;
            if (!pra.account) {
                redTip(acc);
                can = false;
            }
            if (!pra.passwd) {
                redTip(pwd);
                can = false;
            }
            if (can) {
                $.post("/login/", pra, function (res) {
                    if (res["status"]) {
                        reloadPage(res);
                        $("#login-account, #login-passwd").val("");
                        $("#formBox").remove();
                        maskChange(false);
                    } else alert(res["msg"], res["status"]);
                });
            }
        });
    }

    function atSin() {
        $("#sin-form div.false").click(function () {
            $("#sin-account, #sin-nick, #sin-passwd, #sin-repeat").val("");
            $("#formBox").remove();
            maskChange(false);
        });
        $("#sin-repeat").blur(function () {
            let rep = $(this);
            let pwd = $("#sin-passwd");
            if (rep.val() !== pwd.val()) {
                redTip(rep);
                alert("两次密码不一样", false);
            }
        });
        let very = $("#sin-verify")
        if (very.is(":empty")) {
            very.slideVerify({
                type: 1, //类型
                vOffset: 5, //误差量，根据需求自行调整
                barSize: {
                    width: "100%",
                    height: "40px",
                },
                status: false,
                ready: function () {
                    let that = this;
                    $("#sin-form div.true").click(function () {
                        if (!that.status) alert("请先完成验证", false);
                    });
                },
                success: function () {
                    this.status = true;
                    $("#sin-form div.true").click(function () {
                        let acc = $("#sin-account");
                        let nik = $("#sin-nick");
                        let pwd = $("#sin-passwd");
                        let rpt = $("#sin-repeat");
                        let pra = {
                            account: acc.val(),
                            nick: nik.val(),
                            passwd: pwd.val()
                        };
                        let can = true;
                        if (!pra.account) {
                            redTip(acc);
                            can = false;
                        }
                        if (!pra.nick) {
                            redTip(nik);
                            can = false;
                        }
                        if (!pra.passwd) {
                            redTip(pwd);
                            can = false;
                        }
                        if (!rpt.val()) {
                            redTip(rpt);
                            can = false;
                        }
                        if (rpt.val() !== pwd.val()) {
                            redTip(rpt);
                            alert("两次密码不一样", false);
                            can = false;
                        }

                        if (can) {
                            $.post("/newUser/", pra, function (res) {
                                if (res["status"]) {
                                    reloadPage(res);
                                    $("#sin-account, #sin-nick, #sin-passwd, #sin-repeat").val("");
                                    $("#formBox").remove();
                                    maskChange(false);
                                } else alert(res["msg"], res["status"]);
                            })
                        }
                    });
                }
            });
        }
    }

    function userLogout() {
        $.post("/login/", {account: "public-chrome", passwd: ""}, function (res) {
            reloadPage(res);
        });
    }

    function siteAdd() {
        maskChange();
        let str = "<div id='formBox'><h2>添加</h2><form id='add-form'>" +
            "<div class='input-box'><input type='text' maxlength='1010' id='add-url' required><label>网址</label></div>" +
            "<div class='input-box'><input type='text' maxlength='32' id='add-name' required><label>名称</label></div>" +
            "<div class='btn-box'><div class='false'>取消</div><div class='true'><span>添加</span></div></div>" +
            "</form></div>";
        $("#mask").append($(str));
        $("#add-form div.false").click(function () {
            $("#add-url, #add-name").val("");
            $("#formBox").remove();
            maskChange(false);
        });
        $("#add-form div.true").click(function () {
            let url = $("#add-url");
            let nam = $("#add-name");
            let jud = isURL(url.val());
            if (jud.judge) {
                let pra = {
                    id: DATA.user.id,
                    passwd: DATA.user.passwd,
                    site: jud.str,
                    name: nam.val(),
                    icon: "/icon/" + jud.str
                };
                let can = true;
                if (!pra.name) {
                    redTip(nam);
                    can = false;
                }
                for (let i = 0; i < DATA.site.length; i++) {
                    if (pra.site === DATA.site[i].site) {
                        redTip(url);
                        can = false;
                        alert("网址重复", false);
                    }
                }
                if (can) {
                    $.post("/addSite/", pra, function (res) {
                        if (res["status"]) {
                            DATA.site.push(res.data);
                            localStorage.setItem("Tinger", JSON.stringify(DATA));
                            reloadPage(DATA);
                            $("#add-url, #add-name").val("");
                            $("#formBox").remove();
                            maskChange(false);
                        } else alert(res["msg"], res["status"]);
                    });
                }
            } else {
                redTip(url);
                alert("似乎不是一个网址", false);
            }
        });
    }

    function siteModify(num) {
        maskChange();
        let the = DATA.site[num];
        let str = "<div id='formBox'><img src='static/img/icon/close.png' alt='close'><h2>添加</h2><form id='mod-form'>" +
            "<div class='input-box'><input type='text' value='" + the.site + "' maxlength='1010' id='mod-url' required><label>网址</label></div>" +
            "<div class='input-box'><input type='text' value='" + the.name + "' maxlength='32' id='mod-name' required><label>名称</label></div>" +
            "<div class='input-box'><input type='text' value='" + the.icon + "' maxlength='1024' id='mod-icon' required><label>icon</label></div>" +
            "<div class='btn-box'><div class='false'>删除</div><div class='true'><span>修改</span></div></div>" +
            "</form></div>";
        $("#mask").append($(str));
        $("#formBox>img").click(function () {
            $("#mod-url, #mod-name, #mod-icon").val("");
            $("#formBox").remove();
            maskChange(false);
        });
        $("#mod-form div.false").click(function () {
            alert("you're about to delete the link!!", false);
        });
        $("#mod-form div.true").click(function () {
            alert("you're about to modify the link!!", false);
        });
    }

    function reloadPage(data) {
        data.site = data.site.sort((a, b) => {
            return b.count - a.count;
        });
        DATA = data;
        localStorage.setItem("Tinger", JSON.stringify(data));
        setData(data);
    }

    function eventListener() {
        // 差别监听：
        // diy page:
        $("#diy").click(function () {
            if (isLogged()) {
                alert("You're about to DIY your page!");
            } else {
                alert("You can't DIY this account!", false);
            }
        });

        // self info:
        $("#update").click(function () {
            if (isLogged()) {
                alert("You're about to change your info!");
            } else {
                alert("Please login first!", false);
            }
        });

        //login / logout:
        $("#inout").click(() => {
            if (isLogged()) {
                userLogout();
            } else {
                userLogin();
            }
        });

        // 无差别监听：
        // mouse hover user icon:
        $("#user").hover(function () {
            let menu = $("#menu");
            if (!menu.is(":animated")) {
                menu.animate({marginTop: "5px", opacity: 1}, 300);
            }
        }, function () {
            $("#menu").animate({marginTop: "-45px", opacity: 0}, 300);
        });

        // engine select:
        let selected = document.getElementById("select");
        let ls = document.getElementById("content").getElementsByTagName("img");
        for (let i = 0; i < 4; i++) {
            ls[i]["order"] = i + 1;
            ls[i].onclick = function () {
                let cho = {
                    src: this.src,
                    alt: this.alt,
                    title: this.title
                };
                this.src = selected.src;
                this.alt = selected.alt;
                this.title = selected.title;
                selected.src = cho.src;
                selected.alt = cho.alt;
                selected.title = cho.title;
                engineChange(this["order"]);
            }
        }

        // input and search:
        $(document).keydown((even) => {
            if (even.which === 13) {
                let content = $("#input").val();
                if (content) {
                    let strUrl = isURL(content);
                    if (strUrl.judge) {
                        window.location = strUrl.str;
                    } else {
                        let eng = engineMap[DATA.user.engine.split((", "))[0]];
                        window.location = eng + content;
                    }
                }
            } else if ($("#mask").is(":empty")) {
                $("#input").focus();
            }
        });
    }

    function setData(data) {
        if (isLogged()) {  // 差别渲染
            $("#inout").html("注销");
        } else {
            $("#inout").html("登录/注册");
        }

        // 无差别渲染
        $("#avatar").attr("src", data.user.header);  // header
        $("#nick").html(data.user.nick).css("color", data.user.wordColor);  // nick
        if (data.user.wallType) $("#body").css({  // background
            "backgroundColor": "transparent",
            "backgroundImage": "url(" + data.user.wallPaper + ")",
            "backdropFilter": "blur(" + data.user.wallFilter + "px)"
        });
        else $("#body").css({
            "backgroundImage": "none",
            "backgroundColor": data.user.wallColor,
            "backdropFilter": "blur(" + data.user.wallFilter + "px)"
        });
        engineChange();
        let ens = data.user.engine.split(', ');  // engine
        $("#select").attr({
            src: "static/img/icon/" + ens[0] + ".png",
            alt: ens[0],
            title: ens[0]
        });
        $("#content>img").each(function (i) {
            $(this).attr({
                src: "static/img/icon/" + ens[i + 1] + ".png",
                alt: ens[i + 1],
                title: ens[i + 1]
            });
        });
        showSites(data.site);
    }

    function showSites(sites) {
        let box = $("#box");
        let len = sites.length;
        box.html("");
        let pra = distribute(len);
        for (let r = 0; r < pra.row; r++) {
            let line = $("<div class='rows'></div>");
            for (let c = 0; c < pra.col; c++) {
                let ind = r * pra.col + c;
                if (ind < len) {
                    let str = "<div class='nav' ind=" + ind + ">"
                        + "<dot title='修改'>···</dot>"
                        + "<div class='link'>"
                        + "<img src='" + sites[ind].icon + "' alt='icon'>"
                        + "<p>" + sites[ind].name + "</p>"
                        + "</div>"
                        + "</div>";
                    line.append($(str));
                } else {
                    let add = "<div class='nav'><add><img src='/static/img/icon/add.png' alt='add'><p>+添加+</p></add></div>";
                    line.append($(add));
                    break;
                }
            }
            box.append(line);
        }

        // re-listen: link hover and click:
        $("div.link").hover(function () {
            $(this).css({backgroundColor: "rgba(255, 255, 255, 0.2)"}).prev().css({display: "block"});
        }, function () {
            $(this).css({backgroundColor: "transparent"}).prev().css({display: "none"});
        }).click(function () {
            linkClicked($(this).parent().attr("ind"));
        });
        // dot hover and click:
        $("dot").hover(function () {
            $(this).css({
                color: "red",
                display: "block"
            }).next().css({backgroundColor: "rgba(255, 255, 255, 0.2)"});
        }, function () {
            $(this).css({
                color: "black",
                display: "none"
            }).next().css({backgroundColor: "transparent"});
        }).click(function () {
            let ind = $(this).parent().attr("ind");
            if (isLogged()) siteModify(ind);
            else alert("Please login first!", false);
        });
        // add hover and click:
        $("add").hover(function () {
            $(this).css({backgroundColor: "rgba(255, 255, 255, 0.2)"});
        }, function () {
            $(this).css({backgroundColor: "transparent"});
        }).click(function () {
            if (isLogged()) siteAdd();
            else alert("Please login first!", false);
        });
    }

    function linkClicked(index) {
        DATA.site[index].count++;
        let the = DATA.site[index];
        DATA.site = DATA.site.sort((a, b) => {
            return b.count - a.count;
        });
        updateSite({id: the.id, count: the.count});
        showSites(DATA.site);
        window.location.href = the.site;
    }

    function alert(msg, type = true) {
        maskChange();
        let the = $("#alert");
        if (the.length !== 1) {
            the = $("<div id='alert'><p>" + msg + "</p><img src='static/img/icon/close.png' alt='close'></div>");
            $("#mask").append(the);
        }
        let self = setTimeout(function () {
            the.remove();
            maskChange(false);
        }, 1000);
        if (type) the.css({backgroundColor: "rgba(128, 128, 128, 0.8)"});
        else {
            clearTimeout(self);
            the.css({backgroundColor: "rgba(255, 0, 0, 0.6)"});
        }
        $("#alert>img").click(function () {
            self && clearTimeout(self);
            the.remove();
            maskChange(false);
        });
    }

    function redTip(node, time = 1000) {
        let bord = node.css("border");
        node.css({border: "1px solid red"});
        setTimeout(function () {
            node.css({border: bord});
        }, time);
    }

    function maskChange(type = true) {
        let mask = $("#mask");
        if (type && mask.is(":empty")) mask.css({display: "flex"});
        if ((!type) && mask.is(":empty")) mask.css({display: "none"});
    }
});