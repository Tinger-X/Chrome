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
        site: [],
        status: false,
        msg: "",
        logged: false
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
        setData();
        eventListener();
    }

    function getData() {
        return new Promise((resolve => {
            let judge = JSON.parse(localStorage.getItem("Tinger")) || false;
            if (judge && judge.logged) resolve(judge);
            else {
                $.post("/login/", {account: "public-chrome", passwd: ""}, function (res) {
                    if (res.status) {
                        res.site = res.site.sort((a, b) => {
                            return b.count - a.count;
                        });
                        localStorage.setItem("Tinger", JSON.stringify(res));
                        resolve(res);
                    } else alert(res.msg, false);
                });
            }
        }));
    }

    function setData() {
        if (DATA.logged) {  // 差别渲染
            $("#inout").html("注销");
        } else {
            $("#inout").html("登录/注册");
        }

        // 无差别渲染
        $("#avatar").attr("src", DATA.user.header);  // header
        $("#nick").html(DATA.user.nick).css("color", DATA.user.wordColor);  // nick
        if (DATA.user.wallType) $("#body").css({  // background
            "backgroundColor": "none",
            "backgroundImage": "url(" + DATA.user.wallPaper + ")",
            "backdropFilter": "blur(" + DATA.user.wallFilter + "px)"
        });
        else $("#body").css({
            "backgroundImage": "none",
            "backgroundColor": DATA.user.wallColor,
            "backdropFilter": "blur(" + DATA.user.wallFilter + "px)"
        });
        engineChange();
        let ens = DATA.user.engine.split(', ');  // engine
        $("#select").attr({
            src: "/static/img/icon/" + ens[0] + ".png",
            alt: ens[0],
            title: ens[0]
        });
        $("#content>img").each(function (i) {
            $(this).attr({
                src: "/static/img/icon/" + ens[i + 1] + ".png",
                alt: ens[i + 1],
                title: ens[i + 1]
            });
        });
        showSites(DATA.site);
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
                } else if (DATA.logged) {
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
            if (DATA.logged) siteModify(ind);
            else alert("Please login first!", false);
        });
        // add hover and click:
        $("add").hover(function () {
            $(this).css({backgroundColor: "rgba(255, 255, 255, 0.2)"});
        }, function () {
            $(this).css({backgroundColor: "transparent"});
        }).click(siteAdd);
    }

    function linkClicked(index) {
        let the = DATA.site[index];
        the.count++;
        updateSite(the);
        window.location.href = the.site;
    }

    function updateSite(attrs) {
        // attrs => a changed site obj
        for (let i = 0; i < DATA.site.length; i++) {
            if (DATA.site[i].id === attrs.id) {
                DATA.site[i] = attrs;
                break;
            }
        }
        DATA.site = DATA.site.sort((a, b) => {
            return b.count - a.count;
        });
        localStorage.setItem("Tinger", JSON.stringify(DATA));

        showSites(DATA.site);
        attrs.passwd = DATA.user.passwd;
        $.post("/updateSite/", attrs, (res) => {
            if (res.status) console.log(res);
            else alert(res.msg, false);
        });
    }

    function siteModify(num) {
        maskChange();
        let the = DATA.site[num];
        let str = "<div id='formBox'><img src='/static/img/icon/close.png' alt='close'><h2>添加</h2><form id='mod-form'>" +
            "<div class='input-box'><input type='text' value='" + the.site + "' maxlength='1010' id='mod-url' required><label>网址</label></div>" +
            "<div class='input-box'><input type='text' value='" + the.name + "' maxlength='32' id='mod-name' required><label>名称</label></div>" +
            "<div class='input-box'><input type='text' value='" + the.icon + "' maxlength='1024' id='mod-icon' required><label>icon</label></div>" +
            "<div class='icon-box'><img id='icon-res' src='" + the.icon + "' alt='icon'><div id='icons'></div></div>" +
            "<div class='btn-box'><div class='false'>删除</div><div class='true'><span>修改</span></div></div>" +
            "</form></div>";
        $("#mask").append($(str));
        // 添加静态icon及点击事件
        for (let i = 0; i < 10; i++) {
            let one = "<img src='/static/img/sites/icon" + i + ".png' alt='" + i + "'>";
            $("#icons").append($(one));
        }
        $("#icons>img").click(function () {
            let src = $(this).attr("src");
            $("#icon-res").attr("src", src);
            $("#mod-icon").val(src);
        });
        // 输入icon地址结束
        $("#mod-icon").blur(function () {
            let src = $(this).val();
            $("#icon-res").attr("src", src);
        });
        // 按钮事件
        $("#formBox>img").click(function () {
            $("#mod-url, #mod-name, #mod-icon").val("");
            $("#formBox").remove();
            maskChange(false);
        });
        $("#mod-form div.false").click(function () {
            let pra = {
                user: the.user,
                passwd: DATA.user.passwd,
                id: the.id
            }
            $.post("/deleteSite/", pra, function (res) {
                if (res.status) {
                    let list = [];
                    for (let i = 0; i < DATA.site.length; i++) if (DATA.site[i].id !== the.id) list.push(DATA.site[i]);
                    DATA.site = list;
                    localStorage.setItem("Tinger", JSON.stringify(DATA));
                    showSites(list);
                    $("#mod-url, #mod-name, #mod-icon").val("");
                    $("#formBox").remove();
                    maskChange(false);
                } else alert(res.msg, false);
            });
        });
        $("#mod-form div.true").click(function () {
            let nam = $("#mod-name");
            let url = $("#mod-url");
            let ico = $("#mod-icon");
            let jdg = isURL(url.val());
            let can = true;

            // update data
            the.name = nam.val();
            the.site = jdg.str;
            the.icon = ico.val();
            if (!the.name) {
                redTip(nam);
                can = false;
            }
            if (!jdg.judge) {
                redTip(url);
                can = false;
            }
            if (!the.icon) {
                redTip(ico);
                can = false;
            }
            if (can) {
                updateSite(the);
                $("#mod-url, #mod-name, #mod-icon").val("");
                $("#formBox").remove();
                maskChange(false);
            }
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
                    user: DATA.user.id,
                    passwd: DATA.user.passwd,
                    site: jud.str,
                    name: nam.val()
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
                        if (res.status) {
                            DATA.site.push(res.data);
                            localStorage.setItem("Tinger", JSON.stringify(DATA));
                            reloadPage(DATA);
                            $("#add-url, #add-name").val("");
                            $("#formBox").remove();
                            maskChange(false);
                        } else alert(res.msg, false);
                    });
                }
            } else {
                redTip(url);
                alert("似乎不是一个网址", false);
            }
        });
    }

    function reloadPage(data) {
        data.site = data.site.sort((a, b) => {
            return b.count - a.count;
        });
        localStorage.setItem("Tinger", JSON.stringify(data));
        DATA = JSON.parse(localStorage.getItem("Tinger"));
        setData();
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
        if (DATA.logged) {
            attrs.id = DATA.user.id;
            attrs.passwd = DATA.user.passwd;
            $.post("/updateUser/", attrs, (res) => {
                if (res.status) reloadPage(DATA);
                else alert(res.msg, false);
            });
        }
    }

    function userLogin() {
        maskChange();
        let str = "<div id='formBox'><h2>登录</h2><div class='form-selector'><p id='to-login' class='form-this'>登录</p>" +
            "<p id='to-sin'>注册</p></div><form id='login-form'>" +
            "<div class='input-box'><input type='text' maxlength='32' id='login-account' required><label>账号</label></div>" +
            "<div class='input-box'><input type='password' maxlength='32' id='login-passwd' required><label>密码</label></div>" +
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
                    "<div class='input-box'><input type='text' maxlength='32' id='login-account' required><label>账号</label></div>" +
                    "<div class='input-box'><input type='password' maxlength='32' id='login-passwd' required><label>密码</label></div>" +
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
                    if (res.status) {
                        reloadPage(res);
                        $("#login-account, #login-passwd").val("");
                        $("#formBox").remove();
                        maskChange(false);
                    } else alert(res.msg, false);
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
                                if (res.status) {
                                    reloadPage(res);
                                    $("#sin-account, #sin-nick, #sin-passwd, #sin-repeat").val("");
                                    $("#formBox").remove();
                                    maskChange(false);
                                } else alert(res.msg, false);
                            })
                        }
                    });
                }
            });
        }
    }

    function userLogout() {
        $.post("/login/", {account: "public-chrome", passwd: ""}, function (res) {
            if (res.status) reloadPage(res);
            else alert(res.msg, false);
        });
    }

    function pageDiy() {
        maskChange();
        let str = "<div id='diyBox'><h2>页面自定义</h2><div class='filter-line'>" +
            "<txt>模糊度</txt><input id='blur' type='range' value='" + DATA.user.wallFilter + "' min='0' max='3' step='1'>" +
            "<txt>" + DATA.user.wallFilter + "</txt></div><div class='colorInputBox'>" +
            "<div class='input-box'><input id='w-color' type='text' value='" + DATA.user.wordColor + "' maxlength='128' required><label>字体颜色</label></div>" +
            "<div id='wc-res'></div></div><div class='form-selector'><p id='b-img'>背景图</p><p id='b-color'>背景色</p></div><div id='backBox'></div>" +
            "<div class='btn-box'><div class='false'>取消</div><div class='true'><span>修改</span></div></div></div>";
        $("#mask").append($(str));

        $("#wc-res").css({backgroundColor: DATA.user.wordColor}).click(function () {
            colorSelect(function (res) {
                res = colorTrans(res);
                $("#w-color").val(res);
                $("#wc-res").css({backgroundColor: res});
            });
        });
        $("#w-color").blur(function () {
            let c = $(this).val();
            $("#wc-res").css({backgroundColor: c});
        });
        $("#blur").change(function () {
            let v = $(this).val();
            $(this).next("txt").html(v);
        });
        $("#b-img").click(function () {
            if (!$(this).hasClass("form-this")) atBackImg();
        });
        $("#b-color").click(function () {
            if (!$(this).hasClass("form-this")) atBackColor();
        });
        if (DATA.user.wallType) atBackImg();
        else atBackColor();

        $("#diyBox div.false").click(function () {
            $("#diyBox").remove();
            maskChange(false);
        });
        $("#diyBox div.true").click(function () {
            let pra = {
                wallFilter: $("#blur").val(),
                wordColor: $("#w-color").val(),
                wallType: $("#b-img").hasClass("form-this"),
            };
            if (pra.wallType) pra.wallPaper = $("#img-url").val();
            else pra.wallColor = $("#backColor").val();
            updateUser(pra);
            $("#diyBox").remove();
            maskChange(false);
        });
    }

    function atBackImg() {
        $("#b-color").removeClass("form-this");
        $("#b-img").addClass("form-this");
        let str = "<div class='input-box'><input id='img-url' type='text' value='" + DATA.user.wallPaper + "' required><label>URL</label></div>" +
            "<img id='img-res' src='" + DATA.user.wallPaper + "' alt='wallpaper'><div id='backImgBox'></div>";
        $("#backBox").empty().append($(str));

        // 添加static图像
        for (let i = 0; i < 10; i++) {
            let one = "<img src='https://images.tinger.host/paper-" + i + ".png' alt='" + i + "'>";
            $("#backImgBox").append($(one));
        }
        $("#img-url").blur(function () {
            let u = $(this).val();
            $("#img-res").attr({src: u});
        });
        $("#backImgBox>img").click(function () {
            let u = "https://images.tinger.host/paper-" + $(this).attr("alt") + ".png";
            $("#img-url").val(u);
            $("#img-res").attr({src: u});
        });
    }

    function atBackColor() {
        $("#b-img").removeClass("form-this");
        $("#b-color").addClass("form-this");
        let str = "<div class='colorInputBox'><div class='input-box'><input id='backColor' type='text' maxlength='128' value='" + DATA.user.wallColor + "' required>" +
            "<label>背景色</label></div><div id='bc-res'></div></div>";
        $("#backBox").empty().append($(str));

        $("#backColor").blur(function () {
            let c = $(this).val();
            $("#bc-res").css({backgroundColor: c});
        });
        $("#bc-res").css({backgroundColor: DATA.user.wallColor}).click(function () {
            colorSelect(function (res) {
                res = colorTrans(res);
                $("#backColor").val(res);
                $("#bc-res").css({backgroundColor: res});
            });
        });
    }

    function colorTrans(obj = {r: 0, g: 0, b: 0, a: 1}) {
        return "rgba(" + obj.r + ", " + obj.g + ", " + obj.b + ", " + obj.a + ")";
    }

    function colorSelect(callback, color = {r: 100, g: 100, b: 100, a: 1}) {
        maskChange();

        function colorFix(obj = {r: 0, g: 0, b: 0, a: 1}) {
            return "rgb(" + (255 - obj.r) + ", " + (255 - obj.g) + ", " + (255 - obj.b) + ")";
        }

        let rgb = colorTrans(color);
        let wgb = colorFix(color);
        let str = "<div id='colorBox'><h3>调色板</h3>" +
            "<cline><input type='range' id='cr' min='0' step='1' max='255' value='" + color.r + "' /><cval>" + color.r + "</cval></cline>" +
            "<cline><input type='range' id='cg' min='0' step='1' max='255' value='" + color.g + "' /><cval>" + color.g + "</cval></cline>" +
            "<cline><input type='range' id='cb' min='0' step='1' max='255' value='" + color.b + "' /><cval>" + color.b + "</cval></cline>" +
            "<cline><input type='range' id='ca' min='0' step='0.01' max='1' value='" + color.a + "' /><cval>" + color.a + "</cval></cline>" +
            "<cres></cres><div class='btn-box'><div class='false'>取消</div><div class='true'><span>确认</span></div></div></div>";
        $("#mask").append($(str));
        $("cres").css({backgroundColor: rgb, color: wgb}).html(rgb);
        $("#cr, #cg, #cb, #ca").change(function () {
            let k = $(this).attr("id")[1];
            let v = $(this).val();
            $(this).next("cval").html(v);
            color[k] = v;
            let nc = colorTrans(color);
            let wc = colorFix(color);
            $("cres").css({backgroundColor: nc, color: wc}).html(nc);
        });
        $("#colorBox div.false").click(function () {
            $("#cr, #cg, #cb, #ca").val("");
            $("#colorBox").remove();
            maskChange(false);
        });
        $("#colorBox div.true").click(function () {
            $("#cr, #cg, #cb, #ca").val("");
            $("#colorBox").remove();
            callback(color);
            maskChange(false);
        });

        // 拖动
        let dragging = false;
        let pra = {};
        $("#colorBox").mousedown(function (env) {
            pra.X = env.pageX - $(this).offset().left;
            pra.Y = env.pageY - $(this).offset().top;
            dragging = pra.Y < 40 && pra.Y > 0;
        }).mouseup(function () {
            dragging = false;
        }).mousemove(function (env) {
            if (dragging)
                $(this).css({top: env.pageY - pra.Y + "px", left: env.pageX - pra.X + "px"});
        });
    }

    function modifyUser() {
        maskChange();
        let str = "<div id='userForm'><h2>个人信息修改</h2>" +
            "<div class='input-box'><input type='text' maxlength='32' id='user-nick' value='" + DATA.user.nick + "' required><label>昵称</label></div>" +
            "<div class='input-box'><input type='text' id='user-avatar' value='" + DATA.user.header + "' required><label>头像</label></div>" +
            "<img id='h-res' src='" + DATA.user.header + "' alt='avatar'><div id='h-box'></div>" +
            "<div class='btn-box'><div class='false'>取消</div><div class='true'><span>修改</span></div></div></div>";
        $("#mask").append($(str));

        for (let i = 0; i < 10; i++) {
            let one = "<img src='https://images.tinger.host/avatar-" + i + ".jpg' alt='" + i + "'>";
            $("#h-box").append($(one));
        }
        $("#user-avatar").blur(function () {
            let u = $(this).val();
            $("#h-res").attr({src: u});
        });
        $("#h-box>img").click(function () {
            let u = "https://images.tinger.host/avatar-" + $(this).attr("alt") + ".jpg";
            $("#user-avatar").val(u);
            $("#h-res").attr({src: u});
        });

        $("#userForm div.false").click(function () {
            $("#userForm").remove();
            maskChange(false);
        });
        $("#userForm div.true").click(function () {
            updateUser({
                nick: $("#user-nick").val(),
                header: $("#user-avatar").val()
            });
            $("#userForm").remove();
            maskChange(false);
        });
    }

    function eventListener() {
        // 差别监听：
        // diy page:
        $("#diy").click(function () {
            if (DATA.logged) pageDiy();
            else alert("Please login first!", false);
        });

        // self info:
        $("#update").click(function () {
            if (DATA.logged) modifyUser();
            else alert("Please login first!", false);
        });

        //login / logout:
        $("#inout").click(() => {
            if (DATA.logged) {
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

    function alert(msg, type = true) {
        maskChange();
        let the = $("#alert");
        if (the.length !== 1) {
            the = $("<div id='alert'><p>" + msg + "</p><img src='/static/img/icon/close.png' alt='close'></div>");
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