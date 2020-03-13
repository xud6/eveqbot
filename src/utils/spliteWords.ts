import { without, words, uniq } from "lodash";

export function spliteWords(str: string) {
    return uniq(without(words(str, /(\d+)|(\w+)|[^(?:,&\u000A\u000B\u000C\u000D\u0085\u2028\u2029)]/g), ' '))
}