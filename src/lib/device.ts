// Anonymous device id for cloud progress tracking
export function getDeviceId(): string {
  const KEY = "linguo-device-id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}
