const config = localStorage.getItem('competency')
console.log(typeof (config))
export const COMPETENCY_REGISTRATION_CONFIG = {
  config: JSON.parse(config || '{}')
}