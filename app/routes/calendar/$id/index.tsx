import {
  json,
  type MetaFunction,
  type LinksFunction,
  type LoaderArgs,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { UseDataFunctionReturn } from "@remix-run/react/dist/components";
import { Link } from "@remix-run/react/dist/components";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Avatar } from "~/components/Avatar";
import { LinkButton } from "~/components/Button";
import { Main } from "~/components/Main";
import { Section } from "~/components/Section";
import { db } from "~/db";
import { useIsMounted } from "~/hooks/useIsMounted";
import { useUser } from "~/modules/auth";
import { i18next } from "~/modules/i18n";
import {
  canEditCalendarEvent,
  canReportCalendarEventWinners,
} from "~/permissions";
import styles from "~/styles/calendar-event.css";
import { databaseTimestampToDate } from "~/utils/dates";
import { notFoundIfFalsy } from "~/utils/remix";
import { discordFullName, makeTitle } from "~/utils/strings";
import {
  calendarEditPage,
  calendarReportWinnersPage,
  resolveBaseUrl,
  userPage,
} from "~/utils/urls";
import { actualNumber, id } from "~/utils/zod";
import { Tags } from "../components/Tags";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = (args) => {
  const data = args.data as Nullable<UseDataFunctionReturn<typeof loader>>;

  if (!data) return {};

  return {
    title: data.title,
    description: data.event.description,
  };
};

export const handle = {
  i18n: "calendar",
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const t = await i18next.getFixedT(request);
  const parsedParams = z
    .object({ id: z.preprocess(actualNumber, id) })
    .parse(params);
  const event = notFoundIfFalsy(db.calendarEvents.findById(parsedParams.id));

  return json({
    event,
    badgePrizes: db.calendarEvents.findBadgesById(parsedParams.id),
    title: makeTitle([event.name, t("pages.calendar")]),
    results: db.calendarEvents.findResultsByEventId(parsedParams.id),
  });
};

export default function CalendarEventPage() {
  const user = useUser();
  const data = useLoaderData<typeof loader>();
  const { i18n } = useTranslation();
  const isMounted = useIsMounted();

  return (
    <Main className="stack lg">
      <section className="stack sm">
        <div className="event__times">
          {data.event.startTimes.map((startTime, i) => (
            <React.Fragment key={startTime}>
              <span
                className={clsx("event__day", {
                  hidden: data.event.startTimes.length === 1,
                })}
              >
                Day {i + 1}
              </span>
              <time dateTime={databaseTimestampToDate(startTime).toISOString()}>
                {isMounted
                  ? databaseTimestampToDate(startTime).toLocaleDateString(
                      i18n.language,
                      {
                        hour: "numeric",
                        minute: "numeric",
                        day: "numeric",
                        month: "long",
                        weekday: "long",
                      }
                    )
                  : null}
              </time>
            </React.Fragment>
          ))}
        </div>
        <div className="stack md">
          <div className="stack xs">
            <h2>{data.event.name}</h2>
            <Tags tags={data.event.tags} badges={data.badgePrizes} />
          </div>
          <div className="stack horizontal sm flex-wrap">
            {data.event.discordUrl ? (
              <LinkButton
                to={data.event.discordUrl}
                variant="outlined"
                tiny
                isExternal
              >
                Discord
              </LinkButton>
            ) : null}
            <LinkButton
              to={data.event.bracketUrl}
              variant="outlined"
              tiny
              isExternal
            >
              {resolveBaseUrl(data.event.bracketUrl)}
            </LinkButton>
            {canEditCalendarEvent({ user, event: data.event }) && (
              <LinkButton
                tiny
                to={calendarEditPage(data.event.eventId)}
                data-cy="edit-button"
              >
                Edit
              </LinkButton>
            )}
            {canReportCalendarEventWinners({
              user,
              event: data.event,
              startTimes: data.event.startTimes,
            }) && (
              <LinkButton
                tiny
                to={calendarReportWinnersPage(data.event.eventId)}
                data-cy="edit-button"
              >
                Report winners
              </LinkButton>
            )}
          </div>
        </div>
      </section>
      <Results />
      <Description />
    </Main>
  );
}

function Results() {
  const data = useLoaderData<typeof loader>();

  if (!data.results.length) return null;

  return (
    <Section title="Results" className="event__results-section">
      <div className="event__results-participant-count">
        {data.event.participantCount} teams participated
      </div>
      <table className="event__results-table">
        <thead>
          <tr>
            <th>Placement</th>
            <th>Name</th>
            <th>Members</th>
          </tr>
        </thead>
        <tbody>
          {data.results.map((result, i) => (
            <tr key={i}>
              <td className="text-center">{result.placement}</td>
              <td>{result.teamName}</td>
              <td>
                <ul className="event__results-players">
                  {result.players.map((player) => (
                    <li key={typeof player === "string" ? player : player.id}>
                      {typeof player === "string" ? (
                        player
                      ) : (
                        <Link
                          to={userPage(player.discordId)}
                          className="stack horizontal xs justify-center"
                        >
                          <Avatar
                            discordAvatar={player.discordAvatar}
                            discordId={player.discordId}
                            size="xxs"
                          />{" "}
                          {discordFullName(player)}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

function Description() {
  const data = useLoaderData<typeof loader>();

  return (
    <Section title="Description">
      <div className="stack sm">
        <div className="event__author">
          <Avatar
            discordAvatar={data.event.discordAvatar}
            discordId={data.event.discordId}
            size="xs"
          />
          {discordFullName(data.event)}
        </div>
        <div data-cy="event-description">{data.event.description}</div>
      </div>
    </Section>
  );
}
