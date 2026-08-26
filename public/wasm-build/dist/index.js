// src/generated/voxelkloud_wasm_build.js
var BuildSettings = class {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    BuildSettingsFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_buildsettings_free(ptr, 0);
  }
  constructor() {
    const ret = wasm.buildsettings_new();
    this.__wbg_ptr = ret;
    BuildSettingsFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * @param {number} points
   */
  set leafPoints(points) {
    wasm.buildsettings_set_leafPoints(this.__wbg_ptr, points);
  }
  /**
   * @param {number} depth
   */
  set maxDepth(depth) {
    wasm.buildsettings_set_maxDepth(this.__wbg_ptr, depth);
  }
  /**
   * Points across a node's edge. The density knob, and the only one.
   * @param {number} span
   */
  set span(span) {
    wasm.buildsettings_set_span(this.__wbg_ptr, span);
  }
};
if (Symbol.dispose) BuildSettings.prototype[Symbol.dispose] = BuildSettings.prototype.free;
var BuiltCloud = class _BuiltCloud {
  static __wrap(ptr) {
    const obj = Object.create(_BuiltCloud.prototype);
    obj.__wbg_ptr = ptr;
    BuiltCloudFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    BuiltCloudFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_builtcloud_free(ptr, 0);
  }
  /**
   * The CUBE the octree subdivides: `[minX, minY, minZ, maxX, maxY, maxZ]`.
   * @returns {Float64Array}
   */
  get cubeBounds() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.builtcloud_cubeBounds(retptr, this.__wbg_ptr);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var v1 = getArrayF64FromWasm0(r0, r1).slice();
      wasm.__wbindgen_export3(r0, r1 * 8, 8);
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * The tight data extent, from the file's own header.
   * @returns {Float64Array}
   */
  get extentBounds() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.builtcloud_extentBounds(retptr, this.__wbg_ptr);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var v1 = getArrayF64FromWasm0(r0, r1).slice();
      wasm.__wbindgen_export3(r0, r1 * 8, 8);
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * The Extra Bytes VLR payload, when the record carries custom dimensions.
   * @returns {Uint8Array | undefined}
   */
  get extraBytes() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.builtcloud_extraBytes(retptr, this.__wbg_ptr);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      let v1;
      if (r0 !== 0) {
        v1 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_export3(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @returns {Uint8Array | undefined}
   */
  get geoAscii() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.builtcloud_geoAscii(retptr, this.__wbg_ptr);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      let v1;
      if (r0 !== 0) {
        v1 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_export3(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * The GeoTIFF key directory, for a LAS 1.2 file that declares its CRS the
   * older way.
   * @returns {Uint8Array | undefined}
   */
  get geoKeyDirectory() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.builtcloud_geoKeyDirectory(retptr, this.__wbg_ptr);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      let v1;
      if (r0 !== 0) {
        v1 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_export3(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @returns {number}
   */
  get maxLevel() {
    const ret = wasm.builtcloud_maxLevel(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
   * Nodes in the tree, in the order the builder emitted them — a parent
   * always before its children.
   * @returns {number}
   */
  get nodeCount() {
    const ret = wasm.builtcloud_nodeCount(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
   * `"3-1-0-2"` — the level and cell of node `index`, the spelling COPC and
   * EPT both use and the one `createPagedOctree` keys on.
   * @param {number} index
   * @returns {string}
   */
  nodeKey(index) {
    let deferred2_0;
    let deferred2_1;
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.builtcloud_nodeKey(retptr, this.__wbg_ptr, index);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
      var ptr1 = r0;
      var len1 = r1;
      if (r3) {
        ptr1 = 0;
        len1 = 0;
        throw takeObject(r2);
      }
      deferred2_0 = ptr1;
      deferred2_1 = len1;
      return getStringFromWasm0(ptr1, len1);
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
      wasm.__wbindgen_export3(deferred2_0, deferred2_1, 1);
    }
  }
  /**
   * Points in node `index`'s own layer.
   * @param {number} index
   * @returns {number}
   */
  nodePointCount(index) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.builtcloud_nodePointCount(retptr, this.__wbg_ptr, index);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      if (r2) {
        throw takeObject(r1);
      }
      return r0 >>> 0;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * The raw LAS point records of node `index`.
   *
   * Copies out of wasm memory, so take it once. They are records in the
   * input file's own point format, which is exactly what
   * `@voxelkloud/format-las` decodes for the COPC and EPT drivers — this
   * tier reuses that decoder rather than growing a second one.
   * @param {number} index
   * @returns {Uint8Array}
   */
  nodeRecords(index) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.builtcloud_nodeRecords(retptr, this.__wbg_ptr, index);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
      var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
      if (r3) {
        throw takeObject(r2);
      }
      var v1 = getArrayU8FromWasm0(r0, r1).slice();
      wasm.__wbindgen_export3(r0, r1 * 1, 1);
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @returns {Float64Array}
   */
  get offset() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.builtcloud_offset(retptr, this.__wbg_ptr);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var v1 = getArrayF64FromWasm0(r0, r1).slice();
      wasm.__wbindgen_export3(r0, r1 * 8, 8);
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * @returns {number}
   */
  get pointCount() {
    const ret = wasm.builtcloud_pointCount(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {number}
   */
  get pointFormat() {
    const ret = wasm.builtcloud_pointFormat(this.__wbg_ptr);
    return ret;
  }
  /**
   * Bytes per record, extra bytes included.
   * @returns {number}
   */
  get pointSize() {
    const ret = wasm.builtcloud_pointSize(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
   * Distance between neighbouring points at the root, in CRS units.
   * @returns {number}
   */
  get rootSpacing() {
    const ret = wasm.builtcloud_rootSpacing(this.__wbg_ptr);
    return ret;
  }
  /**
   * @returns {Float64Array}
   */
  get scale() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.builtcloud_scale(retptr, this.__wbg_ptr);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      var v1 = getArrayF64FromWasm0(r0, r1).slice();
      wasm.__wbindgen_export3(r0, r1 * 8, 8);
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
  /**
   * The OGC WKT from `LASF_Projection` record 2112, when the file had one.
   * @returns {string | undefined}
   */
  get wkt() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
      wasm.builtcloud_wkt(retptr, this.__wbg_ptr);
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
      let v1;
      if (r0 !== 0) {
        v1 = getStringFromWasm0(r0, r1);
        wasm.__wbindgen_export3(r0, r1 * 1, 1);
      }
      return v1;
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16);
    }
  }
};
if (Symbol.dispose) BuiltCloud.prototype[Symbol.dispose] = BuiltCloud.prototype.free;
function buildFromFile(bytes, settings) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export2);
    const len0 = WASM_VECTOR_LEN;
    let ptr1 = 0;
    if (!isLikeNone(settings)) {
      _assertClass(settings, BuildSettings);
      ptr1 = settings.__destroy_into_raw();
    }
    wasm.buildFromFile(retptr, ptr0, len0, ptr1);
    var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
    var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
    var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
    if (r2) {
      throw takeObject(r1);
    }
    return BuiltCloud.__wrap(r0);
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}
function buildProgress() {
  const ret = wasm.buildProgress();
  return ret;
}
function convertFileToCopc(bytes, settings) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_export2);
    const len0 = WASM_VECTOR_LEN;
    let ptr1 = 0;
    if (!isLikeNone(settings)) {
      _assertClass(settings, BuildSettings);
      ptr1 = settings.__destroy_into_raw();
    }
    wasm.convertFileToCopc(retptr, ptr0, len0, ptr1);
    var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
    var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
    var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
    var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
    if (r3) {
      throw takeObject(r2);
    }
    var v3 = getArrayU8FromWasm0(r0, r1).slice();
    wasm.__wbindgen_export3(r0, r1 * 1, 1);
    return v3;
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}
function intoCopc(cloud) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    _assertClass(cloud, BuiltCloud);
    var ptr0 = cloud.__destroy_into_raw();
    wasm.intoCopc(retptr, ptr0);
    var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
    var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
    var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
    var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
    if (r3) {
      throw takeObject(r2);
    }
    var v2 = getArrayU8FromWasm0(r0, r1).slice();
    wasm.__wbindgen_export3(r0, r1 * 1, 1);
    return v2;
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}
function onBuildProgress(callback) {
  wasm.onBuildProgress(isLikeNone(callback) ? 0 : addHeapObject(callback));
}
function __wbg_get_imports() {
  const import0 = {
    __proto__: null,
    __wbg_Error_408e67f47ca7b58b: function(arg0, arg1) {
      const ret = Error(getStringFromWasm0(arg0, arg1));
      return addHeapObject(ret);
    },
    __wbg___wbindgen_throw_bb96b2010945f0bc: function(arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    },
    __wbg_call_35dba3c747ad7521: function() {
      return handleError(function(arg0, arg1, arg2) {
        const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
      }, arguments);
    },
    __wbg_now_8b265300afd5f2b9: function() {
      const ret = Date.now();
      return ret;
    },
    __wbindgen_cast_0000000000000001: function(arg0) {
      const ret = arg0;
      return addHeapObject(ret);
    },
    __wbindgen_object_clone_ref: function(arg0) {
      const ret = getObject(arg0);
      return addHeapObject(ret);
    },
    __wbindgen_object_drop_ref: function(arg0) {
      takeObject(arg0);
    }
  };
  return {
    __proto__: null,
    "./voxelkloud_wasm_build_bg.js": import0
  };
}
var BuildSettingsFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_buildsettings_free(ptr, 1));
var BuiltCloudFinalization = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((ptr) => wasm.__wbg_builtcloud_free(ptr, 1));
function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];
  heap[idx] = obj;
  return idx;
}
function _assertClass(instance, klass) {
  if (!(instance instanceof klass)) {
    throw new Error(`expected instance of ${klass.name}`);
  }
}
function dropObject(idx) {
  if (idx < 1028) return;
  heap[idx] = heap_next;
  heap_next = idx;
}
function getArrayF64FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}
function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}
var cachedDataViewMemory0 = null;
function getDataViewMemory0() {
  if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || cachedDataViewMemory0.buffer.detached === void 0 && cachedDataViewMemory0.buffer !== wasm.memory.buffer) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
  }
  return cachedDataViewMemory0;
}
var cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
  if (cachedFloat64ArrayMemory0 === null || cachedFloat64ArrayMemory0.byteLength === 0) {
    cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
  }
  return cachedFloat64ArrayMemory0;
}
function getStringFromWasm0(ptr, len) {
  return decodeText(ptr >>> 0, len);
}
var cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}
function getObject(idx) {
  return heap[idx];
}
function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    wasm.__wbindgen_export(addHeapObject(e));
  }
}
var heap = new Array(1024).fill(void 0);
heap.push(void 0, null, true, false);
var heap_next = heap.length;
function isLikeNone(x) {
  return x === void 0 || x === null;
}
function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0;
  getUint8ArrayMemory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
function takeObject(idx) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}
var cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
var MAX_SAFARI_DECODE_BYTES = 2146435072;
var numBytesDecoded = 0;
function decodeText(ptr, len) {
  numBytesDecoded += len;
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
    cachedTextDecoder.decode();
    numBytesDecoded = len;
  }
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
var WASM_VECTOR_LEN = 0;
var wasmModule;
var wasmInstance;
var wasm;
function __wbg_finalize_init(instance, module) {
  wasmInstance = instance;
  wasm = instance.exports;
  wasmModule = module;
  cachedDataViewMemory0 = null;
  cachedFloat64ArrayMemory0 = null;
  cachedUint8ArrayMemory0 = null;
  return wasm;
}
async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (!module.ok) {
      throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`);
    }
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        const validResponse = expectedResponseType(module.type);
        if (validResponse && module.headers.get("Content-Type") !== "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);
    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
  function expectedResponseType(type) {
    switch (type) {
      case "basic":
      case "cors":
      case "default":
        return true;
    }
    return false;
  }
}
function initSync(module) {
  if (wasm !== void 0) return wasm;
  if (module !== void 0) {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ({ module } = module);
    } else {
      console.warn("using deprecated parameters for `initSync()`; pass a single object instead");
    }
  }
  const imports = __wbg_get_imports();
  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module);
  }
  const instance = new WebAssembly.Instance(module, imports);
  return __wbg_finalize_init(instance, module);
}
async function __wbg_init(module_or_path) {
  if (wasm !== void 0) return wasm;
  if (module_or_path !== void 0) {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ({ module_or_path } = module_or_path);
    } else {
      console.warn("using deprecated parameters for the initialization function; pass a single object instead");
    }
  }
  if (module_or_path === void 0) {
    module_or_path = new URL("voxelkloud_wasm_build_bg.wasm", import.meta.url);
  }
  const imports = __wbg_get_imports();
  if (typeof module_or_path === "string" || typeof Request === "function" && module_or_path instanceof Request || typeof URL === "function" && module_or_path instanceof URL) {
    module_or_path = fetch(module_or_path);
  }
  const { instance, module } = await __wbg_load(await module_or_path, imports);
  return __wbg_finalize_init(instance, module);
}

// src/index.ts
function onBuildProgress2(callback) {
  onBuildProgress(callback ?? null);
}
var wasmUrl = new URL(
  "./voxelkloud_wasm_build_bg.wasm",
  import.meta.url
);
var ready;
function initBuilder(source) {
  ready ??= instantiate(source ?? wasmUrl).catch((error) => {
    ready = void 0;
    throw error;
  });
  return ready;
}
async function instantiate(source) {
  if (source instanceof WebAssembly.Module || isBufferSource(source)) {
    initSync({ module: source });
    return;
  }
  const bytes = await readFileUrl(source);
  if (bytes !== void 0) {
    initSync({ module: bytes });
    return;
  }
  await __wbg_init({ module_or_path: source });
}
function isBufferSource(value) {
  return value instanceof ArrayBuffer || ArrayBuffer.isView(value);
}
async function readFileUrl(source) {
  if (source instanceof Response) return void 0;
  const href = source instanceof URL ? source.href : source;
  if (!href.startsWith("file:")) return void 0;
  try {
    const specifier = "node:fs/promises";
    const fs = await import(
      /* @vite-ignore */
      specifier
    );
    return await fs.readFile(new URL(href));
  } catch {
    return void 0;
  }
}
function builtNodes(cloud) {
  const out = [];
  for (let index = 0; index < cloud.nodeCount; index++) {
    const key = cloud.nodeKey(index);
    const parts = key.split("-");
    out.push({
      index,
      key,
      level: Number(parts[0]),
      x: Number(parts[1]),
      y: Number(parts[2]),
      z: Number(parts[3]),
      pointCount: cloud.nodePointCount(index)
    });
  }
  return out;
}
export {
  BuildSettings,
  BuiltCloud,
  buildFromFile,
  buildProgress,
  builtNodes,
  convertFileToCopc,
  initBuilder,
  intoCopc,
  onBuildProgress2 as onBuildProgress,
  wasmUrl
};
//# sourceMappingURL=index.js.map