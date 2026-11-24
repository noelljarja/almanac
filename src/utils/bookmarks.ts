export interface Bookmark {
  id: string;
  name: string;
  html: string;
  category: string;
}

const STORAGE_KEY = 'almanac_bookmarks';

export function getBookmarks(): Bookmark[] {
  const session = sessionStorage.getItem(STORAGE_KEY);
  if (!session) return [];
  try {
    return JSON.parse(session) as Bookmark[];
  } catch {
    return [];
  }
}

export function saveBookmark(bookmark: Omit<Bookmark, 'id'>): Bookmark {
  const bookmarks = getBookmarks();
  const newBookmark: Bookmark = { ...bookmark, id: crypto.randomUUID() };
  bookmarks.push(newBookmark);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  return newBookmark;
}

export function deleteBookmark(id: string): void {
  const bookmarks = getBookmarks().filter((b) => b.id !== id);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}
