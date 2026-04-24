import "dotenv/config";
import { DEFAULT_TASK, runLiveAgent, runScriptedReplay, type DemoEvent } from "./agent.js";

const args = process.argv.slice(2);
const scripted = args.includes("--scripted");
const task = args.filter((arg) => arg !== "--scripted").join(" ").trim() || DEFAULT_TASK;

const emit = async (event: DemoEvent) => {
  if (event.type === "status") {
    console.log(`\n[status] ${event.message}`);
    return;
  }
  if (event.type === "model-step") {
    console.log(`\n[model step ${event.step}]`);
    return;
  }
  if (event.type === "tool-call") {
    console.log(`\n$ ${event.command}`);
    if (event.stdout) console.log(event.stdout.trimEnd());
    if (event.stderr) console.error(event.stderr.trimEnd());
    console.log(`[exit ${event.exitCode}, ${event.durationMs}ms]`);
    return;
  }
  if (event.type === "final") {
    console.log("\n[final]");
    console.log(event.text);
    for (const file of event.snapshot.files) {
      console.log(`\n[${file.path.replace("/workspace/app/", "")}]`);
      console.log(file.content.trimEnd());
    }
    return;
  }
  if (event.type === "error") {
    console.error(`\n[error] ${event.message}`);
  }
};

if (scripted) {
  await runScriptedReplay(task, emit);
} else {
  await runLiveAgent(task, emit);
}
