export class Settings
{
    static namespace = 'rounded-measurement-templates';

    /** @returns {number} */
    static get canvasScale()
    {
        return canvas.dimensions.size / canvas.dimensions.distance;
    }

    /** @return {number} */
    static get coneAngleAdjustment()
    {
        return game.settings.get(Settings.namespace, 'coneAngleAdjustment') ?? 1;
    }

    /** @returns {number} */
    static get coneAngleDefault()
    {
        return game.settings.get(Settings.namespace, 'coneAngleDefault') ?? 90;
    }

    /** @returns {number} */
    static get coneDirectionSnapping()
    {
        return game.settings.get(Settings.namespace, 'coneDirectionSnapping') ?? 0;
    }

    /** @returns {number} */
    static get distanceSnapping()
    {
        const snap = game.settings.get(Settings.namespace, 'distanceSnapping') ?? 0;

        return snap > 0
            ? snap
            : canvas.scene.grid.distance;
    }

    /** @returns {number} */
    static get rayDirectionSnapping()
    {
        return game.settings.get(Settings.namespace, 'rayDirectionSnapping') ?? 0;
    }

    /** @returns {number} */
    static get rayWidthAdjustment()
    {
        return game.settings.get(Settings.namespace, 'rayWidthAdjustment') ?? 1;
    }

    /** @returns {array} */
    static get steps()
    {
        return game.settings.get(Settings.namespace, 'steps')
            ?.replace(' ', '')
            .split(',')
            .sort(function (first, second) {
                return first - second;
            })
            ?? [];
    }

    /** @returns {boolean} */
    static get measureBeyondSteps()
    {
        return game.settings.get(Settings.namespace, 'measureBeyondSteps') ?? false;
    }

    /** @returns {boolean} */
    static get useSteps()
    {
        return game.settings.get(Settings.namespace, 'useSteps') ?? false;
    }

    static register()
    {
        game.settings.register(Settings.namespace, 'distanceSnapping', {
            name: 'Distance snapping',
            hint: 'Measure distances in incremements of this many grid units; 0 to use each scene\'s grid',
            scope: 'world',
            config: true,
            restricted: true,
            default: 0,
            type: Number,
        });

        game.settings.register(Settings.namespace, 'coneDirectionSnapping', {
            name: 'Cone direction snapping',
            hint: 'Allow cones to rotate by this many degrees; 0 for no snapping',
            scope: 'world',
            config: true,
            restricted: true,
            default: 0,
            type: Number,
            range: {
                min: 0,
                max: 90,
                step: 5,
            },
        });

        game.settings.register(Settings.namespace, 'coneAngleAdjustment', {
            name: 'Cone angle adjustment',
            hint: 'Change the angle of cones by this many degrees while holding "Ctrl"',
            scope: 'world',
            config: true,
            restricted: true,
            default: 5,
            type: Number,
            range: {
                min: 5,
                max: 90,
                step: 5,
            },
        });

        game.settings.register(Settings.namespace, 'coneAngleDefault', {
            name: 'Default cone angle',
            hint: 'Set the default angle of the cone measurement tool',
            scope: 'world',
            config: true,
            type: Number,
            default: 90,
            restricted: true,
            range: {
                min: 5,
                max: 360,
                step: 5,
            },
        });
        
        game.settings.register(Settings.namespace, 'rayDirectionSnapping', {
            name: 'Ray direction snapping',
            hint: 'Allow rays to rotate by this many degrees; 0 for no snapping',
            scope: 'world',
            config: true,
            restricted: true,
            default: 0,
            type: Number,
            range: {
                min: 0,
                max: 90,
                step: 5,
            },
        });

        game.settings.register(Settings.namespace, 'rayWidthAdjustment', {
            name: 'Ray width adjustment',
            hint: 'Change the width of rays by this much while holding "Ctrl"',
            scope: 'world',
            config: true,
            restricted: true,
            default: 1,
            type: Number,
            range: {
                min: 1,
                max: 10,
                step: 1,
            },
        });
        
        game.settings.register(Settings.namespace, 'useSteps', {
            name: 'Snap distances to steps?',
            hint: 'Use a set list of distances instead of a multiple',
            scope: 'world',
            config: true,
            restricted: true,
            default: false,
            type: Boolean,
        });
        
        game.settings.register(Settings.namespace, 'steps', {
            name: 'Distance steps',
            hint: 'A comma delimited list of steps to snap by, such as: "1, 5, 10, 20, 50"',
            scope: 'world',
            config: true,
            restricted: true,
            default: '1, 5, 10, 20, 50',
            type: String,
        });
        
        game.settings.register(Settings.namespace, 'measureBeyondSteps', {
            name: 'Allow measuring beyond steps?',
            hint: 'After all steps are used, continue measuring using the "Distance snapping" setting',
            scope: 'world',
            config: true,
            restricted: true,
            default: false,
            type: Boolean,
        });
    }
    
    static update()
    {
        CONFIG.MeasuredTemplate.defaults.angle = Settings.coneAngleDefault;
    }
}
