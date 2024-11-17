export function getUrl(): string {
    // port must be empty when running in ngrok preview
    let url = `${__PROTOCOL__}://${window.location.hostname}`
    // use if statement to determine window location hostname and if it is localhost define __PORT__ to be 9000
    // and populated in the vite preview
    console.log (window.location.hostname)

    if (window.location.hostname === 'localhost') {
        url += ':9000'
    }
    // if (__PORT__ != null) {
    //     url += `:${__PORT__}`;
    
    // }
    return url;
}