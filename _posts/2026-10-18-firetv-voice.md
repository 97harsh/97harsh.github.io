---
layout: post
title: "FireTV Voice: A Private, On-Device Voice Remote for My Fire TV"
description: I built an always-listening voice remote for my Fire TV that runs entirely on my M1 MacBook Air. Whisper on Metal for speech-to-text, two speaker-embedding models so it only reacts to my voice, a rule-based intent parser, and a virtual Bluetooth remote over ADB. End of speech to command sent is about half a second in dry runs. Here's how it works, what surprised me, and what's still left to test.
type: project

tags: ["Speech", "Edge-AI"]
---

## TL; DR
A voice remote for my Fire TV that lives on my Mac. I say "open Netflix", "pause", "volume up 10" or "search for The Bear on Hulu", and it does it. Speech never leaves the laptop. It only listens to **my** voice, and only acts when the **whole phrase** is a TV command.

Tech Stack:
1. Silero VAD: finds where speech starts and stops
2. whisper.cpp (small.en, Metal): speech-to-text on the M1 GPU
3. TitaNet-small + ERes2Net (via sherpa-onnx): "is this Harsh speaking?"
4. A regex intent parser: turns text into TV actions
5. ADB + Android's `hid` tool: a virtual Bluetooth remote on the Fire TV
6. Two small Swift apps: one owns the microphone, one draws a glow around the screen and a menu bar icon

## Why build this?
Alexa on the Fire TV works, but it's slow and every request goes through the cloud. Most of what I ask the TV for is a tiny set of commands: open an app, pause, go back, turn it up. That doesn't need a data center. I wanted something that feels instant, runs on hardware I already own, and doesn't stream my living room to anyone.

The constraint I set myself: no button to press. It should be always listening, which immediately creates the two hard problems of this project. The TV itself is talking all the time, and so are the people in the room.

## How it works

```
mic
 └─ FireTVVoice.app (mic, 16 kHz)
     └─ Silero VAD
         ├─ voice check (CPU)
         │   TitaNet + ERes2Net
         │   + trained head
         └─ whisper.cpp (GPU)
             small.en, Metal
     └─ rule parser
         └─ persistent ADB link
             ├─ hid (virtual remote)
             └─ am start / media
 └─ FireTVVoiceUI.app
     glow + pop-up + menu bar
```

1. A tiny Swift app captures the microphone at 16 kHz and pipes audio to a Python engine. It exists only because macOS attributes microphone permission to an *app*. A bare script launched by `launchd` never gets a usable permission prompt.
2. Silero VAD cuts the stream into speech segments.
3. Each segment goes to two places **at the same time**: the speaker check on the CPU, and whisper.cpp on the GPU. If the voice isn't mine, the transcript is simply thrown away. Running them in parallel means the speaker check costs almost nothing in latency.
4. A rule-based parser maps the transcript to an action. "Please", "can you" and "hey" are ignored. "TV" works as an optional wake word ("TV, pause").
5. The action goes to the TV over a persistent ADB connection.

Everything runs as `launchd` services and starts at login. A small `ftv` CLI handles status, enrolling, switching modes, and showing logs and latency.

## Interesting things I learned

### `input keyevent` is painfully slow; a fake Bluetooth remote is not
The obvious way to press a remote button over ADB is `adb shell input keyevent KEYCODE_HOME`. It works, but each call takes about **1.5 seconds**, because `input` starts a fresh Java VM every time. That alone would have killed the project.

`sendevent`, writing raw events into `/dev/input`, would be fast, but SELinux on Fire OS 8 denies the writes.

What worked: Android ships a `hid` command-line tool that registers a **virtual HID device through `/dev/uhid`**. I keep one `adb shell hid -` process open, register a "consumer control" device (the same kind of report a real Bluetooth media remote sends), and a key press becomes a single JSON line on its stdin. Keys now land in **~10–20 ms**. A second long-lived shell handles `am start` and media commands in ~30–60 ms, instead of paying the ADB connection cost on every command.

### Fire TV's own search is locked away
I wanted "search for Severance" to use the Fire TV's global search. Every entry point to it (the text search and search-results activities, the `amzn://…/search` deep links, and the Alexa directive receivers) requires a `signature|privileged` permission that the ADB shell user doesn't have. So it's **not reachable over ADB**.

The fallback is per-app search deep links. Prime Video, Apple TV, Tubi and Spotify have confirmed formats. Netflix, Hulu, Disney+, HBO Max and YouTube accept a search link, but whether they actually pre-fill the query still needs a live test. Peacock and Pluto have no search link at all, so for those it just opens the app.

### Picking the speaker models: an A/B test beat the literature
My research notes pointed at CAM++ and ResNet34 (WeSpeaker) as the standard choice. In my A/B test, though, they **confused similar voices**. NeMo's TitaNet-small together with 3D-Speaker's ERes2Net separated voices best, so that's what ships. Both run in parallel on the CPU.

On top of the pretrained embeddings there's a small per-user model:
* my enrollment clips (score = max of centroid cosine and mean of the top-3 clip cosines),
* an "impostor" set: TV dialogue and other voices heard in the room, plus synthetic voices, used for score normalisation,
* a small logistic-regression head trained on me-vs-everyone-else, plus a cosine floor that is always enforced.

It keeps learning: confident commands from me are added to my profile, and rejected speech grows the "not me" set. On synthetic test voices it accepted the owner 15/15 times and the impostors 0/15. That's a synthetic test, not my real voice in a real room, which is the next step.

### Is that "pause" for the TV, or for a person?
Saying "pause" or "go back" to a friend shouldn't pause the movie. So commands are split in two:
* **Strong** commands always act: they name an app, a volume or a search, or start with "TV".
* **Ambiguous** ones ("pause", "stop", "go back", "home", "up/down", "next", "select") depend on context. If I was chatting in the last 8 seconds, they're held and a grey pop-up suggests *say "TV, pause"*. If I'm mid TV session (a command within 20 s and no chat since), they go straight through, so "open Netflix … down … select" stays fluid.

Every decision is logged with its context, and a "last one was wrong" button in the menu flags mistakes. That data is what a learned addressee model will eventually be trained on.

### Observe mode and the glow
Before letting it touch the TV, I wanted to watch it think. In **observe mode** it listens and reacts on screen, showing *"Would: open netflix"*, but never sends anything to the TV. The UI app draws:
* a **soft blue glow** around the screen edges when it hears my voice,
* a **bright glow + pop-up** when it recognises a TV command (green = done, with latency; violet = observe mode; red = TV unreachable),
* a **dim glow + grey pop-up** when it heard me, but the phrase wasn't for the TV.

The menu bar icon shows the mode at a glance and has a switch between observe and live.

## Latency
Measured on my M1 Air, from the end of speech to the command being sent, using dry runs on recorded commands:

| stage | typical |
|---|---|
| end-of-speech detection (VAD silence window) | ~255 ms |
| your-voice check (runs in parallel with STT) | 40–125 ms |
| whisper.cpp small.en (Metal) | 180–250 ms |
| intent parsing | < 1 ms |
| **total, end of speech → command sent** | **440–510 ms** |
| ADB delivery to TV (persistent link): key | ~10–20 ms |
| ADB delivery: `am start` / media command | ~30–60 ms |

**Important:** these are dry runs. I haven't yet measured live, on-TV latency in a real room, and the TV still needs its own time to draw the result (opening an app is a cold or warm start on the TV's slow CPU, same as with Alexa).

## Limitations (honest list)
* **The Mac must be awake, open and in the room.** Closing the lid cuts the built-in mic in hardware.
* **Loud TV dialogue** hurts both the voice check and transcription. There's no echo cancellation, because the TV audio doesn't come from the Mac.
* **Very short commands** like "pause" (half a second) carry little voice information. "TV, pause" is longer and passes more reliably.
* **Similar voices**: a family member with a voice like mine could be accepted. Re-enrolling with them talking in the background helps.
* **Fast-forward/rewind** are key presses (~10 s each in most apps), not exact seeks.
* **Sleep/wake** is implemented but untested.
* **After a TV reboot**, network ADB has to be toggled off and on in Developer Options before it reconnects.
* It also hears me dictating to the Mac. Only whole-phrase TV commands act, but dictating literally "pause" would pause the TV.

## What's next
Right now it's installed but stopped. The next steps:
1. **Enroll my voice**: about two minutes of talking naturally from the couch. It groups what it hears by voice, keeps the dominant one (me) and uses the rest as "not me".
2. **Live test on the TV**: check the app search deep links, sleep/wake, and real end-to-end latency in the room.
3. Then flip it from observe to **live**, and start collecting data for a learned "who is this addressed to" model.

I'll update this post with real-room numbers once that's done.
