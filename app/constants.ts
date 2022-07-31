import allTags from "~/routes/calendar/tags.json";
import type { CalendarEventTag } from "./db/types";

export const TWEET_LENGTH_MAX_LENGTH = 280;
export const DISCORD_MESSAGE_MAX_LENGTH = 2000;

export const USER_BIO_MAX_LENGTH = DISCORD_MESSAGE_MAX_LENGTH;

export const PlUS_SUGGESTION_FIRST_COMMENT_MAX_LENGTH = 500;
export const PlUS_SUGGESTION_COMMENT_MAX_LENGTH = TWEET_LENGTH_MAX_LENGTH;

export const CALENDAR_EVENT_NAME_MIN_LENGTH = 2;
export const CALENDAR_EVENT_NAME_MAX_LENGTH = 100;
export const CALENDAR_EVENT_DESCRIPTION_MAX_LENGTH = DISCORD_MESSAGE_MAX_LENGTH;
export const CALENDAR_EVENT_DISCORD_INVITE_CODE_MAX_LENGTH = 50;
export const CALENDAR_EVENT_BRACKET_URL_MAX_LENGTH = 100;
export const CALENDAR_EVENT_MAX_AMOUNT_OF_DATES = 5;
export const CALENDAR_EVENT_TAGS = Object.keys(
  allTags
) as Array<CalendarEventTag>;

export const PLUS_TIERS = [1, 2, 3];

export const PLUS_UPVOTE = 1;
export const PLUS_DOWNVOTE = -1;

export const ADMIN_DISCORD_ID = "79237403620945920";

export const LOHI_TOKEN_HEADER_NAME = "Lohi-Token";
