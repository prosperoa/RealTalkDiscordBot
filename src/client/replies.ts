import { InteractionReplyOptions } from "discord.js";
import { hideLinkEmbed, time } from "@discordjs/builders";
import { isEmpty } from "lodash";
import { stripIndents } from "common-tags";

import { RealTalkStats, RealTalkStatsCompact, StatementRecord } from "../db/models";
import { Config, getDisplayName, msConvert, nicknameMention, pluralize } from "../utils";

const DEV_MODE_LABEL: string = "`[DEVELOPMENT MODE]`";

export const withDevLabel = (message: string): string =>
  Config.IsDev
    ? DEV_MODE_LABEL + "\n" + message
    : message;

export const extractStatementContent = (formattedStatement: string): string => {
  if (!formattedStatement) {
    return formattedStatement;
  }

  const result: RegExpMatchArray = formattedStatement.match(/_"(.)*"_/);

  return result?.[0].replace("_\"", "").replace("\"_", "") ?? "";
};

const quietReply = (content: string): InteractionReplyOptions =>
  ({ content: withDevLabel(content), ephemeral: true });

const formatStatementUrl = (statement: StatementRecord): string =>
  statement.deletedAt
    ? "deleted on " + time(statement.deletedAt)
    : hideLinkEmbed(statement.url);

export default {

  internalError: (): InteractionReplyOptions =>
    quietReply("**#RealTalk**, an error occurred. \:grimacing:"),

  invalidStatementLength: (length: number): string =>
    withDevLabel(`**#RealTalk**, the statement must be ${length} characters or less`),

  noImagesFound: (topic: string): InteractionReplyOptions =>
    quietReply(`**#RealTalk**, no images found for topic "${topic}".`),

  noRealTalkingMe: (): InteractionReplyOptions =>
    quietReply("**#RealTalk**, you can't real talk the RealTalkBot!"),

  realTalkExists: (userId: string, url: string): string =>
    withDevLabel(`Yo, ${nicknameMention(userId)}, it's been **#RealTalk'd**: ${hideLinkEmbed(url)}`),

  realTalkHistory: (statements: StatementRecord[]): string =>
    withDevLabel(statements.map(statement => stripIndents`
      > **#RealTalk** ${getDisplayName(statement.accusedUserId)} said: _"${statement.content}"_.
      > (provided by ${getDisplayName(statement.userId)}) ${formatStatementUrl(statement)}`
    ).join("\n\n")),

  realTalkImageNoStatement: (userId: string): string =>
    withDevLabel(`${getDisplayName(userId)} has no #RealTalk statements.`),

  realTalkIsCap: ({ content, url, userId }: StatementRecord): string =>
    withDevLabel(stripIndents`**#RealTalk**, the following statement made by ${nicknameMention(userId)} is cap:
      _"${content}"_
      ${hideLinkEmbed(url)}`),

  realTalkNotInVoiceChat: (): InteractionReplyOptions =>
    quietReply("**#RealTalk**, you have to be in a voice chat to record a statement."),

  realTalkNoWitnesses: (): InteractionReplyOptions =>
    quietReply("**#RealTalk**, you need witnesses (online, in chat, and not deafened) to make a statement."),

  realTalkRecord: (userId: string, statement: string): string =>
    withDevLabel(stripIndents`**The following is provided under the terms of #RealTalk**
      Date: ${time(new Date())}
      ${nicknameMention(userId)}: _"${statement}"_`),

  realTalkEmojiReaction: (userId: string, message: string): string => {
    const label: string = `**${nicknameMention(userId)} used the #RealTalk emoji**`;

    return message.indexOf(DEV_MODE_LABEL) > -1
      ? DEV_MODE_LABEL + "\n" + message.replace(DEV_MODE_LABEL, label)
      : label + "\n" + message;
  },

  realTalkStats: (stats: RealTalkStats, totalStatements: number): string =>
    withDevLabel(stripIndents`**#RealTalk Stats**: ${totalStatements} Total Statements
      ${Object.keys(stats).map(userId => {
        const { uses, statements }: RealTalkStats["userId"] = stats[userId];

        let message: string = `> ${getDisplayName(userId)}: `;
        const usesPart: string = `${uses} ${pluralize("use", uses)}`;
        const percentagePart: string = `(${(statements / totalStatements * 100).toFixed(2)}%)`;
        const statementsPart: string = `${statements} ${pluralize("statement", statements)} ${percentagePart}`;

        if (uses && statements) {
          message += `${usesPart}, ${statementsPart}`;
        } else if (uses) {
          message += usesPart;
        } else {
          message += statementsPart;
        }

        return message;
      }).join("\n")}`),

  realTalkStatsCompact: ({ uniqueUsers, uses }: RealTalkStatsCompact): string =>
    withDevLabel(
      `**#RealTalk** has been used ${uses} ${pluralize("time", uses)} by ${uniqueUsers} ${pluralize("user", uniqueUsers)}`
    ),

  realTalkQuiz: (userId: string, statement: string, duration: number): string =>
    withDevLabel(stripIndents`
      Who's the type of person to say: _"${statement}"_?
      You have ${msConvert(duration, "Second")}s to respond in chat with: **#RealTalk @Username**
      _e.g. #RealTalk ${nicknameMention(userId)}_`),

  realTalkQuizActive: (duration: number): InteractionReplyOptions =>
    quietReply(`**#RealTalk** wait for the current quiz to end (${msConvert(duration, "Second")}s left).`),

  realTalkQuizEnd: (accusedUserId: string, userIds: string[]): string =>
    withDevLabel(stripIndents`
      ${isEmpty(userIds) ? "No one" : userIds.map(nicknameMention).join(", ")} got it right.
      ${nicknameMention(accusedUserId)} is the type of person that would say that tho...`),

  throttleCoolDown: (duration: number): InteractionReplyOptions =>
    quietReply(`**#RealTalk**, chill... ${msConvert(duration, "Second")}s left`),

};
