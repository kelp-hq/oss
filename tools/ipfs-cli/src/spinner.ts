// https://blog.bitsrc.io/build-colourful-command-line-spinners-in-nodejs-6b94ceab80a1
import { cursorTo } from 'node:readline';

/**
 * Super simple stdout on-line writier
 * @param initialMsg  -
 * @returns
 */
export default function spinner(initialMsg: string): { message: (message: string) => void; end: () => void } {
  cursorTo(process.stdout, 0);
  process.stdout.clearLine(0);
  process.stdout.write(initialMsg);

  function message(message: string): void {
    process.stdout.write('\x1B[?25l');

    cursorTo(process.stdout, 0);
    process.stdout.clearLine(0);
    process.stdout.write(`-> ${message}`);
  }
  return {
    message,
    end: () => {
      process.stdout.write('\n');
    }
  };
}
