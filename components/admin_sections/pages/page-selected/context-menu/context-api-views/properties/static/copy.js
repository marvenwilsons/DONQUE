export default () => {
    if (o === null) return null;

    var output, v, key;
    output = Array.isArray(o) ? [] : {};
    for (key in o) {
      v = o[key];
      output[key] = typeof v === "object" ? copy(v) : v;
    }

    return output;
  };