export type AnyFunction = (...args: any[]) => any;

export interface Timer {
  start: () => Date;
  stop: () => Date;
  time: () => number;
}

export interface Timeout extends NodeJS.Timeout {
  _idleStart: number;
  _idleTimeout: number;
}

export enum Time {
  Second = 1000,
  Minute = Second * 60,
  Hour = Minute * 60,
  Day = Hour * 24,
}

/**
 * Returns remaining time for setTimeout.
 *
 * @param   {Timeout} timeout - Reference to timeout object.
 * @returns {number}
 */
export const getRemainingTimeout = ({ _idleStart, _idleTimeout }: Timeout): number => {
  const timeout: number = Math.ceil((_idleStart + _idleTimeout) / 1000 - process.uptime());
  return timeout >= 0 ? timeout : 0;
};

/**
 * Adds indentation to a multiline string.
 *
 * @param   {string} str    - string to format
 * @param   {number} indent - indent size
 * @returns {string}
 */
export const multilineIndent = (str: string, indent: number = 1): string => {
  if (str.indexOf('\n') === -1) {
    return str;
  }

  const indentSize: number = indent < 1 ? 1 : indent;
  const space: string = Array.from({ length: indentSize }, () => ' ').join('');

  return str
    .split('\n')
    .map(line => space + line)
    .join('\n');
};

/**
 * Returns plural form of a string if a pluralize is not 1 or true.
 *
 * @param   {string} str - string to format
 * @param   {boolean | number} pluralize - number or boolean to check
 * @returns {string}
 */
export const pluralizeIf = (str: string, pluralize: boolean | number): string =>
  pluralize === false || pluralize === 1
    ? str
    : `${str}s`;

/**
 * Provides an interface that calculates the time in ms between a start and end
 * time.
 *
 * @returns {Timer}
 */
export const timer = (): Timer => {
  let startDate: Date = null;
  let totalTime: number = 0;

  return {
    start: (): Date => {
      startDate = new Date();
      return startDate;
    },
    stop: (): Date => {
      const endDate: Date = new Date();

      if (startDate) {
        totalTime = endDate.getTime() - startDate.getTime();
      }

      return endDate;
    },
    time: (): number => totalTime,
  };
};

export const msConvert = (ms: number, format: keyof typeof Time): number =>
  ms / Time[format];
