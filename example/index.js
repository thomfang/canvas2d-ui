var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/// <reference path="../../declarations/index.d.ts" />
/// <reference types="canvas2djs" />
var Example;
(function (Example) {
    var LoadingScene = (function () {
        function LoadingScene() {
        }
        return LoadingScene;
    }());
    __decorate([
        canvas2dUI.Property(Number)
    ], LoadingScene.prototype, "loadedPercent", void 0);
    LoadingScene = __decorate([
        canvas2dUI.Component("LoadingScene")
    ], LoadingScene);
    var AlertLayer = (function () {
        function AlertLayer() {
            this.visible = true;
            this.emitter = new canvas2d.EventEmitter();
        }
        AlertLayer.prototype.onclick = function () {
            this.visible = false;
            this.emitter.emit("confirm", { message: "click alert layer button" });
        };
        return AlertLayer;
    }());
    __decorate([
        canvas2dUI.Property(String)
    ], AlertLayer.prototype, "message", void 0);
    __decorate([
        canvas2dUI.Property(Boolean)
    ], AlertLayer.prototype, "visible", void 0);
    AlertLayer = __decorate([
        canvas2dUI.Component("AlertLayer")
    ], AlertLayer);
    var MainScene = (function () {
        function MainScene() {
            this.title = "canvas2dUI";
            this.message = "world";
            this.count = 0;
            this.alertMessage = "This is an alert layer.";
            this.alertVisible = false;
        }
        MainScene.prototype.onEnter = function (state) {
            // console.log(state.params.id);
            console.log(canvas2dUI.WeakRef.get("alertLayer", this), canvas2dUI.WeakRef.get("box", this));
        };
        MainScene.prototype.toggle = function () {
            this.count += 1;
            this.alertVisible = !this.alertVisible;
        };
        MainScene.prototype.show = function (message) {
            // alert(message);
        };
        return MainScene;
    }());
    __decorate([
        canvas2dUI.Property()
    ], MainScene.prototype, "title", void 0);
    __decorate([
        canvas2dUI.Property(String)
    ], MainScene.prototype, "message", void 0);
    __decorate([
        canvas2dUI.Property(Number)
    ], MainScene.prototype, "count", void 0);
    __decorate([
        canvas2dUI.Property(String)
    ], MainScene.prototype, "alertMessage", void 0);
    __decorate([
        canvas2dUI.Property(Boolean)
    ], MainScene.prototype, "alertVisible", void 0);
    MainScene = __decorate([
        canvas2dUI.Component("MainScene")
    ], MainScene);
    var TestScene = (function () {
        function TestScene() {
            this.alertMessage = "This is a test scene";
            this.arr = [3, 2, 1];
            this.redBoxVisible = true;
            this.layout = canvas2dUI.Layout.Horizontal;
            this.margin = 5;
            this.num = 10;
        }
        TestScene.prototype.removeList = function () {
            this.arr.splice(1, 1);
        };
        TestScene.prototype.toggleLayout = function () {
            if (this.layout === canvas2dUI.Layout.Horizontal) {
                this.layout = canvas2dUI.Layout.Vertical;
            }
            else {
                this.layout = canvas2dUI.Layout.Horizontal;
            }
            this.margin += 1;
            this.num *= 10;
        };
        return TestScene;
    }());
    __decorate([
        canvas2dUI.Property()
    ], TestScene.prototype, "alertMessage", void 0);
    __decorate([
        canvas2dUI.Property(Array)
    ], TestScene.prototype, "arr", void 0);
    __decorate([
        canvas2dUI.Property(Boolean)
    ], TestScene.prototype, "redBoxVisible", void 0);
    __decorate([
        canvas2dUI.Property(Number)
    ], TestScene.prototype, "layout", void 0);
    __decorate([
        canvas2dUI.Property(Number)
    ], TestScene.prototype, "margin", void 0);
    __decorate([
        canvas2dUI.Property(Number)
    ], TestScene.prototype, "num", void 0);
    TestScene = __decorate([
        canvas2dUI.Component("TestScene")
    ], TestScene);
    Example.app = new canvas2dUI.Application();
    Example.app.createStage({
        canvas: document.getElementById("canvas"),
        width: 1136,
        height: 640,
        orientation: canvas2d.Orientation.LANDSCAPE,
        autoAdjustCanvasSize: true,
        touchEnabled: true,
        mouseEnabled: true,
        scaleMode: canvas2d.ScaleMode.SHOW_ALL,
    });
    Example.app.createLoadingScene({
        template: "loading-scene",
        component: "LoadingScene",
        resources: [{
                url: "loading-scene.html",
                type: canvas2dUI.ResourceType.HtmlTemplate
            }],
        onLoadStart: function (loadingSceneComponent) {
            loadingSceneComponent.loadedPercent = 0;
        },
        onLoadingProgress: function (loadingSceneComponent, c, percent) {
            loadingSceneComponent.loadedPercent = percent;
        },
    });
    Example.app.setIndexUrl("/main/123");
    Example.app.setVersion("1.0.0");
    Example.app.registerRouter({
        "/main/:id": {
            template: "main-scene",
            resources: [{
                    url: "main-scene.html",
                    type: canvas2dUI.ResourceType.HtmlTemplate
                }, {
                    url: "alert-layer.html",
                    type: canvas2dUI.ResourceType.HtmlTemplate
                }, {
                    url: "title.html",
                    type: canvas2dUI.ResourceType.HtmlTemplate,
                }],
            component: "MainScene"
        },
        "/test": {
            template: "test-scene",
            resources: [{
                    url: "test-scene.html",
                    type: canvas2dUI.ResourceType.HtmlTemplate
                }, {
                    url: "alert-layer.html",
                    type: canvas2dUI.ResourceType.HtmlTemplate
                }],
            component: "TestScene"
        }
    });
    Example.app.start();
    // app.getStage().start();
    Example.app.getStage().start(true);
    loop();
    function loop() {
        requestAnimationFrame(loop);
        canvas2d.Action.schedule(0.0167);
        Example.app.getStage().step(0.0167);
        Example.app.getStage().render();
    }
})(Example || (Example = {}));
/// <reference path="../../declarations/index.d.ts" />
/// <reference types="canvas2djs" />
var Example;
(function (Example) {
    canvas2dUI.StyleManager.registerStyleMap("common", {
        title: {
            fontSize: 40,
            fontColor: 0xfff,
            fontWeight: "bold",
            autoResizeWidth: true,
            alignX: canvas2d.AlignType.CENTER,
            top: 30,
        }
    });
    canvas2dUI.StyleManager.registerStyleMap("test-scene", {
        container: {
            marginLeft: 5,
            marginRight: 5,
            marginBottom: 5,
            marginTop: 5,
            bgColor: 0xfff,
            alignChild: canvas2d.AlignType.CENTER,
            layout: canvas2dUI.Layout.Vertical,
            right: 20,
            top: 20,
        },
        box: {
            width: 100,
            height: 100,
            bgColor: 0xf00,
        },
    });
    canvas2dUI.StyleManager.registerStyleMap("alert-layer", {
        bg: {
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            bgColor: 'rgba(0,0,0,0.7)'
        },
        container: {
            width: 400,
            height: 200,
            alignX: canvas2d.AlignType.CENTER,
            alignY: canvas2d.AlignType.CENTER,
            borderColor: 0xfff,
            borderWidth: 2,
        },
        message: {
            percentWidth: 0.8,
            alignX: canvas2d.AlignType.CENTER,
            top: 50,
            fontColor: 0xf00,
            fontSize: 24,
        },
        btn: {
            width: 150,
            height: 60,
            alignX: canvas2d.AlignType.CENTER,
            bottom: 20,
            borderColor: 0xfff,
            borderWidth: 2,
        },
        btnlabel: {
            percentWidth: 0.9,
            alignX: canvas2d.AlignType.CENTER,
            alignY: canvas2d.AlignType.CENTER,
            fontSize: 20,
            fontColor: 0xfff,
        },
    });
    canvas2dUI.StyleManager.registerStyleMap("loading-scene", {
        bg: {
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            bgColor: 0x000,
        },
        progressbg: {
            width: 400,
            height: 20,
            borderColor: 0xfff,
            borderWidth: 3,
            alignX: canvas2d.AlignType.CENTER,
            bottom: 100,
        },
        progressbar: {
            alignY: canvas2d.AlignType.CENTER,
            left: 2,
            bgColor: 0xff0,
            height: 16,
        }
    });
    canvas2dUI.StyleManager.registerStyleMap("main-scene", {
        bg: {
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            bgColor: 0x000,
        },
        box: {
            width: 200,
            height: 200,
            alignX: canvas2d.AlignType.CENTER,
            alignY: canvas2d.AlignType.CENTER,
        },
        redbox: {
            bgColor: 0xf00,
        },
        whitebox: {
            bgColor: 0xfff,
        },
        title: {
            autoResizeWidth: true,
            alignY: canvas2d.AlignType.CENTER,
            alignX: canvas2d.AlignType.CENTER,
            fontSize: 20,
        },
        redtitle: {
            fontColor: 0xf00,
        },
        whitetitle: {
            fontColor: 0xfff,
        },
        rotate: {
            startProps: {
                opacity: 1
            },
            queue: [{
                    type: canvas2d.ActionType.BY,
                    options: {
                        rotation: {
                            value: 360,
                            easing: canvas2d.Tween.linear
                        },
                    },
                    duration: 1
                }],
            repeatMode: canvas2d.ActionRepeatMode.REPEAT
        },
        fade: {
            startProps: {
                opacity: 0
            },
            queue: [{
                    type: canvas2d.ActionType.TO,
                    options: {
                        opacity: 1
                    },
                    duration: 0.5
                }],
            repeatMode: canvas2d.ActionRepeatMode.REVERSE_REPEAT,
        },
    });
})(Example || (Example = {}));
//# sourceMappingURL=index.js.map