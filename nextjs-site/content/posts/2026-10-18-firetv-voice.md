---
layout: post
title: "FireTV Voice: A Private, On-Device Voice Remote for My Fire TV"
description: Why depend on Alexa when you can build the remote you actually want? I built an always-listening voice remote for my Fire TV that runs entirely on my M1 MacBook Air and only reacts to my voice. The top is for humans; the rest is a spec your coding agent can build from.
type: project

tags: ["Life-Optimization", "Speech", "Edge-AI"]
---

## AI;DR (AI Didn't Read)
*This part is for you, the human. Everything after it is written for your coding agent.*

Why are we waiting on Alexa (or whatever assistant shipped in the box), why not just build the thing you actually want? mostly to make my own life a little smoother.

This one is a **voice remote for my Fire TV that lives on my Mac**.

* I don't want to says "Alexa, do xxx" just want it to be always on and switch when it was meant for the TV
* I say "open Netflix", "pause", "volume up 10" or "search for The Bear on Hulu", and the TV does it.
* Nothing leaves the laptop. Speech-to-text, voice recognition and the TV control all run locally.
* It only listens to **my** voice, and only acts when the **whole phrase** is a TV command, so the TV's own dialogue and people chatting don't trigger it.
* In dry runs it takes about **half a second** from the end of my sentence to the command being sent. Alexa felt slow next to that.
* Status: built and installed. I still need to enroll my voice and run a real live test on the TV, so live latency isn't measured yet.

If you want one too, hand this page to Claude Code (or your agent of choice) and tell it to build it for your setup.

The code, scripts and tests are on GitHub: [97harsh/firetv-voice](https://github.com/97harsh/firetv-voice).

---

## For agents: overview
Goal: an always-listening, owner-only, fully local voice remote for an Amazon Fire TV, running on an Apple Silicon Mac on the same network. No push-to-talk. Target: end of speech to command sent in under ~500 ms.

Two problems define the design: the TV talks constantly, and so do the people in the room. Every utterance therefore has to pass a speaker check (is this the owner?) and an addressee check (is this said to the TV?) before it acts.

Reference implementation: [97harsh/firetv-voice](https://github.com/97harsh/firetv-voice) — Python engine, two small Swift apps, launchd agents, ~2,300 lines total. Unit tests for the parser and addressee logic run with `pytest`; `scripts/` has the live TV test and a standalone `hid` remote demo.

## Architecture

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

Components:
1. **Mic host (Swift .app).** Owns microphone permission and streams 16 kHz mono audio to the Python engine, which it spawns as a child.
2. **VAD.** Silero VAD. Defaults: threshold 0.5, min silence 0.25 s, min speech 0.2 s, max speech 8 s.
3. **Speaker check.** sherpa-onnx with NeMo TitaNet-small and 3D-Speaker ERes2Net, plus a per-user logistic-regression head.
4. **Speech-to-text.** whisper.cpp `small.en` (q5_1) on Metal, kept warm in a local `whisper-server` child process (warm-up request at start so the first command doesn't pay shader compilation).
5. **Intent parser.** Regex rules. No LLM in the hot path.
6. **TV link.** Persistent ADB over the network: one plain shell and one `hid` virtual remote.
7. **UI (Swift .app).** Menu bar icon, screen-edge glow and pop-ups, driven by JSON events over localhost UDP. Needs no permissions.
8. **CLI.** `ftv status | start | stop | enroll | observe | live | say <text> | log | latency | wrong | reload`.

## Per-utterance pipeline
1. VAD closes a segment after 0.25 s of silence.
2. Submit STT (GPU) and the speaker check (CPU) **in parallel**. If the speaker check fails, discard the transcript and add the embedding to the impostor cohort.
3. Normalise the text: strip filler ("please", "can you", "hey") and detect the optional wake word ("TV", "hey TV", "fire TV"...). A bare "TV" arms the next phrase for 5 s.
4. Parse. The **whole phrase** must match a command; partial matches inside a longer sentence are ignored.
5. Apply the addressee rules (below).
6. In observe mode, show *"Would: …"*. In live mode, send to the TV and report latency.
7. Log every decision to a JSONL event log with timings and context.

## Controlling a Fire TV over ADB: what works and what doesn't
Tested on Fire OS 8.

* **Don't use `input keyevent` for keys.** Each call takes ~1.5 s because `input` starts a fresh JVM.
* **`sendevent` doesn't work.** It would be fast, but SELinux on Fire OS 8 denies writes to `/dev/input`.
* **What works: Android's `hid` tool.** Keep one `adb shell hid -` process open. It registers a virtual HID device through `/dev/uhid`. Register a consumer-control device once, then each key press is one JSON line on stdin. Keys land in ~10–20 ms. Standalone demo: [`scripts/hid_remote.py`](https://github.com/97harsh/firetv-voice/blob/main/scripts/hid_remote.py).
  * Register: `{"id":1,"command":"register","name":"FireTV Voice Remote","vid":4660,"pid":22136,"bus":"bluetooth","descriptor":[...]}` with a consumer-control report descriptor (report id 1, one 16-bit usage).
  * Press: `{"id":1,"command":"report","report":[1, usage & 0xFF, usage >> 8]}` followed by the release `{"id":1,"command":"report","report":[1,0,0]}`.
  * Usages: Home 0x223, Back 0x224, Menu 0x40, Up/Down/Left/Right 0x42–0x45, Select 0x41, Play/Pause 0xCD, Fast-forward 0xB3, Rewind 0xB4, Next 0xB5, Previous 0xB6, Volume up/down 0xE9/0xEA, Mute 0xE2.
  * Wait until `getevent -pl` lists the device before sending the first key, or the first press is lost.
* **Apps and media go over a second persistent shell** (~30–60 ms): `am start -n <package>/<activity>` to open apps, `cmd media_session dispatch play|pause|next|...` for media.
* Find an app's launch activity with `cmd package resolve-activity --brief -a android.intent.action.MAIN -c android.intent.category.LEANBACK_LAUNCHER <pkg>`.
* **Fire TV's system search is not reachable.** Every entry point (text-search and search-results activities, `amzn://…/search` deep links, Alexa directive receivers) requires a `signature|privileged` permission the shell user doesn't hold.
* **Per-app search deep links instead:**
  * Confirmed format: Prime Video, Apple TV, Tubi, Spotify.
  * Accept the link, but query pre-fill is unverified: Netflix, Hulu, Disney+, HBO Max, YouTube.
  * No search link (just open the app): Peacock, Pluto.
* After a TV reboot, network ADB closes. The user has to toggle ADB debugging off and on in Developer Options. Detect this and tell them instead of failing silently.

## Speaker verification (owner-only)
* **Model choice came from an A/B test.** The usual recommendation is CAM++ and ResNet34 (WeSpeaker), but in testing they confused similar voices. TitaNet-small + ERes2Net separated voices best. Run both extractors in parallel threads (onnxruntime releases the GIL).
* **Per-user model on top of the embeddings:**
  * Enrollment clips. Score = max(centroid cosine, mean of the top-3 clip cosines).
  * Impostor cohort: TV dialogue and other room voices, plus a few dozen synthetic voices, used for AS-norm score normalisation.
  * A small logistic-regression head trained on owner-vs-impostor features. Threshold chosen to keep ~all held-out owner clips while never accepting the top 0.5% of impostors.
  * A cosine floor (0.6) that is always enforced.
* **Enrollment:** ~2 minutes of natural talk from the usual seat. Cluster by voice, keep the dominant one as the owner, and use the other voices as impostors.
* **Online learning:** add confident owner commands to the profile, add rejected speech to the cohort, and retrain the head as the cohort grows.
* Result on synthetic test voices: owner 15/15 accepted, impostors 0/15 accepted. Not yet measured on real far-field audio.
* Very short commands (~0.5 s, "pause") carry little voice information, so demand a bit more confidence for them.
* Until the owner is enrolled, require the wake word, so TV dialogue can't trigger commands.

## Addressee rules (TV or a person?)
* **Strong** commands always act: they name an app, a volume or a search, or start with the wake word.
* **Ambiguous** commands ("pause", "stop", "go back", "home", "up/down", "next", "select"):
  * held if the owner was chatting (non-command speech) within the last 8 s, with a hint to say "TV, pause";
  * passed straight through if the owner is mid TV session (a command within the last 20 s and no chat since), so "open Netflix … down … select" stays fluid.
* Log each decision with its context, and give the user a "last one was wrong" action. That labelled data is for a future learned addressee model.

## Intents to support
* Apps: "open Netflix", "put on YouTube", "launch Apple TV". Keep a JSON app table with package, launch activity, spoken aliases (including common mishearings, e.g. "to be" for Tubi) and an optional search deep link with `{q}`.
* Media: "pause", "play", "resume", "next episode".
* Navigation: "go home", "go back", "select", "down 3 times".
* Volume: "volume up/down", "turn it up a little", "volume up 10", "set volume to 20", "mute". Default step 5.
* Seek: "fast forward 30 seconds", "skip back 10 seconds". These are key presses (~10 s each in most apps), not exact seeks.
* Search: "search for X on Hulu", "find X on Apple TV". Default to Prime Video if no app is named.
* Power: "turn off/on the TV" (sleep/wake; untested).
* Self-control: "stop listening" / "start listening".
* Optional cloud fallback (off by default): send free-form requests to an OpenAI-compatible LLM endpoint only when the rules don't match and the wake word was said.

## UX
* **Observe mode** (default): recognise and show *"Would: open netflix"*, but never touch the TV. **Live mode** acts. Switch from the CLI or the menu bar.
* **Screen-edge glow:** soft blue when the owner is speaking; bright plus a pop-up for a recognised command (green = done, with latency; violet = observe mode; red = TV unreachable); dim plus a grey pop-up when the owner spoke but not to the TV.
* **Menu bar icon:** eye = observe, waveform = live, warning = TV not connected, slashed = service not running.

## macOS gotchas
* **Microphone permission is attributed to an app, not a script.** A bare tool launched by launchd gets no usable permission prompt. Wrap the mic capture in a tiny `.app` with `NSMicrophoneUsageDescription`, launch its binary directly from a LaunchAgent plist, and have it spawn the Python engine (children inherit its permission).
* **Sign it with a stable identity.** Ad-hoc signing changes the code identity on every rebuild, so macOS re-prompts (or silently denies under launchd). Use an Apple Development or self-signed code-signing certificate.
* Call `AVCaptureDevice.requestAccess(for: .audio)` explicitly when the status is not determined, before starting the audio engine.
* The orange mic indicator is always on while the service runs. That's a macOS rule.
* Closing the lid cuts the built-in mic in hardware, and sleep stops everything. Use `caffeinate` or an external mic.

## Measured latency
M1 MacBook Air, end of speech to command sent, dry runs on recorded commands:

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

**Live, on-TV latency in a real room has not been measured yet.** The TV also needs its own time to draw the result (opening an app is a cold or warm start on the TV's slow CPU, same as with Alexa).

## Known limitations
* Loud TV dialogue degrades both the speaker check and STT. There's no echo cancellation, because the TV audio doesn't come from the Mac.
* A family member with a very similar voice could be accepted. Re-enroll with them talking in the background so they join the impostor cohort.
* Other people's voices and TV dialogue can't be told apart yet, so only the owner's chatter counts as "conversation" for the addressee rules.
* It also hears the owner dictating to the Mac. Only whole-phrase commands act, but dictating literally "pause" would pause the TV.
* Audio is never stored. Transcripts of non-command speech are logged while tuning; make that switchable off for privacy.

## Status and next steps
1. Enroll the owner's voice (natural talk, ~2 minutes).
2. Live test on the TV: search deep links, sleep/wake, and real end-to-end latency in the room.
3. Switch from observe to live, then collect labelled data for a learned addressee model.

I'll update this post with real-room numbers once that's done.
