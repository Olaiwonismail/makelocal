export function withProject(path: string, projectId: string) {
  return `${path}?${new URLSearchParams({ project: projectId })}`;
}
