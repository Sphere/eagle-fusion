export function getStringifiedQueryParams(obj: { [key: string]: number | string | undefined | string[] }) {
  return Object.entries(obj)
    .filter(u => u[1])
    .map(u => {
      return `${u[0]}=${u[1]}`
    })
    .join('&')
}
