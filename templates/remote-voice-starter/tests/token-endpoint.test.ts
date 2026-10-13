import test from "node:test";
import * as assert from "node:assert/strict";
import { createParticipantToken } from "../src/server/token-endpoint.js";

test("createParticipantToken requires API credentials", async () => {
  await assert.rejects(
    async () => {
      await createParticipantToken(
        { livekitUrl: "https://example.com", apiKey: "", apiSecret: "" },
        "test-room",
        "user-1"
      );
    },
    { message: /Missing LiveKit API credentials/ }
  );
});

test("createParticipantToken issues valid token structure with ttl", async () => {
  const result = await createParticipantToken(
    {
      livekitUrl: "https://example.livekit.cloud",
      apiKey: "devkey",
      apiSecret: "secretkeywhichisatleastthirtytwocharacterslong123456",
      ttlSeconds: 300,
    },
    "operator-room",
    "operator-user"
  );

  assert.equal(result.serverUrl, "https://example.livekit.cloud");
  assert.equal(result.roomName, "operator-room");
  assert.equal(result.participantName, "operator-user");
  assert.ok(result.participantToken.length > 20);
  assert.ok(result.expiresAt > Math.floor(Date.now() / 1000));
});
