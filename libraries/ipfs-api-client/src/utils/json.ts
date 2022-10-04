export {};
// https://github.com/moll/json-stringify-safe/blob/master/stringify.js

// export function stringify(
//   obj: any,
//   replacer: any,
//   spaces: string | number | undefined,
//   cycleReplacer: any
// ): string {
//   return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces);
// }

// export function serializer(
//   replacer: { call: (arg0: any, arg1: any, arg2: any) => any } | null,
//   cycleReplacer: { (key: any, value: any): string; call?: any } | null
// ) {
//   const stack: any[] = [],
//     keys: any[] = [];

//   if (cycleReplacer === null)
//     cycleReplacer = function (key: any, value: any) {
//       if (stack[0] === value) return '[Circular ~]';
//       return '[Circular ~.' + keys.slice(0, stack.indexOf(value)).join('.') + ']';
//     };

//   return function (key: any, value: any) {
//     if (stack.length > 0) {
//       const thisPos = stack.indexOf(this);
//       ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
//       ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
//       if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value);
//     } else stack.push(value);

//     return replacer === null ? value : replacer.call(this, key, value);
//   };
// }
