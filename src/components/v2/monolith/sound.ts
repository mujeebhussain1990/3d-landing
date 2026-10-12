// A quiet generated soundtrack: a low drone breathing through a filter, and a
// soft chime when the camera arrives at a new chapter. Nothing is downloaded.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

export function soundOn() {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    filter.Q.value = 6;
    filter.connect(master);

    [55, 82.4, 110.2, 164.8].forEach((f, i) => {
      const o = ctx!.createOscillator();
      o.type = i % 2 ? "triangle" : "sine";
      o.frequency.value = f;
      o.detune.value = (i - 1.5) * 6;
      const g = ctx!.createGain();
      g.gain.value = 0.16 / (i + 1);
      o.connect(g).connect(filter);
      o.start();
    });

    // slow breathing on the filter
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const depth = ctx.createGain();
    depth.gain.value = 260;
    lfo.connect(depth).connect(filter.frequency);
    lfo.start();
  }
  void ctx.resume();
  master!.gain.cancelScheduledValues(ctx.currentTime);
  master!.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.5);
}

export function soundOff() {
  if (!ctx || !master) return;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
}

export function chime(step: number) {
  if (!ctx || !master || master.gain.value < 0.05) return;
  const notes = [659.3, 740, 830.6, 987.8, 1108.7, 1318.5];
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.value = notes[step % notes.length];
  g.gain.setValueAtTime(0, ctx.currentTime);
  g.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.4);
  o.connect(g).connect(master);
  o.start();
  o.stop(ctx.currentTime + 2.5);
}
