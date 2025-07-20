import md5 from "crypto-js/md5";

export function hash(value: string) {
  return md5(value).toString();
}
