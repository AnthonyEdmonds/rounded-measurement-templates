import { roundDistance, roundToMultiple } from './helpers.mjs';
import { Settings } from './settings.mjs';

const onDragLeftMove = function (event) {
    if (event.interactionData.createState === 0) {
        return;
    }

    event.interactionData.destination = this.getSnappedPoint(event.interactionData.destination);
    
    const ray = new Ray(event.interactionData.origin, event.interactionData.destination);
    const ratio = canvas.dimensions.size / canvas.dimensions.distance;
    const preview = event.interactionData.preview;

    try {
        if (preview.document.t === 'rect') {
            ray.dx = roundDistance(Settings.moduleSettings['use-steps'], ray.dx);
            ray.dy = roundDistance(Settings.moduleSettings['use-steps'], ray.dy);
        } else {
            ray._distance = roundDistance(Settings.moduleSettings['use-steps'], ray.distance);
        }

        if (
            preview.document.t === 'cone'
            && Settings.moduleSettings['cone-angle-multiple'] !== false
        ) {
            ray._angle = Math.toRadians(
                roundToMultiple(
                    Math.toDegrees(ray.angle), 
                    Settings.moduleSettings['cone-angle-multiple'], 
                    0,
                ),
            );
        } else if (
            preview.document.t === 'ray' 
            && Settings.moduleSettings['ray-angle-multiple'] !== false
        ) {
            ray._angle = Math.toRadians(
                roundToMultiple(
                    Math.toDegrees(ray.angle), 
                    Settings.moduleSettings['ray-angle-multiple'],
                    0,
                ),
            );
        }
    } catch (error) {
        console.error(`Rounded Distance for Measured Templates: ${error.message}`);
    }
    
    preview.document.direction = Math.normalizeDegrees(Math.toDegrees(ray.angle));
    preview.document.distance = ray.distance / ratio;
    preview.refresh();

    event.interactionData.createState = 2;
};

Hooks.on('init', Settings.registerSettings);
Hooks.on('closeSettingsConfig', Settings.updateSettings);
Hooks.on('canvasInit', Settings.updateSettings);
Hooks.on('libWrapper.Ready', () => {
    libWrapper.register(Settings.key, 'TemplateLayer.prototype._onDragLeftMove', onDragLeftMove, 'OVERRIDE');
});
