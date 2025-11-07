import Portal = IITC.Portal;

export class IitcHelper {

    public findPortalsInView(): Portal[] {
        const portals: Portal[] = []

        for (const i in window.portals) {
            const portal = window.portals[i]

            // Portals without a "title" are not completely loaded
            if (portal.options.data.title) {
                portals.push(portal)
            }
        }

        return portals
    }

    public findPortalsInPolygons(): Portal[] {
        if (!window.plugin.drawTools) {
            alert('DrawTools plugin is required')

            return []
        }

        const portals: Portal[] = []
        const polygons: L.LatLng[][] = this.findPolygons()

        if (polygons.length === 0) {
            alert('No polygon found')

            return []
        }

        for (const i in window.portals) {
            const portal = window.portals[i]

            // Portals without a "title" are not completely loaded
            if (!portal.options.data.title) {
                continue
            }

            for (const polygon of polygons) {
                if (this.isPointInPolygon(portal.getLatLng(), polygon)) {
                    portals.push(portal)
                    break
                }
            }
        }

        return portals
    }

    private findPolygons(): L.LatLng[][] {
        const layerString: string = localStorage['plugin-draw-tools-layer']
        const layers = JSON.parse(layerString)
        const polygons: L.LatLng[][] = []

        for (const i in layers) {
            if (layers[i].type === 'polygon') {
                const layer: L.LatLng[] = layers[i].latLngs
                polygons.push(layer)
            }
        }

        console.log(`Found ${polygons.length} polygon(s)`)

        return polygons
    }

    private isPointInPolygon(point: L.LatLng, points: L.LatLng[]): boolean {
        const x = point.lat, y = point.lng

        let isInside = false
        let i = 0, j = points.length - 1

        for (; i < points.length; j = i++) {
            const xi = points[i].lat, yi = points[i].lng
            const xj = points[j].lat, yj = points[j].lng
            const intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
            if (intersect) isInside = !isInside
        }

        return isInside
    }
}