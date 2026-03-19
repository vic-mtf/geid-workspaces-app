import { isPlainObject } from "lodash";

export default function deepMerge(oldObject: any, newObject: any): any {
  const result = { ...oldObject };
  Object.keys(newObject).forEach((key) => {
    if (isPlainObject(newObject[key]) && isPlainObject(oldObject[key]))
      result[key] = deepMerge(oldObject[key], newObject[key]);
    else result[key] = newObject[key];
  });
  return result;
}
