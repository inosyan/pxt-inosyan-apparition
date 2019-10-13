/**
 * Apparition
 */
//% weight=1 color=#967851 icon="\uf033"
namespace inosyan_apparition {
    const TARGET_RADIUS = 3;
    const MAX_LOCATION_DISPLAY_NUMBER = 8;
    const warpPointList: Position[] = [];
    const locationNameList: string[] = [];

    //% block="Coonect locations between %locationName1 %worldPosition1=minecraftCreateWorldPosition and %locationName2 %worldPosition2=minecraftCreateWorldPosition"
    export function addLocation(locationName1: string, worldPosition1: Position, locationName2: string, worldPosition2: Position): void {
        warpPointList.push(worldPosition1);
        warpPointList.push(worldPosition2);
        locationNameList.push(locationName1);
        locationNameList.push(locationName2);
    }

    const checkWithinRange = (targetPos: Position) => {
        const playerPos = player.position().toString();
        for (let i = -TARGET_RADIUS + 1; i < TARGET_RADIUS; i++) {
            for (let j = -TARGET_RADIUS + 1; j < TARGET_RADIUS; j++) {
                if (targetPos.add(positions.create(i, 0, j)).toString() === playerPos) {
                    return true;
                }
            }
        }
        return false;
    }

    const apparition = (arg1: number, arg2: number, arg3: number) => {
        let pos: Position = null;
        let oppositePos: Position = null;
        let locationName = '';
        if (arg1 > 0) {
            const idx = Math.clamp(0, warpPointList.length, (arg1 - 1));
            apparitionImpl(player.position(), warpPointList[idx], locationNameList[idx]);
            return;
        }
        for (let i = 0, l = warpPointList.length; i < l; i++) {
            const p = warpPointList[i];
            if (checkWithinRange(p)) {
                pos = p;
                if (i % 2 == 0) {
                    apparitionImpl(p, warpPointList[i + 1], locationNameList[i + 1]);
                } else {
                    apparitionImpl(p, warpPointList[i - 1], locationNameList[i - 1]);
                }
                return;
            }
        }
        const idx = Math.floor(warpPointList.length * Math.random());
        apparitionImpl(player.position(), warpPointList[idx], locationNameList[idx]);
    }

    const apparitionImpl = (pos: Position, oppositePos: Position, locationName: string) => {
        if (pos === null || oppositePos === null) return;
        player.execute(`tell @s ,\nLocation: ${locationName}`);
        [mobs.target(TargetSelectorKind.AllPlayers), mobs.target(TargetSelectorKind.AllEntities)].forEach(
            (target) => {
                mobs.teleportToPosition(mobs.near(target, pos, TARGET_RADIUS), oppositePos);
            }
        );
    }

    const showCurrentLocation = (arg1: number, arg2: number, arg3: number) => {
        player.execute(`tell @s ,\nPosition: ${player.position().toString().split(' ').join(', ')}`)
    }

    const showLocationNames = (arg1: number, arg2: number, arg3: number) => {
        if (locationNameList.length === 0) {
            player.execute(`tell @s ,\nThere is no registered location.`);
            return;
        }
        let maxPage = 1;
        let page = 1;
        if (locationNameList.length > MAX_LOCATION_DISPLAY_NUMBER) {
            maxPage = Math.ceil(locationNameList.length / MAX_LOCATION_DISPLAY_NUMBER);
            page = Math.clamp(1, maxPage, arg1);
        }

        let msg = `Registered locations: (${page}/${maxPage})`;
        const min = (page - 1) * MAX_LOCATION_DISPLAY_NUMBER;
        const max = Math.min(min + MAX_LOCATION_DISPLAY_NUMBER, locationNameList.length);
        for (let i = min; i < max; i++) {
            msg += `\n${i + 1}\t${locationNameList[i]}`;
        }
        player.execute(`tell @s ,\n${msg}`);
    }

    const init = () => {
        inosyan_command_register.registerCommand("Apparition", apparition);
        inosyan_command_register.registerCommand("ShowCurrentLocation", showCurrentLocation);
        inosyan_command_register.registerCommand("ShowLocationNames", showLocationNames);
    }

    init();
}
