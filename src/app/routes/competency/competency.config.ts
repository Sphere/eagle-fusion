export function competencyConfigFactory() {
  return JSON.parse(localStorage.getItem('competency') || '{}')
}