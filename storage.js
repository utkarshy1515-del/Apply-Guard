export const STORAGE_KEY = "applyguardApplications";

export async function getApplications() {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : [];
}

export async function saveApplications(applications) {
  await chrome.storage.local.set({ [STORAGE_KEY]: applications });
}

export async function addApplication(application) {
  const applications = await getApplications();
  const next = [application, ...applications.filter((item) => item.id !== application.id)];
  await saveApplications(next);
  return next;
}

export async function removeApplication(id) {
  const applications = await getApplications();
  const next = applications.filter((item) => item.id !== id);
  await saveApplications(next);
  return next;
}
