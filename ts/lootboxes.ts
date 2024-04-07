import { z } from "zod";

export {};

const envSchema = z.object({
  AUTHORIZATION: z.string(),
  X_SUPER_PROPERTIES: z.string(),
});
const env = envSchema.parse(Bun.env);

function getColoredText(text: any, ...colors: Color[]) {
  const colorsText = colors.map((color) => colorCodes[color]).join("");
  return String(colorsText) + text + colorCodes.reset;
}

function printColoredText(text: string, ...colors: Color[]) {
  console.log(getColoredText(text, ...colors));
}

type Color = keyof typeof colorCodes;

const colorCodes = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  fgBlack: "\x1b[30m",
  fgRed: "\x1b[31m",
  fgGreen: "\x1b[32m",
  fgYellow: "\x1b[33m",
  fgBlue: "\x1b[34m",
  fgMagenta: "\x1b[35m",
  fgCyan: "\x1b[36m",
  fgWhite: "\x1b[37m",
  fgGray: "\x1b[90m",
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
  bgGray: "\x1b[100m",
} as const;

function lootboxRequest() {
  return fetch("https://discord.com/api/v9/users/@me/lootboxes/open", {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9,de-DE;q=0.8,de;q=0.7",
      authorization: env.AUTHORIZATION!,
      "cache-control": "no-cache",
      pragma: "no-cache",
      "sec-ch-ua":
        '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-debug-options": "bugReporterEnabled",
      "x-discord-locale": "en-US",
      "x-discord-timezone": "Europe/Budapest",
      "x-super-properties": env.X_SUPER_PROPERTIES!,
      Referer: "https://discord.com/channels/@me",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: null,
    method: "POST",
  });
}

type LootboxData = {
  user_lootbox_data: {
    user_id: string;
    opened_items: Record<string, number>;
    redeemed_prize: boolean;
  };
  opened_item: string;
};

function printLootboxData(data: LootboxData) {
  const total = Object.values(data.user_lootbox_data.opened_items).reduce(
    (acc, v) => acc + v,
    0,
  );
  const formattedTotal =
    total % 10 === 0 ? getColoredText(`${total}`, "fgRed") : total;

  const items = Object.entries(data.user_lootbox_data.opened_items).sort(
    ([id1], [id2]) => Number(BigInt(id1) - BigInt(id2)),
  );
  const formattedItems = items
    .map(([id, count]) => {
      if (id === data.opened_item) {
        return getColoredText(count, "fgGreen");
      } else {
        return count;
      }
    })
    .join(" ");

  console.log(`Opened: ${formattedTotal}`);
  console.log(`Items: ${formattedItems}\n`);
}

async function openLootbox() {
  const res = await lootboxRequest();
  if (res.body && res.ok) {
    const resJson: LootboxData = await Bun.readableStreamToJSON(res.body!);
    printLootboxData(resJson);
  } else {
    console.error("Failed to open lootbox:", res.status, res.statusText, "\n");
  }
  setTimeout(openLootbox, 2000);
}

printColoredText("Starting lootbox opener", "fgBlack", "bgWhite");
openLootbox();
