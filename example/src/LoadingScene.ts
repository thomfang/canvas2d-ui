/// <reference path="../../declarations/index.d.ts" />
/// <reference types="canvas2djs" />

namespace Example {

    @canvas2dUI.Component("LoadingScene")
    class LoadingScene {

        @canvas2dUI.Property(Number)
        loadedPercent: number;
    }

    @canvas2dUI.Component("AlertLayer")
    class AlertLayer implements canvas2dUI.IComponent {

        @canvas2dUI.Property(String)
        message: string;

        @canvas2dUI.Property(Boolean)
        visible: boolean = true;

        emitter = new canvas2d.EventEmitter();

        onclick() {
            this.visible = false;
            this.emitter.emit("confirm", { message: "click alert layer button" });
        }

    }

    @canvas2dUI.Component("MainScene")
    class MainScene implements canvas2dUI.IComponentWithRouter {

        onEnter(state: canvas2dUI.RouterState) {
            // console.log(state.params.id);
            console.log(
                canvas2dUI.WeakRef.get("alertLayer", this),
                canvas2dUI.WeakRef.get("box", this),
            )
        }

        @canvas2dUI.Property()
        title = "canvas2dUI";

        @canvas2dUI.Property(String)
        message: string = "world";

        @canvas2dUI.Property(Number)
        count = 0;

        @canvas2dUI.Property(String)
        alertMessage: string = "This is an alert layer.";

        @canvas2dUI.Property(Boolean)
        alertVisible: boolean = false;

        toggle() {
            this.count += 1;
            this.alertVisible = !this.alertVisible;
        }

        show(message: string) {
            // alert(message);
        }
    }

    @canvas2dUI.Component("TestScene")
    class TestScene {

        @canvas2dUI.Property()
        alertMessage = "This is a test scene";

        @canvas2dUI.Property(Array)
        arr = [3, 2, 1];

        @canvas2dUI.Property(Boolean)
        redBoxVisible = true;

        @canvas2dUI.Property(Number)
        layout = canvas2dUI.Layout.Horizontal;

        @canvas2dUI.Property(Number)
        margin = 5;

        removeList() {
            this.arr.splice(1, 1);
        }

        toggleLayout() {
            // if (this.layout === canvas2dUI.Layout.Horizontal) {
            //     this.layout = canvas2dUI.Layout.Vertical;
            // }
            // else {
            //     this.layout = canvas2dUI.Layout.Horizontal;
            // }
            this.margin += 1;
        }
    }


    export var app = new canvas2dUI.Application();
    app.createStage({
        canvas: document.getElementById("canvas") as HTMLCanvasElement,
        width: 1136,
        height: 640,
        orientation: canvas2d.Orientation.LANDSCAPE,
        autoAdjustCanvasSize: true,
        touchEnabled: true,
        mouseEnabled: true,
        scaleMode: canvas2d.ScaleMode.SHOW_ALL,
    })
    app.createLoadingScene({
        template: "loading-scene",
        component: "LoadingScene",
        resources: [{
            url: "loading-scene.html",
            type: canvas2dUI.ResourceType.HtmlTemplate
        }],
        onLoadStart: (loadingSceneComponent: LoadingScene) => {
            loadingSceneComponent.loadedPercent = 0;
        },
        onLoadingProgress: (loadingSceneComponent: LoadingScene, c, percent) => {
            loadingSceneComponent.loadedPercent = percent;
        }
    });
    app.setIndexUrl("/main/123");
    app.setVersion("1.0.0");
    app.registerRouter({
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
    app.start();
    // app.getStage().start();

    app.getStage().start(true);
    loop();

    function loop() {
        requestAnimationFrame(loop);
        canvas2d.Action.schedule(0.0167);
        app.getStage().step(0.0167);
        app.getStage().render();
    }
}