import { Utility } from './Utility';

const nameOfEvent = "$event";
const nameOfGlobal = "$global";
const nameOfElement = "$element";
const reInterpolation = /\{\{((.|\n)+?)\}\}/g;

export class Parser {

    public static parseToGetter(exp: string) {
        if (!/\S+/.test(exp)) {
            return Utility.error(`Invalid expression "${exp}" for parsing to a getter.`);
        }
        try {
            return new Function(`try{with(this) {return ${exp}}}catch(e){console.error(e)}`);
        } catch (e) {
            Utility.error(`Error parsing expression "${exp}" to a getter,`, e);
        }
    }

    public static parseToSetter(exp: string) {
        if (!/\S+/.test(exp)) {
            return Utility.error(`Invalid expression "${exp}" for parsing to a setter.`);
        }
        try {
            return new Function("__setterValue__", `try{with(this) {return ${exp} = __setterValue__}}catch(e){console.error(e)}`);
        } catch (e) {
            Utility.error(`Error parsing expression "${exp}" to a setter,`, e);
        }
    }

    public static hasInterpolation(str: string): boolean {
        return typeof str === 'string' && str.match(reInterpolation) !== null;
    }

    public static parseInterpolationToGetter(expression: string) {
        if (!this.hasInterpolation(expression)) {
            return Utility.error(`Expression "${expression} has no interpolation value."`);
        }

        let tokens = [];
        let index = 0;
        let str = expression.trim();
        let length = str.length;
        str.replace(reInterpolation, ($0, exp, $2, i) => {
            if (i > index) {
                tokens.push(`"${str.slice(index, i)}"`);
            }
            tokens.push(exp.trim());
            index = i + $0.length;

            return $0;
        });

        if (index < length && index !== 0) {
            tokens.push(`"${str.slice(index)}"`);
        }

        try {
            return new Function(`try{with(this) {return ${tokens.join('+')}}}catch(e){console.error(e)}`);
        } catch (e) {
            Utility.error(`Error parsing expression "${expression}" to an interpolation getter, `, e);
        }
    }

    public static parseToFunction(exp: string) {
        if (!/\S+/.test(exp)) {
            return Utility.error(`Invalid expression "${exp}" for parsing to a handler.`);
        }
        try {
            return new Function(nameOfGlobal, nameOfEvent, nameOfElement, `try{ with (this) { return ${exp} } } catch (e) { console.error(e) } `);
        } catch (e) {
            Utility.error(`Error parsing expression "${exp}" to a handler, `, e);
        }
    }
}