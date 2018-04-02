import { Utility } from './Utility';

const GlobalName = "$global";
const EventName = "$event";
const ElementName = "$element";
const ContextName = "this";

const reservedKeywords: Array<string> = [
    'break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete', 'do',
    'else', 'finally', 'for', 'function', 'if', 'in', 'instanceof', 'new', 'return',
    'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while',
    'class', 'null', 'undefined', 'true', 'false', 'with', EventName, ElementName, GlobalName,
    'let', 'abstract', 'import', 'yield', 'arguments'
];

const normalExpGetter: { [exp: string]: Function } = {};
const interpolationExpGetter: { [exp: string]: Function } = {};
const identifierCache: { [exp: string]: { formated: string, identifiers: string[] } } = {};

const reIdentifier = /("|').*?\1|[a-zA-Z$_][a-z0-9A-Z$_]*/g;
const reInterpolation = /\{\{((.|\n)+?)\}\}/g;
const reBrackets = /^\([^)]*\)/;
const reObjectKey = /[{,]\s*$/;
const reColon = /^\s*:/;
const reAnychar = /\S+/;

function isObjectKey(str: string): boolean {
    return str.match(reObjectKey) != null;
}

function isColon(str: string): boolean {
    return str.match(reColon) != null;
}

function isCallFunction(str: string): boolean {
    return str.match(reBrackets) != null;
}

function parseIdentifier(str: string) {
    let cache = identifierCache[str];

    if (!cache) {
        let index = 0;
        let identifiers = [];

        let formated = str.replace(reIdentifier, function (x, p, i) {
            if (p === '"' || p === "'" || str[i - 1] === '.' || (x[0] === 'x' && str[i - 1] === '0')) {
                // 如果是字符串: "aaa"
                // 或对象的属性: .aaa
                index = i + x.length;
                return x;
            }

            let prevStr = str.slice(index, i);     // 前一个字符
            let nextStr = str.slice(i + x.length); // 后一个字符
            index = i + x.length;

            if (isColon(nextStr) && isObjectKey(prevStr)) {
                // 如果前一个字符是冒号，再判断是否是对象的Key
                return x;
            }

            if (reservedKeywords.indexOf(x) > -1) {
                // 如果是保留关键字直接返回原字符串
                return x;
            }

            // if (isCallFunction(nextStr)) {
            //     // 如果后面有连续的字符是一对括号则为方法调用
            //     // method(a) 会转成 this.method(a)
            //     return contextName + '.' + x;
            // }

            if (identifiers.indexOf(x) < 0) {
                // 标记未添加到列表
                identifiers.push(x);
            }

            // 否则为属性访问， 直接加上下文
            // a 转成  this.a
            return ContextName + '.' + x;
        });

        cache = {
            formated,
            identifiers
        };

        identifierCache[str] = cache;
    }

    return cache;
}

function createFunction(expression, ...args: Array<string>): any {
    try {
        return Function.apply(Function, args);
    }
    catch (err) {
        Utility.error(`Error in parsing expression "${expression}":\n`, args[args.length - 1]);
    }
}

function fixExpression(exp: string) {
    return exp.trim().replace(/\r\n/g, ' ');
}

export class ExpParser {

    private static normalExpGetter = normalExpGetter;
    private static interpolationExpGetter = interpolationExpGetter;

    public static registerParsedExp(map: { normal: { [exp: string]: Function }, interpolation: { [exp: string]: Function } }) {
        if (map.normal) {
            Object.keys(map.normal).forEach(exp => {
                let fn = map.normal[exp];
                if (!normalExpGetter[exp] && fn != null) {
                    normalExpGetter[exp] = fn;
                }
            });
        }
        if (map.interpolation) {
            Object.keys(map.interpolation).forEach(exp => {
                let fn = map.interpolation[exp];
                if (!interpolationExpGetter[exp] && fn != null) {
                    interpolationExpGetter[exp] = fn;
                }
            });
        }
    }

    public static parseNormalExp(expression: string): Function {
        if (!(typeof expression === 'string' && reAnychar.test(expression))) {
            Utility.error(`[parseNormalExp]Invalid expression, empty string "${expression}"`);
            return;
        }

        expression = fixExpression(expression);
        let fn = normalExpGetter[expression];

        if (!fn) {
            let detail = parseIdentifier(expression);
            let fnBody = `try{${detail.formated.trim().match(';$') ? detail.formated : "return (" + detail.formated + ");"}}catch(e){}`;

            fn = createFunction(expression, EventName, ElementName, GlobalName, fnBody);
            normalExpGetter[expression] = fn;
        }

        return fn;
    }

    public static parseInterpolationExp(expression: string): Function {
        console.assert(this.hasInterpolation(expression), `[parseInterpolationToGetter] error`, expression);

        expression = fixExpression(expression);
        let getter = interpolationExpGetter[expression];

        if (!getter) {
            let tokens = [];
            let index = 0;
            let length = expression.length;
            expression.replace(reInterpolation, ($0, exp, $2, i) => {
                if (i > index) {
                    tokens.push(`"${expression.slice(index, i).split(/\r\n/).join('"+"')}"`);
                }
                tokens.push(parseIdentifier(exp.trim()).formated);
                index = i + $0.length;

                return $0;
            });

            if (index < length && index !== 0) {
                tokens.push(`"${expression.slice(index).split(/\r\n/).join('"+"')}"`);
            }

            if (!tokens.length) {
                return;
            }

            let fnBody = "try{return (" + tokens.join('+') + ")}catch(e){}";
            getter = interpolationExpGetter[expression] = createFunction(expression, EventName, ElementName, GlobalName, fnBody);
        }

        return getter;
    }

    public static hasInterpolation(str: string): boolean {
        return typeof str === 'string' && str.match(reAnychar) !== null && str.match(reInterpolation) !== null;
    }

}