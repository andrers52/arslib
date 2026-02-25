// Mock HTMLCanvasElement getsContext for jsdom
HTMLCanvasElement.prototype.getContext = () => {
    return {
        fillRect: () => { },
        clearRect: () => { },
        getImageData: (x = 0, y = 0, w = 0, h = 0) => ({
            data: new Array(w * h * 4).fill(0)
        }),
        putImageData: () => { },
        createImageData: () => [],
        setTransform: () => { },
        drawImage: () => { },
        save: () => { },
        fillText: () => { },
        restore: () => { },
        beginPath: () => { },
        moveTo: () => { },
        lineTo: () => { },
        closePath: () => { },
        stroke: () => { },
        translate: () => { },
        scale: () => { },
        rotate: () => { },
        arc: () => { },
        fill: () => { },
        measureText: () => ({ width: 0 }),
        transform: () => { },
        rect: () => { },
        clip: () => { },
    };
};

if (typeof window !== 'undefined') {
    // Mock indexedDB for browser-file-store
    (window as any).indexedDB = {
        open: () => ({
            onupgradeneeded: null,
            onsuccess: null,
            onerror: null,
            result: {
                createObjectStore: () => ({}),
                transaction: () => ({
                    objectStore: () => ({
                        put: () => ({ onsuccess: null, onerror: null }),
                        get: () => ({ onsuccess: null, onerror: null }),
                        delete: () => ({ onsuccess: null, onerror: null })
                    })
                }),
                close: () => { }
            }
        })
    };

    // Mock fullScreen and orientation for browser-util
    if (!document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen = async () => { };
    }
    if (!document.exitFullscreen) {
        document.exitFullscreen = async () => { };
    }
    if (!(screen as any).orientation) {
        (screen as any).orientation = {
            lock: async () => { },
            unlock: () => { }
        };
    }
    (screen as any).lockOrientation = () => true;
}
