import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface Commit {
  hash: string;
  date: string;
  message: string;
  type: "added" | "fixed" | "improved" | "removed" | "other";
}

interface Version {
  version: string;
  date: string;
  changes: {
    type: "added" | "fixed" | "improved" | "removed";
    description: string;
  }[];
}

// Получаем последний тег версии
function getLatestVersion(): string {
  try {
    return execSync("git describe --tags --abbrev=0").toString().trim();
  } catch {
    return "1.0.0"; // Если тегов нет
  }
}

// Получаем коммиты с последнего тега
function getCommitsSinceLastTag(): Commit[] {
  const latestTag = getLatestVersion();
  const command = `git log ${latestTag}..HEAD --pretty=format:"%H|%ad|%s" --date=short`;

  try {
    const output = execSync(command).toString();
    return output
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [hash, date, message] = line.split("|");
        return {
          hash,
          date,
          message,
          type: getCommitType(message),
        };
      });
  } catch {
    return [];
  }
}

function getCommitType(message: string): Commit["type"] {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.startsWith("add:") || lowerMessage.includes("feat:")) {
    return "added";
  }
  if (lowerMessage.startsWith("fix:")) {
    return "fixed";
  }
  if (lowerMessage.startsWith("improve:") || lowerMessage.includes("perf:")) {
    return "improved";
  }
  if (lowerMessage.startsWith("remove:")) {
    return "removed";
  }
  return "other";
}

function generateChangelogContent(commits: Commit[]): string {
  if (commits.length === 0) return "";

  const latestVersion = getLatestVersion();
  const today = new Date().toISOString().split("T")[0];

  const changes = commits
    .filter((commit) => commit.type !== "other")
    .map((commit) => ({
      type: commit.type,
      description: commit.message.split(":")[1]?.trim() || commit.message,
    }));

  if (changes.length === 0) return "";

  const newVersion: Version = {
    version: latestVersion,
    date: today,
    changes,
  };

  // Читаем существующий changelog
  const changelogPath = path.join(__dirname, "../src/pages/ChangelogPage.tsx");
  const content = fs.readFileSync(changelogPath, "utf-8");

  // Находим массив changelog
  const changelogMatch = content.match(
    /export const changelog: ChangelogEntry\[] = \[([\s\S]*?)\];/
  );
  if (!changelogMatch) return "";

  // Добавляем новую версию в начало массива
  const newChangelogContent = content.replace(
    /export const changelog: ChangelogEntry\[] = \[([\s\S]*?)\];/,
    `export const changelog: ChangelogEntry[] = [
  {
    version: "${newVersion.version}",
    date: "${newVersion.date}",
    changes: [
      ${newVersion.changes
        .map(
          (change) => `{
        type: "${change.type}",
        description: "${change.description}",
      }`
        )
        .join(",\n      ")}
    ],
  },
  ${changelogMatch[1]}
];`
  );

  fs.writeFileSync(changelogPath, newChangelogContent);
  return "Changelog updated successfully!";
}

// Основная функция
function updateChangelog() {
  const commits = getCommitsSinceLastTag();
  const result = generateChangelogContent(commits);
  if (result) {
    console.log(result);
  } else {
    console.log("No changes to update in changelog");
  }
}

updateChangelog();
