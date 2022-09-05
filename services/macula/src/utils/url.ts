/**
 * Perform validation of the search params because some of the params cannot be used unless some other params are not present
 * @param url -
 */
export function validateSearchParams(url: URL): boolean {
  const { searchParams } = url;

  const formatParams = searchParams.get('f_*');

  console.log(formatParams, searchParams);
  return true;
}
