import { getHackathons } from "./lib/devpost";
import HackathonExplorer from "./components/HackathonExplorer";

export const revalidate = 21600;

export default async function Home() {
  let hackathons: Awaited<ReturnType<typeof getHackathons>> = [];
  try {
    hackathons = await getHackathons();
  } catch (err) {
    console.error("Failed to fetch hackathons from Devpost:", err);
  }

  return <HackathonExplorer initialHackathons={hackathons} fetchedAt={new Date().toISOString()} />;
}
