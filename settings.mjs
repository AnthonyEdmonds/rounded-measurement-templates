export class Settings
{
    static key = 'rounded-measurement-templates';

    static moduleSettings = {};
    
    static registerSettings() {
        game.settings.register(Settings.key, 'distance-multiple', {
            name: 'What multiple should template distances be rounded to?',
            hint: 'The multiple you want the measured templates distance to round to. If left blank, the measured templates will be rounded based on the scenes grid distance.',
            scope: 'world',
            config: true,
            restricted: true,
            default: '',
            type: Number,
        });
        
        game.settings.register(Settings.key, 'cone-angle-multiple', {
            name: 'What multiple should cone angles be rounded to when rotating?',
            hint: "The multiple you want the angle for cones to snap when rotating. If left blank, there won't be any angle snapping.",
            scope: 'world',
            config: true,
            restricted: true,
            default: '',
            type: Number,
        });
        
        game.settings.register(Settings.key, 'ray-angle-multiple', {
            name: 'What multiple should rays angles be rounded to when rotating?',
            hint: "The multiple you want the angle for rays to snap when rotating. If left blank, there won't be any angle snapping.",
            scope: 'world',
            config: true,
            restricted: true,
            default: '',
            type: Number,
        });
        
        game.settings.register(Settings.key, 'use-steps', {
            name: 'Should the distances be rounded by steps instead of a single value?',
            hint: "If set to yes, given a step array of '1, 5, 10, 20, 50', the rounded disatnce would start at 1, then round to 5, then round to 10, etc.",
            scope: 'world',
            config: true,
            restricted: true,
            default: false,
            type: Boolean,
        });
        
        game.settings.register(Settings.key, 'step-array', {
            name: 'What array of steps do you want to use?',
            hint: 'Put the steps you want separated by a comma. Example: 1, 5, 10, 20, 50',
            scope: 'world',
            config: true,
            restricted: true,
            default: '1, 5, 10, 20, 50',
            type: String,
        });
        
        game.settings.register(Settings.key, 'use-multiple-after-steps', {
            name: 'After all steps are used, should the distances to default to round to the nearest multiple?',
            hint: '',
            scope: 'world',
            config: true,
            restricted: true,
            default: false,
            type: Boolean,
        });

        game.settings.register(Settings.key, "coneAngle", {
            name: "Cone Measurement Angle",
            hint: "Angle for cone measurement tool. Must be an number between 1 and 360. Default 90.",
            scope: "world",
            config: true,
            type: Number,
            default: 90
        });
    }
    
    static updateSettings() {
        let distanceRatio = canvas.dimensions.size / canvas.dimensions.distance;

        Settings.moduleSettings = {
            'distance-multiple': (
                Settings.getSetting('distance-multiple')
                    ? parseFloat(Settings.getSetting('distance-multiple'))
                    : canvas.scene.grid.distance
            ) * distanceRatio, // distance multiple from settings. defaults to grid distance
            'cone-angle-multiple': Settings.getSetting('cone-angle-multiple')
                ? parseFloat(Settings.getSetting('cone-angle-multiple'))
                : false, // multiple to snap angles for cones
            'ray-angle-multiple': Settings.getSetting('ray-angle-multiple')
                ? parseFloat(Settings.getSetting('ray-angle-multiple'))
                : false, // multiple to snap angles for rays
            'use-steps': Settings.getSetting('use-steps'), // use stepped distance multiples
            'positive-steps-array': Settings.getSetting('step-array')
                .split(',')
                .map((x) => parseFloat(x) * distanceRatio)
                .sort((first, second) => first - second), // steps array converted to integers and converted to pixels and sorted
            'negative-steps-array': Settings.getSetting('step-array')
                .split(',')
                .map((x) => parseFloat(x) * distanceRatio * -1)
                .sort((first, second) => second - first), // steps array converted to integers and converted to pixels and sorted
            'use-multiple-after-steps': Settings.getSetting('use-multiple-after-steps'), // use roundedDistanceSettings["distance-multiple"] after reaching highest integer from stepArray
        };

        let coneAngle = game.settings.get(Settings.key, "coneAngle");

        if (coneAngle > 360 || coneAngle < 1) {
            game.settings.set(Settings.key, "coneAngle", 90);
            coneAngle = 90;
        }

        CONFIG.MeasuredTemplate.defaults.angle = coneAngle;
    }
    
    static getSetting(settingName) {
        return game.settings.get(Settings.key, settingName);
    }
}
