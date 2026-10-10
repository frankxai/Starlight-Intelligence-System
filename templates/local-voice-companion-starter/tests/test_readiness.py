from voice_companion.readiness import VoiceReadinessProbe
from voice_companion.ipc_client import VoiceIpcProtocol


def test_readiness_probe_structure():
    report = VoiceReadinessProbe.full_readiness_report()
    assert "ready" in report
    assert "packages" in report
    assert "audio_hardware" in report
    assert "pipecat_compatibility" in report
    assert report["pipecat_compatibility"]["tested_baseline"] == "1.4.0"


def test_ipc_protocol_serialization():
    req_json = VoiceIpcProtocol.create_request("101", "ping", {})
    assert '"method": "ping"' in req_json
    assert '"id": "101"' in req_json

    parsed = VoiceIpcProtocol.parse_response('{"id": "101", "ok": true, "result": {"pong": true}}')
    assert parsed["ok"] is True
    assert parsed["result"]["pong"] is True
