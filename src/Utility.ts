export const Utility = {
    /**
     * by EisFrei ?
     */
    formatTimeString: (milliseconds: number): string => {
        if (milliseconds < 0) {
            milliseconds = -milliseconds
        }
        let seconds = Math.floor(milliseconds / 1000)
        if (seconds < 60)
            return `${seconds} seconds`
        else {
            const minutes = Math.floor(seconds / 60)
            seconds = seconds % 60
            return minutes > 5 ? `${minutes} minutes` : `${minutes}:${seconds < 10 ? '0' : ''}${seconds} minutes`
        }
    },

    /**
     * by EisFrei ?
     */
    distance: (latLng: L.LatLng) => {
        const center = window.map.getCenter()

        const distance = latLng.distanceTo(center)

        if (distance >= 10000) {
            return `${Math.round(distance / 1000)} km`
        } else if (distance >= 1000) {
            return `${Math.round(distance / 100) / 10} km`
        }

        return `${Math.round(distance)} m`
    },

    /**
     * by EisFrei ?
     */
    convertHexToSignedFloat: (num: string) => {
        let int = parseInt(num, 16)
        if ((int & 0x80000000) === -0x80000000) {
            int = -1 * (int ^ 0xFFFFFFFF) + 1
        }
        return int / 10e5
    },
}