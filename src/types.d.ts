type Tool = {
  id: number!,
  title: string!,
  searchTerms: string[],
  isFeatured: boolean,
  aspectRatio: number,
  externalLink?: String // if it's a link to something else e.g. socials
}