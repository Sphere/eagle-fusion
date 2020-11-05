export function getTimeElapsed(timestamp: number) {
  const TIME_OBJECT = {
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  }
  return { timestamp, TIME_OBJECT }
}
