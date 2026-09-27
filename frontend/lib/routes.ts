export function withProduct(path: string, product: string) {
  return product ? `${path}?${new URLSearchParams({ product })}` : path;
}
