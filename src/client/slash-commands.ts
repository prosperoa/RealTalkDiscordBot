import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

import { AnyFunction, logger } from "../utils";

export enum RealTalkCommand {
  RealTalk = "realtalk",
}

export enum RealTalkSubcommand {
  Chat = "chat",
  Convo = "convo",
  GenerateImage = "generate_image",
  History = "history",
  Image = "image",
  Quiz = "quiz",
  Record = "record",
  RemindMe = "remind_me",
  Stats = "stats",
  Updoots = "updoots",
}

export enum MessageComponentId {
  DeleteReminder = "delete_reminder",
}

const { CLIENT_ID, CLIENT_TOKEN, GUILD_ID }: NodeJS.ProcessEnv = process.env;
const rest: REST = new REST({ version: "9" }).setToken(CLIENT_TOKEN);

const realTalk = new SlashCommandBuilder()
  .setName(RealTalkCommand.RealTalk)
  .setDescription("#RealTalk?")
  .addSubcommand(subcommand =>
    subcommand
      .setName(RealTalkSubcommand.Record)
      .setDescription("Record a #RealTalk statement.")
      .addUserOption(option =>
        option
          .setName("who")
          .setDescription("Who they is?")
          .setRequired(true))
      .addStringOption(option =>
        option
          .setName("what")
          .setDescription("What they said?")
          .setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName(RealTalkSubcommand.Chat)
      .setDescription("What's good?")
      .addStringOption(option =>
        option
          .setName("message")
          .setDescription("What it is?")
          .setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName(RealTalkSubcommand.GenerateImage)
      .setDescription("[BETA] Generate an image and put it on cam.")
      .addStringOption(option =>
        option
          .setName("description")
          .setDescription("A detailed description")
          .setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName(RealTalkSubcommand.Convo)
      .setDescription("Quotes from two users, conversation style!")
      .addUserOption(option =>
        option
          .setName("user1")
          .setDescription("First user")
          .setRequired(true))
      .addUserOption(option =>
        option
          .setName("user2")
          .setDescription("Second user")))
  .addSubcommand(subcommand =>
    subcommand
      .setName(RealTalkSubcommand.History)
      .setDescription("List a history of them joints.")
      .addUserOption(option =>
        option
          .setName("user")
          .setDescription("user's history")))
  .addSubcommand(subcommand =>
    subcommand
      .setName(RealTalkSubcommand.Stats)
      .setDescription("Show me the stats."))
  .addSubcommand(subcommand =>
    subcommand
      .setName(RealTalkSubcommand.Quiz)
      .setDescription("Quiz us, pls."))
  .addSubcommand(subcommand =>
    subcommand
      .setName(RealTalkSubcommand.Image)
      .setDescription("Put it on cam.")
      .addUserOption(option =>
        option
          .setName("who")
          .setDescription("Who they is?"))
      .addStringOption(option =>
        option
          .setName("topic")
          .setDescription("Image topic"))
      .addBooleanOption(option =>
        option
          .setName("latest")
          .setDescription("Select latest quote?")))
  .addSubcommand(subcommand =>
    subcommand
      .setName(RealTalkSubcommand.Updoots)
      .setDescription("Show me some updooted content")
      .addUserOption(option =>
        option
          .setName("who")
          .setDescription("Who they is?")
          .setRequired(true)))
  .addSubcommand(subcommand =>
    subcommand
      .setName(RealTalkSubcommand.RemindMe)
      .setDescription("Set a reminder [BETA]")
      .addStringOption(option =>
        option
          .setName("time")
          .setDescription("When to remind you")
          .setRequired(true))
        .addStringOption(option =>
          option
            .setName("message")
            .setDescription("What to remind you about")
            .setRequired(true)));

const slashCommands = [
  realTalk,
].map(command => command.toJSON());

const init = async (cb?: AnyFunction): Promise<void> => {
  try {
    logger.info("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: slashCommands,
    });

    logger.info("Successfully reloaded application (/) commands.");

    cb?.();
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

export default { init };
