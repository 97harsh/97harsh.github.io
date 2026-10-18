---
layout: post
title: "FireTV Voice: A Private, On-Device Voice Remote for My Fire TV"
description: Why depend on Alexa when you can build the remote you actually want? I built an always-listening voice remote for my Fire TV that runs entirely on my M1 MacBook Air. Whisper on Metal for speech-to-text, two speaker-embedding models so it only reacts to my voice, a rule-based intent parser, and a virtual Bluetooth remote over ADB. End of speech to command sent is about half a second in dry runs. Here's how it works, what surprised me, and what's still left to test.
type: project

tags: ["Life-Optimization", "Speech", "Edge-AI"]
---

## The idea
Have you ever thought: instead of waiting on Alexa (or whatever assistant shipped in the box), why not just build the thing you actually want?

That's what this blog is about from here on. Ideas I thought were cool, that I built instead of settling for the default, mostly to make my own life a little smoother. This one is a voice remote for my Fire TV that lives on my Mac. I say "open Netflix", "pause", "volume up 10" or "search for The Bear on Hulu", and it does it. Speech never leaves the laptop. It only listens to **my** voice, and only acts when the **whole phrase** is a TV command.

## AIDR (AI Didn't Read)
Not a summary for you, a prompt for your coding agent. Paste this into Claude Code (or whatever you use) to build something similar:

> Build a private, always-listening voice remote for my Fire TV that runs entirely on my Mac (Apple Silicon). Nothing goes to the cloud.
>
> - Mic: a tiny signed Swift .app that owns microphone permission and streams 16 kHz mono audio to a Python engine (macOS only prompts for an app, not a bare launchd script). Run everything as launchd agents at login.
> - Segment speech with Silero VAD.
> - For each segment, in parallel: speech-to-text with whisper.cpp small.en on Metal (kept warm in whisper-server), and a speaker check with two sherpa-onnx embedding models (TitaNet-small + ERes2Net) plus a small logistic-regression head trained on my voice vs. TV, other and synthetic voices. Drop the transcript if it's not me.
> - Parse text with regex rules into actions: open app, play/pause, nav keys, volume, seek, per-app search deep links. "TV" is an optional wake word. Ambiguous words ("pause", "back") only act if I'm mid TV session, not mid conversation.
> - Control the TV over one persistent `adb shell`. For keys, don't use `input keyevent` (~1.5 s, it spawns a JVM); register a virtual HID consumer-control remote with Android's `hid` tool and write one JSON report per key press.
> - Start in an "observe" mode that shows what it would do without touching the TV. Add a menu bar icon and a screen-edge glow for feedback.
> - Log every decision with latency, and add a CLI to enroll my voice, switch observe/live, and show the log.
>
> Target: end of speech to command sent in under ~500 ms.

## The stack
1. Silero VAD: finds where speech starts and stops
2. whisper.cpp (small.en, Metal): speech-to-text on the M1 GPU
3. TitaNet-small + ERes2Net (via sherpa-onnx): "is this Harsh speaking?"
4. A regex intent parser: turns text into TV actions
5. ADB + Android's `hid` tool: a virtual Bluetooth remote on the Fire TV
6. Two small Swift apps: one owns the microphone, one draws a glow around the screen and a menu bar icon

## Why not just use Alexa?
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

<table>
  <thead><tr><th>stage</th><th>typical</th></tr></thead>
  <tbody>
    <tr><td>end-of-speech detection (VAD silence window)</td><td>~255 ms</td></tr>
    <tr><td>your-voice check (runs in parallel with STT)</td><td>40–125 ms</td></tr>
    <tr><td>whisper.cpp small.en (Metal)</td><td>180–250 ms</td></tr>
    <tr><td>intent parsing</td><td>&lt; 1 ms</td></tr>
    <tr><td><strong>total, end of speech → command sent</strong></td><td><strong>440–510 ms</strong></td></tr>
    <tr><td>ADB delivery to TV (persistent link): key</td><td>~10–20 ms</td></tr>
    <tr><td>ADB delivery: <code>am start</code> / media command</td><td>~30–60 ms</td></tr>
  </tbody>
</table>

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
