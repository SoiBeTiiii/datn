// /lib/wishlistCache.ts
export type WishlistKey = string | number;

type WLCache = {
  loadedFor: string | null;     // user key (email). Nếu sau dùng userId thì đổi sang id.toString()
  set: Set<WishlistKey>;        // chứa cả slug (string) và id (number)
  list: any[];                  // danh sách đầy đủ (để Drawer hiển thị)
  loading: Promise<void> | null;
};

export const wishlistCache: WLCache = {
  loadedFor: null,
  set: new Set(),
  list: [],
  loading: null,
};

export const WISHLIST_EVENT = "wishlist:updated";

const LS_SET = (k: string) => `wl_set_${k}`;
const LS_LIST = (k: string) => `wl_list_${k}`;

export function seedFromLS(userKey?: string | null) {
  if (!userKey || typeof window === "undefined") return;
  try {
    const rawSet = localStorage.getItem(LS_SET(userKey));
    const rawList = localStorage.getItem(LS_LIST(userKey));
    if (rawSet) wishlistCache.set = new Set(JSON.parse(rawSet));
    if (rawList) wishlistCache.list = JSON.parse(rawList);
    wishlistCache.loadedFor = userKey;
  } catch {}
}

export function saveToLS(userKey?: string | null) {
  if (!userKey || typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_SET(userKey), JSON.stringify([...wishlistCache.set]));
    localStorage.setItem(LS_LIST(userKey), JSON.stringify(wishlistCache.list));
  } catch {}
}

export function rebuildSetFromList() {
  const s = new Set<WishlistKey>();
  for (const it of wishlistCache.list) {
    if (it?.slug) s.add(it.slug);
    if (it?.product?.slug) s.add(it.product.slug);
    if (it?.id) s.add(it.id);
    if (it?.product_id) s.add(it.product_id);
    if (it?.product?.id) s.add(it.product.id);
  }
  wishlistCache.set = s;
}

export function hasInCache(slug?: string, id?: WishlistKey) {
  return (!!slug && wishlistCache.set.has(slug)) || (id !== undefined && wishlistCache.set.has(id));
}

export function addToCache(userKey: string | null | undefined, slug?: string, id?: WishlistKey, item?: any) {
  if (slug) wishlistCache.set.add(slug);
  if (id !== undefined) wishlistCache.set.add(id);
  if (item) {
    const i = wishlistCache.list.findIndex((it: any) => it?.slug === item?.slug || it?.product?.slug === item?.slug);
    if (i >= 0) wishlistCache.list[i] = item;
    else wishlistCache.list.push(item);
  }
  saveToLS(userKey ?? null);
  dispatchEvent(new CustomEvent(WISHLIST_EVENT, { detail: { action: "add", slug, id } }));
}

export function removeFromCache(userKey: string | null | undefined, slug?: string, id?: WishlistKey) {
  if (slug) wishlistCache.set.delete(slug);
  if (id !== undefined) wishlistCache.set.delete(id);
  if (slug) {
    wishlistCache.list = wishlistCache.list.filter(
      (it: any) => it?.slug !== slug && it?.product?.slug !== slug
    );
  }
  saveToLS(userKey ?? null);
  dispatchEvent(new CustomEvent(WISHLIST_EVENT, { detail: { action: "remove", slug, id } }));
}
