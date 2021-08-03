// @flow

import type { Key, SelectOptions, LabeledSelectOption } from 'mapeo-schema'

export function getProp(tags: any, fieldKey: Key, defaultValue: any) {
  // TODO: support deeply nested tags.
  const shallowKey = Array.isArray(fieldKey) ? fieldKey[0] : fieldKey;
  const tagValue = tags[shallowKey];
  return typeof tagValue === "undefined" ? defaultValue : tagValue;
}

/**
 * Convert a select option which could either be a string or an object with
 * label and value props, to an object with label and value props TODO: Show
 * meaningful translated values for null and boolean, but these types are not
 * used widely in presets yet
 */
export function convertSelectOptionsToLabeled(
  options: SelectOptions
): LabeledSelectOption[] {
  return options.map(option => {
    if (option === null) {
      return { label: "NULL", value: option };
    } else if (typeof option === "boolean") {
      return { label: option ? "TRUE" : "FALSE", value: option };
    } else if (typeof option === "string" || typeof option === "number") {
      return { label: option + "", value: option };
    } else {
      return option;
    }
  });
}
