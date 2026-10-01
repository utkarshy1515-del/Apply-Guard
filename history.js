import { getApplications, removeApplication } from "./storage.js";
import { formatAppliedDate } from "./url-utils.js";

const list = document.querySelector("#list");
const search = document.querySelector("#search");
let applications = [];

function render() {
  const query = search.value.trim().toLowerCase();
  const filtered = applications.filter((item) => `${item.role} ${item.company}`.toLowerCase().includes(query));
  document.querySelector("#count").textContent = `${applications.length} application${applications.length === 1 ? "" : "s"}`;
  list.replaceChildren();
  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = applications.length ? "No matching applications." : "No applications saved yet. Mark one from the extension popup.";
    list.append(empty);
    return;
  }
  for (const item of filtered) {
    const card = document.createElement("article");
    card.className = "history-item";
    const text = document.createElement("div");
    const title = document.createElement("h2"); title.textContent = item.role;
    const company = document.createElement("p"); company.textContent = item.company;
    text.append(title, company);
    const date = document.createElement("time"); date.dateTime = item.appliedAt; date.textContent = formatAppliedDate(item.appliedAt, true);
    const actions = document.createElement("div"); actions.className = "item-actions";
    const link = document.createElement("a"); link.href = item.url; link.target = "_blank"; link.rel = "noreferrer"; link.textContent = "Open job";
    const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "Remove";
    remove.addEventListener("click", async () => { applications = await removeApplication(item.id); render(); });
    actions.append(link, remove); card.append(text, date, actions); list.append(card);
  }
}

search.addEventListener("input", render);
applications = await getApplications();
render();
