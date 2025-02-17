function FindProxyForURL(url, host) {
    if (shExpMatch(host, "*.sitebloqueado.com")) {
        return "PROXY proxy.zeronet.dev";
    }
    return "DIRECT";
}
