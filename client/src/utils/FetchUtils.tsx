export function getUrl(): string {
    // port must be empty when running in ngrok preview
    let url = `${__PROTOCOL__}://${window.location.hostname}`

    // and populated in the vite preview
    if (__PORT__ != null) {
        url += `:${__PORT__}`;
    }
    return url;
}