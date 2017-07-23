/// <reference path="../../declarations/index.d.ts" />
/// <reference types="canvas2djs" />

namespace Example {

    canvas2dUI.StyleManager.registerStyleMap("common", {
        title: {
            fontSize: 40,
            fontColor: 0xfff,
            fontWeight: "bold",
            autoResizeWidth: true,
            alignX: canvas2d.AlignType.CENTER,
            top: 30,
        } as canvas2d.TextProps
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
        } as canvas2dUI.AutoResizeViewProps,
        box: {
            width: 100,
            height: 100,
            bgColor: 0xf00,
        } as canvas2d.SpriteProps,
    });

    canvas2dUI.StyleManager.registerStyleMap("alert-layer", {
        bg: {
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            bgColor: 'rgba(0,0,0,0.7)'
        } as canvas2d.SpriteProps,
        container: {
            width: 400,
            height: 200,
            alignX: canvas2d.AlignType.CENTER,
            alignY: canvas2d.AlignType.CENTER,
            borderColor: 0xfff,
            borderWidth: 2,
        } as canvas2d.SpriteProps,
        message: {
            percentWidth: 0.8,
            alignX: canvas2d.AlignType.CENTER,
            top: 50,
            fontColor: 0xf00,
            fontSize: 24,
        } as canvas2d.TextProps,
        btn: {
            width: 150,
            height: 60,
            alignX: canvas2d.AlignType.CENTER,
            bottom: 20,
            borderColor: 0xfff,
            borderWidth: 2,
        } as canvas2d.SpriteProps,
        btnlabel: {
            percentWidth: 0.9,
            alignX: canvas2d.AlignType.CENTER,
            alignY: canvas2d.AlignType.CENTER,
            fontSize: 20,
            fontColor: 0xfff,
        } as canvas2d.TextProps,
    });

    canvas2dUI.StyleManager.registerStyleMap("loading-scene", {
        bg: {
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            bgColor: 0x000,
        } as canvas2d.SpriteProps,
        progressbg: {
            width: 400,
            height: 20,
            borderColor: 0xfff,
            borderWidth: 3,
            alignX: canvas2d.AlignType.CENTER,
            bottom: 100,
        } as canvas2d.SpriteProps,
        progressbar: {
            alignY: canvas2d.AlignType.CENTER,
            left: 2,
            bgColor: 0xff0,
            height: 16,
        } as canvas2d.SpriteProps
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
        } as canvas2d.SpriteProps,
        redbox: {
            bgColor: 0xf00,
        } as canvas2d.SpriteProps,
        whitebox: {
            bgColor: 0xfff,
        } as canvas2d.SpriteProps,
        title: {
            autoResizeWidth: true,
            alignY: canvas2d.AlignType.CENTER,
            alignX: canvas2d.AlignType.CENTER,
            fontSize: 20,
        } as canvas2d.TextProps,
        redtitle: {
            fontColor: 0xf00,
        } as canvas2d.TextProps,
        whitetitle: {
            fontColor: 0xfff,
        } as canvas2d.TextProps,
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
        } as canvas2dUI.ActionStyle,
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
        } as canvas2dUI.ActionStyle,
    });
}