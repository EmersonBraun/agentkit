export function camelCase(str: string): string {
  return str.replace(/[-_](.)/g, (_, c: string) => c.toUpperCase())
}

export function pascalCase(str: string): string {
  const cc = camelCase(str)
  return cc.charAt(0).toUpperCase() + cc.slice(1)
}

export function packageName(name: string): string {
  return name.startsWith('@') ? name : `agentskit-${name}`
}
