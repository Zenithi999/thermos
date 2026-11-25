// New Year decorations (header lights, Santa hat on the logo, snow on the home banner)
// switch on by themselves for the holiday season and off again afterwards.
// Window: 15 November – 20 January, Ulaanbaatar time. Edit the dates here to change it.

const START = { month: 11, day: 15 };
const END = { month: 1, day: 20 };

export function isFestiveSeason(now = new Date()) {
  // read the calendar date as it is in Ulaanbaatar, whatever the server's timezone
  const [month, day] = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ulaanbaatar", month: "numeric", day: "numeric" })
    .formatToParts(now)
    .filter((p) => p.type === "month" || p.type === "day")
    .map((p) => Number(p.value));
  const afterStart = month > START.month || (month === START.month && day >= START.day);
  const beforeEnd = month < END.month || (month === END.month && day <= END.day);
  return afterStart || beforeEnd;
}
