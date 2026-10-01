import { addApplication, getApplications, removeApplication } from "./storage.js";
import { applicationId, formatAppliedDate, normalizeUrl } from "./url-utils.js";

const $ = (selector) => document.querySelector(selector);
let currentTab;
let currentId;
let currentApplication;

function cleanTitle(title) {
  return (title || "")
    .replace(/\s+[|–—-]\s+(LinkedIn|Indeed|Glassdoor|Greenhouse|Lever).*$/i, "")
    .trim();
}

async function readPageDetails(tabId) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const meta = (name) => document.querySelector(`meta[property="${name}"], meta[name="${name}"]`)?.content?.trim();
      const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map((node) => { try { return JSON.parse(node.textContent); } catch { return null; } })
        .flatMap((value) => Array.isArray(value) ? value : [value])
        .find((value) => value?.["@type"] === "JobPosting" || value?.["@graph"]?.some?.((x) => x?.["@type"] === "JobPosting"));
      const job = jsonLd?.["@type"] === "JobPosting" ? jsonLd : jsonLd?.["@graph"]?.find((x) => x?.["@type"] === "JobPosting");
      const title = job?.title || meta("og:title") || document.querySelector("h1")?.textContent?.trim() || document.title;
      const hiringOrg = typeof job?.hiringOrganization === "string" ? job.hiringOrganization : job?.hiringOrganization?.name;
      const siteName = meta("og:site_name");
      const host = location.hostname.replace(/^www\./, "").split(".")[0];
      return { title, company: hiringOrg || siteName || host };
    }
  });
  return result || {};
}

function setAppliedState(application) {
  currentApplication = application;
  const applied = Boolean(application);
  $("#statusCard").className = `status-card ${applied ? "applied" : "new"}`;
  $("#statusIcon").textContent = applied ? "✓" : "?";
  $("#statusLabel").textContent = applied ? "Already applied" : "Not marked yet";
  $("#statusText").textContent = applied ? formatAppliedDate(application.appliedAt) : "Ready when you are";
  $("#primaryButton").classList.toggle("applied-button", applied);
  $("#buttonIcon").textContent = applied ? "✓" : "+";
  $("#buttonText").textContent = applied ? "Applied" : "Mark as applied";
  $("#primaryButton").disabled = applied;
  $("#removeButton").classList.toggle("hidden", !applied);
  $("#roleInput").value = application?.role || $("#roleInput").value;
  $("#companyInput").value = application?.company || $("#companyInput").value;
}

async function init() {
  try {
    [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!currentTab?.url || !/^https?:/.test(currentTab.url)) throw new Error("Unsupported page");
    currentId = applicationId(currentTab.url);
    const [applications, details] = await Promise.all([getApplications(), readPageDetails(currentTab.id)]);
    const existing = applications.find((item) => item.id === currentId || normalizeUrl(item.url) === normalizeUrl(currentTab.url));
    $("#roleInput").value = cleanTitle(details.title || currentTab.title) || "Untitled role";
    $("#companyInput").value = details.company || "Unknown company";
    $("#displayUrl").textContent = new URL(currentTab.url).hostname.replace(/^www\./, "");
    setAppliedState(existing);
    $("#loading").classList.add("hidden");
    $("#jobPanel").classList.remove("hidden");
  } catch {
    $("#loading").classList.add("hidden");
    $("#unsupported").classList.remove("hidden");
  }
}

$("#primaryButton").addEventListener("click", async () => {
  const application = {
    id: currentId,
    role: $("#roleInput").value.trim() || "Untitled role",
    company: $("#companyInput").value.trim() || "Unknown company",
    url: currentTab.url,
    normalizedUrl: normalizeUrl(currentTab.url),
    appliedAt: new Date().toISOString()
  };
  await addApplication(application);
  setAppliedState(application);
  $("#message").textContent = "Saved — you won’t have to wonder again.";
});

$("#removeButton").addEventListener("click", async () => {
  await removeApplication(currentId);
  setAppliedState(null);
  $("#message").textContent = "Removed from your applied list.";
});

$("#historyButton").addEventListener("click", () => chrome.runtime.openOptionsPage());
init();
