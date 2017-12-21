import { Action, Tween } from 'canvas2djs';
/**
 * 需要记录的历史速度的最大次数。
 */
const MAX_VELOCITY_COUNT = 4;
/**
 * 记录的历史速度的权重列表。
 */
const VELOCITY_WEIGHTS: number[] = [1, 1.33, 1.66, 2];
/**
 * 当前速度所占的权重。
 */
const CURRENT_VELOCITY_WEIGHT = 2.33;
/**
 * 最小的改变速度，解决浮点数精度问题。
 */
const MINIMUM_VELOCITY = 0.02;
/**
 * 当容器自动滚动时要应用的摩擦系数
 */
const FRICTION = 0.998;
/**
 * 当容器自动滚动时并且滚动位置超出容器范围时要额外应用的摩擦系数
 */
const EXTRA_FRICTION = 0.95;
/**
 * 摩擦系数的自然对数
 */
const FRICTION_LOG = Math.log(FRICTION);

export class TouchScroll {

    private offsetPos: number = 0;
    private currentPos: number = 0;
    private previousPos: number = 0;
    private maxScrollPos: number = 0;
    private previousTime: number = 0;
    private velocity: number = 0;
    private previousVelocity: number[] = [];

    private timerId: number;

    private _currScrollPos: number = 0;
    private get currScrollPos() {
        return this._currScrollPos;
    }

    private action: Action;

    public bounce: boolean = true;
    public scrollFactor: number = 1;

    private set currScrollPos(value: number) {
        this._currScrollPos = value;
        if (this.onUpdate) {
            this.onUpdate(this._currScrollPos);
        }
    }

    constructor(
        private onUpdate: (scrollPos: number) => any,
        private onEnded: () => any
    ) {

    }

    public start(position: number) {
        this.stop();
        this.offsetPos = position;
        this.currentPos = this.previousPos = position;
        this.previousTime = Date.now();
        this.previousVelocity.length = 0;
        this.startTick();
    }

    public stop() {
        if (this.action) {
            this.action.stop();
            this.action = null;
        }
        this.velocity = 0;
        this.stopTick();
    }

    public release() {
        this.stop();
        this.onUpdate = this.onEnded = null;
    }

    public update(touchPos: number, maxScrollPos: number, scrollValue: number) {
        maxScrollPos = Math.max(0, maxScrollPos);
        this.currentPos = touchPos;
        this.maxScrollPos = maxScrollPos;

        let disMove = this.offsetPos - touchPos;
        let scrollPos = disMove + scrollValue;

        this.offsetPos = touchPos;

        if (scrollPos < 0) {
            if (!this.bounce) {
                scrollPos = 0;
            }
            else {
                scrollPos -= disMove * 0.5;
            }
        }
        if (scrollPos > maxScrollPos) {
            if (!this.bounce) {
                scrollPos = maxScrollPos;
            }
            else {
                scrollPos -= disMove * 0.5;
            }
        }
        this.currScrollPos = scrollPos;
    }

    public finish(currScrollPos: number, maxScrollPos: number) {
        this.stopTick();

        let sum = this.velocity * CURRENT_VELOCITY_WEIGHT;
        let prevVelocityX = this.previousVelocity;
        let length = this.previousVelocity.length;
        let totalWeight = CURRENT_VELOCITY_WEIGHT;

        for (let i = 0; i < length; i++) {
            let weight = VELOCITY_WEIGHTS[i];
            sum += prevVelocityX[i] * weight;
            totalWeight += weight;
        }

        let pixelsPerMS = sum / totalWeight;
        let absPixelsPerMS = Math.abs(pixelsPerMS);
        let duration = 0;
        let posTo = 0;

        if (absPixelsPerMS > MINIMUM_VELOCITY) {
            posTo = currScrollPos + (pixelsPerMS - MINIMUM_VELOCITY) / FRICTION_LOG * 2 * this.scrollFactor;
            if (posTo < 0 || posTo > maxScrollPos) {
                posTo = currScrollPos;
                while (Math.abs(pixelsPerMS) > MINIMUM_VELOCITY) {
                    posTo -= pixelsPerMS;
                    if (posTo < 0 || posTo > maxScrollPos) {
                        pixelsPerMS *= FRICTION * EXTRA_FRICTION;
                    }
                    else {
                        pixelsPerMS *= FRICTION;
                    }
                    duration += 1;
                }
            }
            else {
                duration = Math.log(MINIMUM_VELOCITY / absPixelsPerMS) / FRICTION_LOG;
            }
        }
        else {
            posTo = currScrollPos;
        }

        if (duration > 0) {
            if (!this.bounce) {
                if (posTo < 0) {
                    posTo = 0;
                }
                else if (posTo > maxScrollPos) {
                    posTo = maxScrollPos;
                }
            }
            this.throwTo(posTo, duration);
        }
        else {
            this.finishScrolling();
        }
    }

    private onTick() {
        let now = Date.now();
        let timeOffset = now - this.previousTime;
        if (timeOffset > 10) {
            let previousVelocity = this.previousVelocity;
            if (previousVelocity.length >= MAX_VELOCITY_COUNT) {
                previousVelocity.shift();
            }
            this.velocity = (this.currentPos - this.previousPos) / timeOffset;
            previousVelocity.push(this.velocity);
            this.previousTime = now;
            this.previousPos = this.currentPos;
        }
        this.startTick();
    }

    private throwTo(posTo: number, duration: number) {
        let currScrollPos = this._currScrollPos;
        if (currScrollPos === posTo) {
            return this.onEnded();
        }
        if (this.action) {
            this.action.stop();
        }

        this.action = new Action(this).to({
            currScrollPos: {
                dest: posTo,
                easing: easeOut
            }
        }, duration / 1000).then(() => {
            this.action = null;
            this.finishScrolling();
        }).start();
    }

    private finishScrolling() {
        let posTo = this._currScrollPos;
        let maxScrollPos = this.maxScrollPos;
        if (posTo < 0) {
            posTo = 0
        }
        else if (posTo > maxScrollPos) {
            posTo = maxScrollPos;
        }
        this.throwTo(posTo, 300);
    }

    private startTick() {
        this.stopTick();
        this.timerId = setTimeout(() => this.onTick());
    }

    private stopTick() {
        clearTimeout(this.timerId);
        this.timerId = null;
    }
}

function easeOut(ratio: number): number {
    let invRatio: number = ratio - 1.0;
    return invRatio * invRatio * invRatio + 1;
}