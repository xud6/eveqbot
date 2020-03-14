import { CQEvent, CQTag } from "@xud6/cq-websocket";
import { toInteger, find, toString } from "lodash";

export interface tMessageInfo {
    message: string
    message_id: number
    message_type: string
    group_id: number | null
    discuss_id: number | null
    atMe: boolean
    sender_user_id: number
    sender_nickname: string
    sender_card: string | null
    sender_area: string | null
    sender_level: string | null
    sender_role: string | null
    sender_title: string | null
    self_id: number
    time: number
    sub_type: string | null
    anonymous: any

}

export function genMessageInfoAtMe(event: CQEvent, context: Record<string, any>, tags: CQTag[]): boolean {
    let self_id = toInteger(context.self_id);
    let at = find(tags, function (tag) {
        if (tag.tagName === "at") {
            if (tag.data.qq === self_id) {
                return true
            }
        }
        return false
    })
    if (at) {
        return true
    } else {
        return false
    }
}

export function genMessageInfo(event: CQEvent, context: Record<string, any>, tags: CQTag[]): tMessageInfo {
    return {
        message: toString(context.message),
        message_id: toInteger(context.message_id),
        message_type: toString(context.message_type),
        group_id: context.group_id ? toInteger(context.group_id) : null,
        discuss_id: context.discuss_id ? toInteger(context.discuss_id) : null,
        atMe: genMessageInfoAtMe(event, context, tags),
        sender_user_id: toInteger(context.sender.user_id),
        sender_nickname: toString(context.sender.nickname),
        sender_card: context.sender.card ? toString(context.sender.card) : null,
        sender_area: context.sender.area ? toString(context.sender.area) : null,
        sender_level: context.sender.level ? toString(context.sender.level) : null,
        sender_role: context.sender.role ? toString(context.sender.role) : null,
        sender_title: context.sender.title ? toString(context.sender.title) : null,
        self_id: toInteger(context.self_id),
        time: toInteger(context.time),
        sub_type: context.sub_type ? toString(context.sub_type) : null,
        anonymous: context.anonymous ? context.anonymous : null
    }
}
