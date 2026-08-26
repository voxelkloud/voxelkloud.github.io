// The build, off the main thread.
//
// Not an optimisation. A build is ONE SYNCHRONOUS CALL into wasm: while it
// runs, nothing else on its thread happens — no timer fires, no promise
// resumes, no frame paints. On the main thread that is a tab frozen solid for
// as long as the file takes, with no spinner and no way to cancel, because the
// code that would draw the spinner is the code that is not running.
//
// So the worker is what makes progress possible at all, and it is why
// `onBuildProgress` PUSHES from inside the loop instead of being polled: a
// timer on this thread could not fire either, but a `postMessage` from inside
// the loop can.
//
// It is also where the memory goes. A 20M-point build peaks around 1.7 GB, and
// terminating the worker when the result is out takes that with it, rather than
// leaving it resident in the page for as long as the tab is open.

import { buildFromFile, initBuilder, intoCopc, onBuildProgress } from "../dist/index.js";

const ready = initBuilder();

self.onmessage = async (event) => {
  const { bytes } = event.data;
  await ready;

  onBuildProgress((points) => self.postMessage({ kind: "progress", points }));

  try {
    const cloud = buildFromFile(new Uint8Array(bytes), undefined);
    // Read before writing: `intoCopc` consumes the cloud, which is what frees
    // each node as it is compressed instead of holding two copies.
    const stats = {
      points: cloud.pointCount,
      nodes: cloud.nodeCount,
      depth: cloud.maxLevel,
      spacing: cloud.rootSpacing,
    };
    const copc = intoCopc(cloud);
    // Transferred, not copied: on a large file this is a hundred megabytes, and
    // a structured clone of it would double the peak at the last moment.
    self.postMessage({ kind: "done", stats, copc }, [copc.buffer]);
  } catch (error) {
    self.postMessage({ kind: "error", message: String(error?.message ?? error) });
  } finally {
    onBuildProgress(undefined);
  }
};
