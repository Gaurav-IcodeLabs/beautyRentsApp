export const getEmailAndTokenFromUrl = (url: string) => {
    // Create a URL object
    const urlObj = new URL(url)
    // Get the value of the 't' parameter (token)
    const token = urlObj.searchParams.get('t')
    // Get the value of the 'e' parameter (email)
    const email = urlObj.searchParams.get('e')
    return { token, email }
}