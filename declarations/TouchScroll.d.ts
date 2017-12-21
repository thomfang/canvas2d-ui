export declare class TouchScroll {
    private onUpdate;
    private onEnded;
    private offsetPos;
    private currentPos;
    private previousPos;
    private maxScrollPos;
    private previousTime;
    private velocity;
    private previousVelocity;
    private timerId;
    private _currScrollPos;
    private currScrollPos;
    private action;
    bounce: boolean;
    scrollFactor: number;
    constructor(onUpdate: (scrollPos: number) => any, onEnded: () => any);
    start(position: number): void;
    stop(): void;
    release(): void;
    update(touchPos: number, maxScrollPos: number, scrollValue: number): void;
    finish(currScrollPos: number, maxScrollPos: number): void;
    private onTick();
    private throwTo(posTo, duration);
    private finishScrolling();
    private startTick();
    private stopTick();
}
