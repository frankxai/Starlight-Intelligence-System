"""One-shot Starlight worker example. Standard library only; no model or network.

Replace execute() with a bounded call to a pinned Python agent framework.
Keep credentials in operator-provided environment variables, never the envelope.
Built on SIP.
"""
import json
import sys


def execute(prompt: str) -> str:
    words = prompt.split()
    return json.dumps({"language": "python", "wordCount": len(words), "characters": len(prompt)})


def main() -> None:
    line = sys.stdin.buffer.readline(1_048_577)
    if len(line) > 1_048_576:
        raise ValueError("Input limit exceeded")
    request = json.loads(line)
    if request.get("version") != "1.0" or not isinstance(request.get("id"), str):
        raise ValueError("Invalid worker request")
    if not isinstance(request.get("prompt"), str):
        raise ValueError("Prompt must be text")
    result = {"version": "1.0", "id": request["id"], "output": execute(request["prompt"]), "exitCode": 0}
    sys.stdout.buffer.write((json.dumps(result, ensure_ascii=False) + "\n").encode("utf-8"))


if __name__ == "__main__":
    main()
