function normalizePath(path) {
  return path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);
}

function getValue(obj, path) {
  const keys = normalizePath(path);
  let current = obj;
  for (const key of keys) {
    const normalizedKey = /^\d+$/.test(key) ? Number(key) : key;
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof normalizedKey === "number") {
      if (!Array.isArray(current) || normalizedKey >= current.length) {
        return undefined;
      }
    } else if (!Object.prototype.hasOwnProperty.call(current, normalizedKey)) {
      return undefined;
    }
    current = current[normalizedKey];
  }
  return current;
}

function setValue(obj, path, value) {
  const keys = normalizePath(path);
  if (keys.length === 0) {
    return false;
  }
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const normalizedKey = /^\d+$/.test(key) ? Number(key) : key;
    if (current === null || current === undefined) {
      return false;
    }
    if (typeof normalizedKey === "number") {
      if (!Array.isArray(current) || normalizedKey >= current.length) {
        return false;
      }
    } else if (!Object.prototype.hasOwnProperty.call(current, normalizedKey)) {
      return false;
    }
    current = current[normalizedKey];
  }
  const lastKey = keys[keys.length - 1];
  const normalizedLastKey = /^\d+$/.test(lastKey) ? Number(lastKey) : lastKey;
  if (current === null || current === undefined) {
    return false;
  }
  if (typeof normalizedLastKey === "number") {
    if (!Array.isArray(current) || normalizedLastKey >= current.length) {
      return false;
    }
  } else if (!Object.prototype.hasOwnProperty.call(current, normalizedLastKey)) {
    return false;
  }
  current[normalizedLastKey] = value;
  return true;
}

module.exports = { getValue, setValue };
