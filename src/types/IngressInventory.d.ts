export declare namespace IngressInventory {
    interface Items extends Array<IngressInventory.Items> {
        resource: Resource
        resourceWithLevels: ResourceWithLevels
        timedPowerupResource: TimedPowerupResource
        playerPowerupResource: PlayerPowerupResource
        modResource: ModResource
        flipCard: FlipCard
        portalCoupler: PortalCoupler
        moniker: Moniker
        container: Container
    }

    interface Resource {
        resourceType: string // eg PORTAL_POWERUP
        resourceRarity?: string // eg VERY_RARE
    }

    interface ResourceWithLevels extends Resource {
        level: number // eg 8
    }

    // This should be named just "mod"
    // eslint-disable-next-line
    interface ModResource extends Resource {
        rarity: 'COMMON' | 'RARE' | 'VERY_RARE'
    }

    interface TimedPowerupResource {
        designation: string // eg FW_ENL
        multiplier: number // ? eg 0
        multiplierE6: number // ? eg 1000000
    }

    interface PlayerPowerupResource {
        playerPowerupEnum: string
    }

    interface Moniker {
        differentiator: string
    }

    interface PortalCoupler {
        portalGuid: string
        portalLocation: string
        portalImageUrl: string
        portalTitle: string
        portalAddress: string
    }

    interface FlipCard {
        flipCardType: string
    }

    interface Container {
        currentCapacity: number
        currentCount: number
        stackableItems: ContainerItem[]
    }

    interface ContainerItem {
        itemGuids: string[]
        exampleGameEntity: [string, number, GameEntity]
    }

    interface GameEntity {
        inInventory: InInventory
        portalCoupler: PortalCoupler
        resource: Resource
    }

    interface InInventory {
        playerId: string
        acquisitionTimestampMs: number
    }
}
