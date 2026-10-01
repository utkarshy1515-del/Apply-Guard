import test from "node:test";
import assert from "node:assert/strict";
import { applicationId, normalizeUrl } from "../url-utils.js";

test("strips common tracking data and fragments", () => {
  assert.equal(
    normalizeUrl("https://www.example.com/jobs/42/?utm_source=email&ref=feed#apply"),
    "https://example.com/jobs/42"
  );
});

test("keeps parameters that can identify the job", () => {
  assert.equal(normalizeUrl("https://jobs.example.com/view?id=42&location=blr"), "https://jobs.example.com/view?id=42&location=blr");
});

test("equivalent tracked URLs receive the same id", () => {
  assert.equal(applicationId("https://example.com/job/7?utm_campaign=x"), applicationId("https://www.example.com/job/7/#top"));
});
